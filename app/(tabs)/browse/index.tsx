import React, { useEffect, useState } from "react";
import { 
  Text, FlatList, TextInput, TouchableOpacity, Modal, ActivityIndicator, Alert
} from "react-native";
import { styled } from "nativewind";
import { View as RNView } from "react-native";
import { 
  Octicons, Ionicons, FontAwesome, Feather, MaterialCommunityIcons
} from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchProjects,
  selectProjects,
  createNewProject,
  deleteProject,
} from "../../../slices/projectSlice";
import { AppDispatch } from "../../../store/store";
import { useRouter } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import CreationModalforAllScreens from "@/components/CreationModalforAllScreens";
import { selectLoader } from "@/slices/LoaderSlice";
import Toast from "react-native-toast-message";

const View = styled(RNView);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);

export default function BrowseScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const projects = useSelector(selectProjects);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [newProjectName, setNewProjectName] = useState<string>("");
  const router = useRouter();
  const [isTaskModalVisible, setTaskModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const loader = useSelector(selectLoader);

  useEffect(() => {
    dispatch(fetchProjects());
  }, []);

  const handleCreate = () => {
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!newProjectName.trim()) {
      Alert.alert("Erro", "O nome do projeto não pode estar vazio.");
      return;
    }

    if (projects.length < 8) {
      await dispatch(createNewProject(newProjectName)).unwrap();
      setNewProjectName("");
      setModalVisible(false);
      Toast.show({
        type: "success",
        text1: "Projeto criado com sucesso!",
        text2: "O projeto foi adicionado à lista.",
      });
    } else {
      Toast.show({
        type: "error",
        text1: "Limite de projetos atingido",
        text2: "Você só pode ter até 8 projetos.",
      });
    }
  };

  const handleDelete = async (id: string) => {
    await dispatch(deleteProject(id));
  };

  const handlePressProject = (id: string) => {
    router.push(`/project-details?id=${id}`);
  };

  const showFeatureUnavailable = () => {
    Alert.alert("Indisponível", "Esta funcionalidade ainda não está disponível.");
  };

  const openModal = (task: any = null) => {
    setSelectedTask(task);
    setTaskModalVisible(true);
  };

  const closeModal = () => {
    setTaskModalVisible(false);
    setSelectedTask(null);
  };

  return (
    <View className="flex-1">
      {loader && (
        <Modal transparent={true} animationType="none" visible={loader}>
          <View className="flex-1 justify-center items-center ">
            <View className="bg-white p-4 rounded-lg">
              <ActivityIndicator size="large" color="red" />
            </View>
          </View>
        </Modal>
      )}

      <View className="flex-1 p-4 gap-10">
        {/* Caixa de Entrada */}
        <View className="py-2 flex bg-white shadow-lg rounded-md">
          <TouchableOpacity 
            className="px-3 flex flex-row gap-4 mb-2 items-center"
            onPress={() => {
              const inboxProject = projects.find((project) => project.name === "Inbox");
              if (inboxProject) {
                handlePressProject(inboxProject.id.toString());
              }
            }}
          >
            <Octicons name="inbox" size={24} color="red" />
            <StyledText className="text-lg">Caixa de entrada</StyledText>
          </TouchableOpacity>
        </View>

        {/* Filtros e Etiquetas */}
        <TouchableOpacity 
          className="px-3 flex flex-row gap-4 items-center bg-white shadow-lg rounded-md py-2"
          onPress={showFeatureUnavailable}
        >
          <Ionicons name="grid-outline" size={24} color="red" />
          <StyledText className="text-lg">Filtros e etiquetas</StyledText>
        </TouchableOpacity>

        <View className="px-0 shadow-lg">
          <View className="flex flex-row items-center">
            <StyledText className="text-xl px-2 py-2 grow">Meus projetos</StyledText>
            <StyledText onPress={handleCreate}>
              <Feather name="plus" size={24} color="black" />
            </StyledText>
          </View>

          <FlatList
            data={projects} 
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View className="py-2 border-b border-gray-200 bg-white flex flex-row px-3 rounded-md items-center">
                <StyledText
                  onPress={() => handlePressProject(item.id.toString())}
                  className="text-lg grow text-gray-900"
                >
                  # {item.name}
                </StyledText>
                <TouchableOpacity onPress={() => handleDelete(item.id.toString())}>
                  <MaterialCommunityIcons name="delete" size={18} color="red" />
                </TouchableOpacity>
              </View>
            )}
          />
        </View>

        {/* Gerenciar Projetos */}
        <TouchableOpacity onPress={showFeatureUnavailable} className="flex flex-row items-center px-2 bg-white py-2 rounded-md shadow-lg">
          <FontAwesome name="pencil" size={24} color="black" />
          <StyledText className="ml-2 text-lg">Gerenciar projetos</StyledText>
        </TouchableOpacity>

        {/* Modal de Criação de Projeto */}
        <Modal visible={modalVisible} transparent={true} animationType="fade" onRequestClose={() => setModalVisible(false)}>
          <View className="flex-1 justify-center items-center bg-transparent">
            <View className="bg-white p-6 rounded-md shadow-lg w-80">
              <StyledText className="text-lg mb-4 text-center">Criar novo projeto</StyledText>
              
              <StyledTextInput
                value={newProjectName}
                onChangeText={setNewProjectName}
                placeholder="Digite o nome do projeto"
                className="border border-gray-300 p-2 mb-4 rounded-md"
              />

              {/* Botões lado a lado */}
              <View className="flex-row justify-between space-x-2">
                <TouchableOpacity 
                  onPress={handleSubmit} 
                  className={`p-2 rounded-md flex-1 ${newProjectName.trim() ? "bg-blue-500" : "bg-gray-300"}`}
                  disabled={!newProjectName.trim()}
                >
                  <StyledText className="text-white text-center">Criar</StyledText>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => setModalVisible(false)} 
                  className="bg-gray-400 p-2 rounded-md flex-1"
                >
                  <StyledText className="text-white text-center">Cancelar</StyledText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>

      <Toast />
    </View>
  );
}
