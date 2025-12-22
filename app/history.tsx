import { Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { API } from "../constants/Config";

const { width, height } = Dimensions.get("window");
const DARK = "#143B28";
const CARD_BG = "#F6FFF7";

const diseaseImages: { [key: string]: any } = {
  "Rice Blast": require("../assets/images/Rice_Blastt.png"),
  "Leaf Blast": require("../assets/images/Rice_Blastt.png"),
  "Sheath Blight": require("../assets/images/Sheath_Blightt.png"),
  "Bacterial Leaf Blight": require("../assets/images/Bacterial_Blightt.png"),
  "Bacterial Blight": require("../assets/images/Bacterial_Blightt.png"),
  "Tungro Virus": require("../assets/images/tungro.png"),
  "Brown Spot": require("../assets/images/brown_spot.png"),
  "Placeholder": require("../assets/images/bacterial_blight.png"),
};

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
// Generate years dynamically (e.g., from 2020 to current year + 1)
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => (CURRENT_YEAR - 4 + i));

const getDaysInMonth = (monthIndex: number, year: number) => {
    return new Date(year, monthIndex + 1, 0).getDate();
};

const formatDateTime = (dateString: string) => {
  if (!dateString) return { date: "N/A", time: "" };
  // Ensure date string is compatible with JS Date
  const isoString = dateString.replace(" ", "T"); 
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return { date: dateString, time: "" };
  
  const datePart = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  // ✅ Extract Time Correctly
  const timePart = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return { date: datePart, time: timePart };
};

