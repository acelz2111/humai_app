import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function CalendarHistory() {
  const router = useRouter();
  const today = new Date();
  const [monthIndex, setMonthIndex] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);

  const months = [
    "January","February","March","April",
    "May","June","July","August",
    "September","October","November","December",
  ];
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  const getDaysInMonth = (m:number,y:number) =>
    new Date(y, m+1, 0).getDate();
  const getStartDay = (m:number,y:number) =>
    new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(monthIndex, year);
  const startDay   = getStartDay(monthIndex, year);
  const totalBoxes = 42;

  const holidays: Record<string,string> = {
    [`${year}-01-01`]: "New Year's Day",
    [`${year}-01-15`]: "ML King Day",
  };

  const handleDatePress = (day:number) => {
    const mm = (monthIndex+1).toString().padStart(2,"0");
    const dd = day.toString().padStart(2,"0");
    const yy = year.toString().slice(-2);
    const dateStr = `${mm}/${dd}/${yy}`;
    setSelectedDate(dateStr);
    router.push({ pathname: "/history", params: { filterDate: dateStr } });
  };

  const jumpToToday = () => {
    setMonthIndex(today.getMonth());
    setYear(today.getFullYear());
    setSelectedDate("");
  };

  const onLogout = () => {
    setMenuVisible(false);
    router.replace("/login-type");
  };

  return (
    <LinearGradient
      colors={["#18B949", "#1D492D"]}
      style={styles.bg}
    >
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.iconLeft}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.header}>History</Text>

        {/* Right icons: menu (top), filter (below) */}
        <View style={styles.iconRight}>
          <TouchableOpacity
            onPress={() => setMenuVisible(true)}
            style={styles.iconButton}
          >
            <Feather name="menu" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={jumpToToday}
            style={styles.iconButton}
          >
            <Feather name="filter" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Year / Month Navigation */}
      <View style={styles.navWrap}>
        <View style={styles.navRow}>
          <TouchableOpacity onPress={() => setYear(y=>y-1)}>
            <Ionicons name="chevron-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.navText}>{year}</Text>
          <TouchableOpacity onPress={() => setYear(y=>y+1)}>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.navRow}>
          <TouchableOpacity onPress={() => setMonthIndex(i=>i===0?11:i-1)}>
            <Ionicons name="chevron-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.navText}>{months[monthIndex]}</Text>
          <TouchableOpacity onPress={() => setMonthIndex(i=>i===11?0:i+1)}>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Weekday Labels */}
      <View style={styles.weekdayRow}>
        {days.map(d => (
          <Text key={d} style={styles.dayLabel}>{d}</Text>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarGrid}>
        {Array.from({ length: totalBoxes }).map((_, i) => {
          const day = i - startDay + 1;
          const valid = day>0 && day<=daysInMonth;
          const key  = `${year}-${(monthIndex+1).toString().padStart(2,"0")}-${day.toString().padStart(2,"0")}`;
          const isHol = holidays[key];
          const sel   = selectedDate === `${(monthIndex+1).toString().padStart(2,"0")}/${day.toString().padStart(2,"0")}/${year.toString().slice(-2)}`;

          return (
            <TouchableOpacity
              key={i}
              style={[
                styles.dateBox,
                isHol   && styles.holidayBox,
                sel     && styles.selectedBox,
              ]}
              disabled={!valid}
              onPress={()=> valid && handleDatePress(day)}
            >
              {valid && (
                <>
                  <Text style={[styles.dateText, isHol && styles.holidayText]}>
                    {day}
                  </Text>
                  {isHol && <Text style={styles.holidayLabel}>{isHol}</Text>}
                </>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Dropdown Menu */}
      {menuVisible && (
        <TouchableWithoutFeedback onPress={()=>setMenuVisible(false)}>
          <View style={styles.menuOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.dropdownMenu}>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setMenuVisible(false);
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
                  }}
                >
                  <Text style={styles.dropdownText}>Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={onLogout}
                >
                  <Text style={styles.dropdownText}>Logout</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      )}
    </LinearGradient>
  );
}

const DARK = "#143B28";

const styles = StyleSheet.create({
  bg: { flex: 1 },

  // Top bar
  topBar: {
    paddingTop: 56,
    paddingBottom: 16,
    position: "relative",
    alignItems: "center",
  },
  iconLeft: {
    position: "absolute",
    left: 24,
    top: 56,
  },
  header: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
  },
  iconRight: {
    position: "absolute",
    right: 24,
    top: 56,
    flexDirection: "column",
    alignItems: "center",
  },
  iconButton: {
    marginBottom: 12,
  },

  // Year/Month nav
  navWrap: {
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  navText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  // Weekdays
  weekdayRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  dayLabel: {
    flexBasis: "14.28%",
    textAlign: "center",
    color: DARK,
    fontWeight: "700",
    fontSize: 14,
    paddingVertical: 6,
    backgroundColor: "#E8F5EC",
    borderRadius: 6,
    elevation: 1,
  },

  // Dates grid
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    paddingHorizontal: 16,
  },
  dateBox: {
    flexBasis: "14.28%",
    aspectRatio: 1,
    backgroundColor: "#E8F5EC",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    elevation: 2,
  },
  dateText: {
    color: DARK,
    fontWeight: "700",
    fontSize: 16,
  },
  holidayBox: {
    backgroundColor: "#D9F1DF",
    borderWidth: 1,
    borderColor: "#2C6B46",
  },
  holidayText: {
    color: "#2C6B46",
    fontWeight: "900",
  },
  holidayLabel: {
    fontSize: 10,
    color: "#2C6B46",
    textAlign: "center",
    marginTop: 2,
  },
  selectedBox: {
    borderWidth: 2,
    borderColor: DARK,
  },

  // Dropdown menu
  menuOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 2000,
  },
  dropdownMenu: {
    position: "absolute",
    top: 64,
    right: 16,
    width: 170,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 16,
    zIndex: 2100,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownText: {
    fontSize: 16,
    fontWeight: "700",
    color: DARK,
  },
});
