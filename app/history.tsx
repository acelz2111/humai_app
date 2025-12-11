import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { Calendar } from "react-native-calendars";

const { width } = Dimensions.get("window");

// --- Helper: format date to 'YYYY-MM-DD'
const formatDate = (date) => {
  if (typeof date === "string") return date;
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

type Item = {
  id: string;
  title: string;
  fileLabel: string;
  date: string;
  time: string;
  description: string;
  symptoms: string;
  causes: string;
  image: any;
};

export default function History() {
  const router = useRouter();
  const flatListRef = useRef(null);

  const [activeTab, setActiveTab] = useState("history");
  const activeColor = "#22BB66";
  const inactiveColor = "#143B28";

  const [menuVisible, setMenuVisible] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  // --- SMOOTH SWIPE animation state
  const translateX = useRef(new Animated.Value(0)).current;

  // Card animation for popup
  const cardScale = useRef(new Animated.Value(0.96)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  // --- Full historic data (add freely, new entries auto supported)
  const data: Item[] = useMemo(
    () => [
      {
        id: "1",
        title: "Rice Blast",
        fileLabel: "Image1.jpg",
        date: "2025-06-23",
        time: "2:59PM",
        description:
          "Rice Blast is one of the most destructive diseases of rice worldwide. It is caused by the fungus Magnaporthe oryzae.",
        symptoms:
          "Leaf spots: Diamond- or spindle-shaped lesions with gray centers and brown borders.",
        causes: "Caused by the fungus Magnaporthe oryzae.",
        image: require("../assets/images/rice_blast.png"),
      },
      {
        id: "2",
        title: "Sheath Blight",
        fileLabel: "Image2.jpg",
        date: "2025-06-24",
        time: "2:45PM",
        description:
          "Sheath blight affects the sheaths and leaves, leading to lodging and yield loss.",
        symptoms:
          "Elliptical lesions on leaf sheaths that may coalesce and spread upward.",
        causes: "Caused by the fungus Rhizoctonia solani.",
        image: require("../assets/images/sheath_blight.png"),
      },
    ],
    []
  );

  // --- Filtering: if date selected, only show matching
  const filteredData =
    selectedDate == null
      ? data
      : data.filter((item) => item.date === selectedDate);

  // --- Card popup animation function
  const popInCard = () => {
    cardScale.setValue(0.92);
    cardOpacity.setValue(0);
    Animated.parallel([
      Animated.spring(cardScale, { toValue: 1, friction: 7, useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 210, useNativeDriver: true }),
    ]).start();
  };
  const showPopup = (item: Item) => {
    setSelectedItem(item);
    setTimeout(popInCard, 10);
  };

  // --- PanResponder for right swipe gesture
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 7 && Math.abs(gesture.dy) < 18,
      onPanResponderGrant: () => {},
      onPanResponderMove: Animated.event(
        [null, { dx: translateX }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > width * 0.24) {
          Animated.spring(translateX, {
            toValue: width,
            speed: 13,
            bounciness: 7,
            useNativeDriver: true
          }).start(() => {
            setActiveTab("dashboard");
            translateX.setValue(0);
            router.push("/dashboard");
          });
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            speed: 14,
            bounciness: 10,
            useNativeDriver: true
          }).start();
        }
      }
    })
  ).current;

  const renderItem = ({ item }: { item: Item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.84}
      onPress={() => showPopup(item)}
    >
      <View style={styles.rowTopSimple}>
        <Image source={item.image} style={styles.thumbLarge} />
        <View style={{ flex: 1, justifyContent: "center", marginLeft: 16 }}>
          <Text style={styles.titleModern}>{item.title}</Text>
          <Text style={styles.dateModern}>{item.date}</Text>
        </View>
        <Ionicons name="chevron-forward" color="#BEE8D2" size={24} />
      </View>
    </TouchableOpacity>
  );

  // --- Modern calendar modal content
  const CalendarModal = (
    <Modal
      transparent
      visible={calendarVisible}
      animationType="fade"
      onRequestClose={() => setCalendarVisible(false)}
    >
      <TouchableWithoutFeedback onPress={() => setCalendarVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.calendarModernBox}>
              <Calendar
                onDayPress={day => {
                  setCalendarVisible(false);
                  setSelectedDate(day.dateString);
                }}
                markedDates={
                  Object.fromEntries(
                    data.map(i => [i.date, {
                      marked: true,
                      dotColor: "#22BB66",
                      selected: selectedDate === i.date,
                      selectedColor: selectedDate === i.date ? "#15c36d" : undefined
                    }])
                  )
                }
                theme={{
                  backgroundColor: "#fff",
                  calendarBackground: "#fff",
                  textSectionTitleColor: "#30ad89",
                  dayTextColor: "#143B28",
                  monthTextColor: "#22BB66",
                  textMonthFontWeight: "700",
                  todayTextColor: "#1fde67",
                  selectedDayTextColor: "#fff",
                  selectedDayBackgroundColor: "#22BB66",
                  arrowColor: "#22BB66",
                  textDisabledColor: "#cacaca"
                }}
                style={{
                  borderRadius: 28,
                  padding: 6,
                  margin: 10
                }}
                renderArrow={direction =>
                  <Ionicons
                    name={direction === "left" ? "chevron-back" : "chevron-forward"}
                    size={26}
                    color="#16ac5c"
                  />
                }
                enableSwipeMonths
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  return (
    <LinearGradient
      colors={["#18B949", "#1D492D"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.bg}
    >
      {/* Top bar (no back sign) */}
      <View style={styles.topBar}>
        <Text style={styles.header}>History</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <TouchableOpacity
            onPress={() => setMenuVisible(true)}
            activeOpacity={0.7}
          >
            <Feather name="menu" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setCalendarVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="calendar-outline" size={26} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Section Header */}
      <View style={styles.sectionHeaderWrap}>
        <Text style={styles.sectionHeader}>Recent</Text>
      </View>

      {/* Animated FlatList for left-right swipe */}
      <Animated.View
        style={{
          flex: 1,
          transform: [{ translateX: translateX }],
        }}
        {...panResponder.panHandlers}
      >
        <FlatList
          ref={flatListRef}
          data={filteredData}
          keyExtractor={(it) => it.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="alert-circle-outline" size={42} color="#afdcae" />
              <Text style={styles.emptyText}>No history on this day</Text>
            </View>
          }
        />
      </Animated.View>

      {CalendarModal}

      {/* Menu Dropdown */}
      {menuVisible && (
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.menuOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.dropdownMenu}>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setMenuVisible(false);
                    setActiveTab("dashboard");
                    router.push("/dashboard");
                  }}
                >
                  <Text style={styles.dropdownText}>Dashboard</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setMenuVisible(false);
                    router.push("/profile");
                  }}>
                  <Text style={styles.dropdownText}>Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setMenuVisible(false);
                    router.replace("/login-type");
                  }}
                >
                  <Text style={styles.dropdownText}>Logout</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      )}

      {/* Popup for item details (with animation) */}
      <Modal
        transparent
        visible={!!selectedItem}
        animationType="fade"
        onRequestClose={() => setSelectedItem(null)}
      >
        <TouchableWithoutFeedback onPress={() => setSelectedItem(null)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <Animated.View
                style={[
                  styles.popupContainer,
                  {
                    opacity: cardOpacity,
                    transform: [{ scale: cardScale }]
                  },
                ]}
              >
                {selectedItem && (
                  <>
                    <Image source={selectedItem.image} style={styles.popupImage} />
                    <Text style={styles.popupTitle}>{selectedItem.title}</Text>
                    <Text style={styles.popupDate}>
                      {selectedItem.date} {selectedItem.time}
                    </Text>
                    <View style={styles.popupDivider} />
                    <Text style={styles.popupLabel}>Description</Text>
                    <Text style={styles.popupText}>{selectedItem.description}</Text>
                    <Text style={styles.popupLabel}>Symptoms</Text>
                    <Text style={styles.popupText}>{selectedItem.symptoms}</Text>
                    <Text style={styles.popupLabel}>Causes</Text>
                    <Text style={styles.popupText}>{selectedItem.causes}</Text>
                    <View style={{ height: 1, opacity: 0.15, backgroundColor: "#143B28", marginVertical: 10 }} />
                    <Text style={styles.popupFile}>{selectedItem.fileLabel}</Text>
                    <TouchableOpacity onPress={() => setSelectedItem(null)} style={styles.closePopupBtn}>
                      <Ionicons name="close" size={22} color="#18543A" />
                    </TouchableOpacity>
                  </>
                )}
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Tab Bar - Same size as Dashboard, no green on Dashboard icon */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => {
            setActiveTab("chatbot");
            router.push("/chatbot");
          }}>
          <Ionicons
            name={activeTab === "chatbot" ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"}
            size={22}
            color={activeTab === "chatbot" ? activeColor : inactiveColor}
          />
          <Text style={[styles.tabLabel, activeTab === "chatbot" && { color: activeColor }]}>
            Chatbot
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => {
            setActiveTab("dashboard");
            router.push("/dashboard");
          }}>
          <Ionicons
            name={"grid-outline"}
            size={22}
            color={inactiveColor}
          />
          <Text style={styles.tabLabel}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => {
            setActiveTab("history");
            router.push("/history");
          }}>
          <Ionicons
            name={activeTab === "history" ? "time" : "time-outline"}
            size={22}
            color={activeTab === "history" ? activeColor : inactiveColor}
          />
          <Text style={[styles.tabLabel, activeTab === "history" && { color: activeColor }]}>
            History
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const CARD_BG = "#F6FFF7";
const DARK = "#143B28";
const styles = StyleSheet.create({
  bg: { flex: 1 },
  topBar: {
    paddingTop: 56,
    paddingBottom: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 5,
  },
  header: { color: "#fff", fontSize: 20, fontWeight: "800" },
  sectionHeaderWrap: {
    marginTop: 5, 
    marginBottom: 5, 
    paddingHorizontal: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    letterSpacing: 0.02,
  },
  listContent: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 80, gap: 20 },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 7,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e4e4e7"
  },
  rowTopSimple: { flexDirection: "row", alignItems: "center", width: "100%" },
  thumbLarge: { width: 64, height: 64, borderRadius: 15, backgroundColor: "#fff" },
  titleModern: { fontSize: 18, fontWeight: "bold", color: DARK, letterSpacing: 0.1 },
  dateModern: { color: "#229a4d", fontWeight: "700", fontSize: 13, marginTop: 7 },
  // -- Popup Styling --
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.24)",
    justifyContent: "center",
    alignItems: "center",
  },
  popupContainer: {
    width: width * 0.89,
    maxWidth: 420,
    borderRadius: 26,
    backgroundColor: "#fff",
    padding: 26,
    alignItems: "center",
    shadowColor: "#1EBA56",
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 14,
    position: "relative"
  },
  popupImage: { width: 126, height: 126, borderRadius: 16, marginBottom: 14, backgroundColor: "#ecfaf3" },
  popupTitle: { fontSize: 23, fontWeight: "bold", color: DARK, textAlign: "center", marginBottom: 2, marginTop: 4 },
  popupDate: { color: "#229a4d", fontWeight: "600", fontSize: 13, marginBottom: 6 },
  popupDivider: { width: 70, height: 3, borderRadius: 2, backgroundColor: "#d7f3e4", marginVertical: 10 },
  popupLabel: { color: "#129b4b", fontWeight: "800", fontSize: 13, marginTop: 7, marginBottom: 2, alignSelf: "flex-start" },
  popupText: { color: "#246A46", fontSize: 14.5, lineHeight: 22, marginBottom: 5, alignSelf: "flex-start" },
  popupFile: { color: "#999", fontSize: 12, alignSelf: "flex-end", marginTop: 9, marginBottom: -7 },
  closePopupBtn: {
    position: "absolute",
    top: 13, right: 17,
    zIndex: 2, backgroundColor: "#ebede7", borderRadius: 24,
    width: 37, height: 37, alignItems: "center", justifyContent: "center"
  },
  empty: { justifyContent: "center", alignItems: "center", marginTop: 44, marginBottom: 30 },
  emptyText: { color: "#adcaba", fontSize: 17, fontWeight: "700", marginTop: 12, opacity: 0.8 },
  // ---- Modern calendar modal ----
  calendarModernBox: {
    width: 345,
    backgroundColor: "#fff",
    borderRadius: 28,
    padding: 4, alignItems: "center",
    shadowColor: "#1EBA56",
    shadowOpacity: 0.13,
    shadowRadius: 14,
    elevation: 10,
    marginTop: 50,
  },
  // ---- Menu and Calendar ----
  menuOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 2000,
  },
  dropdownMenu: {
    position: "absolute",
    top: 64,
    right: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 6,
    width: 170,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 16,
    zIndex: 2100,
  },
  dropdownItem: { paddingHorizontal: 16, paddingVertical: 12 },
  dropdownText: { fontSize: 16, color: DARK, fontWeight: "700" },
  // ---- Tab bar styles (same size as Dashboard) ----
  tabBar: {
    position: "absolute",
    left: 0, right: 0, bottom: 0,
    backgroundColor: CARD_BG,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopLeftRadius: 18, borderTopRightRadius: 18,
    paddingBottom: 20, paddingTop: 21, paddingHorizontal: 24,
    shadowColor: "#000", shadowOpacity: 0.09, shadowRadius: 8, elevation: 6,
  },
  tabItem: { alignItems: "center", gap: 4, flex: 1, justifyContent: "center" },
  tabLabel: { color: DARK, fontSize: 12, fontWeight: "700", marginTop: 2 },
});
