import { ReactNativeZoomableView } from '@dudigital/react-native-zoomable-view';
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
  ImageBackground,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { API } from "../constants/Config";

const { width } = Dimensions.get("window");

// Constants moved up to prevent Reference Errors
const CARD_BG = "#F6FFF7";
const DARK = "#143B28";
const SHADOW = Platform.OS === "ios" 
  ? { shadowColor: "#000", shadowOpacity: 0.19, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } } 
  : { elevation: 8 };

const riceDiseasesExpanded = [
  { name: "Rice Blast", img: require("../assets/images/rice_blast.png") },
  { name: "Sheath Blight", img: require("../assets/images/sheath_blight.png") },
  { name: "Bacterial Blight", img: require("../assets/images/bacterial_blight.png") },
  { name: "Tungro Virus", img: require("../assets/images/tungro.png") },
  { name: "Brown Spot", img: require("../assets/images/brown_spot.png") },
];

const diseaseImages: { [key: string]: any } = {
  "Rice Blast": require("../assets/images/Rice_Blastt.png"),
  "Leaf Blast": require("../assets/images/Rice_Blastt.png"),
  "Sheath Blight": require("../assets/images/Sheath_Blightt.png"),
  "Bacterial Leaf Blight": require("../assets/images/Bacterial_Blightt.png"),
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

const locationCoordinates: { [key: string]: { top: string, left: string } } = {
    "Mabinay": { top: "38%", left: "39%" }, 
    "Tanjay": { top: "50%", left: "59%" }, 
    "Siaton": { top: "85%", left: "55%" },  
};

const DEFAULT_RECENT = {
    id: null, // Added ID field
    disease: "No Diagnosis Made",
    category: "N/A",
    date: "N/A",
    confidence: "0%",
    description: "Please use the Capture button to start your first diagnosis.",
    treatment: "",
    prevention: ""
};

const formatDateTime = (dateString: string) => {
  if (!dateString || dateString === "N/A") return { date: "N/A", time: "" };
  const isoString = dateString.replace(" ", "T"); 
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return { date: dateString, time: "" };
  const datePart = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const timePart = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return { date: datePart, time: timePart };
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Alert': return '#FF4444';
        case 'Moderate': return '#FF8800';
        case 'Safe': return '#22BB66';
        default: return '#666';
    }
};

