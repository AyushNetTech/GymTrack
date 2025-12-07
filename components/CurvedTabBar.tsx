import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

const TAB_HEIGHT = 65; // Increased to fit label
const ICON_SIZE = 28;

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

export default function CurvedTabBar({ state, navigation }: any) {
  return (
    <View style={styles.outer}>
      {/* Blur Background */}
      <BlurView intensity={20} tint="light" style={styles.inner} />

      {/* Icon Row */}
      <View style={styles.row}>
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;
          const icon = ICONS[route.name];
          const label = LABELS[route.name];

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

              {/* Label below icon */}
              {isFocused && <Text style={styles.label}>{label}</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: "absolute",
    bottom: 35,
    left: 40,
    right: 40,
    height: TAB_HEIGHT,
    
    justifyContent: "center",
  },

  inner: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 40,
    backgroundColor: "rgba(10, 10, 10, 0.95)",
    overflow: "hidden",
    borderWidth:1,
    borderColor:"#070707ff"
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    height: TAB_HEIGHT,
    padding:10
  },

  button: {
    width: 60, // wide enough for icon + label
    height: TAB_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },

  label: {
    marginTop: 2, // space below icon
    fontSize: 11,
    color: "#d0ff2a",
    fontWeight: "700",
    textAlign: "center",
  },
});
