import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";

const { width } = Dimensions.get('window');

const SERVER_URL = "http://172.16.54.179/HumAI/backend/signup.php";

export default function Signup() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Toast states
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("error");
  const [toastVisible, setToastVisible] = useState(false);
  const toastAnim = React.useRef(new Animated.Value(-80)).current;

  const showToast = (msg: string, type = "error") => {
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
          duration: 240,
          useNativeDriver: false,
        }).start(() => setToastVisible(false));
      }, 1800);
    });
  };

  const handleSignup = async () => {
    Keyboard.dismiss();

    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      showToast("Please fill all fields", "error");
      return;
    }

    if (name.trim().length < 2) {
      showToast("Name must be at least 2 characters", "error");
      return;
    }

    if (name.trim().length > 100) {
      showToast("Name is too long (max 100 characters)", "error");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showToast("Please enter a valid email address", "error");
      return;
    }

    if (password.length < 8) {
      showToast("Password must be at least 8 characters", "error");
      return;
    }

    if (password.length > 128) {
      showToast("Password is too long (max 128 characters)", "error");
      return;
    }

    if (password !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    setLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(SERVER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: name.trim(), 
          email: email.trim(), 
          password: password 
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        showToast("Account created successfully!", "success");
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setTimeout(() => router.replace("/login-student"), 900);
      } else {
        showToast(result.message || "Signup failed. Please try again.", "error");
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      
      if (err.name === 'AbortError') {
        showToast("Request timeout. Please check your connection.", "error");
      } else if (err.message.includes('Network')) {
        showToast("No internet connection", "error");
      } else if (err.message.includes('Server error')) {
        showToast("Server error. Please try again later.", "error");
      } else {
        showToast("Cannot connect to server", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1 }}>
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
            onPress={() => router.back()}
            activeOpacity={0.7}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Image
              source={require("../assets/icons/arrow-left.png")}
              style={styles.backIcon}
            />
          </TouchableOpacity>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              <View style={{ height: 28 }} />

              {/* Logo Container */}
              <View style={styles.logoContainer}>
                <Image
                  source={require("../assets/images/HumAI_logo.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>

              {/* Text Section */}
              <View style={styles.textSection}>
                <Text style={styles.subheading}>Create Account</Text>
                <Text style={styles.subtitle}>Join HumAI today</Text>
              </View>

              <View style={{ height: 19 }} />

              {/* Name Input */}
              <TextInput
                placeholder="Full Name"
                placeholderTextColor="#b1ebd7"
                style={styles.input}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="next"
              />

              {/* Email Input */}
              <TextInput
                placeholder="Email"
                placeholderTextColor="#b1ebd7"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
                returnKeyType="next"
              />

              {/* Password Input */}
              <View style={styles.passwordContainer}>
                <TextInput
                  placeholder="Password (min 8 characters)"
                  placeholderTextColor="#b1ebd7"
                  secureTextEntry={!showPassword}
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.eyeIcon}>{showPassword ? "👁️" : "👁️‍🗨️"}</Text>
                </TouchableOpacity>
              </View>

              {/* Confirm Password Input */}
              <View style={styles.passwordContainer}>
                <TextInput
                  placeholder="Confirm Password"
                  placeholderTextColor="#b1ebd7"
                  secureTextEntry={!showConfirmPassword}
                  style={styles.passwordInput}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleSignup}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.eyeIcon}>{showConfirmPassword ? "👁️" : "👁️‍🗨️"}</Text>
                </TouchableOpacity>
              </View>

              {/* Signup Button */}
              <TouchableOpacity
                style={[
                  styles.button1,
                  loading && { backgroundColor: "#10953a90" }
                ]}
                onPress={handleSignup}
                disabled={loading}
                activeOpacity={0.88}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Creating Account..." : "Sign Up"}
                </Text>
              </TouchableOpacity>

              {/* Login Link */}
              <View style={styles.loginRow}>
                <Text style={styles.loginPrompt}>Already have an account?</Text>
                <TouchableOpacity onPress={() => router.replace("/login-student")}>
                  <Text style={styles.loginText}> Login</Text>
                </TouchableOpacity>
              </View>

              <View style={{ height: 36 }} />
            </View>
          </ScrollView>
        </LinearGradient>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  logoContainer: {
    marginBottom: 20,
    marginTop: 0,
    alignItems: "center",
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
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
  subtitle: {
    fontSize: 14,
    color: "#b1ebd7",
    textAlign: "center",
    marginTop: 4,
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "rgba(255, 255, 255, 0.10)",
    width: 250,
    borderRadius: 13,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#18B949",
    shadowColor: "#18B949",
    shadowOpacity: 0.08,
    shadowRadius: 7,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 13,
    paddingHorizontal: 17,
    color: "#fff",
    fontSize: 16,
  },
  eyeButton: {
    padding: 10,
    paddingRight: 15,
  },
  eyeIcon: {
    fontSize: 20,
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
  buttonText: { 
    color: "#fff", 
    fontSize: 18, 
    fontWeight: "bold", 
    letterSpacing: 0.5 
  },
  loginRow: {
    flexDirection: "row",
    marginTop: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  loginPrompt: { 
    fontSize: 14, 
    color: "#fff" 
  },
  loginText: { 
    fontSize: 14, 
    fontWeight: "bold", 
    color: "#b1ebd7" 
  },
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
  toastError: { 
    borderLeftWidth: 7, 
    borderLeftColor: "#b60e34" 
  },
  toastTextError: { 
    color: "#b60e34" 
  },
  toastSuccess: { 
    borderLeftWidth: 7, 
    borderLeftColor: "#18B949" 
  },
  toastTextSuccess: { 
    color: "#18B949" 
  },
});