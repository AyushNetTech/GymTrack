import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import LottieView from "lottie-react-native";

interface LoadingScreenProps {
  visible?: boolean; // optional, default true
}

const { width, height } = Dimensions.get("window");

export default function LoadingScreen({ visible = true }: LoadingScreenProps) {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <LottieView
        source={require("../assets/loading.json")}
        autoPlay
        loop
        style={styles.animation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject, // fills the whole screen
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  animation: {
    width: 200,
    height: 200,
  },
});
