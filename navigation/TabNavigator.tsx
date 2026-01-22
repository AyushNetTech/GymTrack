import React, { useRef, useEffect } from "react"
import { Animated } from "react-native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Ionicons } from "@expo/vector-icons"

import HomeScreen from "../screens/HomeScreen"
import WorkoutBrowseStackNavigator from "./WorkoutBrowseStackNavigator";
import AnalysisScreen from "../screens/AnalysisScreen"
import ProfileScreen from "../screens/ProfileScreen"
import WorkoutStackNavigator from "./WorkoutStackNavigator"
import CurvedTabBar from "../components/CurvedTabBar"

type TabIconProps = { name: keyof typeof Ionicons.glyphMap; focused: boolean }

export type RootTabParamList = {
  HomeTab: undefined
  Workout: undefined
  AddWorkout: undefined
  Analysis: undefined
  Profile: undefined
}

const Tab = createBottomTabNavigator<RootTabParamList>()

const TabIcon = ({ name, focused }: TabIconProps) => {
  const scale = useRef(new Animated.Value(1)).current
  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1.25 : 1,
      useNativeDriver: true,
      friction: 5,
      tension: 150,
    }).start()
  }, [focused])
  return (
    <Animated.View style={{ transform: [{ scale }], justifyContent: "center", alignItems: "center" }}>
      <Ionicons name={name} size={28} color={focused ? "#2e86de" : "#8a8a8a"} />
    </Animated.View>
  )
}

type Props = {
  onHomeReady?: () => void;
};

export default function TabNavigator({ onHomeReady }: Props) {

  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarStyle: { display: "none" } }} tabBar={(props) => <CurvedTabBar {...props} />}>
      <Tab.Screen name="HomeTab">
        {(props) => (
          <HomeScreen
            {...props}
            onReady={onHomeReady}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Workout"
        component={WorkoutBrowseStackNavigator}
      />
      {/* Replace AddWorkout with the stack navigator */}
      <Tab.Screen name="AddWorkout" component={WorkoutStackNavigator} />
      <Tab.Screen name="Analysis" component={AnalysisScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  )
}
