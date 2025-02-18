import React /*, { useEffect, useState }*/ from "react";
import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { store } from "../store/store";
// import { GoogleSignin } from "@react-native-google-signin/google-signin"; // Comentei para evitar erros
import { View, ActivityIndicator } from "react-native";
import LoginScreen from "../app/LoginScreen"; // Ajuste o caminho conforme necessário

export default function RootLayout() {
  // 🔹 Comentei a lógica de login para evitar erros enquanto configura o Google Sign-In
  /*
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkUserSignIn = async () => {
      try {
        await GoogleSignin.hasPlayServices(); // Garante que os serviços do Google estão disponíveis
        const user = await GoogleSignin.signInSilently(); // Tenta logar automaticamente
        setIsSignedIn(!!user); // Define como `true` se o usuário estiver logado
      } catch (error) {
        setIsSignedIn(false); // Define como `false` se houver erro (usuário não logado)
      }
    };

    checkUserSignIn();
  }, []);

  if (isSignedIn === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    ); // Exibe um loading enquanto verifica o login
  }
  */

  return (
    <Provider store={store}>
      {/* 🔹login, descomente essa parte */}
      {/* {isSignedIn ? ( */}
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false, title: "" }} />
        <Stack.Screen name="project-details" options={{ title: "" }} />
      </Stack>
      {/* ) : (
        <LoginScreen />
      )} */}
    </Provider>
  );
}
