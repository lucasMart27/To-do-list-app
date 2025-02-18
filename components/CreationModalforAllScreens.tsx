import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import { createNewTask as createNewTaskAction, updateTask } from "@/slices/taskSlice";
import { styled } from "nativewind";
import DateTimePicker from "@react-native-community/datetimepicker";
import DropDownPicker from "react-native-dropdown-picker";
import { selectProjects } from "@/slices/projectSlice";

// Estilização utilizando `nativewind`
const StyledTextInput = styled(TextInput);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

const priorities = [
  { label: "Prioridade 1 (Normal)", value: 1 },
  { label: "Prioridade 2", value: 2 },
  { label: "Prioridade 3", value: 3 },
  { label: "Prioridade 4 (Urgente)", value: 4 },
];

interface CreationModalProps {
  closeModal: () => void;
  task?: any;
}

const CreationModalforAllScreens: React.FC<CreationModalProps> = ({
  closeModal,
  task,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  // Pegando os projetos do Redux
  const projects = useSelector(selectProjects).map((project) => ({
    label: project.name,
    value: project.id,
  }));

  const inboxProject = projects.find((project) => project.label === "Inbox");

  // Estados dos campos
  const [content, setContent] = useState(task?.content ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [dueDate, setDueDate] = useState<Date>(task?.dueDate ? new Date(task.dueDate) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [priority, setPriority] = useState(task?.priority ?? priorities[0].value);
  const [project, setProject] = useState(task?.projectId ?? inboxProject?.value ?? "");

  // Estados para controle dos Dropdowns
  const [openPriority, setOpenPriority] = useState(false);
  const [openProject, setOpenProject] = useState(false);

  // Função para salvar/editar tarefa
  const handleSubmit = async () => {
    const taskData = {
      content,
      projectId: project,
      description: description || "",
      dueDate: dueDate.toISOString(),
      priority,
    };

    console.log("Task Data:", taskData);

    try {
      if (task) {
        await dispatch(updateTask({ id: task.id, ...taskData }));
      } else {
        await dispatch(createNewTaskAction(taskData));
      }
      closeModal();
    } catch (error) {
      console.error("Erro ao criar/atualizar tarefa:", error);
    }
  };

  // Função para selecionar data
  const onDateChange = (_: any, selectedDate?: Date) => {
    if (selectedDate) {
      setDueDate(selectedDate);
    }
    if (Platform.OS !== "ios") {
      setShowDatePicker(false);
    }
  };

  return (
    <Modal 
      transparent={true} // Garante que o fundo seja visível
      animationType="slide"
      visible
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <StyledView className="p-4 bg-white rounded-md w-80 shadow-lg">
          
          {/* Campo de Nome da Tarefa */}
          <StyledTextInput
            className="p-2 border-2 border-gray-200 mb-2 w-full"
            placeholder="Adicionar item"
            placeholderTextColor="#A0AEC0"
            value={content}
            onChangeText={setContent}
          />

          {/* Campo de Descrição */}
          <StyledTextInput
            className="p-2 border-2 border-gray-200 mb-2 w-full"
            placeholder="Descrição"
            placeholderTextColor="#A0AEC0"
            value={description}
            onChangeText={setDescription}
          />

          {/* Seleção de Data */}
          <StyledTouchableOpacity
            className="p-2 border-2 border-gray-200 mb-2 w-full"
            onPress={() => setShowDatePicker(true)}
          >
            <StyledText>{dueDate.toLocaleDateString()}</StyledText>
          </StyledTouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={dueDate}
              mode={"date"}
              is24Hour={true}
              display="default"
              onChange={onDateChange}
            />
          )}

          {/* Seleção de Prioridade */}
          <DropDownPicker
            open={openPriority}
            value={priority}
            items={priorities}
            setOpen={(val) => {
              setOpenPriority(val);
              if (val) setOpenProject(false); // Fecha o outro dropdown se este abrir
            }}
            setValue={setPriority}
            placeholder="Selecione a prioridade"
            containerStyle={{ width: "100%", marginBottom: 10, zIndex: 2000 }}
            style={{ borderWidth: 1, borderColor: "gray", borderRadius: 8, backgroundColor: "#fff" }}
            textStyle={{ textAlign: "left", color: "black" }}
            dropDownContainerStyle={{ backgroundColor: "#fff", zIndex: 3000 }}
            placeholderStyle={{ color: "gray" }}
          />

          {/* Seleção de Projeto */}
          <DropDownPicker
            open={openProject}
            value={project}
            items={projects}
            setOpen={(val) => {
              setOpenProject(val);
              if (val) setOpenPriority(false); // Fecha o outro dropdown se este abrir
            }}
            setValue={setProject}
            placeholder="Selecione um projeto"
            containerStyle={{ width: "100%", marginBottom: 10, zIndex: 1000 }}
            style={{ borderWidth: 1, borderColor: "gray", borderRadius: 8, backgroundColor: "#fff" }}
            textStyle={{ textAlign: "left", color: "black" }}
            dropDownContainerStyle={{ backgroundColor: "#fff", zIndex: 1500 }}
            placeholderStyle={{ color: "gray" }}
          />

          {/* Botões */}
          <StyledView className="flex-row justify-between">
            <StyledTouchableOpacity onPress={closeModal} className="bg-gray-400 p-2 rounded-md">
              <StyledText className="text-white">Cancelar</StyledText>
            </StyledTouchableOpacity>
            <StyledTouchableOpacity onPress={handleSubmit} className="bg-blue-500 p-2 rounded-md">
              <StyledText className="text-white">{task ? "Editar tarefa" : "Criar tarefa"}</StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        </StyledView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CreationModalforAllScreens;
