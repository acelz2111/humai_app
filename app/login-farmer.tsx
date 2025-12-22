import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import {
  GestureHandlerRootView,
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from "react-native-gesture-handler";

const { width } = Dimensions.get('window');
const SERVER_URL = "http://192.168.101.8/HumAI/backend/login.php";

export default function FarmerLogin() {
  const router = useRouter();
  
  // --- STATE ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 

  // --- TOAST ANIMATIONS ---
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("error");
  const [toastVisible, setToastVisible] = useState(false);
  const toastAnim = useRef(new Animated.Value(-80)).current;

  const showToast = (msg: string, type: "success" | "error" = "error") => {
    setToastMsg(msg);
    setToastType(type);
    setToastVisible(true);
    Animated.timing(toastAnim, {
      toValue: 40,
      duration: 300,
      useNativeDriver: false,
      easing: Easing.out(Easing.back(1.5))
    }).start(() => {
      setTimeout(() => {
        Animated.timing(toastAnim, {
          toValue: -80,
          duration: 250,
          useNativeDriver: false,
        }).start(() => setToastVisible(false));
      }, 2000);
    });
  };

  const handleGesture = (event: PanGestureHandlerGestureEvent) => {
    const { translationX, x } = event.nativeEvent;
    if (x < 60 && translationX > 50) {
      router.replace("/login-type");
    }
  };

  const handleLogin = async () => {
    Keyboard.dismiss();

    if (!email.trim() || !password.trim()) {
      showToast("Please enter email and password.", "error");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(SERVER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const text = await response.text();

      try {
        const result = JSON.parse(text);
        
        if (result.success) {
            const userId = result.user.id.toString(); 
            await AsyncStorage.setItem('user_id', userId); 
            
            setLoading(false);
            showToast("Login successful!", "success");
            setTimeout(() => router.replace("/dashboard"), 900); 
        } else {
            setLoading(false);
            showToast(result.message || "Invalid credentials.", "error");
        }
      } catch (jsonError) {
        setLoading(false);
        showToast("Server Error. Check database.", "error");
      }

    } catch (networkError) {
      setLoading(false);
      showToast("Cannot connect to server.", "error");
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PanGestureHandler onGestureEvent={handleGesture} activeOffsetX={[0, 20]}>
        <View style={{ flex: 1 }}>
          <LinearGradient
            colors={["#18B949", "#1D492D"]}
            style={styles.background}
          >
            {toastVisible && (
              <Animated.View style={[styles.toast, toastType === "success" ? styles.toastSuccess : styles.toastError, { top: toastAnim, width: width - 44, left: 22 }]}>
                <Text style={[styles.toastText, toastType === "success" ? styles.toastTextSuccess : styles.toastTextError]}>
                  {toastMsg}
                </Text>
              </Animated.View>
            )}

            <TouchableOpacity style={styles.backButton} onPress={() => router.replace("/login-type")}>
              <Image source={require("../assets/icons/arrow-left.png")} style={styles.backIcon} />
            </TouchableOpacity>

            <View style={styles.content}>
              <View style={styles.logoCard}>
                <Image source={require("../assets/images/HumAI_logo.png")} style={styles.logo} resizeMode="contain" />
              </View>

              <View style={styles.textSection}>
                <Text style={styles.headline}>Welcome Back!</Text>
                <Text style={styles.subheading}>Farmer Login</Text>
              </View>

              <View style={{ height: 19 }} />

              <TextInput
                placeholder="Email"
                placeholderTextColor="#b1ebd7"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              
              <View style={styles.passwordInputWrapper}>
                <TextInput
                  placeholder="Password"
                  placeholderTextColor="#b1ebd7"
                  secureTextEntry={!showPassword} 
                  style={[styles.input, styles.passwordInput]}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  style={styles.toggleButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                    <Ionicons 
                      name={showPassword ? "eye-outline" : "eye-off-outline"} 
                      size={22} 
                      color="#b1ebd7" 
                    />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.button1, loading && { backgroundColor: "#10953a90" }]}
                onPress={handleLogin}
                disabled={loading}
              >
                <Text style={styles.buttonText}>{loading ? "Logging in..." : "Login"}</Text>
              </TouchableOpacity>

              {/* ✅ ADDED SIGN UP ROW */}
              <View style={styles.signupRow}>
                <Text style={styles.sign}>Don't have an account?</Text>
                <TouchableOpacity onPress={() => router.push("/signup")}>
                  <Text style={styles.signupText}> Sign Up</Text>
                </TouchableOpacity>
              </View>

              <View style={{ height: 36 }} />
            </View>
          </LinearGradient>
        </View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
  logoCard: {
    backgroundColor: "#fff",
    borderRadius: 100,
    padding: 14,
    marginBottom: 18,
    alignItems: "center",
    elevation: 7,
  },
  logo: { width: 128, height: 128, borderRadius: 64, borderColor: "#18B949", borderWidth: 2 },
  textSection: { alignItems: "center", marginBottom: 14 },
  headline: { fontSize: 27, fontWeight: "bold", color: "#fff", letterSpacing: 0.9 },
  subheading: { fontSize: 18, color: "#e9ffe5", fontWeight: "600", letterSpacing: 0.5 },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.10)",
    width: 250,
    paddingVertical: 13,
    paddingHorizontal: 17,
    borderRadius: 13,
    marginBottom: 15,
    color: "#fff",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#18B949",
  },
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 250,
    marginBottom: 15,
    position: 'relative', 
  },
  passwordInput: { flex: 1, marginBottom: 0, paddingRight: 45 },
  toggleButton: { position: 'absolute', right: 15, padding: 5 },
  button1: {
    backgroundColor: "#18B949",
    paddingVertical: 12,
    borderRadius: 30,
    marginVertical: 13,
    borderColor: "#fff",
    borderWidth: 1,
    width: 250,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold", letterSpacing: 0.5 },
  
  // ✅ STYLES FOR SIGNUP OPTION
  signupRow: {
    flexDirection: "row",
    marginTop: 16,
    alignItems: "center",
    justifyContent: "center"
  },
  sign: { fontSize: 14, color: "#fff" },
  signupText: { fontSize: 14, fontWeight: "bold", color: "#b1ebd7" },

  backButton: { position: "absolute", top: Platform.OS === "android" ? 44 : 60, left: 18, zIndex: 10 },
  backIcon: { width: 24, height: 24, tintColor: "#fff" },
  toast: {
    position: "absolute",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    elevation: 7,
    alignItems: "center",
    alignSelf: "center",
    zIndex: 99,
  },
  toastText: { fontSize: 16, fontWeight: "bold", textAlign: "center" },
  toastError: { borderLeftWidth: 8, borderLeftColor: "#b60e34" },
  toastTextError: { color: "#b60e34" },
  toastSuccess: { borderLeftWidth: 8, borderLeftColor: "#18B949" },
  toastTextSuccess: { color: "#18B949" },
});