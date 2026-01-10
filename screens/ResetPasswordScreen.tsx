import React, { useState, useEffect } from 'react'
import { 
  View, 
  TextInput, 
  Alert, 
  StyleSheet, 
  Text, 
  Linking, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator 
} from 'react-native'
import { supabase } from '../lib/supabase'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'


export default function ResetPasswordScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  const [checkedInitialUrl, setCheckedInitialUrl] = useState(false)


  const parseTokensFromUrl = (url: string | null) => {
    if (!url) return { accessToken: null, refreshToken: null }
    try {
      const params = new URL(url).searchParams
      let access = params.get('access_token')
      let refresh = params.get('refresh_token')

      if ((!access || !refresh) && url.includes('#')) {
        const hash = url.split('#')[1]
        const hashParams = new URLSearchParams(hash)
        access = access || hashParams.get('access_token')
        refresh = refresh || hashParams.get('refresh_token')
      }
      return { accessToken: access, refreshToken: refresh }
    } catch {
      return { accessToken: null, refreshToken: null }
    }
  }

  useEffect(() => {
    const handleUrl = (url: string | null) => {
      const { accessToken, refreshToken } = parseTokensFromUrl(url)
      if (accessToken && refreshToken) {
        setAccessToken(accessToken)
        setRefreshToken(refreshToken)
        setReady(true)
      }

      setCheckedInitialUrl(true) // ✅ ADD
    }

    const paramUrl = route.params?.url
    if (paramUrl) {
      handleUrl(paramUrl)
      return
    }

    Linking.getInitialURL().then(url => handleUrl(url))
    const sub = Linking.addEventListener('url', e => handleUrl(e.url))
    return () => sub.remove()
  }, [route.params])

  useEffect(() => {
  if (checkedInitialUrl && !ready) {
    // 🚫 No reset token → escape safely
    navigation.reset({
      index: 0,
      routes: [{ name: "Auth" }],
    })
  }
}, [checkedInitialUrl, ready])


  const updatePassword = async () => {
    if (!password) return Alert.alert('Error', 'Enter a new password')
    if (password.length < 6) return Alert.alert('Error', 'Password must be at least 6 characters')
    if (password !== confirmPassword) return Alert.alert('Error', 'Passwords do not match')
    if (!accessToken || !refreshToken) return Alert.alert('Error', 'Missing access or refresh token')

    setLoading(true)

    const { error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })

    if (sessionError) {
      setLoading(false)
      return Alert.alert('Error', sessionError.message)
    }

    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (updateError) return Alert.alert('Error', updateError.message)

    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    })
  }

  if (!ready) {
  return (
    <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
      <ActivityIndicator size="large" color="#f4ff47" />
    </View>
  )
}



  return (
    <View style={styles.container}>
      {/* Background */}
      <Image source={require("../assets/fitness1.jpg")} style={styles.bgImage} />
      <View style={styles.overlay} />

      {/* Glass Card */}
      <View style={styles.card}>
        <Text style={styles.title}>Reset</Text>
        <Text style={styles.subtitle}>your password</Text>

        {/* Password Input */}
        <View style={styles.inputWrapper}>
          <TextInput
            style={[
              styles.input,
              password.length > 0 && password.length < 6 && styles.inputError
            ]}
            placeholder="New Password"
            placeholderTextColor="#aaa"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color="#ccc" />
          </TouchableOpacity>
        </View>

        {password.length > 0 && password.length < 6 && (
          <Text style={styles.errorText}>Password must be at least 6 characters</Text>
        )}

        {/* Confirm Password */}
        <View style={styles.inputWrapper}>
          <TextInput
            style={[
              styles.input,
              confirmPassword.length > 0 && confirmPassword !== password && styles.inputError
            ]}
            placeholder="Confirm Password"
            placeholderTextColor="#aaa"
            secureTextEntry={!showConfirm}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowConfirm(!showConfirm)}>
            <Ionicons name={showConfirm ? 'eye-off' : 'eye'} size={22} color="#ccc" />
          </TouchableOpacity>
        </View>

        {confirmPassword.length > 0 && confirmPassword !== password && (
          <Text style={styles.errorText}>Passwords do not match</Text>
        )}

        {/* Kite Button */}
        <TouchableOpacity style={styles.kiteButton} onPress={updatePassword} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Ionicons
              name="checkmark-sharp"
              size={28}
              color="#000"
              style={styles.kiteButtonIcon}
            />

          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", backgroundColor: "#000" },

  bgImage: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)" },

  card: {
    marginHorizontal: 20,
    padding: 26,
    borderRadius: 22,
    backgroundColor: "rgba(20,20,20,0.65)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  title: { color: "#fff", fontSize: 32, fontWeight: "700" },
  subtitle: { color: "#ccc", fontSize: 20, marginBottom: 25 },

  inputWrapper: { position: "relative", marginBottom: 12 },

  input: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    padding: 14,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
    color: "#fff",
    paddingRight: 40,
  },

  eyeIcon: { position: "absolute", right: 14, top: 16 },

  errorText: { color: "#ff4d4d", fontSize: 13, marginBottom: 10 },

  inputError: {
    borderColor: "#ff4d4d",
    backgroundColor: "rgba(255, 77, 77, 0.15)",
  },

  kiteButton: {
    width: 70,
    height: 70,
    backgroundColor: "#f4ff47",
    transform: [{ rotate: "45deg" }],
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    alignSelf: "center",
    marginTop: 25,
    shadowColor: "#f4ff47",
    shadowOpacity: 0.8,
    shadowRadius: 18,
  },

  kiteButtonIcon: { transform: [{ rotate: "-45deg" }] },
})