export default function History() {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  // Calendar State
  const [currentYear, setCurrentYear] = useState(CURRENT_YEAR);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());

  // Dropdown Visibility for Calendar
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const translateX = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.96)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const init = async () => {
      let userId = await AsyncStorage.getItem('user_id');
      if (userId) fetchHistory(userId);
      else router.replace("/login-student"); 
    };
    init();
  }, []);

  const fetchHistory = async (userId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API.GET_HISTORY}?user_id=${userId}`);
      const result = await response.json();
      if (result.success) setHistoryData(result.data); 
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('user_id');
    setMenuVisible(false);
    router.replace("/login-student");
  };

  const filteredData = useMemo(() => {
    if (!selectedDate) return historyData;
    return historyData.filter((item: any) => {
      // Use raw_date for precise filtering if available, else date_diagnosed
      const rawDate = item.raw_date || item.date_diagnosed || "";
      const { date } = formatDateTime(rawDate); 
      return date === selectedDate; 
    });
  }, [selectedDate, historyData]);

  const popInCard = () => {
    cardScale.setValue(0.92);
    cardOpacity.setValue(0);
    Animated.parallel([
      Animated.spring(cardScale, { toValue: 1, friction: 7, useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 210, useNativeDriver: true }),
    ]).start();
  };

  const showPopup = (item: any) => {
    setSelectedItem(item);
    setTimeout(popInCard, 10);
  };

  const handleDayPress = (day: number) => {
    const displayDate = new Date(currentYear, currentMonth, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    setSelectedDate(displayDate); 
    setCalendarVisible(false);
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 20 && Math.abs(gesture.dy) < 30,
      onPanResponderMove: Animated.event([null, { dx: translateX }], { useNativeDriver: false }),
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > width * 0.3) {
          Animated.spring(translateX, { toValue: width, useNativeDriver: true }).start(() => router.push("/dashboard"));
        } else {
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
        }
      }
    })
  ).current;

  const renderItem = ({ item, index }: { item: any, index: number }) => {
    // ✅ Use the raw_date from the backend to ensure time is included
    const rawDate = item.raw_date || item.date_diagnosed || "";
    const { date, time } = formatDateTime(rawDate);

    return (
        <TouchableOpacity style={styles.card} activeOpacity={0.84} onPress={() => showPopup(item)}>
        <View style={styles.rowTopSimple}>
            <Image 
            source={{ uri: `http://192.168.101.8/HumAI/backend/get_image.php?id=${item.id}` }} 
            style={styles.thumbLarge} 
            defaultSource={diseaseImages[item.disease_name] || diseaseImages["Placeholder"]}
            />
            <View style={{ flex: 1, justifyContent: "center", marginLeft: 16 }}>
                <Text style={styles.titleModern}>{item.disease_name}</Text>
                {/* ✅ Display Date and Time Separately */}
                <Text style={styles.dateModern}>
                    {date} • <Text style={{fontWeight: 'normal', color: '#666'}}>{time}</Text>
                </Text>
                <Text style={styles.confidenceText}>Confidence: {item.confidence}%</Text>
            </View>
            <Ionicons name="chevron-forward" color="#BEE8D2" size={24} />
        </View>
        </TouchableOpacity>
    );
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <LinearGradient colors={["#18B949", "#1D492D"]} style={styles.bg}>
      <View style={styles.topBar}>
        <Text style={styles.header}>History</Text>
        <View style={styles.topIcons}>
          <TouchableOpacity onPress={() => setCalendarVisible(true)}>
            <Ionicons name="calendar-outline" size={26} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMenuVisible(true)}>
            <Feather name="menu" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filterInfo}>
        <Text style={styles.sectionHeader}>{selectedDate ? `Records: ${selectedDate}` : "My Records"}</Text>
        {selectedDate && <TouchableOpacity onPress={() => setSelectedDate(null)}><Text style={styles.clearText}>Clear Filter</Text></TouchableOpacity>}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#fff" style={{ flex: 1 }} />
      ) : (
        <Animated.View style={{ flex: 1, transform: [{ translateX }] }} {...panResponder.panHandlers}>
          <FlatList
            data={filteredData}
            keyExtractor={(item, index) => item.id ? `${item.id}-${index}` : index.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="alert-circle-outline" size={42} color="#afdcae" />
                <Text style={styles.emptyText}>No history records found.</Text>
              </View>
            }
          />
        </Animated.View>
      )}

      {/* --- MENU MODAL --- */}
      {menuVisible && (
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.menuOverlay}>
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
          </View>
        </TouchableWithoutFeedback>
      )}

      {/* --- CALENDAR MODAL --- */}
      <Modal transparent visible={calendarVisible} animationType="fade">
        <TouchableWithoutFeedback onPress={() => { setCalendarVisible(false); setShowMonthPicker(false); setShowYearPicker(false); }}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.calendarContainer}>
                
                {/* 🔽 CALENDAR HEADER WITH DROPDOWNS */}
                <View style={styles.calHeader}>
                   
                   {/* Month Selector */}
                   <TouchableOpacity style={styles.dropdownBtn} onPress={() => { setShowMonthPicker(!showMonthPicker); setShowYearPicker(false); }}>
                      <Text style={styles.dropdownBtnText}>{MONTHS[currentMonth]}</Text>
                      <Ionicons name="caret-down" size={12} color={DARK} />
                   </TouchableOpacity>

                   {/* Year Selector */}
                   <TouchableOpacity style={styles.dropdownBtn} onPress={() => { setShowYearPicker(!showYearPicker); setShowMonthPicker(false); }}>
                      <Text style={styles.dropdownBtnText}>{currentYear}</Text>
                      <Ionicons name="caret-down" size={12} color={DARK} />
                   </TouchableOpacity>

                </View>

                {/* 🔽 DROPDOWN LISTS (Overlaying the grid) */}
                {showMonthPicker && (
                    <View style={styles.pickerOverlay}>
                        <ScrollView style={{maxHeight: 200}}>
                            {MONTHS.map((m, index) => (
                                <TouchableOpacity key={m} style={styles.pickerItem} onPress={() => { setCurrentMonth(index); setShowMonthPicker(false); }}>
                                    <Text style={[styles.pickerItemText, currentMonth === index && {color: '#22BB66', fontWeight:'bold'}]}>{m}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {showYearPicker && (
                    <View style={styles.pickerOverlay}>
                        <ScrollView style={{maxHeight: 200}}>
                            {YEARS.map((y) => (
                                <TouchableOpacity key={y} style={styles.pickerItem} onPress={() => { setCurrentYear(y); setShowYearPicker(false); }}>
                                    <Text style={[styles.pickerItemText, currentYear === y && {color: '#22BB66', fontWeight:'bold'}]}>{y}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Days Grid */}
                <View style={styles.daysGrid}>
                  {daysArray.map(day => (
                    <TouchableOpacity 
                        key={day} 
                        style={styles.dayCell} 
                        onPress={() => handleDayPress(day)}
                    >
                      <Text style={styles.dayText}>{day}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity onPress={() => setCalendarVisible(false)} style={styles.calCloseBtn}>
                  <Text style={{color: '#fff', fontWeight: 'bold'}}>Close</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* --- ITEM DETAIL MODAL --- */}
      <Modal transparent visible={!!selectedItem} animationType="fade">
        <TouchableWithoutFeedback onPress={() => setSelectedItem(null)}>
          <View style={styles.modalOverlay}>
            <Animated.View style={[styles.popupContainer, { opacity: cardOpacity, transform: [{ scale: cardScale }] }]}>
              {selectedItem && (
                <>
                  <TouchableOpacity onPress={() => setSelectedItem(null)} style={styles.closePopupBtn}><Ionicons name="close" size={22} color="#18543A" /></TouchableOpacity>
                  <Image source={{ uri: `http://192.168.101.8/HumAI/backend/get_image.php?id=${selectedItem.id}` }} style={styles.popupImage} defaultSource={diseaseImages[selectedItem.disease_name]} />
                  <Text style={styles.popupTitle}>{selectedItem.disease_name}</Text>
                  {/* ✅ Popup Date & Time */}
                  <Text style={styles.popupDate}>
                      {formatDateTime(selectedItem.raw_date || selectedItem.date_diagnosed).date} • {formatDateTime(selectedItem.raw_date || selectedItem.date_diagnosed).time}
                  </Text>
                  <View style={styles.popupDivider} />
                  <ScrollView style={{width: '100%', maxHeight: 250}}>
                    <Text style={styles.popupLabel}>Description</Text>
                    <Text style={styles.popupText}>{selectedItem.description || "N/A"}</Text>
                    <Text style={styles.popupLabel}>Care Guide</Text>
                    <Text style={styles.popupText}>Treatment: {selectedItem.treatment || "N/A"}{"\n\n"}Prevention: {selectedItem.prevention || "N/A"}</Text>
                  </ScrollView>
                </>
              )}
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push("/chatbot")}><Ionicons name="chatbubble-ellipses-outline" size={22} color={DARK} /><Text style={styles.tabLabel}>Chatbot</Text></TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push("/dashboard")}><Ionicons name="grid-outline" size={22} color={DARK} /><Text style={styles.tabLabel}>Dashboard</Text></TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push("/history")}><Ionicons name="time" size={22} color="#22BB66" /><Text style={[styles.tabLabel, { color: "#22BB66" }]}>History</Text></TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  topBar: { paddingTop: 60, paddingHorizontal: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  header: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  topIcons: { flexDirection: "row", gap: 15 },
  filterInfo: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 20, alignItems: 'center' },
  sectionHeader: { color: "#fff", fontSize: 16, fontWeight: "600" },
  clearText: { color: "#b1ebd7", fontWeight: "bold", textDecorationLine: 'underline', fontSize: 14 },
  listContent: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 100 },
  card: { backgroundColor: CARD_BG, borderRadius: 18, padding: 12, marginBottom: 12, elevation: 3 },
  rowTopSimple: { flexDirection: "row", alignItems: "center" },
  thumbLarge: { width: 60, height: 60, borderRadius: 12, backgroundColor: '#eee' },
  titleModern: { fontSize: 18, fontWeight: "bold", color: DARK },
  dateModern: { color: "#229a4d", fontSize: 13, marginTop: 4, fontWeight: "500" },
  confidenceText: { fontSize: 11, color: "#666", marginTop: 2 },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 100 },
  emptyText: { color: "#fff", fontSize: 16, marginTop: 10, textAlign: 'center', opacity: 0.8 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  popupContainer: { width: width * 0.9, backgroundColor: "#fff", borderRadius: 24, padding: 24, alignItems: "center" },
  popupImage: { width: 150, height: 150, borderRadius: 20, marginBottom: 15, backgroundColor: '#eee' },
  popupTitle: { fontSize: 22, fontWeight: "bold", color: DARK },
  popupDate: { color: "#229a4d", fontSize: 13, marginTop: 5, marginBottom: 10 },
  popupDivider: { width: 50, height: 4, borderRadius: 2, backgroundColor: "#d7f3e4", marginVertical: 15 },
  popupLabel: { fontWeight: "bold", color: "#129b4b", fontSize: 14, alignSelf: "flex-start", marginTop: 10 },
  popupText: { color: DARK, fontSize: 14, lineHeight: 20 },
  closePopupBtn: { position: "absolute", top: 15, right: 15, backgroundColor: "#f0f0f0", borderRadius: 20, padding: 5 },
  tabBar: { position: "absolute", bottom: 0, width: '100%', backgroundColor: CARD_BG, flexDirection: "row", paddingVertical: 15, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  tabItem: { flex: 1, alignItems: "center" },
  tabLabel: { fontSize: 11, fontWeight: "bold", marginTop: 4 },
  
  // Menu Styles
  menuOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 2000 },
  dropdownMenu: { position: "absolute", top: 70, right: 18, backgroundColor: "#FFFFFF", borderRadius: 16, paddingVertical: 8, width: 180, elevation: 8 },
  dropdownItem: { paddingHorizontal: 20, paddingVertical: 12 },
  dropdownText: { fontSize: 16, color: DARK, fontWeight: "700" },

  // Calendar Styles
  calendarContainer: { width: 320, backgroundColor: "#fff", borderRadius: 18, padding: 15, alignItems: "center" },
  calHeader: { flexDirection: "row", justifyContent: "space-between", width: "100%", marginBottom: 15, alignItems: 'center' },
  calTitle: { fontSize: 18, fontWeight: "bold", color: DARK },
  daysGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-start" },
  dayCell: { width: 40, height: 40, justifyContent: "center", alignItems: "center", margin: 1 },
  dayText: { fontSize: 16, color: "#333" },
  calCloseBtn: { marginTop: 15, backgroundColor: "#22BB66", paddingVertical: 8, paddingHorizontal: 20, borderRadius: 10 },
  
  // New Dropdown Styles
  dropdownBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F5F2', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, gap: 5 },
  dropdownBtnText: { fontSize: 16, fontWeight: 'bold', color: DARK },
  pickerOverlay: { position: 'absolute', top: 60, zIndex: 100, backgroundColor: '#fff', width: '80%', borderRadius: 10, elevation: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, padding: 5 },
  pickerItem: { paddingVertical: 10, paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  pickerItemText: { fontSize: 16, color: DARK }
});