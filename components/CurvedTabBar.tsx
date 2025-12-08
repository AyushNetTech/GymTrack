import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Keyboard,
  Platform,
  Animated,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";

const TAB_HEIGHT = 70;
const ICON_SIZE = 26;

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  HomeTab: "home-outline",
  Workout: "barbell-outline",
  Analysis: "analytics-outline",
  Profile: "person-outline",
};

const LABELS: Record<string, string> = {
  HomeTab: "Home",
  Workout: "Workouts",
  Analysis: "Analysis",
  Profile: "Profile",
};

const CurvedTabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  // Translate animation (hide/show)
  const animatedTranslate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => hideTab()
    );

    const hide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => showTab()
    );

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const hideTab = () => {
    Animated.timing(animatedTranslate, {
      toValue: 150, // fully off screen
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const showTab = () => {
    Animated.timing(animatedTranslate, {
      toValue: 0, // normal position
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const addWorkoutIndex = state.routes.findIndex((r) => r.name === "AddWorkout");
  const isAddFocused = state.index === addWorkoutIndex;

  return (
    <Animated.View
      style={[
        styles.outer,
        { transform: [{ translateY: animatedTranslate }] },
      ]}
      pointerEvents="box-none"
    >
      {/* Blur Background */}
      <BlurView intensity={20} tint="light" style={styles.inner} />

      {/* Floating center button */}
      <TouchableOpacity
        style={[styles.centerButton, isAddFocused && styles.centerButtonActive]}
        activeOpacity={0.8}
        onPress={() => navigation.navigate("AddWorkout")}
      >
        <Ionicons name="add" size={34} color={isAddFocused ? "white" : "black"} />
      </TouchableOpacity>

      {/* Icons */}
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          if (route.name === "AddWorkout")
            return <View key={route.key} style={{ width: 60 }} />;

          const isFocused = state.index === index;
          const icon = ICONS[route.name] ?? "ellipse-outline";
          const label = LABELS[route.name] ?? "";

          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              style={styles.button}
              activeOpacity={0.7}
            >
              <Ionicons
                name={icon}
                size={ICON_SIZE}
                color={isFocused ? "#d0ff2a" : "#f8f8f8ff"}
              />

              {isFocused && <Text style={styles.label}>{label}</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );
};

export default CurvedTabBar;

const styles = StyleSheet.create({
  outer: {
    position: "absolute",
    left: 35,
    right: 35,
    bottom: 35,
    height: TAB_HEIGHT,
    justifyContent: "center",
    zIndex: 999,
  },
  inner: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 40,
    backgroundColor: "rgba(10, 10, 10, 0.95)",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#070707ff",
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: TAB_HEIGHT,
  },
  button: {
    width: 51,
    height: TAB_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    marginTop: 2,
    fontSize: 11,
    color: "#d0ff2a",
    fontWeight: "700",
    textAlign: "center",
  },
  centerButton: {
    position: "absolute",
    alignSelf: "center",
    top: -28,
    width: 58,
    height: 58,
    borderRadius: 30,
    backgroundColor: "#d0ff2a",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 6,
  },
  centerButtonActive: {
    backgroundColor: "#d0ff2a",
    shadowColor: "#d0ff2a",
    shadowOpacity: 0.9,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 18,
  },
});
