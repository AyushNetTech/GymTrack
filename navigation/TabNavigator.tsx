import React, { useRef, useEffect } from "react";
import { Animated, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "../screens/HomeScreen";
import WorkoutScreen from "../screens/WorkoutScreen";
import AnalysisScreen from "../screens/AnalysisScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();

type TabIconProps = {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
};

const TabIcon = ({ name, focused }: TabIconProps) => {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1.25 : 1,
      useNativeDriver: true,
      friction: 5,
      tension: 150,
    }).start();
  }, [focused]);

  return (
    <Animated.View
      style={{
        transform: [{ scale }],
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Ionicons
        name={name}
        size={28}
        color={focused ? "#2e86de" : "#8a8a8a"}
      />
    </Animated.View>
  );
};

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,

        tabBarBackground: () => (
          <BlurView intensity={70} tint="light" style={StyleSheet.absoluteFill} />
        ),

        tabBarStyle: {
          position: "absolute",
          bottom: 20,
          left: 25,
          right: 25,
          height: 75,
          borderRadius: 26,
          backgroundColor: "rgba(255,255,255,0.55)",
          elevation: 0,
          shadowOpacity: 0,

          paddingHorizontal: 30,   // More space on left & right
          display: "flex",
        },

        tabBarItemStyle: {
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: 10,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="home-outline" focused={focused} />,
        }}
      />

      <Tab.Screen
        name="Workout"
        component={WorkoutScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="barbell-outline" focused={focused} />,
        }}
      />

      <Tab.Screen
        name="Analysis"
        component={AnalysisScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="analytics-outline" focused={focused} />,
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="person-outline" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}
