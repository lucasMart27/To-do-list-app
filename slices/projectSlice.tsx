import { createProject, deleteProjectApi, getProjects } from "@/services/api";
import { Project } from "@/types";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { hideLoader, showLoader } from "./LoaderSlice";
import showToast from "@/utils/toast";

/**
 * Interface para representar o estado dos projetos no Redux
 */
interface ProjectsState {
  projects: Project[]; // Lista de projetos
}

/**
 * Estado inicial da aplicação para os projetos
 */
const initialState: ProjectsState = {
  projects: [],
};

/**
 * Thunk para buscar a lista de projetos
 */
export const fetchProjects = createAsyncThunk(
  "projects/fetchProjects",
  async (_, { dispatch }) => {
    try {
      dispatch(showLoader()); // Exibe loader antes da requisição
      const response = await getProjects(); // Faz a requisição para buscar projetos
      return response;
    } catch (error) {
      showToast("error", "Não foi possível buscar os projetos", "Tente novamente."); // Exibe erro em caso de falha
      throw new Error((error as Error).message || "Erro ao buscar projetos");
    } finally {
      dispatch(hideLoader()); // Esconde loader após a requisição
    }
  }
);

/**
 * Thunk para criar um novo projeto
 */
export const createNewProject = createAsyncThunk(
  "projects/createNewProject",
  async (name: string, { dispatch }) => {
    try {
      dispatch(showLoader()); // Exibe loader antes da requisição
      const response = await createProject(name); // Faz a requisição para criar um novo projeto
      showToast("success", "Projeto criado com sucesso!", ""); // Exibe mensagem de sucesso
      return response;
    } catch (error) {
      showToast("error", "Não foi possível criar o projeto", "Tente novamente."); // Exibe erro em caso de falha
      throw new Error((error as Error).message || "Erro ao criar projeto");
    } finally {
      dispatch(hideLoader()); // Esconde loader após a requisição
    }
  }
);

/**
 * Thunk para deletar um projeto pelo ID
 */
export const deleteProject = createAsyncThunk(
  "projects/deleteProject",
  async (id: string, { dispatch }) => {
    try {
      dispatch(showLoader()); // Exibe loader antes da requisição
      await deleteProjectApi(id); // Faz a requisição para deletar o projeto
      return id;
    } catch (error) {
      showToast("error", "Não foi possível excluir o projeto", "Tente novamente."); // Exibe erro em caso de falha
      throw new Error((error as Error).message || "Erro ao excluir projeto");
    } finally {
      dispatch(hideLoader()); // Esconde loader após a requisição
    }
  }
);

/**
 * Slice do Redux para gerenciar os projetos
 */
const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(
        fetchProjects.fulfilled,
        (state, action: PayloadAction<Project[]>) => {
          state.projects = action.payload; // Atualiza a lista de projetos no estado
        }
      )
      .addCase(
        createNewProject.fulfilled,
        (state, action: PayloadAction<Project>) => {
          state.projects.push(action.payload); // Adiciona o novo projeto ao estado
        }
      )
      .addCase(
        deleteProject.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.projects = state.projects.filter(
            (project) => project.id !== action.payload
          ); // Remove o projeto excluído do estado
        }
      );
  },
});

/**
 * Seletor para obter a lista de projetos do estado global
 */
export const selectProjects = (state: { projects: ProjectsState }) =>
  state.projects.projects;

export default projectsSlice.reducer;
