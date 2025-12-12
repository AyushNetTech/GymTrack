import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import EmailActionDialog from '../components/EmailActionDialog';
import EmailExistsDialog from '../components/EmailExistsDialog';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Validation errors
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Dialog states
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailDialogMessage, setEmailDialogMessage] = useState('');
  const [showExistsDialog, setShowExistsDialog] = useState(false);

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
    return true;
  };

  // ---------------------------
  // SIGN IN
  // ---------------------------
  async function signIn() {
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
  }

  // ---------------------------
  // SIGN UP
  // ---------------------------
  async function signUp() {
    const validEmail = validateEmail(email);
    const validPass = validatePassword(password);
    if (!validEmail || !validPass) return;

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: 'myapp://auth/callback' },
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

    {/* Background Image */}
    <Image
      source={require("../assets/fitness1.jpg")}
      style={styles.bgImage}
    />

    {/* Dark Overlay */}
    <View style={styles.overlay} />

    {/* Card */}
    <View style={styles.card}>
      <Text style={styles.title}>
        {isSignUp ? 'Sign up' : 'Welcome'}
      </Text>
      <Text style={styles.subtitle}>
        {isSignUp ? 'to start' : 'back'}
      </Text>

      {/* Email Input */}
      <TextInput
        style={[styles.input, emailError && styles.inputError]}
        placeholderTextColor="#aaa"
        placeholder="Email"
        value={email}
        onChangeText={validateEmail}
        autoCapitalize="none"
      />
      {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

      {/* Password Input */}
      <View style={styles.passwordWrapper}>
        <TextInput
          style={[
    styles.input,
    { flex: 1, marginBottom: 0 },
    passwordError && styles.inputError   // red on error
  ]}
          placeholder="Password"
          placeholderTextColor="#aaa"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={validatePassword}
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

      {passwordError ? (
        <Text style={styles.errorText}>{passwordError}</Text>
      ) : null}

      {/* Big arrow button styled like screenshot */}
      <TouchableOpacity
  style={styles.kiteButton}
  onPress={isSignUp ? signUp : signIn}
  disabled={loading}
>
  {loading ? (
    <ActivityIndicator color="#fff" />
  ) : (
    <Ionicons
  name="arrow-forward"
  size={26}
  color="#000"
  style={styles.kiteButtonIcon}
/>

  )}
</TouchableOpacity>


      {!isSignUp && (
        <TouchableOpacity onPress={resetPassword}>
          <Text style={styles.forgot}>Forgot Password?</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
        <Text style={styles.switch}>
          {isSignUp
            ? 'Already have an account? Sign In'
            : 'Don’t have an account? Sign Up'}
        </Text>
      </TouchableOpacity>
    </View>

    {/* Dialogs remain unchanged */}
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
  </View>
);


}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
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

  card: {
    marginHorizontal: 20,
    padding: 26,
    borderRadius: 22,
    backgroundColor: "rgba(20,20,20,0.65)", // frosted look
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },

  title: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "700",
  },

  subtitle: {
    color: "#ccc",
    fontSize: 20,
    marginBottom: 30,
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

  errorText: {
    color: "#ff4d4d",
    fontSize: 13,
    marginBottom: 10,
  },

  passwordWrapper: {
    flexDirection: "row",
    position: "relative",
    marginBottom: 10,
  },

  eyeIcon: {
    position: "absolute",
    right: 16,
    top: 16,
  },

  forgot: {
    textAlign: "center",
    color: "#4ab4ff",
    marginTop: 5,
  },

  switch: {
    textAlign: "center",
    color: "#4effae",
    fontWeight: "700",
    marginTop: 20,
  },
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
},

kiteButtonIcon: {
  transform: [{ rotate: "-45deg" }],
},
inputError: {
  borderColor: "#ff4d4d",
  backgroundColor: "rgba(255,77,77,0.15)", // soft red glow
},

});
