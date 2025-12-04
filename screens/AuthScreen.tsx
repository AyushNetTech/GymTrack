import React, { useState } from 'react';
import { StyleSheet, TextInput, View, Text, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import EmailActionDialog from '../components/EmailActionDialog';
import EmailExistsDialog from '../components/EmailExistsDialog';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const navigation = useNavigation<any>();

  // Dialog states
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailDialogMessage, setEmailDialogMessage] = useState('');
  const [showExistsDialog, setShowExistsDialog] = useState(false);

  // ------------------------------------
  // SIGN IN
  // ------------------------------------
  async function signIn() {
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      Alert.alert("login Error",error.message)
      return;
    }

    if (!data.session) {
      Alert.alert("Please verify your email before signing in.")
      return;
    }

    navigation.navigate("Home");
  }

  // ------------------------------------
  // SIGN UP
  // ------------------------------------
  async function signUp() {
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: 'myapp://auth/callback' },
    });

    setLoading(false);

    if (error) {
      Alert.alert("login Error",error.message)
      return;
    }

    // VERY IMPORTANT — check if email already exists
    if (data.user?.identities?.length === 0) {
      setShowExistsDialog(true);
      return;
    }

    // Show dialog for verification email sent
    setEmailDialogMessage("A verification link has been sent to your email. Please verify to complete signup.");
    setShowEmailDialog(true);
  }

  // ------------------------------------
  // RESET PASSWORD
  // ------------------------------------
  async function resetPassword() {
    if (!email) {
      Alert.alert("Please Enter Your Email First")
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'myapp://reset-password',
    });

    setLoading(false);

    if (error) {
      Alert.alert("login Error",error.message)
      return;
    }

    setEmailDialogMessage("Password reset email sent! Please check your inbox.");
    setShowEmailDialog(true);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isSignUp ? 'Create Account' : 'Welcome Back'}</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: '#2e86de' }]}
        onPress={isSignUp ? signUp : signIn}
        disabled={loading}
      >
        <Text style={styles.btnText}>{isSignUp ? 'Sign Up' : 'Sign In'}</Text>
      </TouchableOpacity>

      {!isSignUp && (
        <TouchableOpacity onPress={resetPassword}>
          <Text style={styles.forgot}>Forgot Password?</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
        <Text style={styles.switch}>
          {isSignUp ? 'Already have an account? Sign In' : "Don’t have an account? Sign Up"}
        </Text>
      </TouchableOpacity>

      {/* -------- Dialogs -------- */}
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
          setIsSignUp(false); // switch to sign-in
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 28, textAlign: 'center', marginBottom: 20, fontWeight: '700' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 6, fontSize: 16, marginBottom: 12 },
  btn: { padding: 14, borderRadius: 6, marginTop: 10 },
  btnText: { color: '#fff', textAlign: 'center', fontSize: 16, fontWeight: '600' },
  forgot: { textAlign: 'center', color: '#2e86de', marginTop: 10 },
  switch: { textAlign: 'center', color: '#10ac84', marginTop: 20, fontWeight: '600' },
});
