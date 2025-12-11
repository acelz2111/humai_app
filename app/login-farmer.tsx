import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

const { width } = Dimensions.get('window');
const SERVER_URL = "http://172.16.54.179/myapp/login.php";

export default function FarmerLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Toast states
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("error");
  const [toastVisible, setToastVisible] = useState(false);
  const toastAnim = React.useRef(new Animated.Value(-80)).current;

  const showToast = (msg, type = "error") => {
    setToastMsg(msg);
    setToastType(type);
    setToastVisible(true);
    Animated.timing(toastAnim, {
      toValue: 34,
      duration: 280,
      useNativeDriver: false,
      easing: Easing.out(Easing.cubic)
    }).start(() => {
      setTimeout(() => {
        Animated.timing(toastAnim, {
          toValue: -80,
          duration: 260,
          useNativeDriver: false,
        }).start(() => setToastVisible(false));
      }, 1800);
    });
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showToast("Please enter both email and password.", "error");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(SERVER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();
      if (result.success) {
        setLoading(false);
        showToast("Login successful!", "success");
        setTimeout(() => router.replace("/dashboard"), 900);
      } else {
        setLoading(false);
        showToast(result.message || "Invalid credentials.", "error");
      }
    } catch (err) {
      setLoading(false);
      showToast("Cannot connect to server.", "error");
    }
  };

  return (
    <LinearGradient
      colors={["#18B949", "#1D492D"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.background}
    >
      {toastVisible && (
        <Animated.View
          style={[
            styles.toast,
            toastType === "success"
              ? styles.toastSuccess
              : styles.toastError,
            { top: toastAnim, width: width - 44, left: 22 }
          ]}
        >
          <Text style={[
            styles.toastText,
            toastType === "success"
              ? styles.toastTextSuccess
              : styles.toastTextError,
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
      >
        <Image
          source={require("../assets/icons/arrow-left.png")}
          style={styles.backIcon}
        />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={{ height: 28 }} />

        {/* Logo Card */}
        <View style={styles.logoCard}>
          <Image
            source={require("../assets/images/HumAI_logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Headline and Subheading */}
        <View style={styles.textSection}>
          <Text style={styles.headline}>Welcome Back!</Text>
          <Text style={styles.subheading}>Farmer Login</Text>
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
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#b1ebd7"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />
        {/* Login Button */}
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

        {/* Sign Up Row */}
        <View style={styles.signupRow}>
          <Text style={styles.sign}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => router.push("/signup")}>
            <Text style={styles.signupText}> Sign Up</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 36 }} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoCard: {
    backgroundColor: "#fff",
    borderRadius: 100,
    padding: 14,
    marginBottom: 18,
    marginTop: 28,
    shadowColor: "#18B949",
    shadowOpacity: 0.09,
    shadowRadius: 12,
    elevation: 7,
    alignItems: "center",
  },
  logo: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderColor: "#18B949",
    borderWidth: 2,
  },
  textSection: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    marginTop: 2,
  },
  headline: {
    fontSize: 27,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
    textAlign: "center",
    letterSpacing: 0.9,
  },
  subheading: {
    fontSize: 18,
    color: "#e9ffe5",
    textAlign: "center",
    fontWeight: "600",
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
  signupText: { fontSize: 14, fontWeight: "bold", color: "#10953a" },
  backButton: { position: "absolute", top: 60, left: 18 },
  backIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
    tintColor: "#fff",
  },
  toast: {
    position: "absolute",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 16,
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
  toastError: { borderLeftWidth: 8, borderLeftColor: "#b60e34" },
  toastTextError: { color: "#b60e34" },
  toastSuccess: { borderLeftWidth: 8, borderLeftColor: "#18B949" },
  toastTextSuccess: { color: "#18B949" },
});
