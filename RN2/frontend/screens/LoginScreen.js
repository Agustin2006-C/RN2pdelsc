import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import axios from "axios";

WebBrowser.maybeCompleteAuthSession();

// ⚠️ Cambia esta URL por tu backend
const BACKEND_URL = "315886621923-h8fusal5ki8u0fkknrfsg7bunca26u6g.apps.googleusercontent.com";

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Configuración de Google OAuth para Android, iOS y Web
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: "TU_EXPO_CLIENT_ID.apps.googleusercontent.com", // Expo Go
    androidClientId: "TU_ANDROID_CLIENT_ID.apps.googleusercontent.com", // Android
    iosClientId: "TU_IOS_CLIENT_ID.apps.googleusercontent.com", // iOS
    webClientId: "TU_WEB_CLIENT_ID.apps.googleusercontent.com", // Web ⚠️ obligatorio para navegador
  });

  // Manejo de respuesta de Google
  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      handleGoogleLogin(authentication.accessToken);
    }
  }, [response]);

  // Enviar token de Google al backend
  const handleGoogleLogin = async (accessToken) => {
    try {
      const res = await axios.post(`${BACKEND_URL}/google-login`, { token: accessToken });
      if (res.data.ok) {
        Alert.alert("Inicio de sesión con Google correcto");
        navigation.replace("Profile", { user: res.data.user });
      }
    } catch (err) {
      Alert.alert("Error con Google", err.response?.data?.error || "Error al conectar con el servidor");
    }
  };

  // Login manual
  const handleLogin = async () => {
    if (!username || !password) return Alert.alert("Campos vacíos");

    try {
      const res = await axios.post(`${BACKEND_URL}/select/users`, { username, password });
      if (res.data.ok) {
        Alert.alert("Inicio de sesión correcto");
        navigation.replace("Profile", { user: res.data.data });
      }
    } catch (err) {
      Alert.alert("Error", err.response?.data?.error || "Error al iniciar sesión");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar sesión</Text>

      <TextInput
        style={styles.input}
        placeholder="Usuario"
        onChangeText={setUsername}
        value={username}
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />

      <Button title="Ingresar" onPress={handleLogin} />

      <View style={{ marginTop: 20 }} />
      <Button
        title="Ingresar con Google"
        onPress={() => {
          if (request) promptAsync();
          else Alert.alert("Error", "Google Auth no está listo");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 26, textAlign: "center", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
});
