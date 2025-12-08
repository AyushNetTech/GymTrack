import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '../lib/supabase'
import { useNavigation } from '@react-navigation/native'

type Category = { id: string; name: string; description?: string }
type Exercise = { id: string; category_id: string; name: string; description?: string }

export default function AddWorkoutScreen() {
  const navigation = useNavigation<any>()

  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true)
      const { data, error } = await supabase.from('workout_categories').select('*').order('name')
      setLoading(false)
      if (error) console.log(error.message)
      else setCategories((data as Category[]) || [])
    }
    fetchCategories()
  }, [])

  const fetchExercises = async (categoryId: string) => {
    setLoading(true)
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('category_id', categoryId)
      .order('name')
    setLoading(false)
    if (error) console.log(error.message)
    else setExercises((data as Exercise[]) || [])
  }

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category)
    fetchExercises(category.id)
  }

  const handleExercisePress = (exercise: Exercise) => {
    // Navigate to new screen to add sets/reps/weight
    navigation.navigate('ExerciseDetails', { exercise })
  }

  if (loading)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    )

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Select Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.categoryButton, selectedCategory?.id === cat.id && styles.selectedCategory]}
            onPress={() => handleCategorySelect(cat)}
          >
            <Text
              style={[styles.categoryText, selectedCategory?.id === cat.id && styles.selectedCategoryText]}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedCategory && (
        <>
          <Text style={styles.heading}>Select Exercise</Text>
          <View style={styles.exerciseGrid}>
            {exercises.map(ex => (
              <TouchableOpacity
                key={ex.id}
                style={styles.exerciseButton}
                onPress={() => handleExercisePress(ex)}
              >
                <Text style={styles.exerciseText}>{ex.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 20 },
  heading: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  categoryButton: { padding: 10, backgroundColor: '#222', borderRadius: 10, marginRight: 10 },
  selectedCategory: { backgroundColor: '#1E90FF' },
  categoryText: { color: '#fff' },
  selectedCategoryText: { color: '#fff', fontWeight: 'bold' },
  exerciseGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  exerciseButton: { backgroundColor: '#222', padding: 12, borderRadius: 10, margin: 5, minWidth: 100 },
  exerciseText: { color: '#fff', textAlign: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' }
})
