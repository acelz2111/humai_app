import { Ionicons } from "@expo/vector-icons";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
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
// 🚨 Update this path if your Config is in a different folder

export default function CaptureScreen() {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  
  // --- STATE ---
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // --- PERMISSIONS CHECK ---
  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButtonSimple} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- HANDLERS ---
  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  async function takePicture() {
    if (cameraRef.current) {
      try {
        const result = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true, 
          skipProcessing: true, 
        });
        setPhoto(result.uri);
      } catch (error) {
        Alert.alert("Error", "Failed to take picture.");
      }
    }
  }

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  }

  const handleAnalyze = () => {
    setAnalyzing(true);
    // Simulate Analysis - We will connect this to backend later
    setTimeout(() => {
      setAnalyzing(false);
      Alert.alert("Success", "Image captured! Ready for backend analysis.");
    }, 1500);
  };

  const handleRetake = () => {
    setPhoto(null);
  };

  // --- PREVIEW MODE (Photo Taken) ---
  if (photo) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: photo }} style={styles.previewImage} />
        
        <View style={styles.previewOverlay}>
          {analyzing ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#18B949" />
              <Text style={styles.loadingText}>Analyzing Crop...</Text>
            </View>
          ) : (
            <>
              <Text style={styles.previewTitle}>Ready to Analyze?</Text>
              <View style={styles.previewButtonsRow}>
                <TouchableOpacity style={styles.retakeBtn} onPress={handleRetake}>
                  <Ionicons name="refresh-outline" size={24} color="#fff" />
                  <Text style={styles.btnText}>Retake</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.analyzeBtn} onPress={handleAnalyze}>
                  <Ionicons name="scan-outline" size={24} color="#fff" />
                  <Text style={styles.btnText}>Analyze</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    );
  }

  // --- CAMERA MODE ---
  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        
        {/* Close Button */}
        <View style={styles.topControls}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          <TouchableOpacity style={styles.sideControlBtn} onPress={pickImage}>
            <Ionicons name="images-outline" size={28} color="white" />
            <Text style={styles.controlLabel}>Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.shutterContainer} onPress={takePicture}>
             <View style={styles.shutterInner} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.sideControlBtn} onPress={toggleCameraFacing}>
            <Ionicons name="camera-reverse-outline" size={28} color="white" />
            <Text style={styles.controlLabel}>Flip</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#143B28', padding: 20 },
  permissionText: { color: '#fff', textAlign: 'center', fontSize: 18, marginBottom: 20 },
  permissionButton: { backgroundColor: '#18B949', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, marginBottom: 10 },
  permissionButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  backButtonSimple: { padding: 10 },
  backButtonText: { color: '#b1ebd7', fontSize: 14 },
  camera: { flex: 1, width: "100%" },
  topControls: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
  iconButton: { width: 44, height: 44, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  bottomControls: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 140, backgroundColor: 'rgba(0,0,0,0.5)', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingBottom: 20 },
  shutterContainer: { width: 80, height: 80, borderRadius: 40, borderWidth: 5, borderColor: 'rgba(255,255,255,0.6)', justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent', marginBottom: 10 },
  shutterInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#fff' },
  sideControlBtn: { alignItems: 'center', justifyContent: 'center', width: 70 },
  controlLabel: { color: '#fff', fontSize: 12, marginTop: 4 },
  previewImage: { flex: 1, width: '100%', height: '100%', resizeMode: 'contain', backgroundColor: '#000' },
  previewOverlay: { position: 'absolute', bottom: 40, left: 20, right: 20, backgroundColor: 'rgba(20, 59, 40, 0.9)', borderRadius: 20, padding: 20, alignItems: 'center' },
  previewTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  previewButtonsRow: { flexDirection: 'row', gap: 15, width: '100%', justifyContent: 'center' },
  retakeBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#444', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, gap: 8 },
  analyzeBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#18B949', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, gap: 8 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  loadingBox: { alignItems: 'center', padding: 10 },
  loadingText: { color: '#fff', marginTop: 10, fontSize: 16 }
});