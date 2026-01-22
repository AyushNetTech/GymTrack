import React from "react";
import { View, Image } from "react-native";

const HEADER_HEIGHT = 160;

export default function WorkoutHeader() {
  return (
    <View style={{ height: HEADER_HEIGHT }}>
      <Image
        source={{
          uri: "https://mftvgiceccapzcgheaom.supabase.co/storage/v1/object/public/Workout%20Images/HeaderWorkoutScreen.jpg",
        }}
        style={{
          width: "100%",
          height: "100%",
          opacity: 0.7,
        }}
      />
    </View>
  );
}

export { HEADER_HEIGHT };
