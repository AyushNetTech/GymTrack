import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

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

export default function CurvedTabBar({ state, navigation }: any) {

  // ⭐ Find AddWorkout index
  const addWorkoutIndex = state.routes.findIndex(
    (r: any) => r.name === "AddWorkout"
  );
  const isAddFocused = state.index === addWorkoutIndex;

  return (
    <View style={styles.outer}>
      
      {/* Background Blur */}
      <BlurView intensity={20} tint="light" style={styles.inner} />

      {/* ⭐ Floating Center Button */}
      <TouchableOpacity
        style={[
          styles.centerButton,
          isAddFocused && styles.centerButtonActive, // glow when active
        ]}
        activeOpacity={0.8}
        onPress={() => navigation.navigate("AddWorkout")}
      >
        <Ionicons
          name="add"
          size={34}
          color={isAddFocused ? "white" : "black"}
        />
      </TouchableOpacity>

      {/* Icon Row */}
      <View style={styles.row}>
        {state.routes.map((route: any, index: number) => {
          
          // ⭐ Invisible placeholder for AddWorkout
          if (route.name === "AddWorkout") {
            return <View key={route.key} style={{ width: 60 }} />;
          }

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

              {isFocused && (
                <Text style={styles.label}>{label}</Text>
              )}
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
    left: 35,
    right: 35,
    height: TAB_HEIGHT,
    justifyContent: "center",
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

  /* ⭐ Floating Center Button */
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

  /* ⭐ Glow when AddWorkout is active */
  centerButtonActive: {
    backgroundColor: "#d0ff2a",
    shadowColor: "#d0ff2a",
    shadowOpacity: 0.9,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 18,
  },
});
