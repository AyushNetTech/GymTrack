import React from 'react';
import { TouchableOpacity, Text, TextInput, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function StepBodyDetails(props: any) {
  const {
    birthdate,
    setBirthdate,
    showDatePicker,
    setShowDatePicker,
    height,
    setHeight,
    weight,
    setWeight,
  } = props;

  return (
    <>
      <TouchableOpacity style={styles.card} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.label}>Birthdate</Text>
        <Text style={styles.value}>{birthdate.toDateString()}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={birthdate}
          mode="date"
          maximumDate={new Date()}
          onChange={(_, d) => {
            setShowDatePicker(false);
            if (d) setBirthdate(d);
          }}
        />
      )}

      <TextInput style={styles.input} placeholder="Height (cm)" placeholderTextColor="#888" value={height} onChangeText={setHeight} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Weight (kg)" placeholderTextColor="#888" value={weight} onChangeText={setWeight} keyboardType="numeric" />
    </>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#111', borderRadius: 16, padding: 18, marginBottom: 14 },
  label: { color: '#888' },
  value: { color: '#fff', fontWeight: '700' },
  input: { backgroundColor: '#111', borderRadius: 16, padding: 18, color: '#fff', marginBottom: 10 },
});
