import React from "react";
import { View, Image, Text } from "react-native";

export const HEADER_HEIGHT = 160;

const getFormattedDate = () => {
  const today = new Date();

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return `${days[today.getDay()]}, ${today.getDate()} ${
    months[today.getMonth()]
  }`;
};

type Props = {
  title?: string;
};

export default function WorkoutHeader({ title = "Add Workouts" }: Props) {
  return (
    <View style={{ height: HEADER_HEIGHT, backgroundColor:"#111" }}>
      <Image
        source={require("../assets/HeaderAddWorkoutScreen.jpg")}
        style={{
          width: "100%",
          height: "100%",
          opacity: 0.5,
        }}
      />

      {/* 🔥 TEXT OVERLAY */}
      <View
        style={{
          position: "absolute",
          bottom: 12,
          left: 20,
          alignItems: "flex-start",
        }}
      >
        <Text style={{ color: "#f0f0f0", fontSize: 12, fontWeight: "600", }}>
          {getFormattedDate()}
        </Text>

        <Text
          style={{
            color: "#fff",
            fontSize: 27,
            fontWeight: "800",
            marginTop: 2,
          }}
        >
          {title}
        </Text>
      </View>
    </View>
  );
}
