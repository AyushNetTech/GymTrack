import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function WorkoutScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "black" }} edges={[]}>
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor:"#000" }}>
          <Text style={{color:"#fff"}}>Workouts Screen</Text>
        </View>
    </SafeAreaView>
  );
}
