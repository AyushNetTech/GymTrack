import React, { useRef, useEffect } from "react";
import { Animated, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "../screens/HomeScreen";
import WorkoutScreen from "../screens/WorkoutScreen";
import AnalysisScreen from "../screens/AnalysisScreen";
import ProfileScreen from "../screens/ProfileScreen";
import AddWorkoutScreen from "../screens/AddWorkoutScreen";
import CurvedTabBar from "../components/CurvedTabBar";



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
    tabBarStyle: { display: "none" }, // Hide default bar completely
  }}
  tabBar={(props) => <CurvedTabBar {...props} />}
>
  <Tab.Screen name="HomeTab" component={HomeScreen} />
  <Tab.Screen name="Workout" component={WorkoutScreen} />
  <Tab.Screen name="AddWorkout" component={AddWorkoutScreen} />
  <Tab.Screen name="Analysis" component={AnalysisScreen} />
  <Tab.Screen name="Profile" component={ProfileScreen} />
</Tab.Navigator>

  );
}
