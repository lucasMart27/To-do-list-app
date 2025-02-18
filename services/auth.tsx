import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Configuração do Google Sign-In
GoogleSignin.configure({
  webClientId: "SEU_CLIENT_ID_AQUI", // Substitua pelo seu Client ID
  offlineAccess: true, // Para obter refresh token
});
