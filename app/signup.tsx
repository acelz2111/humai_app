import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

// Change this to your PC's actual IPv4 address
const SIGNUP_URL = "http://192.168.101.8/HumAI/backend/signup.php";

export default function Signup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    password: "",
    confirm_password: "",
  });

  // Inside handleRegister function in app/signup.tsx

const handleRegister = async () => {
    // 1. Phone Validation (Matches your DB Trigger)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone_number)) {
      Alert.alert("Invalid Phone", "Phone number must be exactly 10 digits (e.g. 9123456789)");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(SIGNUP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        Alert.alert("Success", "Account created!", [
          // FIX: Redirect to 'login-student' or 'login-farmer', NOT 'welcome'
          { text: "Login", onPress: () => router.replace("/login-student") }
        ]);
      } else {
        Alert.alert("Failed", result.message);
      }
    } catch (error) {
      Alert.alert("Error", "Check server connection.");
    } finally {
      setLoading(false);
    }
};

  return (
    <LinearGradient colors={["#18B949", "#1D492D"]} style={styles.background}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Image source={require("../assets/images/HumAI_logo.png")} style={styles.logo} />
          <Text style={styles.title}>Create Account</Text>

          <TextInput placeholder="First Name *" placeholderTextColor="#b1ebd7" style={styles.input} 
            onChangeText={(t) => setFormData({...formData, first_name: t})} />
          
          <TextInput placeholder="Last Name *" placeholderTextColor="#b1ebd7" style={styles.input} 
            onChangeText={(t) => setFormData({...formData, last_name: t})} />
          
          <TextInput placeholder="Email Address *" placeholderTextColor="#b1ebd7" style={styles.input} 
            keyboardType="email-address" autoCapitalize="none"
            onChangeText={(t) => setFormData({...formData, email: t})} />
          
          <TextInput placeholder="Phone Number" placeholderTextColor="#b1ebd7" style={styles.input} 
            keyboardType="phone-pad"
            onChangeText={(t) => setFormData({...formData, phone_number: t})} />
          
          <TextInput placeholder="Password *" placeholderTextColor="#b1ebd7" style={styles.input} 
            secureTextEntry onChangeText={(t) => setFormData({...formData, password: t})} />
          
          <TextInput placeholder="Confirm Password *" placeholderTextColor="#b1ebd7" style={styles.input} 
            secureTextEntry onChangeText={(t) => setFormData({...formData, confirm_password: t})} />

          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: "center" },
  content: { padding: 30, alignItems: "center", paddingVertical: 60 },
  logo: { width: 120, height: 120, marginBottom: 10, resizeMode: 'contain' },
  title: { fontSize: 24, fontWeight: "bold", color: "#fff", marginBottom: 20 },
  input: { backgroundColor: "rgba(255,255,255,0.15)", width: 280, padding: 15, borderRadius: 12, marginBottom: 12, color: "#fff", borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" },
  button: { backgroundColor: "#18B949", width: 280, padding: 15, borderRadius: 25, alignItems: "center", marginTop: 10, borderWidth: 1, borderColor: "#fff" },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});