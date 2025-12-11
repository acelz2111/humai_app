import React, { useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function Feedback() {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const onSubmit = () => {
    const payload = text.trim();
    if (!payload) {
      inputRef.current?.focus();
      return;
    }
    Keyboard.dismiss();
    // TODO: send `payload` to your backend here
    setSubmitted(true);
  };

  const onLogout = () => {
    setMenuVisible(false);
    router.replace("/login-type");
  };

  return (
    <LinearGradient
      colors={["#18B949", "#1D492D"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.bg}
    >
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.title}>Feedback</Text>

        <TouchableOpacity onPress={() => setMenuVisible((v) => !v)} activeOpacity={0.7}>
          <Feather name="menu" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Body */}
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.content}>
    <View style={styles.body}>
        <Image
          source={require("../assets/images/HumAI_logo.png")} 
          style={styles.logo}
          resizeMode="cover"
        />
            </View>

            <Text style={styles.heading}>
              {submitted ? "Thank you for sharing your thoughts with us." : "Share your thoughts with us."}
            </Text>

            {submitted ? (
              <View style={styles.submittedWrap}>
                <View style={styles.submitBtnDisabled}>
                  <Text style={styles.submitBtnDisabledText}>Feedback Submitted</Text>
                </View>
              </View>
            ) : (
              <>
                <TextInput
                  ref={inputRef}
                  placeholder="Enter feedback here"
                  placeholderTextColor="#CDE9D4"
                  value={text}
                  onChangeText={setText}
                  multiline
                  numberOfLines={5}
                  style={styles.input}
                  textAlignVertical="top"
                  returnKeyType="done"
                  onSubmitEditing={onSubmit}
                />
                <TouchableOpacity onPress={onSubmit} activeOpacity={0.9} style={styles.submitBtn}>
                  <Text style={styles.submitBtnText}>Submit Feedback</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* ✅ Menu Overlay + Dropdown (moved OUTSIDE topBar) */}
      {menuVisible && (
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.menuOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.dropdown}>
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

                <TouchableOpacity style={styles.dropdownItem} onPress={onLogout}>
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

const styles = StyleSheet.create({
  bg: { flex: 1 },

  /* Top bar */
  topBar: {
    paddingTop: 56,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 5, // stays above gradient
  },
  title: { color: "#fff", fontSize: 18, fontWeight: "700" },

  /* Menu */
  menuOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 2000,
  },
  dropdown: {
    position: "absolute",
    top: 56 + 8, // below the top bar
    right: 18,
    backgroundColor: "#FFFFFF",
    width: 160,
    borderRadius: 12,
    paddingVertical: 6,
    // shadows
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 16,
    zIndex: 2100,
  },
  dropdownItem: { paddingHorizontal: 16, paddingVertical: 12 },
  dropdownText: { color: DARK, fontSize: 16, fontWeight: "700" },

  /* Body */
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 28,
  },

  body: {
    alignSelf: "center",
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#1E6C40",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 80,
    resizeMode: "contain",
  },

  heading: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    alignSelf: "flex-start",
  },

  input: {
    backgroundColor: "#4AA86A55",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 120,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#9AD5AE55",
    marginBottom: 14,
    fontSize: 16,
  },

  submitBtn: {
    alignSelf: "center",
    backgroundColor: "#E8F5EC",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  submitBtnText: { color: DARK, fontWeight: "800", fontSize: 16 },

  submittedWrap: { alignItems: "center", marginTop: 12 },
  submitBtnDisabled: {
    backgroundColor: "#4AA86A55",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: "#9AD5AE66",
  },
  submitBtnDisabledText: { color: "#E8F5EC", fontWeight: "800", fontSize: 16 },
});