export default function Dashboard() {
  const router = useRouter();
  
  const [menuVisible, setMenuVisible] = useState(false);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  
  const [zoomLevel, setZoomLevel] = useState(1);

  const [recent, setRecent] = useState(DEFAULT_RECENT);
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [popupLoading, setPopupLoading] = useState(false);
  const [popupData, setPopupData] = useState({ description: "", prevention: "" });

  const [diagnosisCount, setDiagnosisCount] = useState(0); 
  const [currentUserId, setCurrentUserId] = useState(null); 
  const [topDiseases, setTopDiseases] = useState([]);
  const [showTopDiseasesPopup, setShowTopDiseasesPopup] = useState(false);
  
  const topDiseasesAnim = useRef(new Animated.Value(0)).current;
  const notificationAnim = useRef(new Animated.Value(0)).current;
  const popupAnim = useRef(new Animated.Value(0)).current;
  const mapAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  const activeColor = "#22BB66";
  const inactiveColor = "#143B28";

  useEffect(() => {
    const anim = selectedDisease ? popupAnim : (showTopDiseasesPopup ? topDiseasesAnim : (notificationsVisible ? notificationAnim : null));
    if (anim) {
       Animated.spring(anim, { toValue: 1, useNativeDriver: true, friction: 8 }).start();
    } else {
       if (!selectedDisease) popupAnim.setValue(0);
       if (!showTopDiseasesPopup) topDiseasesAnim.setValue(0);
       if (!notificationsVisible) notificationAnim.setValue(0);
    }
  }, [selectedDisease, showTopDiseasesPopup, notificationsVisible]);

  useEffect(() => {
    if (mapVisible) {
      Animated.spring(mapAnim, { toValue: 1, useNativeDriver: true, friction: 8 }).start();
      setZoomLevel(1); 
      
      Animated.loop(
        Animated.sequence([
            Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
            Animated.timing(pulseAnim, { toValue: 0, duration: 0, useNativeDriver: true })
        ])
      ).start();

    } else {
      mapAnim.setValue(0);
      pulseAnim.setValue(0);
    }
  }, [mapVisible]);

  useEffect(() => {
    const loadUserId = async () => {
        const id = await AsyncStorage.getItem('user_id');
        if (id) setCurrentUserId(id);
    };
    loadUserId();
  }, []); 

  useEffect(() => {
    if (currentUserId) {
        fetchData();
        fetchTopDiseases();
    }
  }, [currentUserId]);

  const fetchData = async () => {
    try {
        const countRes = await fetch(`${API.GET_DIAGNOSIS_COUNT}?user_id=${currentUserId}`);
        const countJson = await countRes.json();
        if (countJson.success) setDiagnosisCount(countJson.count);
        const recentRes = await fetch(`${API.GET_RECENT_DIAGNOSIS}?user_id=${currentUserId}`);
        const result = await recentRes.json();
        if (result.success && result.data) {
            setRecent({
                id: result.data.id, // ✅ Store ID
                disease: result.data.disease_name,
                category: result.data.category,
                date: result.data.date_diagnosed,
                confidence: result.data.confidence + "%",
                description: result.data.description,
                treatment: result.data.treatment,
                prevention: result.data.prevention
            });
        } else {
            setRecent(DEFAULT_RECENT);
        }
    } catch (error) { setRecent(DEFAULT_RECENT); }
  };

  const fetchTopDiseases = async () => {
    try {
        const res = await fetch(`${API.GET_TOP_DISEASES}?user_id=${currentUserId}`);
        const result = await res.json();
        if (result.success) setTopDiseases(result.data);
    } catch (error) { console.error("Error fetching top diseases:", error); }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('user_id');
    setMenuVisible(false);
    router.replace("/login-student");
  };

  const handleRecentCardPress = () => {
    if (recent.disease !== "No Diagnosis Made") {
        setSelectedDisease({ 
            name: recent.disease, 
            // ✅ Use Real Image if ID exists, else fallback
            img: recent.id 
                ? { uri: `http://192.168.101.8/HumAI/backend/get_image.php?id=${recent.id}&t=${new Date().getTime()}` } 
                : (diseaseImages[recent.disease] || diseaseImages["No Diagnosis Made"])
        });
        setPopupData({
            description: recent.description,
            prevention: `Treatment: ${recent.treatment}\n\nPrevention: ${recent.prevention}`
        });
        setPopupLoading(false); 
    }
  };

  const handleDiseaseTap = async (disease) => {
    setSelectedDisease(disease); 
    setPopupLoading(true); 
    try {
        const response = await fetch(`${API.GET_DISEASE}?name=${encodeURIComponent(disease.name)}`);
        const result = await response.json();
        if (result.success) {
            setPopupData({ description: result.data.description, prevention: result.data.prevention });
        }
    } catch (error) { setPopupData({ description: "Error loading info.", prevention: "" });
    } finally { setPopupLoading(false); }
  };

  const handleNotificationClick = (notification: any) => {
    setSelectedAlert(notification);
    setNotificationsVisible(false); 
    setTimeout(() => {
        setMapVisible(true); 
    }, 200);
  };

  const handleZoomAfter = (_event: any, _gestureState: any, zoomableViewEventObject: any) => {
      setZoomLevel(zoomableViewEventObject.zoomLevel);
  };

  const { date: displayDate, time: displayTime } = formatDateTime(recent.date);
  const pinCoords = selectedAlert ? locationCoordinates[selectedAlert.location] || { top: "50%", left: "50%" } : { top: "50%", left: "50%" };

  return (
    <LinearGradient colors={["#1EBA56", "#18543A"]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.bg}>
      
      <View style={styles.topBar}>
        <Text style={styles.heading}>Dashboard</Text>
        <View style={styles.iconRow}>
          <TouchableOpacity onPress={() => setNotificationsVisible(true)}>
            <Ionicons name="notifications-outline" size={25} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMenuVisible(true)}>
            <Feather name="menu" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionTitle}>Recent Diagnosis</Text>
        <TouchableOpacity onPress={handleRecentCardPress} activeOpacity={0.85}>
          <View style={styles.cardWide}>
            <Image 
              // ✅ Updated Image Source with ID check and cache busting
              source={recent.id 
                ? { uri: `http://192.168.101.8/HumAI/backend/get_image.php?id=${recent.id}&t=${new Date().getTime()}` } 
                : (diseaseImages[recent.disease] || diseaseImages["No Diagnosis Made"])
              } 
              style={styles.recentImg} 
            />
            <View style={{ flex: 1, paddingHorizontal: 14, gap: 6 }}>
              <Text style={styles.rdTitle}>{recent.disease}</Text>
              <Text style={styles.rdMeta}>Category: {recent.category}</Text>
              <View>
                 <Text style={styles.rdMeta}>{displayDate}</Text>
                 <Text style={[styles.rdMeta, { fontWeight: 'normal' }]}>{displayTime}</Text>
              </View>
              <Text style={styles.rdMeta}>Confidence {recent.confidence}</Text>
            </View>
            <Ionicons name={"chevron-down"} size={24} color="#fff" style={{ marginRight: 10 }} />
          </View>
        </TouchableOpacity>
        
        <View style={styles.statsRow}>
          <View style={{ flex: 1, gap: 12 }}>
            <TouchableOpacity activeOpacity={0.85} onPress={() => setShowTopDiseasesPopup(true)}>
              <View style={styles.topDiseaseCard}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.cardHeader}>Top Disease</Text>
                  <MaterialCommunityIcons name="trophy-outline" size={16} color={inactiveColor} />
                </View>
                <Text style={styles.bigText} numberOfLines={1}>
                    {topDiseases.length > 0 ? topDiseases[0].name : "None"}
                </Text>
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
          
          <View style={styles.diagnosisCardFixed}>
            <Text style={styles.cardHeaderCenter}>Diagnosis{"\n"}Made</Text>
            <Text style={styles.hugeNumberFixed}>{diagnosisCount}</Text>
          </View>
        </View>
        
        <Text style={styles.sectionTitle}>Common Rice Diseases</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
          {riceDiseasesExpanded.map((disease, index) => (
            <TouchableOpacity key={index} style={styles.diseaseCard} activeOpacity={0.86} onPress={() => handleDiseaseTap(disease)}>
              <Image source={disease.img} style={styles.diseaseImage} />
              <Text style={styles.diseaseLabel}>{disease.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>

      {/* NOTIFICATIONS MODAL */}
      {notificationsVisible && (
        <TouchableWithoutFeedback onPress={() => setNotificationsVisible(false)}>
          <View style={styles.overlay}>
            <Animated.View style={[
                styles.popupModal, 
                { opacity: notificationAnim, transform: [{ scale: notificationAnim }] }
            ]}>
              <TouchableOpacity onPress={() => setNotificationsVisible(false)} style={styles.popupCloseBtn}>
                <Ionicons name="close" size={27} color="#184128" />
              </TouchableOpacity>
              
              <Text style={styles.popupTitle}>Notifications</Text>
              <View style={styles.popupDivider} />
              
              <ScrollView style={{ width: '100%' }}>
                {notificationsList.map((n, i) => (
                  <TouchableOpacity key={i} style={styles.dropdownItemModern} onPress={() => handleNotificationClick(n)}>
                    <Image source={diseaseImages[n.disease] || diseaseImages["No Diagnosis Made"]} style={styles.dropdownImage} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.dropdownDisease}>{n.disease}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                         <Ionicons name="location-sharp" size={12} color="#17AD65" style={{marginRight: 2}} />
                         <Text style={styles.dropdownMeta}>{n.location} • {n.status}</Text>
                      </View>
                      <Text style={{ fontSize: 11, color: '#999' }}>{n.time}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#ccc" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      )}

      {/* MAP MODAL */}
      {mapVisible && selectedAlert && (
        <View style={styles.overlay}> 
            <Animated.View style={[
                styles.popupModal, 
                { opacity: mapAnim, transform: [{ scale: mapAnim }], height: 620, padding: 0 }
            ]}>
              <View style={styles.mapHeader}>
                  <Text style={styles.mapTitle}>Disease Alert</Text>
                  <TouchableOpacity onPress={() => setMapVisible(false)}>
                    <Ionicons name="close-circle" size={30} color="#ccc" />
                  </TouchableOpacity>
              </View>

              <View style={styles.mapContainer}>
                 <ReactNativeZoomableView
                    maxZoom={4}
                    minZoom={1}
                    zoomStep={0.5}
                    initialZoom={1}
                    bindToBorders={true}
                    onZoomAfter={handleZoomAfter}
                    style={{ flex: 1 }}
                 >
                     <ImageBackground 
                        source={require('../assets/images/negros_map.png')} 
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="contain"
                     >
                        <Animated.View style={[
                            styles.pulseRing, 
                            { 
                               top: pinCoords.top, 
                               left: pinCoords.left,
                               transform: [
                                   { scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 2] }) },
                                   { scale: 1 / zoomLevel } 
                               ],
                               opacity: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] })
                            }
                        ]} />

                        <View style={[
                            styles.mapPin, 
                            { 
                                top: pinCoords.top, 
                                left: pinCoords.left,
                                transform: [{ scale: 1 / zoomLevel }] 
                            }
                        ]}>
                           <MaterialCommunityIcons name="map-marker" size={42} color={getStatusColor(selectedAlert.status)} style={styles.pinShadow} />
                        </View>
                     </ImageBackground>
                 </ReactNativeZoomableView>
              </View>

              <View style={styles.alertDetailContainer}>
                 <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12}}>
                     <View style={{flex: 1}}>
                         <Text style={styles.alertLabel}>Disease</Text>
                         <Text style={styles.alertValue}>{selectedAlert.disease}</Text>
                     </View>
                     <View style={{flex: 1}}>
                         <Text style={styles.alertLabel}>Location</Text>
                         <Text style={styles.alertValue}>{selectedAlert.location}</Text>
                     </View>
                 </View>

                 <View style={styles.dividerThin} />

                 <View style={styles.alertDetailRow}>
                    <View style={[styles.alertIconBox, { backgroundColor: getStatusColor(selectedAlert.status) + '20' }]}>
                        <MaterialCommunityIcons name="alert-circle-outline" size={20} color={getStatusColor(selectedAlert.status)} />
                    </View>
                    <View>
                        <Text style={styles.alertLabel}>Status</Text>
                        <Text style={[styles.alertValue, { color: getStatusColor(selectedAlert.status), fontWeight: '900' }]}>
                            {selectedAlert.status}
                        </Text>
                    </View>
                 </View>
              </View>
            </Animated.View>
        </View>
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
                <Image source={selectedDisease.img} style={styles.popupImage} resizeMode="cover" />
              </View>
              <Text style={styles.popupTitle}>{selectedDisease.name}</Text>
              <View style={styles.popupDivider} />
              {popupLoading ? <ActivityIndicator size="large" color="#1EBA56" /> : (
                <ScrollView>
                    <Text style={styles.popupDescription}>{popupData.description}</Text>
                    {popupData.prevention ? <>
                        <Text style={styles.popupSubtitle}>Guide:</Text>
                        <Text style={styles.popupDescription}>{popupData.prevention}</Text>
                    </> : null}
                </ScrollView>
              )}
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      )}

      {/* Top Diseases Popup */}
      {showTopDiseasesPopup && (
        <TouchableWithoutFeedback onPress={() => setShowTopDiseasesPopup(false)}>
          <View style={styles.overlay}>
            <Animated.View style={[styles.popupModal, { opacity: topDiseasesAnim, transform: [{ scale: topDiseasesAnim }] }]}>
              <TouchableOpacity onPress={() => setShowTopDiseasesPopup(false)} style={styles.popupCloseBtn}>
                <Ionicons name="close" size={27} color="#184128" />
              </TouchableOpacity>
              <Text style={styles.popupTitle}>Your Top Diseases</Text>
              <View style={styles.popupDivider} />
              <View style={{ width: '100%' }}>
                {topDiseases.length > 0 ? topDiseases.map((item, index) => (
                  <View key={index} style={styles.topDiseaseItem}>
                    <View style={styles.rankBadge}><Text style={styles.rankText}>{index + 1}</Text></View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.topDiseaseName}>{item.name}</Text>
                      <Text style={styles.topDiseaseCategory}>{item.category}</Text>
                    </View>
                    <Text style={styles.occurrenceText}>{item.occurrences}x</Text>
                  </View>
                )) : <Text style={styles.popupDescription}>No diagnoses found yet.</Text>}
              </View>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      )}

      {/* Menu */}
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
                <TouchableOpacity style={styles.dropdownItem} onPress={() => { setMenuVisible(false); router.push("/feedback"); }}>
                  <Text style={styles.dropdownText}>Submit Feedback</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dropdownItem} onPress={handleLogout}>
                  <Text style={[styles.dropdownText, { color: '#FF4444' }]}>Logout</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      )}

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push("/chatbot")}>
          <Ionicons name="chatbubble-ellipses-outline" size={26} color={inactiveColor} />
          <Text style={styles.tabLabel}>Chatbot</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabItem, styles.tabCenter]} onPress={() => router.push("/capture")}>
          <Ionicons name="camera-outline" size={28} color={activeColor} />
          <Text style={styles.tabLabel}>Capture</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push("/history")}>
          <Ionicons name="time-outline" size={26} color={inactiveColor} />
          <Text style={styles.tabLabel}>History</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  topBar: { paddingTop: 56, paddingHorizontal: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  heading: { color: "#fff", fontSize: 32, fontWeight: "800" },
  iconRow: { flexDirection: "row", alignItems: "center", gap: 20 },
  scroll: { paddingHorizontal: 16, paddingBottom: 130, paddingTop: 25 },
  sectionTitle: { color: "#fff", fontWeight: "700", fontSize: 16, marginBottom: 10 },
  cardWide: { backgroundColor: "#ffffffbb", borderRadius: 18, padding: 12, flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderColor: "#edf7ef", marginBottom: 20, ...SHADOW },
  recentImg: { width: 115, height: 115, borderRadius: 16, backgroundColor: "#fff" },
  rdTitle: { color: DARK, fontWeight: "900", fontSize: 22 },
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
  
  overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.37)", justifyContent: "center", alignItems: "center", zIndex: 1900 },
  popupModal: { backgroundColor: "#fff", borderRadius: 27, alignItems: "center", padding: 26, width: 340, maxWidth: "97%", ...SHADOW, maxHeight: '80%' },
  popupCloseBtn: { position: "absolute", top: 17, right: 18, zIndex: 10, padding: 7 },
  popupImageContainer: { shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 16, elevation: 10, borderRadius: 24, backgroundColor: "#fefefe", padding: 6, marginBottom: 20 },
  popupImage: { width: 200, height: 180, borderRadius: 18, backgroundColor: "#fff" },
  popupTitle: { color: "#1EBA56", fontSize: 24, fontWeight: "bold", marginBottom: 6, textAlign: "center" },
  popupDivider: { width: 70, height: 3, borderRadius: 2, backgroundColor: "#DFF4E7", marginVertical: 15 },
  popupDescription: { color: DARK, fontWeight: "600", fontSize: 15.5, textAlign: "center", lineHeight: 24 },
  popupSubtitle: { color: "#1EBA56", fontWeight: "bold", fontSize: 16, marginTop: 15, marginBottom: 5, textAlign: 'center' },
  topDiseaseItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F6FFF7', padding: 12, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#E6F3EA' },
  rankBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#1EBA56', justifyContent: 'center', alignItems: 'center' },
  rankText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  topDiseaseName: { fontSize: 16, fontWeight: '700', color: DARK },
  topDiseaseCategory: { fontSize: 12, color: '#1EBA56' },
  occurrenceText: { fontSize: 16, fontWeight: '800', color: DARK, opacity: 0.6 },
  
  menuOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 2000 },
  dropdownMenu: { position: "absolute", top: 70, right: 18, backgroundColor: "#FFFFFF", borderRadius: 16, paddingVertical: 8, width: 180, ...SHADOW },
  dropdownItem: { paddingHorizontal: 20, paddingVertical: 12 },
  dropdownText: { fontSize: 16, color: DARK, fontWeight: "700" },
  
  dropdownDisease: { fontSize: 16, fontWeight: "700", color: DARK },
  dropdownMeta: { color: "#17AD65", fontSize: 13, marginTop: 2 },
  dropdownItemModern: { flexDirection: "row", alignItems: "center", padding: 11, borderRadius: 12, backgroundColor: "#F7FFF7", marginBottom: 10, borderWidth: 1, borderColor: "#E6F3EA", width: '100%' },
  dropdownImage: { width: 36, height: 36, borderRadius: 12, marginRight: 12, backgroundColor: "#fff", borderWidth: 1, borderColor: "#E5E5E5" },

  mapHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingHorizontal: 20, paddingVertical: 15 },
  mapTitle: { fontSize: 20, fontWeight: 'bold', color: DARK },
  mapContainer: { width: '100%', height: 400, backgroundColor: '#F0F8FF', overflow: 'hidden', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#eee' },
  mapPin: { position: 'absolute', alignItems: 'center', justifyContent: 'center', width: 50, height: 50, marginTop: -42, marginLeft: -25 },
  pinShadow: { textShadowColor: 'rgba(0, 0, 0, 0.4)', textShadowOffset: { width: 1, height: 3 }, textShadowRadius: 4 },
  pulseRing: { position: 'absolute', width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(229, 57, 53, 0.4)', marginTop: -46, marginLeft: -30, zIndex: -1 },
  alertDetailContainer: { width: '100%', paddingHorizontal: 15, paddingVertical: 12, backgroundColor: '#fff', borderBottomLeftRadius: 27, borderBottomRightRadius: 27 },
  alertDetailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  alertIconBox: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  alertLabel: { fontSize: 12, color: '#888', fontWeight: '600' },
  alertValue: { fontSize: 14, color: DARK, fontWeight: 'bold' },
  dividerThin: { height: 1, backgroundColor: '#eee', marginVertical: 8, width: '100%' }
});