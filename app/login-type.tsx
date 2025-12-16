import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function LoginType() {
  const router = useRouter();
  return (
    <LinearGradient
      colors={["#18B949", "#1D492D"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.background}
    >
      {/* Back Button - Simplified */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.replace("/")}
        activeOpacity={0.7}
        hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }} // Increases touch area without changing visuals
      >
        <Image
          source={require("../assets/icons/arrow-left.png")}
          style={styles.backIcon}
        />
      </TouchableOpacity>

      <View style={styles.content}>
        {/* Spacer */}
        <View style={{ height: 28 }} />

        {/* Logo Container - Removed white card style */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/images/HumAI_logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Text Section - Removed "Welcome Back!" */}
        <View style={styles.textSection}>
          <Text style={styles.subheading}>Sign in as...</Text>
        </View>

        {/* Spacer */}
        <View style={{ height: 19 }} />

        {/* Buttons */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={[styles.button, styles.farmerBtn]}
            onPress={() => router.push("/login-farmer")}
            activeOpacity={0.94}
          >
            <Text style={[styles.buttonText, { color: "#fff" }]}>Farmer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.studentBtn]}
            onPress={() => router.push("/login-student")}
            activeOpacity={0.94}
          >
            <Text style={[styles.buttonText, { color: "#18B949" }]}>Student</Text>
          </TouchableOpacity>
        </View>
        {/* Bottom Spacer for equal vertical symmetry */}
        <View style={{ height: 40 }} />
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
  logoContainer: {
    // Removed background color, shadows, and padding
    marginBottom: 26,
    marginTop: 0,
    alignItems: "center",
  },
  logo: {
    width: 142,
    height: 142,
    borderRadius: 71,
    // Removed border properties
  },
  textSection: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    marginTop: 2,
  },
  // Removed headline style
  subheading: {
    fontSize: 22, // Slightly larger since headline is gone
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  buttonSection: {
    gap: 17,
    width: 220,
    alignItems: "center",
    marginTop: 0,
  },
  button: {
    width: 220,
    paddingVertical: 16,
    borderRadius: 33,
    alignSelf: "center",
    alignItems: "center",
    elevation: 4,
    borderWidth: 2.1,
    shadowColor: "#18B949",
    shadowOpacity: 0.13,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
    marginBottom: 2,
  },
  farmerBtn: {
    backgroundColor: "#18B949",
    borderColor: "#fff",
  },
  studentBtn: {
    backgroundColor: "#fff",
    borderColor: "#18B949",
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 0.7,
  },
  backButton: {
    position: "absolute",
    top: Platform.OS === "android" ? 44 : 70,
    left: 24, // Adjusted slightly since padding is gone
    zIndex: 10,
    // Removed background, border radius, and shadows
  },
  backIcon: {
    width: 23,
    height: 23,
    resizeMode: "contain",
    tintColor: "#fff", // Changed to white to be visible on green
  },
});