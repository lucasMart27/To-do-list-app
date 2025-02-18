import { taskReducer, addTask, completeTask, deleteTask } from "../taskSlice";

describe("taskSlice", () => {
  test("Deve adicionar uma nova tarefa", () => {
    const initialState = { tasks: [] };
    const newTask = { id: "1", content: "Nova Tarefa", createdAt: "2024-02-17" };
    const newState = taskReducer(initialState, addTask(newTask));

    expect(newState.tasks.length).toBe(1);
    expect(newState.tasks[0].content).toBe("Nova Tarefa");
  });

  test("Deve marcar uma tarefa como concluída", () => {
    const initialState = { tasks: [{ id: "1", content: "Tarefa", completed: false }] };
    const newState = taskReducer(initialState, completeTask("1"));

    expect(newState.tasks[0].completed).toBe(true);
  });

  test("Deve deletar uma tarefa", () => {
    const initialState = { tasks: [{ id: "1", content: "Tarefa", completed: false }] };
    const newState = taskReducer(initialState, deleteTask("1"));

    expect(newState.tasks.length).toBe(0);
  });
});
