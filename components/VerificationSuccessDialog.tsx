import React from "react";
import { View, StyleSheet } from "react-native";
import { Portal, Dialog, Button, Text } from "react-native-paper";
import LottieView from "lottie-react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function VerificationSuccessDialog({ visible, onClose }: Props) {
  return (
    <Portal>
      <Dialog visible={visible} dismissable={false} style={styles.dialog}>
        <Dialog.Content>
          <View style={styles.container}>
            <LottieView
              source={require("../assets/Success.json")}
              autoPlay
              loop={false}
              style={{ width: 120, height: 120 }}
            />

            <Text style={styles.title}>Email Verified!</Text>
            <Text style={styles.subtitle}>
              Your email has been successfully verified.
            </Text>
          </View>
        </Dialog.Content>

        <Dialog.Actions>
          <Button mode="contained" onPress={onClose}>
            Continue
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: {
    borderRadius: 20,
  },
  container: {
    alignItems: "center",
    paddingVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 8,
  },
  subtitle: {
    marginTop: 6,
    textAlign: "center",
    color: "#666",
  },
});
