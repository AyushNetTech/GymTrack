import React, { useState } from 'react'
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native'
import { supabase } from '../lib/supabase'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../App'
import { Ionicons } from '@expo/vector-icons'

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ProfileSetup'>
}

export default function ProfileSetupScreen({ navigation }: Props) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    username: '',
    phone: '',
  })

  // -------- VALIDATION (UNCHANGED) --------
  const validateFirstName = (value: string) => {
    if (!value.trim()) return 'First name is required'
    if (value.trim().length < 2) return 'First name must be at least 2 characters'
    return ''
  }

  const validateLastName = (value: string) => {
    if (!value.trim()) return 'Last name is required'
    if (value.trim().length < 2) return 'Last name must be at least 2 characters'
    return ''
  }

  const validatePhone = (value: string) => {
    if (!value) return ''
    const phoneRegex = /^[0-9]{6,15}$/
    if (!phoneRegex.test(value)) return 'Enter a valid phone number'
    return ''
  }

  const validateUsername = async (value: string) => {
    if (!value.trim()) return 'Username is required'

    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', value.trim())
      .maybeSingle()

    if (error) return 'Error checking username'
    if (data) return 'Username is already taken'
    return ''
  }

  const handleSave = async () => {
    const firstNameError = validateFirstName(firstName)
    const lastNameError = validateLastName(lastName)
    const phoneError = validatePhone(phone)

    setErrors({
      ...errors,
      firstName: firstNameError,
      lastName: lastNameError,
      phone: phoneError,
    })

    if (firstNameError || lastNameError || phoneError) return

    const usernameError = await validateUsername(username)
    setErrors(prev => ({ ...prev, username: usernameError }))
    if (usernameError) return

    setLoading(true)
    const { data: userData } = await supabase.auth.getUser()
    if (!userData?.user) {
      setLoading(false)
      Alert.alert('Error', 'User not found')
      return
    }

    const { error } = await supabase.from('profiles').upsert({
      id: userData.user.id,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      username: username.trim(),
      phone: phone.trim(),
      email: userData.user.email,
    })

    setLoading(false)

    if (error) {
      Alert.alert('Error', error.message)
    } else {
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] })
    }
  }

  return (
    <View style={styles.screen}>
      <Image
        source={require('../assets/profilesetupimg2.jpg')}
        style={styles.bgImage}
      />
      <View style={styles.overlay} />

      <View style={styles.card}>
        <Text style={styles.title}>Complete</Text>
        <Text style={styles.subtitle}>your profile</Text>

        <TextInput
          style={[styles.input, errors.firstName && styles.inputError]}
          placeholder="First Name"
          placeholderTextColor="#aaa"
          value={firstName}
          onChangeText={value => {
            setFirstName(value)
            setErrors(prev => ({ ...prev, firstName: validateFirstName(value) }))
          }}
        />
        {errors.firstName ? <Text style={styles.errorText}>{errors.firstName}</Text> : null}

        <TextInput
          style={[styles.input, errors.lastName && styles.inputError]}
          placeholder="Last Name"
          placeholderTextColor="#aaa"
          value={lastName}
          onChangeText={value => {
            setLastName(value)
            setErrors(prev => ({ ...prev, lastName: validateLastName(value) }))
          }}
        />
        {errors.lastName ? <Text style={styles.errorText}>{errors.lastName}</Text> : null}

        <TextInput
          style={[styles.input, errors.username && styles.inputError]}
          placeholder="Username"
          placeholderTextColor="#aaa"
          value={username}
          autoCapitalize="none"
          onChangeText={value => {
            setUsername(value)
            setErrors(prev => ({ ...prev, username: '' }))
          }}
        />
        {errors.username ? <Text style={styles.errorText}>{errors.username}</Text> : null}

        <TextInput
          style={[styles.input, errors.phone && styles.inputError]}
          placeholder="Phone Number"
          placeholderTextColor="#aaa"
          value={phone}
          keyboardType="phone-pad"
          onChangeText={value => {
            setPhone(value)
            setErrors(prev => ({ ...prev, phone: validatePhone(value) }))
          }}
        />
        {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}

        <TouchableOpacity
          style={styles.kiteButton}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Ionicons
              name="checkmark"
              size={30}
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
  screen: { flex: 1, backgroundColor: "#000", justifyContent: "center" },

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
    backgroundColor: "rgba(20,20,20,0.65)",
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

  inputError: {
    borderColor: "#ff4d4d",
    backgroundColor: "rgba(255,77,77,0.15)",
  },

  errorText: {
    color: "#ff4d4d",
    fontSize: 13,
    marginBottom: 10,
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
    marginTop: 25,
  },

  kiteButtonIcon: {
    transform: [{ rotate: "-45deg" }],
  },
})
