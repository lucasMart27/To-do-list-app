import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import TodayScreen from "../app/(tabs)/today"; // Ajuste o caminho se necessário

test("Deve adicionar uma tarefa e exibi-la na tela", () => {
  const { getByPlaceholderText, getByText } = render(<TodayScreen />);

  const input = getByPlaceholderText("Digite sua tarefa...");
  fireEvent.changeText(input, "Nova Tarefa");

  const addButton = getByText("Adicionar");
  fireEvent.press(addButton);

  expect(getByText("Nova Tarefa")).toBeTruthy();
});
