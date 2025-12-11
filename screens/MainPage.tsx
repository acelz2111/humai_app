import { useRouter } from "expo-router";
import React from "react";
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const MainPage: React.FC = () => {
  const router = useRouter();

  return (
    <ImageBackground
      source={require("../assets/images/ricefield-bg.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>🌾 HumAI</Text>
        <Text style={styles.subtitle}>Smart Rice Disease Diagnosis</Text>

        <TouchableOpacity style={styles.button} onPress={() => router.push("/login")}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

export default MainPage;

const styles = StyleSheet.create({
  background: { flex: 1, justifyContent: "center", alignItems: "center" },
  overlay: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 20,
  },
  title: { fontSize: 40, fontWeight: "bold", color: "#fff", marginBottom: 10 },
  subtitle: { fontSize: 18, color: "#fff", marginBottom: 40, textAlign: "center" },
  button: { backgroundColor: "#4CAF50", paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25 },
  buttonText: { fontSize: 18, fontWeight: "bold", color: "#fff" },
});
