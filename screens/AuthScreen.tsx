import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  Text,
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
      <View style={styles.card}>
        <Text style={styles.title}>
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </Text>

        {/* Email Input */}
        <TextInput
          style={styles.input}
          placeholderTextColor="#5a5a5aff"
          placeholder="Email"
          value={email}
          onChangeText={validateEmail}
          autoCapitalize="none"
        />
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

        {/* Password Input */}
        <View style={styles.passwordWrapper}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="Password"
            placeholderTextColor="#5a5a5aff"
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
              color="#666"
            />
          </TouchableOpacity>
        </View>
        {passwordError ? (
          <Text style={styles.errorText}>{passwordError}</Text>
        ) : null}

        {/* Submit */}
        <TouchableOpacity
          style={[
            styles.btn,
            { backgroundColor: loading ? '#7fb3ef' : '#2e86de' },
          ]}
          onPress={isSignUp ? signUp : signIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </Text>
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

      {/* Dialogs */}
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
    backgroundColor: '#f4f6f9',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    elevation: 5,
    shadowColor: '#0002',
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  title: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    color:"#000",
    fontSize: 16,
    marginBottom: 6,
    backgroundColor: '#fafafa',
  },
  errorText: {
    color: 'red',
    fontSize: 13,
    marginBottom: 10,
    marginLeft: 4,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    color:"black",
    marginBottom: 6,
  },
  eyeIcon: {
    position: 'absolute',
    right: 14,
  },
  btn: {
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
  },
  btnText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
  },
  forgot: {
    textAlign: 'center',
    color: '#2e86de',
    marginTop: 10,
    fontSize: 14,
  },
  switch: {
    textAlign: 'center',
    color: '#10ac84',
    marginTop: 20,
    fontWeight: '600',
  },
});
