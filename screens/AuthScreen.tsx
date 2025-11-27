import React, { useState } from 'react'
import {
  Alert,
  StyleSheet,
  TextInput,
  View,
  Text,
  TouchableOpacity,
} from 'react-native'
import { supabase } from '../lib/supabase'
import { useNavigation } from '@react-navigation/native'

export default function AuthScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const navigation = useNavigation<any>()

  async function signIn() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) Alert.alert(error.message)
    setLoading(false)
  }

  async function signUp() {
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      Alert.alert(error.message)
    } else {
      Alert.alert("Verify Email", "Check your email and click the verification link.")
    }
  }

  async function resetPassword() {
    if (!email) return Alert.alert("Enter your email first")

    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "myapp://reset-password",
    })

    setLoading(false)

    if (error) Alert.alert(error.message)
    else Alert.alert("Email Sent", "Check your inbox for the reset link.")
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isSignUp ? 'Create Account' : 'Welcome Back'}</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
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
          {isSignUp
            ? 'Already have an account? Sign In'
            : "Don't have an account? Sign Up"}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 28, textAlign: 'center', marginBottom: 20, fontWeight: '700' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 6, fontSize: 16, marginBottom: 12 },
  btn: { padding: 14, borderRadius: 6, marginTop: 10 },
  btnText: { color: '#fff', textAlign: 'center', fontSize: 16, fontWeight: '600' },
  forgot: { textAlign: 'center', color: '#2e86de', marginTop: 10 },
  switch: { textAlign: 'center', color: '#10ac84', marginTop: 20, fontWeight: '600' },
})
