import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import React, { useRef } from "react";
import {
  Animated,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function LandingPage() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const [fontsLoaded] = useFonts({
    IrishGrover: require("../assets/fonts/IrishGrover-Regular.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  const handlePress = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1.08,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.push("/login-type");
    });
  };

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <Animated.View
        style={[
          { flex: 1, backgroundColor: "#1D492D" },
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <ImageBackground
          source={require("../assets/images/ricefield-bg.png")}
          style={styles.background}
          resizeMode="cover"
          imageStyle={styles.bgImage}
        >
          <View style={styles.centerWrap}>
            <View style={styles.logoCard}>
              <Image
                source={require("../assets/images/HumAI_logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.appName}>HumAI</Text>
            <Text style={styles.subtitle}>Smart Rice Disease Diagnostics</Text>
            <View style={styles.divider} />
            <Text style={styles.hintText}>Tap to Start</Text>
          </View>
        </ImageBackground>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  bgImage: {
    opacity: 0.84,
  },
  centerWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoCard: {
    backgroundColor: "#fff",
    borderRadius: 90,
    padding: 15,
    marginTop: -68,
    marginBottom: 24,
    alignItems: "center",
    shadowColor: "#18B949",
    shadowOpacity: 0.13,
    shadowRadius: 12,
    elevation: 11,
  },
  logo: {
    width: 126,
    height: 126,
    borderRadius: 63,
    borderColor: "#18B949",
    borderWidth: 2,
  },
  appName: {
    fontSize: 48,
    color: "#18B949",
    fontFamily: "IrishGrover",
    fontWeight: "900",
    textAlign: "center",
    marginTop: 10,
    letterSpacing: 2,
    marginBottom: 7,
    textShadowColor: "#00000020",
    textShadowOffset: { width: 2, height: 3 },
    textShadowRadius: 6,
  },
  subtitle: {
    color: "#eee",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: 0.6,
    fontWeight: "600"
  },
  divider: {
    width: 52,
    height: 3,
    backgroundColor: "#18B949",
    borderRadius: 2,
    marginVertical: 8,
    opacity: 0.66,
  },
  hintText: {
    color: "#1D492D",
    backgroundColor: "#e5fff0cc",
    fontSize: 18,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 7,
    textAlign: "center",
    marginTop: 8,
    letterSpacing: 0.7,
    fontWeight: "bold",
    elevation: 2,
    shadowColor: "#18B94955",
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
});
