import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { Portal } from "react-native-paper";
import LottieView from "lottie-react-native";
import { Text } from "react-native-paper";

type Props = {
  visible: boolean;
  onAutoClose: () => void;
};

export default function ProfileSetupSuccessDialog({
  visible,
  onAutoClose,
}: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (!visible) return;

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => onAutoClose());
    }, 3000);

    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  return (
    <Portal>
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.dialog,
            {
              opacity,
              transform: [{ scale }],
            },
          ]}
        >
          <LottieView
            source={require("../assets/Success.json")}
            autoPlay
            loop={false}
            style={styles.lottie}
          />

          <Text style={styles.title}>Profile Ready 🎉</Text>
          <Text style={styles.subtitle}>
            Your profile has been set up successfully.
          </Text>
        </Animated.View>
      </View>
    </Portal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dialog: {
    width: "80%",
    backgroundColor: "#111",
    borderRadius: 26,
    paddingVertical: 24,
    alignItems: "center",
  },
  lottie: {
    width: 180,
    height: 180,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    marginTop: 12,
    color:"#fff"
  },
  subtitle: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 14,
    color: "#e2e2e2",
    paddingHorizontal: 20,
  },
});
