import React, { useState } from "react";
import { View, Text, Button, Image } from "react-native";
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";

const LoginScreen = () => {
  const [userInfo, setUserInfo] = useState(null);

  const signInWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices(); // Verifica se há suporte ao Google Play Services
      const user = await GoogleSignin.signIn(); // Abre o pop-up de login
      setUserInfo(user); // Salva os dados do usuário
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("Login cancelado pelo usuário.");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log("Login em andamento...");
      } else {
        console.log("Erro no login:", error);
      }
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {userInfo ? (
        <>
          <Image source={{ uri: userInfo.user.photo }} style={{ width: 100, height: 100, borderRadius: 50 }} />
          <Text>Bem-vindo, {userInfo.user.name}!</Text>
          <Text>{userInfo.user.email}</Text>
        </>
      ) : (
        <>
          <Text>Faça login com Google</Text>
          <Button title="Login com Google" onPress={signInWithGoogle} />
        </>
      )}
    </View>
  );
};

export default LoginScreen;
