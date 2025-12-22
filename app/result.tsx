import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get("window");

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const { disease, confidence, treatment, imageUri } = params;

  return (
    <LinearGradient colors={["#18B949", "#1D492D"]} style={styles.bg}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Scan Result</Text>
          <TouchableOpacity onPress={() => router.replace("/dashboard")}>
            <Ionicons name="close-circle" size={32} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Image Card */}
        <View style={styles.card}>
          <Image source={{ uri: imageUri as string }} style={styles.image} />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{parseFloat(confidence as string).toFixed(1)}% Match</Text>
          </View>
        </View>

        {/* Diagnosis */}
        <View style={styles.infoCard}>
          <Text style={styles.label}>Diagnosis</Text>
          <Text style={styles.diseaseName}>{disease}</Text>
          <View style={styles.divider} />
          <Text style={styles.label}>Recommended Treatment</Text>
          <Text style={styles.bodyText}>{treatment}</Text>
        </View>

        {/* Buttons */}
        <TouchableOpacity style={styles.btn} onPress={() => router.back()}>
          <Text style={styles.btnText}>Scan Again</Text>
        </TouchableOpacity>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 10, alignItems: 'center', marginBottom: 20 },
  image: { width: '100%', height: 250, borderRadius: 15 },
  badge: { position: 'absolute', bottom: 20, right: 20, backgroundColor: '#18B949', padding: 8, borderRadius: 8 },
  badgeText: { color: '#fff', fontWeight: 'bold' },
  infoCard: { backgroundColor: '#F6FFF7', borderRadius: 20, padding: 20, marginBottom: 20 },
  label: { color: '#18B949', fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase' },
  diseaseName: { fontSize: 26, fontWeight: 'bold', color: '#143B28', marginBottom: 10 },
  bodyText: { fontSize: 16, color: '#333', lineHeight: 24 },
  divider: { height: 1, backgroundColor: '#ddd', marginVertical: 15 },
  btn: { backgroundColor: '#fff', padding: 15, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#143B28', fontWeight: 'bold', fontSize: 16 }
});