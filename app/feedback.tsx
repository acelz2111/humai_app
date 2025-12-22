import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const SUBMIT_URL = "http://192.168.101.8/HumAI/backend/submit_feedback.php";

export default function Feedback() {
  const router = useRouter();
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!comments.trim()) {
      Alert.alert("Empty", "Please type something before submitting.");
      return;
    }

    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem('user_id');
      if (!userId) {
        router.replace("/login-student");
        return;
      }

      const response = await fetch(SUBMIT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          comments: comments.trim(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        Alert.alert("Success", result.message, [
          { text: "OK", onPress: () => router.back() }
        ]);
      } else {
        Alert.alert("Error", result.message);
      }
    } catch (error) {
      Alert.alert("Error", "Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#18B949", "#1D492D"]} style={styles.bg}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.header}>Feedback</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.content}>
            <Text style={styles.label}>How can we improve HumAI?</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Type your suggestions or report issues here..."
              placeholderTextColor="#b1ebd7"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              value={comments}
              onChangeText={setComments}
            />

            <TouchableOpacity
              style={[styles.submitBtn, loading && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#143B28" />
              ) : (
                <Text style={styles.submitText}>Submit Feedback</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 20 },
  topBar: {
    paddingTop: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  header: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  content: { flex: 1, alignItems: "center" },
  label: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
    alignSelf: "flex-start",
  },
  textArea: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    width: "100%",
    borderRadius: 15,
    padding: 15,
    color: "#fff",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#18B949",
    minHeight: 150,
  },
  submitBtn: {
    backgroundColor: "#fff",
    marginTop: 30,
    width: "100%",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  submitText: { color: "#143B28", fontWeight: "bold", fontSize: 18 },
});