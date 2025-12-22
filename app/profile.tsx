import { Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

const BASE_URL = "http://192.168.101.8/HumAI/backend";

export default function Profile() {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // User States
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // Memoized values for the avatar
  const displayFirstName = useMemo(() => (firstName.trim() ? firstName.trim() : "User"), [firstName]);
  const initial = useMemo(() => (displayFirstName?.[0] || "U").toUpperCase(), [displayFirstName]);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const userId = await AsyncStorage.getItem('user_id');
      if (!userId) { router.replace("/login-student"); return; }

      const response = await fetch(`${BASE_URL}/get_profile.php?user_id=${userId}`);
      if (!response.ok) throw new Error("Server response not OK");
      const result = await response.json();

      if (result.success) {
        setFirstName(result.data.first_name || "");
        setLastName(result.data.last_name || "");
        setEmail(result.data.email || "");
        setPhone(result.data.phone_number || "");
      }
    } catch (error) {
      Alert.alert("Error", "Could not load profile.");
    } finally {
      setLoading(false);
    }
  };

  const onSave = async () => {
    if (!editing) return;
    if (phone && !/^[0-9]{10}$/.test(phone)) {
      Alert.alert("Invalid Phone", "Phone number must be exactly 10 digits.");
      return;
    }

    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem('user_id');
      const response = await fetch(`${BASE_URL}/update_profile.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone: phone,
          password: password 
        }),
      });

      const result = await response.json();
      if (result.success) {
        Alert.alert("Success", "Profile updated!");
        setEditing(false);
        setPassword(""); 
        Keyboard.dismiss();
      } else {
        Alert.alert("Update Failed", result.message);
      }
    } catch (error) {
      Alert.alert("Error", "Connection failed.");
    } finally {
      setLoading(false);
    }
  };

  const onLogout = async () => {
    await AsyncStorage.removeItem('user_id');
    setMenuVisible(false);
    router.replace("/login-type");
  };

  if (loading && !editing) {
    return (
      <View style={[styles.bg, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <LinearGradient colors={["#18B949", "#1D492D"]} style={styles.bg}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={22} color="#fff" /></TouchableOpacity>
        <Text style={styles.header}>Profile</Text>
        <TouchableOpacity onPress={() => setMenuVisible(true)}><Feather name="menu" size={22} color="#fff" /></TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.screenPad}>
            <View style={styles.cardWrap}>
              <View style={styles.avatarShadow}>
                <View style={styles.avatar}><Text style={styles.avatarLetter}>{initial}</Text></View>
              </View>

              <View style={styles.card}>
                <TouchableOpacity style={[styles.editBtn, editing && { backgroundColor: '#1A6D45' }]} onPress={() => setEditing(!editing)}>
                  <Feather name={editing ? "x" : "edit-2"} size={16} color={editing ? "#fff" : "#143B28"} />
                </TouchableOpacity>

                <View style={{ marginLeft: 110, marginBottom: 10 }}>
                  <Text style={styles.hello}>Hello!</Text>
                  <Text style={styles.username}>{displayFirstName}</Text>
                </View>

                <TextInput
                  style={[styles.input, !editing && styles.inputDisabled]}
                  placeholder="First Name"
                  value={firstName}
                  onChangeText={setFirstName}
                  editable={editing}
                />
                <TextInput
                  style={[styles.input, !editing && styles.inputDisabled]}
                  placeholder="Last Name"
                  value={lastName}
                  onChangeText={setLastName}
                  editable={editing}
                />
                <TextInput
                  style={[styles.input, !editing && styles.inputDisabled]}
                  placeholder="Email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  editable={editing}
                />
                <TextInput
                  style={[styles.input, !editing && styles.inputDisabled]}
                  placeholder="Phone (10 digits)"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  editable={editing}
                />
                <TextInput
                  style={[styles.input, !editing && styles.inputDisabled]}
                  placeholder="New Password (or leave blank)"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  editable={editing}
                />

                <TouchableOpacity onPress={onSave} style={[styles.saveBtn, !editing && styles.saveBtnDisabled]}>
                  <Text style={[styles.saveText, !editing && styles.saveTextDisabled]}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {menuVisible && (
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.menuOverlay}>
            <View style={styles.dropdownMenu}>
              <TouchableOpacity style={styles.dropdownItem} onPress={() => { setMenuVisible(false); router.push("/dashboard"); }}>
                <Text style={styles.dropdownText}>Dashboard</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dropdownItem} onPress={onLogout}>
                <Text style={[styles.dropdownText, { color: '#FF4444' }]}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  topBar: { paddingTop: 56, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", zIndex: 5 },
  header: { color: "#fff", fontSize: 18, fontWeight: "700" },
  screenPad: { flex: 1, paddingHorizontal: 16, paddingTop: 10 },
  avatarShadow: { position: "absolute", top: -10, left: 6, width: 112, height: 112, borderRadius: 56, shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 10, zIndex: 6 },
  avatar: { width: 112, height: 112, borderRadius: 56, backgroundColor: "#14A26A", borderWidth: 8, borderColor: "#EAFBF0", alignItems: "center", justifyContent: "center" },
  avatarLetter: { color: "#FFFFFF", fontSize: 52, fontWeight: "700" },
  cardWrap: { marginTop: 38, position: "relative" },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, paddingTop: 18, shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
  editBtn: { position: "absolute", right: 12, top: 12, width: 28, height: 28, borderRadius: 8, backgroundColor: "#F0F5F2", alignItems: "center", justifyContent: "center", zIndex: 10 },
  hello: { color: "#1A6D45", fontWeight: "700", fontSize: 16, marginBottom: 2 },
  username: { color: "#1A6D45", fontSize: 28, fontWeight: "900", letterSpacing: 0.5 },
  input: { backgroundColor: "#fff", borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, marginTop: 10, borderWidth: 1, borderColor: "#E6ECE8", color: "#333" },
  inputDisabled: { backgroundColor: '#F9F9F9', borderColor: '#EEE', color: '#666' },
  saveBtn: { marginTop: 16, alignSelf: "center", backgroundColor: "#1A6D45", borderRadius: 10, paddingHorizontal: 28, paddingVertical: 10 },
  saveBtnDisabled: { backgroundColor: "#F1F3F2" },
  saveText: { color: '#fff', fontWeight: "800", fontSize: 16 },
  saveTextDisabled: { color: "#9BA3A7" },
  menuOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 2000, backgroundColor: 'rgba(0,0,0,0.1)' },
  dropdownMenu: { position: "absolute", top: 64, right: 16, backgroundColor: "#FFFFFF", borderRadius: 12, paddingVertical: 6, width: 170, shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.24, shadowRadius: 16, elevation: 16 },
  dropdownItem: { paddingHorizontal: 16, paddingVertical: 12 },
  dropdownText: { fontSize: 16, color: "#143B28", fontWeight: "700" },
});