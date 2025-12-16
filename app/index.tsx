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
            <View style={styles.logoContainer}>
              <Image
                source={require("../assets/images/HumAI_logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.appName}>HumAI</Text>
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
  logoContainer: {
    marginTop: -68,
    marginBottom: 24,
    alignItems: "center",
    // Added horizontal padding to create space on the sides
    paddingHorizontal: 50, 
  },
  logo: {
    width: 126,
    height: 126,
    borderRadius: 63,
  },
  appName: {
    fontSize: 48,
    color: "#FFFFFF",
    fontFamily: "IrishGrover",
    fontWeight: "400",
    textAlign: "center",
    marginTop: 10,
    letterSpacing: 2,
    marginBottom: 7,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 2, height: 3 },
    textShadowRadius: 6,
  },
});