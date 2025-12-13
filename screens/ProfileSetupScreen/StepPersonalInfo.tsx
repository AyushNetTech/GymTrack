import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';

const PRIMARY = '#f4ff47';

export default function StepPersonalInfo(props: any) {
  const {
    gender,
    setGender,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    username,
    setUsername,
    checkUsername,
    checkingUsername,
    usernameAvailable,
    phone,
    setPhone,
  } = props;

  return (
    <>
      <View style={styles.genderRow}>
        {['Male', 'Female'].map((g) => (
          <TouchableOpacity
            key={g}
            style={[styles.genderCard, gender === g && styles.genderSelected]}
            onPress={() => setGender(g)}
          >
            <Text style={styles.genderText}>{g}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput style={styles.input} placeholder="First Name" placeholderTextColor="#888" value={firstName} onChangeText={setFirstName} />
      <TextInput style={styles.input} placeholder="Last Name" placeholderTextColor="#888" value={lastName} onChangeText={setLastName} />

      <TextInput
        style={[styles.input, usernameAvailable === false && styles.inputError]}
        placeholder="Username"
        placeholderTextColor="#888"
        value={username}
        onChangeText={(t) => {
          setUsername(t);
        }}
        onBlur={checkUsername}
      />

      {checkingUsername && <Text style={styles.info}>Checking username…</Text>}
      {usernameAvailable === false && <Text style={styles.error}>Username already taken</Text>}
      {usernameAvailable === true && <Text style={styles.success}>Username available</Text>}

      <TextInput style={styles.input} placeholder="Phone" placeholderTextColor="#888" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
    </>
  );
}

const styles = StyleSheet.create({
  genderRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  genderCard: { flex: 1, backgroundColor: '#111', padding: 20, borderRadius: 16, alignItems: 'center' },
  genderSelected: { borderWidth: 2, borderColor: PRIMARY },
  genderText: { color: '#fff', fontWeight: '700' },

  input: { backgroundColor: '#111', borderRadius: 16, padding: 18, color: '#fff', marginBottom: 10 },
  inputError: { borderWidth: 1.5, borderColor: '#ff4d4d' },

  info: { color: '#aaa' },
  error: { color: '#ff4d4d' },
  success: { color: PRIMARY },
});
