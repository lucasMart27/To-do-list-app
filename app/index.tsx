import { Redirect } from "expo-router";

export default function Index() {
  console.log("Index.tsx foi carregado!"); // Adiciona log para depuração
  return <Redirect href="/today" />;
}
