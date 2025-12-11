import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
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
} from "react-native";

export default function Profile() {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // Replace with real user data
  const username = useMemo(() => (fullName.trim() ? fullName.trim().split(" ")[0] : "Username"), [fullName]);
  const initial = useMemo(() => (username?.[0] || "A").toUpperCase(), [username]);

  const hasChanges = fullName || email || phone || password;

  const onSave = () => {
    if (!editing || !hasChanges) return;
    // TODO: persist data to your backend
    setEditing(false);
    Keyboard.dismiss();
  };

  const onLogout = () => {
    setMenuVisible(false);
    router.replace("/login-type");
  };

  return (
    <LinearGradient colors={["#18B949", "#1D492D"]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.bg}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.header}>Profile</Text>
        <TouchableOpacity onPress={() => setMenuVisible(true)} activeOpacity={0.7}>
          <Feather name="menu" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.select({ ios: "padding", android: undefined })} style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.screenPad}>
            {/* Card wrapper (for avatar overlap) */}
            <View style={styles.cardWrap}>
              {/* Avatar */}
              <View style={styles.avatarShadow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarLetter}>{initial}</Text>
                </View>
              </View>

              {/* Card */}
              <View style={styles.card}>
                {/* Edit button (pencil) */}
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => setEditing((e) => !e)}
                  accessibilityLabel="Edit profile"
                >
                  <Feather name="edit-2" size={16} color="#143B28" />
                </TouchableOpacity>

                {/* Greeting + Username */}
                <View style={{ marginLeft: 110, marginBottom: 10 }}>
                  <Text style={styles.hello}>Hello!</Text>
                  <Text style={styles.username}>{username}</Text>
                </View>

                {/* Inputs */}
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  placeholderTextColor="#9BA3A7"
                  value={fullName}
                  onChangeText={setFullName}
                  editable={editing}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#9BA3A7"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  editable={editing}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Phone number"
                  placeholderTextColor="#9BA3A7"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  editable={editing}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#9BA3A7"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  editable={editing}
                />

                {/* Save */}
                <TouchableOpacity
                  activeOpacity={editing && hasChanges ? 0.8 : 1}
                  onPress={onSave}
                  style={[styles.saveBtn, !(editing && hasChanges) && styles.saveBtnDisabled]}
                >
                  <Text style={[styles.saveText, !(editing && hasChanges) && styles.saveTextDisabled]}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

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

const CARD_BG = "#FFFFFF";
const DARK = "#143B28";

const styles = StyleSheet.create({
  bg: { flex: 1 },

  /* Top bar */
  topBar: {
    paddingTop: 56,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 5,
  },
  header: { color: "#fff", fontSize: 18, fontWeight: "700" },

  screenPad: { flex: 1, paddingHorizontal: 16, paddingTop: 10 },

  /* Avatar */
  avatarShadow: {
    position: "absolute",
    top: -10,
    left: 6,
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: "transparent",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
    zIndex: 6,
  },
  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: "#14A26A",
    borderWidth: 8,
    borderColor: "#EAFBF0",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: {
    color: "#FFFFFF",
    fontSize: 52,
    fontWeight: "700",
  },

  /* Card + wrapper (so avatar overlaps) */
  cardWrap: { marginTop: 38, position: "relative" },

  card: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 16,
    paddingTop: 18,
    // subtle drop shadow
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },

  /* Edit button (pencil) */
  editBtn: {
    position: "absolute",
    right: 12,
    top: 12,
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#F0F5F2",
    alignItems: "center",
    justifyContent: "center",
  },

  /* Hello + Username styling */
  hello: {
    color: "#1A6D45",
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 2,
  },
  username: {
    color: "#1A6D45",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 0.5,
    // faux embossed look
    textShadowColor: "rgba(20, 59, 40, 0.35)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },

  /* Inputs */
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#E6ECE8",
    // soft shadow like your mock
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  /* Save button */
  saveBtn: {
    marginTop: 16,
    alignSelf: "center",
    backgroundColor: "#E8F5EC",
    borderRadius: 10,
    paddingHorizontal: 28,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  saveBtnDisabled: {
    backgroundColor: "#F1F3F2",
    shadowOpacity: 0.05,
  },
  saveText: { color: DARK, fontWeight: "800", fontSize: 16 },
  saveTextDisabled: { color: "#9BA3A7" },

  /* Menu overlay */
  menuOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 2000,
  },
  dropdownMenu: {
    position: "absolute",
    top: 56 + 8,
    right: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 6,
    width: 170,
    // shadows
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 16,
    zIndex: 2100,
  },
  dropdownItem: { paddingHorizontal: 16, paddingVertical: 12 },
  dropdownText: { fontSize: 16, color: DARK, fontWeight: "700" },
});