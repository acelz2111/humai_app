import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker"; // Library for gallery access
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const ANALYZE_URL = "http://192.168.101.8/HumAI/backend/analyze_image.php";

export default function CaptureScreen() {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<string | null>(null);
  const [base64, setBase64] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  if (!permission) return <View style={styles.container} />;
  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>We need camera access to diagnose crops.</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- NEW: PICK IMAGE FROM GALLERY ---
  const pickImage = async () => {
    // No permissions request needed for picking images on modern Expo versions, 
    // but good to have the library installed.
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // Allows user to crop image
      aspect: [4, 3],
      quality: 0.5,
      base64: true, // Critical for your analyze API
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
      setBase64(result.assets[0].base64 || null);
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      const result = await cameraRef.current.takePictureAsync({ quality: 0.5, base64: true });
      setPhoto(result.uri);
      setBase64(result.base64);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const userId = await AsyncStorage.getItem('user_id');
      const { status } = await Location.requestForegroundPermissionsAsync();
      let locName = "Unknown";
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        const addr = await Location.reverseGeocodeAsync(loc.coords);
        locName = addr[0]?.city || addr[0]?.district || "Negros Oriental";
      }

      const response = await fetch(ANALYZE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, image: base64, location: locName }),
      });
      
      const result = await response.json();
      if (result.success) {
        router.push({ pathname: "/result", params: result.data });
      } else {
        Alert.alert("Error", result.message);
      }
    } catch (e) {
      Alert.alert("Connection Error", "Check your PHP server and IP address.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <View style={styles.container}>
      {!photo ? (
        <>
          <CameraView style={StyleSheet.absoluteFill} facing={facing} ref={cameraRef} />
          <View style={styles.topControls}>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>
          </View>
          <View style={styles.bottomControls}>
            {/* UPDATED: Added pickImage to the onPress */}
            <TouchableOpacity style={styles.sideControlBtn} onPress={pickImage}>
              <Ionicons name="images-outline" size={28} color="white" />
              <Text style={{color: 'white', fontSize: 10}}>Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shutterContainer} onPress={takePicture}>
              <View style={styles.shutterInner} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.sideControlBtn} onPress={() => setFacing(f => f === "back" ? "front" : "back")}>
              <Ionicons name="camera-reverse-outline" size={28} color="white" />
              <Text style={{color: 'white', fontSize: 10}}>Flip</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={{ flex: 1 }}>
          <Image source={{ uri: photo }} style={styles.previewImage} />
          <View style={styles.previewOverlay}>
            {analyzing ? (
              <ActivityIndicator size="large" color="#fff" />
            ) : (
              <View style={styles.previewButtonsRow}>
                <TouchableOpacity style={styles.retakeBtn} onPress={() => {setPhoto(null); setBase64(null);}}>
                  <Text style={styles.btnText}>Retake</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.analyzeBtn} onPress={handleAnalyze}>
                  <Text style={styles.btnText}>Analyze</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  topControls: { position: 'absolute', top: 50, left: 20 },
  bottomControls: { position: 'absolute', bottom: 40, flexDirection: 'row', width: '100%', justifyContent: 'space-around', alignItems: 'center' },
  iconButton: { padding: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20 },
  shutterContainer: { width: 70, height: 70, borderRadius: 35, borderWidth: 4, borderColor: '#fff', padding: 5 },
  shutterInner: { flex: 1, backgroundColor: '#fff', borderRadius: 30 },
  sideControlBtn: { padding: 10, alignItems: 'center' },
  previewImage: { flex: 1, resizeMode: 'contain' },
  previewOverlay: { position: 'absolute', bottom: 40, width: '100%', alignItems: 'center' },
  previewButtonsRow: { flexDirection: 'row', gap: 20 },
  retakeBtn: { backgroundColor: '#444', padding: 15, borderRadius: 10 },
  analyzeBtn: { backgroundColor: '#18B949', padding: 15, borderRadius: 10 },
  btnText: { color: '#fff', fontWeight: 'bold' },
  permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#143B28' },
  permissionText: { color: '#fff', marginBottom: 20 },
  permissionButton: { backgroundColor: '#18B949', padding: 15, borderRadius: 10 },
  permissionButtonText: { color: '#fff' }
});