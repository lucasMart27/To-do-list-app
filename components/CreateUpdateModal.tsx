import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import {
  createNewTask as createNewTaskAction,
  updateTask,
} from "@/slices/taskSlice";
import { styled } from "nativewind";
import DateTimePicker from "@react-native-community/datetimepicker";
import DropDownPicker from "react-native-dropdown-picker";

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

const CreateNewTask: React.FC<{
  closeModal: () => void;
  projectId: string;
  task?: any;
}> = ({ closeModal, projectId, task }) => {
  const [content, setContent] = useState(task?.content ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [dueDate, setDueDate] = useState(task?.dueDate ? new Date(task.dueDate) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [open, setOpen] = useState(false);
  const [priority, setPriority] = useState(task?.priority ?? 1);

  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = () => {
    const taskData = {
      content,
      description: description || undefined,
      dueDate: dueDate ? dueDate.toISOString() : undefined,
      priority,
    };

    if (task) {
      dispatch(updateTask({ id: task.id, ...taskData }));
    } else {
      dispatch(createNewTaskAction({ ...taskData, projectId }));
    }
    closeModal();
  };

  const onDateChange = (_: any, selectedDate?: Date) => {
    if (selectedDate) {
      setDueDate(selectedDate);
    }
    if (Platform.OS !== "ios") {
      setShowDatePicker(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <StyledView className="p-4 bg-white rounded-md w-80">
        {/* Input de Conteúdo */}
        <StyledTextInput
          className="p-2 border-2 border-gray-200 mb-2 w-full"
          placeholder="Adicionar item"
          placeholderTextColor="#A0AEC0"
          value={content}
          onChangeText={setContent}
        />

        {/* Input de Descrição */}
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
          <StyledText>
            {dueDate ? dueDate.toLocaleDateString() : "Selecionar data de vencimento"}
          </StyledText>
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
          open={open}
          value={priority}
          items={priorities}
          setOpen={setOpen}
          setValue={setPriority}
          placeholder="Selecione a prioridade"
          containerStyle={{ width: "100%", marginBottom: 10 }}
          style={{
            borderWidth: 1,
            borderColor: "gray",
            borderRadius: 8,
            backgroundColor: "#fff",
          }}
          textStyle={{ textAlign: "left", color: "black" }}
          dropDownContainerStyle={{ backgroundColor: "#fff" }}
          placeholderStyle={{ color: "gray" }}
        />

        {/* Botões */}
        <StyledView className="flex-row justify-between">
          <StyledTouchableOpacity onPress={handleSubmit} className="bg-blue-500 p-2 rounded-md">
            <StyledText className="text-white">{task ? "Editar tarefa" : "Criar tarefa"}</StyledText>
          </StyledTouchableOpacity>

          <StyledTouchableOpacity onPress={closeModal} className="bg-gray-400 p-2 rounded-md">
            <StyledText className="text-white">Cancelar</StyledText>
          </StyledTouchableOpacity>
        </StyledView>
      </StyledView>
    </KeyboardAvoidingView>
  );
};

export default CreateNewTask;
