import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

// CHANGE THIS TO YOUR PC LAN IP and XAMPP folder route
const SERVER_URL = "http://192.168.101.8/myapp/login.php"; // <-- set your real LAN IP

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing Fields", "Please enter both email and password.");
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
        router.replace("/dashboard"); // ONLY if credentials are correct!
      } else {
        setLoading(false);
        Alert.alert("Login Failed", result.message || "Invalid credentials.");
        // Stay on login page
      }
    } catch (err) {
      setLoading(false);
      Alert.alert("Network Error", "Cannot connect to server.");
    }
  };

  return (
    <LinearGradient
      colors={["#18B949", "#1D492D"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.background}
    >
      {/* Back Arrow */}
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
        <Image
          source={require("../assets/images/HumAI_logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Login to your account</Text>

        {/* Email Input */}
        <TextInput
          placeholder="Email"
          placeholderTextColor="#ccc"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />

        {/* Password Input */}
        <TextInput
          placeholder="Password"
          placeholderTextColor="#ccc"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />

        {/* Login Button */}
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? "Logging in..." : "Login"}</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 50,
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 30, color: "#fff" },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    width: 250,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 15,
    color: "#fff",
    borderWidth: 0.8,
    borderColor: "#fff",
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginVertical: 10,
    borderColor: "#fff",
    borderWidth: 0.8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    width: 170,
    textAlign: "center",
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 18,
  },
  backIcon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
    tintColor: "#fff",
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: 16,
  },
});
