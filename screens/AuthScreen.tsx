import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Keyboard } from "react-native";

import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import EmailActionDialog from '../components/EmailActionDialog';
import EmailExistsDialog from '../components/EmailExistsDialog';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App'; // adjust path if needed

type AuthScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Auth'>;

type Props = {
  navigation: AuthScreenNavigationProp;
};

export default function AuthScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailDialogMessage, setEmailDialogMessage] = useState('');
  const [showExistsDialog, setShowExistsDialog] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const colorScheme = useColorScheme();


  // ---------------------------
  // VALIDATION FUNCTIONS
  // ---------------------------
  const validateEmail = (value: string) => {
    setEmail(value);

    if (!value) {
      setEmailError('Email is required');
      return false;
    }

    const regex = /\S+@\S+\.\S+/;
    if (!regex.test(value)) {
      setEmailError('Enter a valid email');
      return false;
    }

    setEmailError('');
    return true;
  };

  const validatePassword = (value: string) => {
    setPassword(value);

    if (!value) {
      setPasswordError('Password is required');
      return false;
    }

    if (value.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }

    setPasswordError('');

    // ✅ Only update confirm-password error WITHOUT resetting state
    if (confirmPassword && value !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
    } else {
      setConfirmPasswordError('');
    }

    return true;
  };



  const validateConfirmPassword = (value: string) => {
    setConfirmPassword(value);

    if (!value) {
      setConfirmPasswordError('Confirm password is required');
      return false;
    }

    if (value !== password) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }

    setConfirmPasswordError('');
    return true;
  };

  // ---------------------------
  // SIGN IN
  // ---------------------------
  async function signIn() {
    Keyboard.dismiss(); // ✅ always first
    const validEmail = validateEmail(email);
    const validPass = validatePassword(password);
    if (!validEmail || !validPass) return;

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) return alert(error.message);
    if (!data.session)
      return alert("Please verify your email before signing in.");

    // Navigate to Home after successful login
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  }

  // ---------------------------
  // SIGN UP
  // ---------------------------
  async function signUp() {
    Keyboard.dismiss(); // ✅ always first
    const validEmail = validateEmail(email);
    const validPass = validatePassword(password);
    const validConfirm = validateConfirmPassword(confirmPassword);

    if (!validEmail || !validPass || !validConfirm) return;

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: 'https://xtrackverification.vercel.app/' },
    });

    setLoading(false);

    if (error) return alert(error.message);

    if (data.user?.identities?.length === 0) {
      setShowExistsDialog(true);
      return;
    }

    setEmailDialogMessage(
      'Verification email sent! Please verify to activate your account.'
    );
    setShowEmailDialog(true);
  }


  // ---------------------------
  // RESET PASSWORD
  // ---------------------------
  async function resetPassword() {
    Keyboard.dismiss(); // ✅ always first
    const validEmail = validateEmail(email);
    if (!validEmail) return;

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'myapp://reset-password',
    });

    setLoading(false);

    setEmailDialogMessage(
      'If an account exists for this email, you will receive a password reset link.'
    );
    setShowEmailDialog(true);
  }

  return (
    <View style={styles.screen}>
      <Image
        source={require("../assets/fitness1.jpg")}
        style={styles.bgImage}
      />
      <View style={styles.overlay} />
  {/* Content should respect safe area */}
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar
        style={colorScheme === "dark" ? "light" : "dark"}
        translucent
        backgroundColor="transparent"
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
      >

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingBottom: Platform.OS === "android" ? 120 : 40,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >


      <View style={styles.card}>
        <Text style={styles.title}>{isSignUp ? 'Sign Up' : 'Welcome'}</Text>
        <Text style={styles.subtitle}>{isSignUp ? 'Create New Account' : 'back'}</Text>

        <TextInput
          style={[styles.input, emailError && styles.inputError]}
          placeholderTextColor="#aaa"
          placeholder="Email"
          value={email}
          onChangeText={validateEmail}
          autoCapitalize="none"
        />
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

        <View style={styles.passwordWrapper}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }, passwordError && styles.inputError]}
            placeholder="Password"
            placeholderTextColor="#aaa"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={validatePassword}
          />
          <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color="#ccc" />
          </TouchableOpacity>
        </View>
        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
        {isSignUp && (
          <>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={[
                  styles.input,
                  { flex: 1, marginBottom: 0 },
                  confirmPasswordError && styles.inputError,
                ]}
                placeholder="Confirm Password"
                placeholderTextColor="#aaa"
                secureTextEntry={!showPassword}
                value={confirmPassword}
                onChangeText={validateConfirmPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={22}
                  color="#ccc"
                />
              </TouchableOpacity>
            </View>

            {confirmPasswordError ? (
              <Text style={styles.errorText}>{confirmPasswordError}</Text>
            ) : null}
          </>
        )}


        <TouchableOpacity style={styles.kiteButton} onPress={() => {
            Keyboard.dismiss(); // ✅ CLOSE KEYBOARD
            isSignUp ? signUp() : signIn();
          }} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Ionicons name="arrow-forward" size={26} color="#000" style={styles.kiteButtonIcon} />
          )}
        </TouchableOpacity>

        {!isSignUp && (
          <TouchableOpacity onPress={resetPassword}>
            <Text style={styles.forgot}>Forgot Password?</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => {
            setIsSignUp(!isSignUp);
            setConfirmPassword('');
            setConfirmPasswordError('');
            setPasswordError('');
            setEmailError('');
          }}
        >
          <Text style={styles.switch}>
            {isSignUp ? 'Already have an account? Sign In' : 'Don’t have an account? Sign Up'}
          </Text>
        </TouchableOpacity>

      </View>
      </ScrollView>
      </KeyboardAvoidingView>

      <EmailActionDialog
        visible={showEmailDialog}
        duration={10}
        message={emailDialogMessage}
        onTimeout={() => setShowEmailDialog(false)}
      />

      <EmailExistsDialog
        visible={showExistsDialog}
        email={email}
        onClose={() => setShowExistsDialog(false)}
        onSignIn={() => {
          setShowExistsDialog(false);
          setIsSignUp(false);
        }}
      />
    </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#000" },

  bgImage: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)" },
  card: {
    marginHorizontal: 20,
    padding: 26,
    paddingBottom: 36, // ✅ ADD THIS
    borderRadius: 22,
    backgroundColor: "rgba(20,20,20,0.65)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  title: { color: "#fff", fontSize: 32, fontWeight: "700" },
  subtitle: { color: "#ccc", fontSize: 20, marginBottom: 30 },
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
  errorText: { color: "#ff4d4d", fontSize: 13, marginBottom: 10 },
  passwordWrapper: { flexDirection: "row", position: "relative", marginBottom: 10 },
  eyeIcon: { position: "absolute", right: 16, top: 16 },
  forgot: { textAlign: "center", color: "#4ab4ff", marginTop: 5 },
  switch: { textAlign: "center", color: "#4effae", fontWeight: "700", marginTop: 20 },
  kiteButton: {
    width: 70,
    height: 70,
    transform: [{ rotate: "45deg" }],
    backgroundColor: "#f4ff47",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 18,
    alignSelf: "center",
    marginVertical: 25,
    shadowColor: "#3a3aff",
    shadowOpacity: 0.6,
    shadowRadius: 16,
    color:"Black"
  },
  kiteButtonIcon: { transform: [{ rotate: "-45deg" }], color:"black" },
  inputError: { borderColor: "#ff4d4d", backgroundColor: "rgba(255,77,77,0.15)" },
});
