import React from "react";
import { View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import WorkoutScreen from "../screens/WorkoutScreen";
import ExerciseDetailScreen from "../screens/ExerciseDetailScreen";
import WorkoutHeader, { HEADER_HEIGHT } from "../components/WorkoutHeader";

const Stack = createNativeStackNavigator();

export default function WorkoutBrowseStackNavigator() {
  return (
    <View style={{ flex: 1, backgroundColor: "#111" }}>
      {/* ✅ Persistent Header */}
      <WorkoutHeader />

      {/* ✅ Stack BELOW header */}
      <View style={{ flex: 1 }}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="WorkoutMain" component={WorkoutScreen} />
          <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} />
        </Stack.Navigator>
      </View>
    </View>
  );
}
