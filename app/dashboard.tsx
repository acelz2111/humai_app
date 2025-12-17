import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import ImageViewing from "react-native-image-viewing";
// 🚨 Ensure this path is correct for your structure!
import { API } from "../constants/Config";


// Initial state structure for recent diagnosis (must match API output structure)
interface RecentDiagnosis {
  disease: string;
  image: number; // For local image reference
  category: string;
  date: string;
  confidence: string;
  description: string;
}

// ✅ FIX APPLIED: Corrected the placeholder image path
const DEFAULT_RECENT_DIAGNOSIS: RecentDiagnosis = {
    disease: "No Diagnosis Made",
    image: require("../assets/images/placeholder.png"), // Ensure this image exists!
    category: "N/A",
    date: "N/A",
    confidence: "0%",
    description: "Please use the 'Capture' button to start your first diagnosis."
};

// --- DATA ---
const diagnosisData = [
  {
    disease: "Sheath Blight",
    image: require("../assets/images/sheath_blight.png"),
    category: "Fungal disease",
    date: "Apr 24, 2024",
    confidence: "90%",
    description: "Sheath Blight is a fungal disease caused by Rhizoctonia solani...",
  },
  {
    disease: "Rice Blast",
    image: require("../assets/images/Rice_Blastt.png"),
    category: "Fungal disease",
    date: "May 3, 2024",
    confidence: "95%",
    description: "Rice Blast is a serious disease caused by the fungus Magnaporthe oryzae...",
  },
  {
    disease: "Bacterial Blight",
    image: require("../assets/images/Bacterial_Blightt.png"),
    category: "Bacterial disease",
    date: "May 10, 2024",
    confidence: "87%",
    description: "Bacterial Blight is a widespread rice disease...",
  },
];

const riceDiseasesExpanded = [
  { name: "Rice Blast", img: require("../assets/images/rice_blast.png") },
  { name: "Sheath Blight", img: require("../assets/images/sheath_blight.png") },
  { name: "Bacterial Blight", img: require("../assets/images/bacterial_blight.png") },
  { name: "Tungro Virus", img: require("../assets/images/tungro.png") },
  { name: "Brown Spot", img: require("../assets/images/brown_spot.png") },
];

const diseaseImages = {
  "Rice Blast": require("../assets/images/Rice_Blastt.png"),
  "Sheath Blight": require("../assets/images/Sheath_Blightt.png"),
  "Bacterial Blight": require("../assets/images/Bacterial_Blightt.png"),
  "Tungro Virus": require("../assets/images/tungro.png"),
  "Brown Spot": require("../assets/images/brown_spot.png"),
  "No Diagnosis Made": require("../assets/images/placeholder.png"), 
};

const notificationsList = [
  { disease: "Rice Blast", location: "Mabinay", status: "Alert", time: "10m ago" },
  { disease: "Sheath Blight", location: "Tanjay", status: "Moderate", time: "2h ago" },
  { disease: "Bacterial Blight", location: "Siaton", status: "Safe", time: "1d ago" },
];

