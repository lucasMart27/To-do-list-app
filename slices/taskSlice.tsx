import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  completeTaskApi,
  createNewTaskApi,
  deleteTaskApi,
  getTaskByProject,
  updateTaskApi,
} from "../services/api";
import { Task } from "@/types";
import { hideLoader, showLoader } from "./LoaderSlice";
import showToast from "@/utils/toast";
import { createSelector } from "@reduxjs/toolkit";

interface TasksState {
  tasks: Task[];
}

const initialState: TasksState = {
  tasks: [],
};

// Chave para armazenamento local
const TASKS_STORAGE_KEY = "tasks";

// 🔹 Funções utilitárias para AsyncStorage
const saveTasksToStorage = async (tasks: Task[]) => {
  try {
    await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error("Erro ao salvar tarefas no AsyncStorage:", error);
  }
};

const loadTasksFromStorage = async () => {
  try {
    const storedTasks = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
    return storedTasks ? JSON.parse(storedTasks) : [];
  } catch (error) {
    console.error("Erro ao carregar tarefas do AsyncStorage:", error);
    return [];
  }
};

// 🔹 Buscar todas as tarefas
export const getAllTasks = createAsyncThunk("tasks/fetchAllTasks", async () => {
  try {
    let tasks = await loadTasksFromStorage();
    if (tasks.length === 0) {
      const response = await getTaskByProject();
      await saveTasksToStorage(response);
      tasks = response;
    }
    return tasks;
  } catch (error) {
    showToast("error", "Erro ao buscar tarefas", "Tente novamente.");
    throw new Error("Erro ao buscar tarefas");
  }
});

// 🔹 Buscar tarefas de um projeto específico
export const getTasksByProjectId = createAsyncThunk(
  "tasks/getTasksByProjectId",
  async (projectId: string) => {
    try {
      const response = await getTaskByProject(projectId);
      return response;
    } catch (error) {
      showToast("error", "Erro ao buscar tarefas do projeto", "Tente novamente.");
      throw new Error("Erro ao buscar tarefas do projeto");
    }
  }
);

// 🔹 Criar nova tarefa
export const createNewTask = createAsyncThunk<Task, Task>(
  "tasks/createNewTask",
  async (taskData, { getState }) => {
    try {
      const newTask = await createNewTaskApi(taskData);
      showToast("success", "Nova tarefa criada!", "A tarefa foi adicionada.");

      // Atualizando AsyncStorage
      const updatedTasks = [...(getState() as any).tasks.tasks, newTask];
      await saveTasksToStorage(updatedTasks);

      return newTask;
    } catch (error) {
      showToast("error", "Erro ao criar tarefa", "Tente novamente.");
      throw new Error("Erro ao criar tarefa");
    }
  }
);

// 🔹 Atualizar tarefa
export const updateTask = createAsyncThunk(
  "tasks/updateTask",
  async (taskData: Task, { getState }) => {
    try {
      const updatedTask = await updateTaskApi(taskData);
      showToast("success", "Tarefa atualizada!", "A tarefa foi editada.");

      const updatedTasks = (getState() as any).tasks.tasks.map((task: Task) =>
        task.id === updatedTask.id ? updatedTask : task
      );

      await saveTasksToStorage(updatedTasks);

      return updatedTask;
    } catch (error) {
      showToast("error", "Erro ao atualizar tarefa", "Tente novamente.");
      throw new Error("Erro ao atualizar tarefa");
    }
  }
);

// 🔹 Concluir tarefa
export const completeTask = createAsyncThunk(
  "tasks/completeTask",
  async (id: string, { getState }) => {
    try {
      await completeTaskApi(id);
      const updatedTasks = (getState() as any).tasks.tasks.map((task: Task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      );

      await saveTasksToStorage(updatedTasks);
      return id;
    } catch (error) {
      showToast("error", "Erro ao concluir tarefa", "Tente novamente.");
      throw new Error("Erro ao concluir tarefa");
    }
  }
);

// 🔹 Excluir tarefa
export const deleteTask = createAsyncThunk(
  "tasks/deleteTask",
  async (id: string, { getState }) => {
    try {
      await deleteTaskApi(id);
      showToast("success", "Tarefa excluída!", "A tarefa foi removida.");

      const updatedTasks = (getState() as any).tasks.tasks.filter((task: Task) => task.id !== id);
      await saveTasksToStorage(updatedTasks);

      return id;
    } catch (error) {
      showToast("error", "Erro ao excluir tarefa", "Tente novamente.");
      throw new Error("Erro ao excluir tarefa");
    }
  }
);

// 🔹 Slice Redux
const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.tasks = action.payload;
      })
      .addCase(getTasksByProjectId.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.tasks = action.payload;
      })
      .addCase(createNewTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.tasks.push(action.payload);
      })
      .addCase(updateTask.fulfilled, (state, action: PayloadAction<Task>) => {
        const index = state.tasks.findIndex((task) => task.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(deleteTask.fulfilled, (state, action: PayloadAction<string>) => {
        state.tasks = state.tasks.filter((task) => task.id !== action.payload);
      })
      .addCase(completeTask.fulfilled, (state, action: PayloadAction<string>) => {
        const task = state.tasks.find((t) => t.id === action.payload);
        if (task) task.completed = !task.completed;
      });
  },
});

// 🔹 Selectors
export const selectTasks = (state: { tasks: TasksState }) => state.tasks.tasks;

//  Adicionando `selectTasksById` corretamente 
export const selectTasksById = (state: { tasks: TasksState }, projectId: string) =>
  state.tasks.tasks.filter((task) => task.projectId === projectId);

export default taskSlice.reducer;
