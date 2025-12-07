import React, { useState } from 'react'
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { supabase } from '../lib/supabase'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../App'

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ProfileSetup'>
}

export default function ProfileSetupScreen({ navigation }: Props) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [phone, setPhone] = useState('')

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    username: '',
    phone: '',
  })

  const [loading, setLoading] = useState(false)

  // Validation helpers
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
    if (!value) return '' // optional
    const phoneRegex = /^[0-9]{6,15}$/
    if (!phoneRegex.test(value)) return 'Enter a valid phone number'
    return ''
  }

  const validateUsername = async (value: string) => {
  if (!value.trim()) return 'Username is required'

  // Check in database
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
  // Client-side validations
  const firstNameError = validateFirstName(firstName)
  const lastNameError = validateLastName(lastName)
  const phoneError = validatePhone(phone)
  setErrors({ ...errors, firstName: firstNameError, lastName: lastNameError, phone: phoneError })

  if (firstNameError || lastNameError || phoneError) return

  // Server-side username check
  const usernameError = await validateUsername(username)
  setErrors(prev => ({ ...prev, username: usernameError }))
  if (usernameError) return // stop if username is taken

  // Save profile
  setLoading(true)
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) {
    setLoading(false)
    Alert.alert('Error', 'User not found')
    return
  }

  const id = userData.user.id
  const { error } = await supabase.from('profiles').upsert({
    id,
    first_name: firstName.trim(),
    last_name: lastName.trim(),
    username: username.trim(),
    phone: phone.trim(),
    email: userData.user.email,
  })

  setLoading(false)

  if (error) {
    // Check for duplicate username error
    if (error.message.includes('profiles_username_key')) {
      setErrors(prev => ({ ...prev, username: 'Username already taken' }))
    } else {
      Alert.alert('Error', error.message) // other DB errors
    }
  } else {
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] })
  }
}



  return (
    <View style={styles.container}>
      <Text style={styles.title}>Complete Your Profile</Text>

      <TextInput
        style={styles.input}
        placeholder="First Name"
        placeholderTextColor="#5a5a5aff"
        value={firstName}
        onChangeText={value => {
          setFirstName(value)
          setErrors(prev => ({ ...prev, firstName: validateFirstName(value) }))
        }}
      />
      {errors.firstName ? <Text style={styles.errorText}>{errors.firstName}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Last Name"
        placeholderTextColor="#5a5a5aff"
        value={lastName}
        onChangeText={value => {
          setLastName(value)
          setErrors(prev => ({ ...prev, lastName: validateLastName(value) }))
        }}
      />
      {errors.lastName ? <Text style={styles.errorText}>{errors.lastName}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#5a5a5aff"
        value={username}
        onChangeText={value => {
          setUsername(value)
          setErrors(prev => ({ ...prev, username: '' })) // clear error while typing
        }}
        autoCapitalize="none"
      />
      {errors.username ? <Text style={styles.errorText}>{errors.username}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        placeholderTextColor="#5a5a5aff"
        value={phone}
        keyboardType="phone-pad"
        onChangeText={value => {
          setPhone(value)
          setErrors(prev => ({ ...prev, phone: validatePhone(value) }))
        }}
      />
      {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}

      <TouchableOpacity
        style={[styles.btn, { opacity: loading ? 0.6 : 1 }]}
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.btnText}>{loading ? 'Saving...' : 'Save & Continue'}</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 26, marginBottom: 20, fontWeight: '700', textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 6, marginBottom: 4 },
  errorText: { color: 'red', fontSize: 13, marginBottom: 10, marginLeft: 4 },
  btn: { backgroundColor: '#2e86de', padding: 14, borderRadius: 6, marginTop: 10 },
  btnText: { color: '#fff', textAlign: 'center', fontSize: 16, fontWeight: '700' },
})
