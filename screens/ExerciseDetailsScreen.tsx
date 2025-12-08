import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '../lib/supabase'

export default function ExerciseDetailsScreen({ route, navigation }: any) {
  const { exercise } = route.params
  const [userId, setUserId] = useState<string | null>(null)
  const [setsList, setSetsList] = useState<{ sets: string; reps: string; weight: string }[]>([
    { sets: '', reps: '', weight: '' }
  ])

  React.useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUserId(data.user?.id ?? null)
    }
    fetchUser()
  }, [])

  const handleSetChange = (index: number, field: 'sets' | 'reps' | 'weight', value: string) => {
    const newList = [...setsList]
    newList[index][field] = value
    setSetsList(newList)
  }

  const addNewSet = () => setSetsList([...setsList, { sets: '', reps: '', weight: '' }])

  const saveWorkout = async () => {
    if (!userId) return Alert.alert('User not logged in')

    const inserts = setsList.map(s => ({
      user_id: userId,
      workout_id: exercise.id,
      sets: parseInt(s.sets),
      reps: parseInt(s.reps),
      weight: s.weight ? parseFloat(s.weight) : null
    }))

    const { error } = await supabase.from('user_workouts').insert(inserts)
    if (error) Alert.alert('Error', error.message)
    else {
      Alert.alert('Workout saved!')
      navigation.goBack()
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Text style={styles.heading}>{exercise.name}</Text>

          {setsList.map((s, idx) => (
            <View key={idx} style={styles.setContainer}>
              <TextInput
                placeholder="Sets"
                placeholderTextColor="#aaa"
                style={styles.input}
                keyboardType="numeric"
                value={s.sets}
                onChangeText={v => handleSetChange(idx, 'sets', v)}
              />
              <TextInput
                placeholder="Reps"
                placeholderTextColor="#aaa"
                style={styles.input}
                keyboardType="numeric"
                value={s.reps}
                onChangeText={v => handleSetChange(idx, 'reps', v)}
              />
              <TextInput
                placeholder="Weight"
                placeholderTextColor="#aaa"
                style={styles.input}
                keyboardType="numeric"
                value={s.weight}
                onChangeText={v => handleSetChange(idx, 'weight', v)}
              />
            </View>
          ))}

          <TouchableOpacity style={styles.addButton} onPress={addNewSet}>
            <Text style={styles.addButtonText}>+ Add Another Set</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveButton} onPress={saveWorkout}>
            <Text style={styles.saveButtonText}>Save Workout</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  heading: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  setContainer: { marginBottom: 15 },
  input: { backgroundColor: '#222', color: '#fff', padding: 12, borderRadius: 10, marginBottom: 5 },
  addButton: { backgroundColor: '#32CD32', padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 10 },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  saveButton: { backgroundColor: '#1E90FF', padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
})
