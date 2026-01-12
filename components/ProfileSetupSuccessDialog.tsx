import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Portal, Dialog, Text } from "react-native-paper";
import LottieView from "lottie-react-native";

type Props = {
  visible: boolean;
  onAutoClose: () => void;
};

export default function ProfileSetupSuccessDialog({
  visible,
  onAutoClose,
}: Props) {
  useEffect(() => {
    if (!visible) return;

    const timer = setTimeout(() => {
      onAutoClose();
    }, 3000); // ⏱️ 2 seconds

    return () => clearTimeout(timer);
  }, [visible]);

  return (
    <Portal>
      <Dialog visible={visible} dismissable={false} style={styles.dialog}>
        <Dialog.Content>
          <View style={styles.container}>
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
          </View>
        </Dialog.Content>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: {
    borderRadius: 24,
    backgroundColor: "#fff",
  },
  container: {
    alignItems: "center",
    paddingVertical: 24,
  },
  lottie: {
    width: 180,
    height: 180,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    marginTop: 12,
  },
  subtitle: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 14,
    color: "#666",
    paddingHorizontal: 20,
  },
});
