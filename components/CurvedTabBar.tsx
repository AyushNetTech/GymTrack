import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

const TAB_HEIGHT = 60;

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  HomeTab: "home-outline",
  Workout: "barbell-outline",
  Analysis: "analytics-outline",
  Profile: "person-outline",
};

export default function CurvedTabBar({ state, navigation }: any) {
  return (
    <View style={styles.outer}>
      {/* Blur Background */}
      <BlurView intensity={10} tint="light" style={styles.inner} />

      {/* Icon Row */}
      <View style={styles.row}>
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;
          const icon = ICONS[route.name];

          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              style={styles.button}
              activeOpacity={0.7}
            >
              <Ionicons
                name={icon}
                size={26}
                color={isFocused ? "#2e86de" : "#8f8f8f"}
              />
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
    bottom: 25,
    left: 25,
    right: 25,
    height: TAB_HEIGHT,
    justifyContent: "center",
  },

  inner: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 40,
    backgroundColor: "rgba(0, 0, 0, 0.8)", // Soft frosted glass
    overflow: "hidden",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    height: TAB_HEIGHT,
    paddingHorizontal: 20,
  },

  button: {
    width: 55,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
  },
});