export default function Dashboard() {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [notifPreview, setNotifPreview] = useState(null);
  
  const [recent, setRecent] = useState<RecentDiagnosis>(DEFAULT_RECENT_DIAGNOSIS); 
  
  const notifIconRef = useRef(null);
  const [notifPopupPos, setNotifPopupPos] = useState({ top: 75, right: 24 });
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // --- POPUP STATE for Disease Details ---
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [popupLoading, setPopupLoading] = useState(false);
  const [popupData, setPopupData] = useState({ description: "", prevention: "" });

  // ✅ STATE: For Diagnosis Count and User ID
  const [diagnosisCount, setDiagnosisCount] = useState(0); 
  const [currentUserId, setCurrentUserId] = useState(null); 
  
  const activeColor = "#22BB66";
  const inactiveColor = "#143B28";

  // Animations
  const [popupAnim] = useState(new Animated.Value(0));
  useEffect(() => {
    if (selectedDisease) {
      Animated.spring(popupAnim, { toValue: 1, useNativeDriver: true, friction: 8 }).start();
    } else {
      popupAnim.setValue(0);
    }
  }, [selectedDisease]);

  const notificationAnim = useRef(new Animated.Value(0)).current;
  const optionsAnim = useRef(new Animated.Value(0)).current;
  const [showOptions, setShowOptions] = useState(false);

  // ✅ 1. Hook to load the User ID from storage on mount
  useEffect(() => {
    const loadUserId = async () => {
        try {
            const id = await AsyncStorage.getItem('user_id');
            if (id !== null) {
                setCurrentUserId(id); 
            }
        } catch (e) {
            console.error("Failed to load user ID from storage", e);
        }
    };
    loadUserId();
  }, []); 

  // ✅ 2. Hook to fetch the count and recent diagnosis when the User ID is available
  useEffect(() => {
    if (currentUserId) {
        // --- A. Fetch Diagnosis Count ---
        const fetchDiagnosisCount = async () => {
            try {
                const url = `${API.GET_DIAGNOSIS_COUNT}?user_id=${currentUserId}`;
                const response = await fetch(url);
                const result = await response.json();
                if (result.success && typeof result.count === 'number') {
                    setDiagnosisCount(result.count);
                }
            } catch (error) {
                console.error("Error fetching count:", error);
            }
        };

        // --- B. Fetch Recent Diagnosis Details ---
        const fetchRecentDiagnosis = async () => {
            try {
                const url = `${API.GET_RECENT_DIAGNOSIS}?user_id=${currentUserId}`;
                const response = await fetch(url);
                const result = await response.json();

                if (result.success && result.data) {
                    const data = result.data;
                    const diseaseName = data.disease_name;
                    
                    setRecent({
                        disease: diseaseName,
                        image: diseaseImages[diseaseName] || DEFAULT_RECENT_DIAGNOSIS.image, 
                        category: data.category,
                        date: data.diagnosis_date,
                        confidence: data.confidence + "%",
                        description: data.description,
                    });
                } else {
                    setRecent(DEFAULT_RECENT_DIAGNOSIS);
                }
            } catch (error) {
                console.error("Error fetching recent diagnosis:", error);
                setRecent(DEFAULT_RECENT_DIAGNOSIS);
            }
        };

        fetchDiagnosisCount();
        fetchRecentDiagnosis();
    }
  }, [currentUserId]); 

  
  // --- HANDLERS ---
  
  const handleNotifIconPress = () => {
    if (notifIconRef.current) {
      // @ts-ignore
      notifIconRef.current.measureInWindow((x, y, width, height) => {
        setNotifPopupPos({ top: y + height + 8, right: Dimensions.get("window").width - (x + width) });
        setNotificationsVisible(true);
      });
    } else {
      setNotificationsVisible(true);
    }
  };

  const handleSelectDiagnosis = (data) => {
    setRecent(data);
    setShowOptions(false);
  };

  // Handle Disease Tap & Fetch from DB
  const handleDiseaseTap = async (disease) => {
    setSelectedDisease(disease); 
    setPopupLoading(true); 
    setPopupData({ description: "", prevention: "" }); 

    try {
        const response = await fetch(`${API.GET_DISEASE}?name=${encodeURIComponent(disease.name)}`);
        const result = await response.json();

        if (result.success) {
            setPopupData({
                description: result.data.description,
                prevention: result.data.prevention
            });
        } else {
            setPopupData({ description: result.message || "No details available.", prevention: "" });
        }
    } catch (error) {
        console.error("Fetch Error:", error);
        setPopupData({ description: "Failed to load info. Check network.", prevention: "" });
    } finally {
        setPopupLoading(false);
    }
  };

  const handleFeedback = () => {
    setMenuVisible(false);
    router.push("/feedback");
  };

  const handleLogout = async () => { 
    try {
        await AsyncStorage.removeItem('user_id'); 
    } catch (e) {
        console.error("Failed to remove user ID on logout", e);
    }
    setMenuVisible(false);
    router.replace("/login-type");
  };

  return (
    <LinearGradient colors={["#1EBA56", "#18543A"]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.bg}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.heading}>Dashboard</Text>
        <View style={styles.iconRow}>
          <TouchableOpacity ref={notifIconRef} onPress={handleNotifIconPress} style={styles.notifIconTouch}>
            <Ionicons name="notifications-outline" size={25} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMenuVisible(true)}>
            <Feather name="menu" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionTitle}>Recent Diagnosis</Text>
        <TouchableOpacity 
          // Disable showOptions functionality if no diagnosis exists
          onPress={() => recent.disease !== DEFAULT_RECENT_DIAGNOSIS.disease && setShowOptions(true)} 
          activeOpacity={0.85}
        >
          <View style={styles.cardWide}>
            {/* Display the dynamically fetched image, or placeholder */}
            <Image source={recent.image} style={styles.recentImg} />
            <View style={{ flex: 1, paddingHorizontal: 14, gap: 6 }}>
              <Text style={styles.rdTitle}>{recent.disease}</Text>
              <Text style={styles.rdMeta}>Category: {recent.category}</Text>
              <Text style={styles.rdMeta}>Date: {recent.date}</Text>
              <Text style={styles.rdMeta}>Confidence: {recent.confidence}</Text>
            </View>
            {/* Show dropdown icon only if there is a diagnosis history (count > 1) */}
            {diagnosisCount > 1 && <Ionicons name={"chevron-down"} size={24} color="#fff" style={{ marginRight: 10 }} />}
          </View>
        </TouchableOpacity>
        
        <View style={styles.statsRow}>
          <View style={{ flex: 1, gap: 12 }}>
            <TouchableOpacity activeOpacity={0.85}>
              <View style={styles.topDiseaseCard}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.cardHeader}>Top Disease</Text>
                  <MaterialCommunityIcons name="virus-outline" size={16} color={inactiveColor} />
                </View>
                <Text style={styles.bigText}>Rice Blast</Text>
              </View>
            </TouchableOpacity>
            <View style={styles.alertCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardHeader}>Regional Alert</Text>
                <Ionicons name="alert-circle-outline" size={16} color={inactiveColor} />
              </View>
              <Text style={styles.bigText}>Moderate</Text>
            </View>
          </View>
          
          {/* ✅ Display the dynamic count */}
          <View style={styles.diagnosisCardFixed}>
            <Text style={styles.cardHeaderCenter}>Diagnosis{"\n"}Made</Text>
            <Text style={styles.hugeNumberFixed}>{diagnosisCount}</Text>
          </View>
        </View>
        
        {/* Common Rice Diseases */}
        <Text style={styles.sectionTitle}>Common Rice Diseases</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
          {riceDiseasesExpanded.map((disease, index) => (
            <TouchableOpacity
              key={index}
              style={styles.diseaseCard}
              activeOpacity={0.86}
              onPress={() => handleDiseaseTap(disease)}
            >
              <Image source={disease.img} style={styles.diseaseImage} />
              <Text style={styles.diseaseLabel}>{disease.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>
      
      {/* ----------- MODERN TAB BAR SECTION ----------- */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => { setActiveTab("chatbot"); router.push("/chatbot"); }}>
          <Ionicons name={activeTab === "chatbot" ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"} size={26} color={activeTab === "chatbot" ? activeColor : inactiveColor} />
          <Text style={[styles.tabLabel, activeTab === "chatbot" && { color: activeColor }]}>Chatbot</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabItem, styles.tabCenter]} onPress={() => { setActiveTab("capture"); router.push("/capture"); }}>
          <Ionicons name={activeTab === "capture" ? "camera" : "camera-outline"} size={28} color={activeTab === "capture" ? activeColor : inactiveColor} />
          <Text style={[styles.tabLabel, activeTab === "capture" && { color: activeColor }]}>Capture</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => { setActiveTab("history"); router.push("/history"); }}>
          <Ionicons name={activeTab === "history" ? "time" : "time-outline"} size={26} color={activeTab === "history" ? activeColor : inactiveColor} />
          <Text style={[styles.tabLabel, activeTab === "history" && { color: activeColor }]}>History</Text>
        </TouchableOpacity>
      </View>
      {/* -------- End MODERN TAB BAR SECTION ------- */}

      {/* Menu Dropdown */}
      {menuVisible && (
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.menuOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.dropdownMenu}>
                <TouchableOpacity style={styles.dropdownItem} onPress={() => { setMenuVisible(false); router.push("/dashboard"); }}>
                  <Text style={styles.dropdownText}>Dashboard</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dropdownItem} onPress={() => { setMenuVisible(false); router.push("/profile"); }}>
                  <Text style={styles.dropdownText}>Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dropdownItem} onPress={handleFeedback}>
                  <Text style={styles.dropdownText}>Submit Feedback</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dropdownItem} onPress={handleLogout}>
                  <Text style={styles.dropdownText}>Logout</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      )}

      {/* Notifications Popup */}
      {notificationsVisible && (
        <TouchableWithoutFeedback onPress={() => setNotificationsVisible(false)}>
          <View style={StyleSheet.absoluteFill}>
            <Animated.View style={[styles.notifDropdownModern, { top: notifPopupPos.top, right: notifPopupPos.right, opacity: notificationAnim, transform: [{ scale: notificationAnim.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1] }) }, { translateY: notificationAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) }] }]}>
              <Text style={styles.dropdownTitle}>Notifications</Text>
              {notificationsList.map((n, i) => (
                <TouchableOpacity key={i} onPress={() => setNotifPreview(diseaseImages[n.disease])} style={styles.dropdownItemModern} activeOpacity={0.97}>
                  <Image source={diseaseImages[n.disease]} style={styles.dropdownImage} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dropdownDisease}>{n.disease}</Text>
                    <Text style={styles.dropdownMeta}>{n.location} • {n.status} • {n.time}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      )}
      {notifPreview && (
        <LinearGradient colors={["#ffffff", "#f3f4f6", "#e8ebf2"]} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "center", alignItems: "center", zIndex: 2500 }}>
          <View style={{ width: "97%", height: "75%", justifyContent: "center", alignItems: "center", borderRadius: 22, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.10, shadowRadius: 20, elevation: 8, backgroundColor: "rgba(255,255,255,0.85)" }}>
            {/* @ts-ignore */}
            <ImageViewing images={[{ uri: Image.resolveAssetSource(notifPreview).uri }]} imageIndex={0} visible={!!notifPreview} onRequestClose={() => setNotifPreview(null)} doubleTapToZoomEnabled swipeToCloseEnabled presentationStyle="overFullScreen" animationType="fade" backgroundColor="transparent" HeaderComponent={() => (<TouchableOpacity onPress={() => setNotifPreview(null)} activeOpacity={0.8} style={{ position: "absolute", top: 16, right: 16, width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(250,250,250,0.92)", justifyContent: "center", alignItems: "center", shadowColor: "#222", shadowOpacity: 0.30, shadowRadius: 14, elevation: 10 }}><Ionicons name="close" size={26} color="#222" /></TouchableOpacity>)} />
          </View>
        </LinearGradient>
      )}

      {/* Disease Detail Popup */}
      {selectedDisease && (
        <TouchableWithoutFeedback onPress={() => setSelectedDisease(null)}>
          <View style={styles.overlay}>
            <Animated.View style={[styles.popupModal, { opacity: popupAnim, transform: [{ scale: popupAnim }] }]}>
              <TouchableOpacity onPress={() => setSelectedDisease(null)} style={styles.popupCloseBtn}>
                <Ionicons name="close" size={27} color="#184128" />
              </TouchableOpacity>
              
              <View style={styles.popupImageContainer}>
                {/* @ts-ignore */}
                <Image source={selectedDisease.img} style={styles.popupImage} resizeMode="cover" />
              </View>
              
              {/* @ts-ignore */}
              <Text style={styles.popupTitle}>{selectedDisease.name}</Text>
              <View style={styles.popupDivider} />
              
              {/* Dynamic Content Area */}
              {popupLoading ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#1EBA56" />
                    <Text style={{ marginTop: 10, color: '#666' }}>Loading info...</Text>
                </View>
              ) : (
                <View>
                    <Text style={styles.popupDescription}>{popupData.description}</Text>
                    {popupData.prevention ? (
                        <>
                            <Text style={styles.popupSubtitle}>Prevention:</Text>
                            <Text style={styles.popupDescription}>{popupData.prevention}</Text>
                        </>
                    ) : null}
                </View>
              )}
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      )}
      
      {/* Options Popup */}
      {showOptions && (
        <TouchableWithoutFeedback onPress={() => setShowOptions(false)}>
          <View style={styles.optionsOverlay}>
            {/* ✅ SYNTAX CHECKED AND FIXED HERE */}
            <Animated.View style={[styles.optionsPopupModern, { 
              opacity: optionsAnim, 
              transform: [
                { scale: optionsAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }, 
                { translateY: optionsAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }
              ] 
            }]}>
              <Text style={styles.optionsTitle}>Select Diagnosis</Text>
              {/* This list is currently hardcoded for demonstration purposes */}
              {diagnosisData.map((data, idx) => (
                <TouchableOpacity key={idx} onPress={() => handleSelectDiagnosis(data)} style={styles.optionsItemModern} activeOpacity={0.97}>
                  <Image source={data.image} style={styles.optionsImage} />
                  <View>
                    <Text style={styles.optionsDisease}>{data.disease}</Text>
                    <Text style={styles.optionsMeta}>{data.category} • {data.confidence}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      )}

    </LinearGradient>
  );
}

const CARD_BG = "#F6FFF7";
const DARK = "#143B28";
const MODERN_BORDER = "#E5E5E5";
const SHADOW = Platform.OS === "ios" ? { shadowColor: "#000", shadowOpacity: 0.19, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } } : { elevation: 8 };

const styles = StyleSheet.create({
  bg: { flex: 1 },
  topBar: { paddingTop: 56, paddingHorizontal: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  heading: { color: "#fff", fontSize: 32, fontWeight: "800" },
  iconRow: { flexDirection: "row", alignItems: "center", gap: 20 },
  notifIconTouch: { padding: 8 },
  scroll: { paddingHorizontal: 16, paddingBottom: 130, paddingTop: 25 },
  sectionTitle: { color: "#fff", fontWeight: "700", fontSize: 16, marginBottom: 10 },
  cardWide: { backgroundColor: "#ffffffbb", borderRadius: 18, padding: 12, flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderColor: "#edf7ef", marginBottom: 20, ...SHADOW },
  recentImg: { width: 115, height: 115, borderRadius: 16, backgroundColor: "#fff" },
  rdTitle: { color: DARK, fontWeight: "900", fontSize: 22 },
  rdMeta: { color: "#229a4d", fontSize: 13, marginBottom: 2 },
  rdMeta: { color: "#229a4d", fontSize: 13, marginBottom: 2 },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  topDiseaseCard: { backgroundColor: CARD_BG, borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "#f7f7fa", height: 88, width: '100%', alignItems: "center", justifyContent: "space-between", ...SHADOW },
  alertCard: { backgroundColor: CARD_BG, borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "#f7f7fa", height: 88, width: '100%', alignItems: "center", justifyContent: "space-between", ...SHADOW },
  diagnosisCardFixed: { backgroundColor: CARD_BG, borderRadius: 18, borderWidth: 1, borderColor: "#f7f7fa", height: 190, width: 130, alignItems: "center", justifyContent: "center", ...SHADOW, paddingVertical: 15 },
  hugeNumberFixed: { color: DARK, fontWeight: "900", fontSize: 55, marginTop: 10, marginBottom: 0, textAlign: "center", alignSelf: "center" },
  cardHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: '100%' },
  cardHeader: { color: DARK, opacity: 0.9, fontWeight: "700" },
  cardHeaderCenter: { color: DARK, textAlign: "center", fontWeight: "800", fontSize: 18, lineHeight: 24 },
  bigText: { color: DARK, fontWeight: "900", fontSize: 26, marginTop: 8 },
  horizontalScroll: { flexDirection: "row", gap: 14, paddingVertical: 6 },
  diseaseCard: { backgroundColor: "#fff", borderRadius: 18, padding: 12, alignItems: "center", borderWidth: 1, borderColor: "#eaeaea", marginRight: 8, ...SHADOW },
  diseaseImage: { width: 110, height: 110, borderRadius: 14, marginBottom: 9, backgroundColor: "#fff" },
  diseaseLabel: { color: "#246A46", fontWeight: "bold", fontSize: 15, marginTop: 2 },
  tabBar: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: CARD_BG, borderTopLeftRadius: 18, borderTopRightRadius: 18, paddingBottom: 10, paddingTop: 10, paddingHorizontal: 24, flexDirection: "row", justifyContent: "space-between", ...SHADOW },
  tabItem: { alignItems: "center", gap: 4, flex: 1, justifyContent: "center" },
  tabCenter: { backgroundColor: "#E8F5EC", paddingVertical: 8, borderRadius: 16, borderWidth: 1.5, borderColor: "#22BB66" },
  tabLabel: { color: DARK, fontSize: 12, fontWeight: "700", marginTop: 2 },
  menuOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 2000 },
  dropdownMenu: { position: "absolute", top: 70, right: 18, backgroundColor: "#FFFFFF", borderRadius: 16, paddingVertical: 5, width: 168, ...SHADOW },
  dropdownItem: { paddingHorizontal: 16, paddingVertical: 12 },
  dropdownText: { fontSize: 16, color: DARK, fontWeight: "700" },
  notifDropdownModern: { position: "absolute", minWidth: 320, backgroundColor: "#fff", borderRadius: 19, padding: 16, ...SHADOW, borderWidth: 1, borderColor: "#E4F5EA" },
  dropdownTitle: { fontWeight: "800", fontSize: 19, color: DARK, marginBottom: 10, marginLeft: 2 },
  dropdownDisease: { fontSize: 16, fontWeight: "700", color: DARK },
  dropdownMeta: { color: "#17AD65", fontSize: 13, marginTop: 2 },
  dropdownItemModern: { flexDirection: "row", alignItems: "center", padding: 11, borderRadius: 12, backgroundColor: "#F7FFF7", marginBottom: 10, borderWidth: 1, borderColor: "#E6F3EA" },
  dropdownImage: { width: 36, height: 36, borderRadius: 12, marginRight: 12, backgroundColor: "#fff", borderWidth: 1, borderColor: MODERN_BORDER },
  overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.37)", justifyContent: "center", alignItems: "center", zIndex: 1900, paddingHorizontal: 20 },
  popupModal: { backgroundColor: "#fff", borderRadius: 27, alignItems: "center", padding: 26, width: 340, maxWidth: "97%", elevation: 15, shadowColor: "#222", shadowOpacity: 0.29, shadowRadius: 33, shadowOffset: { width: 0, height: 12 } },
  popupCloseBtn: { position: "absolute", top: 17, right: 18, zIndex: 10, padding: 7 },
  popupImageContainer: { shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 10, borderRadius: 24, backgroundColor: "#fefefe", padding: 6, marginBottom: 20 },
  popupImage: { width: 200, height: 180, borderRadius: 18, backgroundColor: "#fff" },
  popupTitle: { color: "#1EBA56", fontSize: 24, fontWeight: "bold", marginBottom: 6, textAlign: "center", letterSpacing: 0.08 },
  popupDivider: { width: 70, height: 3, borderRadius: 2, backgroundColor: "#DFF4E7", marginVertical: 15 },
  popupDescription: { color: DARK, fontWeight: "600", fontSize: 15.5, textAlign: "center", lineHeight: 24 },
  popupSubtitle: { color: "#1EBA56", fontWeight: "bold", fontSize: 16, marginTop: 15, marginBottom: 5, textAlign: 'center' },
  optionsOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 2000, backgroundColor: "rgba(0,0,0,0.12)", justifyContent: "center", alignItems: "center" },
  optionsPopupModern: { left: 0, right: 0, minWidth: 320, backgroundColor: "#fff", borderRadius: 20, padding: 20, ...SHADOW, marginHorizontal: 26 },
  optionsTitle: { color: "#11aa57", fontSize: 18, fontWeight: "800", marginBottom: 14, marginLeft: 4 },
  optionsItemModern: { flexDirection: "row", alignItems: "center", padding: 13, backgroundColor: "#F6FFF7", borderRadius: 12, marginBottom: 11, borderWidth: 1, borderColor: "#E6F3EA" },
  optionsImage: { width: 36, height: 36, borderRadius: 10, marginRight: 12, backgroundColor: "#fff", borderWidth: 1, borderColor: MODERN_BORDER },
  optionsDisease: { color: DARK, fontSize: 16, fontWeight: "700" },
  optionsMeta: { color: "#189A56", fontSize: 12 },
});