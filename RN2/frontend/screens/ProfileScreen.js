import React, { useState } from "react";
import { View, Text, TextInput, Button, Image, StyleSheet, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import axios from "axios";

const BACKEND_URL = "315886621923-h8fusal5ki8u0fkknrfsg7bunca26u6g.apps.googleusercontent.com"; // ⚠️ CAMBIA ESTO

export default function ProfileScreen({ route }) {
  const user = route.params?.user || {};
  const [nombre, setNombre] = useState(user.nombre || "");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [foto, setFoto] = useState(null);
  const [documento, setDocumento] = useState("");

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
    });
    if (!result.canceled) setFoto(result.assets[0].uri);
  };

  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso denegado");
      return;
    }
    const loc = await Location.getCurrentPositionAsync({});
    setDireccion(`Lat: ${loc.coords.latitude}, Lon: ${loc.coords.longitude}`);
  };

  const updateProfile = async () => {
    try {
      await axios.put(`${BACKEND_URL}/update/profile/${user.id || 1}`, {
        nombre,
        foto,
        direccion,
        telefono,
        documento,
      });
      Alert.alert("Perfil actualizado");
    } catch (err) {
      Alert.alert("Error", "No se pudo actualizar el perfil");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil de Usuario</Text>

      {foto && <Image source={{ uri: foto }} style={styles.image} />}
      <Button title="Cambiar Foto" onPress={pickImage} />

      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={nombre}
        onChangeText={setNombre}
      />
      <TextInput
        style={styles.input}
        placeholder="Teléfono"
        value={telefono}
        onChangeText={setTelefono}
      />
      <TextInput
        style={styles.input}
        placeholder="Documento"
        value={documento}
        onChangeText={setDocumento}
      />
      <TextInput
        style={styles.input}
        placeholder="Dirección"
        value={direccion}
        onChangeText={setDireccion}
      />

      <Button title="Obtener ubicación actual" onPress={getLocation} />
      <View style={{ marginVertical: 10 }} />
      <Button title="Guardar perfil" onPress={updateProfile} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, textAlign: "center", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  image: { width: 120, height: 120, borderRadius: 60, alignSelf: "center", margin: 10 },
});
