import React, { useEffect, useState, useMemo } from "react";
import { 
  Text, Modal, View as RNView, ActivityIndicator, FlatList, TouchableOpacity 
} from "react-native";
import { styled } from "nativewind";
import { useDispatch, useSelector } from "react-redux";
import { getAllTasks, selectTasks, completeTask, deleteTask, updateTask } from "@/slices/taskSlice";
import CheckBox from "expo-checkbox";
import { AppDispatch } from "@/store/store";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { fetchProjects, selectProjects } from "@/slices/projectSlice";
import { isToday, parseISO, format, compareDesc } from "date-fns";
import CreationModalforAllScreens from "@/components/CreationModalforAllScreens";
import { selectLoader } from "@/slices/LoaderSlice";
import Toast from "react-native-toast-message";

const View = styled(RNView);
const StyledText = styled(Text);

export default function TodayScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const tasks = useSelector(selectTasks);
  const projects = useSelector(selectProjects);
  const loader = useSelector(selectLoader);
  const [completedTasks, setCompletedTasks] = useState<{ [key: string]: boolean }>({});
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [filterType, setFilterType] = useState<"all" | "pending" | "completed">("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    dispatch(getAllTasks());
    dispatch(fetchProjects());
  }, [dispatch]);

  const refreshTasks = () => {
    dispatch(getAllTasks());
  };

  const todaysTasks = useMemo(
    () =>
      tasks
        .filter((task) => task.due?.date && typeof task.due.date === "string" && isToday(parseISO(task.due.date)))
        .sort((a, b) => {
          const dateA = a.createdAt ? parseISO(a.createdAt) : new Date();
          const dateB = b.createdAt ? parseISO(b.createdAt) : new Date();
          return compareDesc(dateA, dateB);
        }),
    [tasks]
  );

  const projectMap = useMemo(() => {
    return projects.reduce((acc, project) => {
      acc[project.id] = project.name || "Sem projeto";
      return acc;
    }, {} as Record<string, string>);
  }, [projects]);

  const handleCheckboxClick = (taskId: string) => {
    dispatch(completeTask(taskId));
    setCompletedTasks((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
    refreshTasks();
  };

  const openModal = (task: any = null) => {
    setSelectedTask(task);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedTask(null);
    refreshTasks();
  };

  const handleDeleteTask = async (id: string) => {
    await dispatch(deleteTask(id));
    refreshTasks();
  };

  const handleUpdateTask = async (taskId: string, updatedTaskData: Partial<Task>) => {
    if (!updatedTaskData.content || !updatedTaskData.dueDate || !updatedTaskData.projectId) {
      console.error("Erro: Campos obrigatórios ausentes", updatedTaskData);
      Toast.show({
        type: "error",
        text1: "Erro ao atualizar tarefa",
        text2: "Preencha todos os campos obrigatórios",
      });
      return;
    }
  
    try {
      console.log("Atualizando tarefa:", taskId, updatedTaskData);
      await dispatch(updateTask({ id: taskId, taskData: updatedTaskData }));
      refreshTasks();
      Toast.show({ type: "success", text1: "Tarefa atualizada com sucesso!" });
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error);
      Toast.show({ type: "error", text1: "Erro ao atualizar tarefa" });
    }
  };
  
  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const filteredTasks = useMemo(() => {
    switch (filterType) {
      case "pending":
        return todaysTasks.filter((task) => !completedTasks[task.id]);
      case "completed":
        return todaysTasks.filter((task) => completedTasks[task.id]);
      default:
        return todaysTasks;
    }
  }, [filterType, todaysTasks, completedTasks]);

  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      const dateA = a.createdAt ? parseISO(a.createdAt) : new Date();
      const dateB = b.createdAt ? parseISO(b.createdAt) : new Date();
      return sortOrder === "asc" ? compareDesc(dateB, dateA) : compareDesc(dateA, dateB);
    });
  }, [filteredTasks, sortOrder]);

  return (
    <View className="flex-1 p-4 gap-4">
      {loader && (
        <Modal transparent animationType="none" visible>
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="red" />
          </View>
        </Modal>
      )}

      <StyledText className="text-xl font-bold">Tarefas de hoje</StyledText>

        {/* Botões de Filtro e Ordenação alinhados */}
  <View className="flex-row items-center justify-between mb-2">
    <View className="flex-row gap-2">
      {["all", "pending", "completed"].map((type) => (
        <TouchableOpacity 
          key={type} 
          className={`px-4 py-2 rounded-lg ${
            filterType === type ? "bg-red-500" : "bg-gray-300"
          }`}
          onPress={() => setFilterType(type as "all" | "pending" | "completed")}
        >
          <StyledText className="text-white font-semibold">
            {type === "all" ? "Todas" : type === "pending" ? "Pendentes" : "Concluídas"}
          </StyledText>
        </TouchableOpacity>
      ))}
    </View>

    {/* Botão de Ordenação alinhado corretamente */}
    <TouchableOpacity onPress={toggleSortOrder} className="flex-row items-center ml-1">
      <MaterialIcons name={sortOrder === "asc" ? "arrow-upward" : "arrow-downward"} size={14} color="red" />
      <StyledText className="text-red-500 text-sm font-bold ">Ordenar</StyledText>
    </TouchableOpacity>
  </View>


      {/* Lista de Tarefas Filtradas e Ordenadas */}
      <FlatList
        data={sortedTasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item: task }) => {
          const createdAt = task.createdAt
            ? format(parseISO(task.createdAt), "dd/MM/yyyy")
            : format(new Date(), "dd/MM/yyyy");

          return (
            <View className="bg-white p-4 mb-2 flex flex-row rounded-md shadow-md w-full">
              <CheckBox
                value={completedTasks[task.id] || false}
                onValueChange={() => handleCheckboxClick(task.id)}
              />
              <View className="ml-3 flex-1">
                <StyledText className={`font-semibold ${completedTasks[task.id] ? "line-through text-gray-500" : "text-black"}`}>
                  {task.content}
                </StyledText>
                {task.description && <StyledText className="text-gray-500">{task.description}</StyledText>}
                <StyledText className="text-gray-400">Prioridade: {task.priority}</StyledText>
                <StyledText> {![ "OutroProjeto"].includes(projectMap[task.projectId]) && (
                <StyledText># {projectMap[task.projectId]}</StyledText>
              )}</StyledText>
                <StyledText className="text-gray-500">Criado em: {createdAt}</StyledText>
              </View>
              <View className="flex flex-row items-center">
                <MaterialIcons onPress={() => openModal(task)} name="edit" size={24} color="red" />
                <MaterialIcons onPress={() => handleDeleteTask(task.id)} name="delete" size={24} color="red" />
              </View>
            </View>
          );
        }}
        ListEmptyComponent={<StyledText>Sem tarefas para exibir</StyledText>}
      />

      <View className="absolute bottom-8 right-8">
        <AntDesign name="pluscircle" size={54} color="red" onPress={() => openModal()} />
      </View>

      {/* Modal para Criar/Editar Tarefa */}
      <Modal visible={isModalVisible} transparent animationType="slide">
        <View className="flex-1 justify-center items-center bg-transparent">
          <CreationModalforAllScreens 
            closeModal={closeModal} 
            task={selectedTask} 
            todaysdate={new Date()} 
            screen="today" 
            onTaskCreated={refreshTasks}
          />
        </View>
      </Modal>

      <Toast />
    </View>
  );
}
