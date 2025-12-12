import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons'; // make sure to import Ionicons

type SetData = {
  reps: string;
  weight: string;
  unit: 'kg' | 'lbs';
};

export default function ExerciseDetailsScreen({ route, navigation }: any) {
  const { exercise } = route.params;
  const [userId, setUserId] = useState<string | null>(null);
  const [setsList, setSetsList] = useState<SetData[]>([{ reps: '', weight: '', unit: 'kg' }]);

  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id ?? null);
    };
    fetchUser();
  }, []);

  const handleSetChange = (index: number, field: keyof SetData, value: string | 'kg' | 'lbs') => {
    const newList = [...setsList];
    newList[index][field] = value as any; // safe because field and value are compatible
    setSetsList(newList);
  };

  const addNewSet = () => {
    Keyboard.dismiss();
    setTimeout(() => {
      setSetsList([...setsList, { reps: '', weight: '', unit: 'kg' }]);
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 50);
    }, 50);
  };

  const removeSet = (index: number) => {
    const newList = [...setsList];
    newList.splice(index, 1);
    setSetsList(newList.length ? newList : [{ reps: '', weight: '', unit: 'kg' }]);
  };

  const saveWorkout = async () => {
    if (!userId) return Alert.alert('User not logged in');

    const inserts = setsList.map((s, idx) => {
      const weightKg =
        s.unit === 'lbs' && s.weight
          ? parseFloat(s.weight) * 0.453592
          : parseFloat(s.weight || '0');
      return {
        user_id: userId,
        workout_id: exercise.id,
        sets: 1, // each row is a single set
        reps: parseInt(s.reps || '0'),
        weight: weightKg,
        notes: null,
      };
    });

    const { error } = await supabase.from('user_workouts').insert(inserts);
    if (error) Alert.alert('Error', error.message);
    else {
      Alert.alert('Workout saved!');
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Floating Header */}
    <View style={styles.floatingHeader}>
      <TouchableOpacity
        style={{ flexDirection: 'row', alignItems: 'center',  paddingBottom:20 }}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back-outline" size={24} color="#f4ff47" />
        <Text style={{ color: '#f4ff47', fontSize: 18, marginLeft: 8 }}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.heading}>{exercise.name}</Text>
    </View>
        <ScrollView ref={scrollRef} contentContainerStyle={{ padding: 20, paddingBottom: 150, paddingTop:120 }}>

          {setsList.map((s, idx) => (
            <View key={idx} style={styles.setCard}>
              <View style={styles.setHeader}>
                <Text style={styles.setTitle}>Set {idx + 1}</Text>
                <TouchableOpacity onPress={() => removeSet(idx)}>
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputsRow}>
                <TextInput
                  placeholder="Reps"
                  placeholderTextColor="#aaa"
                  style={[styles.input, { flex: 1 }]}
                  keyboardType="numeric"
                  value={s.reps}
                  onChangeText={v => handleSetChange(idx, 'reps', v)}
                />

                <TextInput
                  placeholder="Weight"
                  placeholderTextColor="#aaa"
                  style={[styles.input, { flex: 1 }]}
                  keyboardType="numeric"
                  value={s.weight}
                  onChangeText={v => handleSetChange(idx, 'weight', v)}
                />

                <View style={styles.unitToggle}>
                  <TouchableOpacity
                    style={[styles.unitButton, s.unit === 'kg' && styles.unitButtonActive]}
                    onPress={() => handleSetChange(idx, 'unit', 'kg')}
                  >
                    <Text style={styles.unitText}>KG</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.unitButton, s.unit === 'lbs' && styles.unitButtonActive]}
                    onPress={() => handleSetChange(idx, 'unit', 'lbs')}
                  >
                    <Text style={styles.unitText}>LBS</Text>
                  </TouchableOpacity>
                </View>
              </View>
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
  );
}

const styles = StyleSheet.create({
  heading: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  setCard: { backgroundColor: '#222', padding: 15, borderRadius: 12, marginBottom: 15 },
  setHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  setTitle: { color: '#fff', fontWeight: 'bold' },
  removeText: { color: '#ff4d4d', fontWeight: 'bold' },
  inputsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { backgroundColor: '#333', color: '#fff', padding: 10, borderRadius: 10 },
  unitToggle: { flexDirection: 'row', marginLeft: 5 },
  unitButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#555',
    marginHorizontal: 2,
  },
  unitButtonActive: { backgroundColor: '#f4ff47' },
  unitText: { color: '#fff', fontWeight: 'bold' },
  addButton: {
    backgroundColor: '#32CD32',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  saveButton: { backgroundColor: '#1E90FF', padding: 15, borderRadius: 12, alignItems: 'center' },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  floatingHeader: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  backgroundColor: '#000',
  paddingHorizontal: 20,
  paddingTop: 20,
  zIndex: 10,
},
});
