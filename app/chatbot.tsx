import React, { useState } from "react";
import {
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";

export default function Chatbot() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);

  const send = () => {
    if (!message.trim()) return;
    // TODO: hook to your chatbot backend
    setMessage("");
    Keyboard.dismiss();
  };

  const handleLogout = () => {
    setMenuVisible(false);
    router.replace("/login-type");
  };

  return (
    <LinearGradient colors={["#18B949", "#1D492D"]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.bg}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.title}>Chatbot</Text>

        <TouchableOpacity onPress={() => setMenuVisible(true)} activeOpacity={0.7}>
          <Feather name="menu" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Body */}
      <View style={styles.body}>
        <Image
          source={require("../assets/images/HumAI_logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.welcome}>Welcome to HumAI chatbot</Text>

        {/* Input */}
        <View style={styles.inputRow}>
          <Ionicons name="chatbubble-ellipses-outline" size={18} color="#143B28" />
          <TextInput
            placeholder="Ask anything"
            placeholderTextColor="#cfe6d6"
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            returnKeyType="send"
            onSubmitEditing={send}
          />
          <TouchableOpacity onPress={send} activeOpacity={0.8} style={styles.sendBtn}>
            <Ionicons name="send" size={18} color="#143B28" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.push("/faqs")} activeOpacity={0.7}>
          <Text style={styles.link}>View FAQs</Text>
        </TouchableOpacity>
      </View>

      {/*  Menu Overlay + Dropdown */}
      {menuVisible && (
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.menuOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.dropdownMenu}>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setMenuVisible(false);
                    router.push("/dashboard");
                  }}
                >
                  <Text style={styles.dropdownText}>Dashboard</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setMenuVisible(false);
                    router.push("/profile");
                  }}
                >
                  <Text style={styles.dropdownText}>Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.dropdownItem} onPress={handleLogout}>
                  <Text style={styles.dropdownText}>Logout</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      )}
    </LinearGradient>
  );
}

const DARK = "#143B28";
const CHIP = "#2C6B46";

const styles = StyleSheet.create({
  bg: { flex: 1 },

  topBar: {
    paddingTop: 56,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 5,
  },
  title: { color: "#fff", fontSize: 18, fontWeight: "700" },

  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 18,
    alignItems: "center",
  },
  logo: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#ffffff22",
    marginBottom: 16,
  },
  welcome: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    alignSelf: "flex-start",
    marginTop: 8,
    marginBottom: 16,
  },

  inputRow: {
    width: "100%",
    backgroundColor: CHIP,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontWeight: "700",
  },
  sendBtn: {
    backgroundColor: "#D9F1DF",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  link: {
    color: "#EAFBEF",
    marginTop: 14,
    textDecorationLine: "underline",
  },

  /* ⬇️ Menu overlay styles */
  menuOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 2000, // sits above everything
  },
  dropdownMenu: {
    position: "absolute",
    top: 56 + 8, // just below top bar (matches paddingTop)
    right: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 6,
    width: 170,

    // shadow (iOS)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    // elevation (Android)
    elevation: 16,

    zIndex: 2100,
  },
  dropdownItem: { paddingHorizontal: 16, paddingVertical: 12 },
  dropdownText: { fontSize: 16, color: DARK, fontWeight: "700" },
});