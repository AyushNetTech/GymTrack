import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Keyboard,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { supabase } from "../lib/supabase";

export default function ResetPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (value: string) => {
    setEmail(value);

    if (!value) {
      setError("Email is required");
      return false;
    }

    const regex = /\S+@\S+\.\S+/;
    if (!regex.test(value)) {
      setError("Enter a valid email");
      return false;
    }

    setError("");
    return true;
  };

  const handleReset = async () => {
    Keyboard.dismiss();

    const valid = validateEmail(email);
    if (!valid) return;

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://workout-auth-web.vercel.app/resetpassword.html',
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    alert("Password reset link sent. Please check your email.");
    setEmail("");
  };

  return (
    <View style={styles.screen}>
      <Image
        source={require("../assets/fitness1.jpg")}
        style={styles.bgImage}
      />
      <View style={styles.overlay} />

      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar style="light" translucent backgroundColor="transparent" />

        <View style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter your email to receive a password reset link.
            </Text>

            <TextInput
              style={[styles.input, error && styles.inputError]}
              placeholder="Email"
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={validateEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={styles.button}
              onPress={handleReset}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.buttonText}>Send Reset Link</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#000",
  },

  bgImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },

  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  card: {
    padding: 26,
    borderRadius: 22,
    backgroundColor: "rgba(20,20,20,0.65)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },

  title: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 8,
  },

  subtitle: {
    color: "#ccc",
    fontSize: 16,
    marginBottom: 24,
  },

  input: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
    color: "#fff",
  },

  inputError: {
    borderColor: "#ff4d4d",
    backgroundColor: "rgba(255,77,77,0.15)",
  },

  errorText: {
    color: "#ff4d4d",
    fontSize: 13,
    marginBottom: 12,
  },

  button: {
    backgroundColor: "#f4ff47",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "700",
  },
});
