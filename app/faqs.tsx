import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";

const faqs = [
  {
    q: "Who can use HumAI?",
    a: "HumAI is designed for farmers, agricultural workers, researchers, and administrators involved in rice cultivation and disease monitoring.",
  },
  {
    q: "Is HumAI free to use?",
    a: "Yes, the application is free for general users. Admin features are accessible to authorized personnel only.",
  },
  {
    q: "What platforms support HumAI?",
    a: "HumAI is currently available as a mobile application (Android), with web-based admin features.",
  },
];

export default function FAQs() {
  const router = useRouter();

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
        <Text style={styles.title}>Chatbot</Text>
        <TouchableOpacity onPress={() => {}} activeOpacity={0.7}>
          <Feather name="menu" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Heading Row */}
        <View style={styles.headingRow}>
          <Image
            source={require("../assets/images/HumAI_logo.png")}
            style={styles.badge}
          />
          <Text style={styles.headingText}>
            Here are some frequently asked{"\n"}questions (FAQs)
          </Text>
        </View>

        {/* FAQ Card */}
        <View style={styles.card}>
          {faqs.map((item, idx) => (
            <View key={idx} style={styles.faqItem}>
              <Text style={styles.qText}>
                {idx + 1}. {item.q}
              </Text>
              <Text style={styles.aText}>{item.a}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const DARK = "#143B28";
const PANEL = "#2C6B46"; // inner panel color

const styles = StyleSheet.create({
  bg: { flex: 1 },
  topBar: {
    paddingTop: 56,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { color: "#fff", fontSize: 18, fontWeight: "700" },

  content: { paddingHorizontal: 16, paddingBottom: 28 },
  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 14,
    gap: 12,
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ffffff22",
  },
  headingText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 22,
  },

  card: {
    backgroundColor: PANEL,
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  faqItem: { marginBottom: 18 },
  qText: { color: "#EAFBEF", fontWeight: "800", marginBottom: 6, fontSize: 15 },
  aText: { color: "#EAFBEF", opacity: 0.9, lineHeight: 20 },

  // (optional) add spacing after last item
  last: { marginBottom: 0 },
});
