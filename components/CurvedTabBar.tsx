import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import Svg, { Path } from "react-native-svg";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

const TAB_HEIGHT = 85;
const CURVE_HEIGHT = 25;

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Home: "home-outline",
  Workout: "barbell-outline",
  Analysis: "analytics-outline",
  Profile: "person-outline",
};

export default function CurvedTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={styles.container}>
      <BlurView intensity={70} tint="light" style={styles.blurBg} />

      <Svg width="100%" height={TAB_HEIGHT} style={styles.svgStyle}>
        <Path
          d={`
            M0 0 
            L0 ${TAB_HEIGHT - CURVE_HEIGHT}
            Q${state.routes.length * 50} ${TAB_HEIGHT + CURVE_HEIGHT} ${state.routes.length * 100} ${
            TAB_HEIGHT - CURVE_HEIGHT
          }
            L${state.routes.length * 200} 0 Z
          `}
          fill="rgba(255,255,255,0.55)"
        />
      </Svg>

      <View style={styles.tabRow}>
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;

          const onPress = () => navigation.navigate(route.name);

          const iconName = ICONS[route.name];

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tabButton}
              activeOpacity={0.7}
            >
              <Ionicons
                name={iconName}
                size={28}
                color={isFocused ? "#2e86de" : "#7f7f7f"}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 20,
    left: 25,
    right: 25,
    height: TAB_HEIGHT,
    borderRadius: 40,
    overflow: "hidden",
  },
  blurBg: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 40,
  },
  svgStyle: {
    position: "absolute",
    bottom: 0,
  },
  tabRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: TAB_HEIGHT,
    paddingHorizontal: 35,
  },
  tabButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 60,
    height: 60,
  },
});
