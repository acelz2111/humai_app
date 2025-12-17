import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // ✅ Added
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
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

// Assume the correct path to the backend
const SERVER_URL = "http://172.16.54.179/HumAI/backend/login.php";

const { width } = Dimensions.get("window");

export default function StudentLogin() {
  const router = useRouter();
  
  // --- STATE MANAGEMENT ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 

  // --- ANIMATIONS & TOAST ---
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("error");
  const [toastVisible, setToastVisible] = useState(false);
  const toastAnim = useRef(new Animated.Value(-80)).current;

  // --- HELPERS ---
  const showToast = (msg: string, type: "success" | "error" = "error") => {
    setToastMsg(msg);
    setToastType(type);
    setToastVisible(true);
    
    Animated.timing(toastAnim, {
      toValue: 40, 
      duration: 300,
      useNativeDriver: false,
      easing: Easing.out(Easing.back(1.5)),
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

  // --- MAIN LOGIN LOGIC (UPDATED) ---
  const handleLogin = async () => {
    Keyboard.dismiss();

    if (!email.trim() || !password.trim()) {
      showToast("Please enter email and password.", "error");
      return;
    }

    setLoading(true);

    try {
      console.log(`[Connecting] ${SERVER_URL}`);

      const response = await fetch(SERVER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const text = await response.text(); 
      console.log(`[Response] ${text.substring(0, 100)}...`); 

      try {
        const result = JSON.parse(text);
        
        if (result.success) {
            // ✅ CRITICAL: Save the User ID as a string
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
        console.error("JSON Error (Server Crash):", text);
        setLoading(false);
        showToast("Server Error. Check XAMPP logs.", "error");
      }

    } catch (networkError) {
      console.error("Network Error:", networkError);
      setLoading(false);
      showToast("Cannot connect to server. Check IP and XAMPP.", "error");
    }
  };

  // --- UI RENDERING ---
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PanGestureHandler
        onGestureEvent={handleGesture}
        activeOffsetX={[0, 20]}
        failOffsetY={[-20, 20]}
      >
        <View style={{ flex: 1 }}>
          <LinearGradient
            colors={["#18B949", "#1D492D"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.background}
          >
            {/* Toast Notification */}
            {toastVisible && (
              <Animated.View
                style={[
                  styles.toast,
                  toastType === "success" ? styles.toastSuccess : styles.toastError,
                  { top: toastAnim, width: width - 44, left: 22 }
                ]}
              >
                <Text style={[
                  styles.toastText,
                  toastType === "success" ? styles.toastTextSuccess : styles.toastTextError,
                ]}>
                  {toastMsg}
                </Text>
              </Animated.View>
            )}

            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.replace("/login-type")}
              activeOpacity={0.7}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <Image 
                source={require("../assets/icons/arrow-left.png")} 
                style={styles.backIcon} 
              />
            </TouchableOpacity>

            <View style={styles.content}>
              <View style={{ height: 28 }} />

              {/* Logo */}
              <View style={styles.logoContainer}>
                <Image
                  source={require("../assets/images/HumAI_logo.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.textSection}>
                <Text style={styles.subheading}>Student Login</Text>
              </View>

              <View style={{ height: 19 }} />

              {/* Inputs */}
              <TextInput
                placeholder="Email"
                placeholderTextColor="#b1ebd7"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              
              {/* Password Input Wrapper */}
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
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons 
                      name={showPassword ? "eye-outline" : "eye-off-outline"} 
                      size={24} 
                      color="#b1ebd7" 
                    />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  styles.button1,
                  loading && { backgroundColor: "#10953a90" }
                ]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.88}
              >
                <Text style={styles.buttonText}>{loading ? "Logging in..." : "Login"}</Text>
              </TouchableOpacity>
              
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
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    marginBottom: 20,
    marginTop: 0,
    alignItems: "center",
  },
  logo: {
    width: 142,
    height: 142,
    borderRadius: 71,
  },
  textSection: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    marginTop: 2,
  },
  subheading: {
    fontSize: 24,
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    letterSpacing: 0.5,
    marginTop: 2,
  },
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
    shadowColor: "#18B949",
    shadowOpacity: 0.08,
    shadowRadius: 7,
  },
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 250,
    marginBottom: 15,
    position: 'relative', 
  },
  passwordInput: {
    flex: 1, 
    marginBottom: 0, 
    paddingRight: 50, 
  },
  toggleButton: {
    position: 'absolute',
    right: 15,
    padding: 5,
  },
  button1: {
    backgroundColor: "#18B949",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginVertical: 13,
    borderColor: "#fff",
    borderWidth: 1,
    width: 250,
    alignItems: "center",
    shadowColor: "#18B949",
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold", letterSpacing: 0.5 },
  signupRow: {
    flexDirection: "row",
    marginTop: 16,
    alignItems: "center",
    justifyContent: "center"
  },
  sign: { fontSize: 14, color: "#fff" },
  signupText: { fontSize: 14, fontWeight: "bold", color: "#b1ebd7" }, 
  backButton: {
    position: "absolute",
    top: Platform.OS === "android" ? 44 : 70,
    left: 24,
    zIndex: 10,
  },
  backIcon: {
    width: 28,
    height: 28,
    resizeMode: "contain",
    tintColor: "#fff",
  },
  toast: {
    position: "absolute",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    elevation: 7,
    shadowColor: "#007333",
    shadowOpacity: 0.11,
    shadowRadius: 10,
    alignItems: "center",
    alignSelf: "center",
    zIndex: 99,
  },
  toastText: {
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.7,
    textAlign: "center",
  },
  toastError: { borderLeftWidth: 7, borderLeftColor: "#b60e34" },
  toastTextError: { color: "#b60e34" },
  toastSuccess: { borderLeftWidth: 7, borderLeftColor: "#18B949" },
  toastTextSuccess: { color: "#18B949" },
});