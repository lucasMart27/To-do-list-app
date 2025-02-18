import React, { useEffect, useState } from "react";
import { Modal, Text, ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import { styled } from "nativewind";
import { View as RNView } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  completeTask,
  deleteTask,
  getTasksByProjectId,
  selectTasksById,
} from "@/slices/taskSlice";
import { AppDispatch } from "@/store/store";
import { selectProjects } from "@/slices/projectSlice";
import CheckBox from "expo-checkbox";
import { format, isToday, isTomorrow, isThisWeek, parseISO } from "date-fns";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import CreateNewTask from "../components/CreateUpdateModal";
import { selectLoader } from "@/slices/LoaderSlice";
import { useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";

const StyledText = styled(Text);
const View = styled(RNView);

export default function ProjectDetailsScreen() {
  const { id } = useLocalSearchParams();
  const dispatch = useDispatch<AppDispatch>();

  // Obtendo tarefas do Redux
  const tasks = useSelector((state) => selectTasksById(state, id as string));


  // Obtendo projetos do Redux
  const projects = useSelector(selectProjects) || [];
  const loader = useSelector(selectLoader);

  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [completedTasks, setCompletedTasks] = useState<{ [key: string]: boolean }>({});
  const [isModalVisible, setModalVisible] = useState<boolean>(false);

  const priorityColors: { [key: number]: string } = {
    1: "gray",
    2: "orange",
    3: "blue",
    4: "red",
  };

  // Abrir modal de criação/edição de tarefa
  const openModal = (task: any = null) => {
    setSelectedTask(task);
    setModalVisible(true);
  };

  const closeModal = () => setModalVisible(false);

  useEffect(() => {
    if (id) {
      dispatch(getTasksByProjectId(id as string));
    }
  }, [id, dispatch]);

  // Verifica se o projeto existe antes de tentar acessá-lo
  const project = projects.find((project) => project.id === id) || null;

  const handleCheckboxClick = (taskId: string) => {
    dispatch(completeTask(taskId));
    setCompletedTasks((prevState) => ({
      ...prevState,
      [taskId]: !prevState[taskId],
    }));
  };

  const handleDeleteTask = async (taskId: string) => {
    Alert.alert(
      "Excluir Tarefa",
      "Tem certeza de que deseja excluir esta tarefa?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            await dispatch(deleteTask(taskId));
            dispatch(getTasksByProjectId(id as string)); // Atualiza lista após exclusão
          },
        },
      ]
    );
  };

  const formatDueDate = (due: { date: string } | null | undefined): string => {
    if (!due || !due.date) return "";
    const date = parseISO(due.date);
    if (isToday(date)) return "Hoje";
    if (isTomorrow(date)) return "Amanhã";
    if (isThisWeek(date)) return format(date, "EEEE");
    return format(date, "dd/MM/yyyy");
  };

  return (
    <View className="p-6 flex-1 relative gap-5">
      <Toast />

      {/* Exibição do nome do projeto */}
      {project ? (
        <StyledText className="text-2xl font-bold">{project.name}</StyledText>
      ) : (
        <StyledText className="text-xl text-red-500">Projeto não encontrado</StyledText>
      )}

      {/* Loader para quando as tarefas estiverem carregando */}
      {loader && (
        <Modal transparent={true} animationType="fade" visible={loader}>
          <View className="flex-1 justify-center items-center bg-black bg-opacity-40">
            <View className="bg-white p-5 rounded-lg">
              <ActivityIndicator size="large" color="red" />
            </View>
          </View>
        </Modal>
      )}

      {/* Lista de Tarefas */}
      {Array.isArray(tasks) && tasks.length > 0 ? (
        tasks.map((task) => (
          <View
            key={task.id}
            className="flex flex-row bg-white py-4 px-3 shadow-lg rounded-md items-center mb-2"
          >
            {/* Checkbox */}
            <CheckBox
              value={completedTasks[task.id] || false}
              onValueChange={() => handleCheckboxClick(task.id)}
              color={priorityColors[task.priority ?? 1]}
            />

            {/* Conteúdo da Tarefa */}
            <View className="ml-4 grow">
              <StyledText className="font-semibold text-md">{task.content}</StyledText>
              {task.description && (
                <StyledText className="text-sm text-gray-500">{task.description}</StyledText>
              )}
              {task.due && (
                <StyledText
                  className="text-sm"
                  style={{ color: priorityColors[task.priority ?? 1] }}
                >
                  {formatDueDate(task.due)}
                </StyledText>
              )}
            </View>

            {/* Ícones de Ações */}
            <View className="flex-row gap-3">
              <TouchableOpacity onPress={() => openModal(task)}>
                <MaterialIcons name="edit" size={24} color="red" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteTask(task.id)}>
                <MaterialIcons name="delete" size={24} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        ))
      ) : (
        <StyledText className="text-center text-gray-500">Nenhuma tarefa encontrada.</StyledText>
      )}

      {/* Botão para adicionar nova tarefa */}
      <View className="absolute bottom-16 right-10">
        <TouchableOpacity onPress={() => openModal()}>
          <AntDesign name="pluscircle" size={54} color="red" />
        </TouchableOpacity>
      </View>

      {/* Modal de criação/edição de tarefas */}
      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <CreateNewTask closeModal={closeModal} projectId={id as string} task={selectedTask} />
        </View>
      </Modal>
    </View>
  );
}

export default ProjectDetailsScreen;
