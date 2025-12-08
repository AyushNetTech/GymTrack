import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import AddWorkoutScreen from '../screens/AddWorkoutScreen'
import ExerciseDetailsScreen from '../screens/ExerciseDetailsScreen'

export type WorkoutStackParamList = {
  AddWorkoutMain: undefined
  ExerciseDetails: { exercise: { id: string; name: string; category_id: string } }
}

const Stack = createNativeStackNavigator<WorkoutStackParamList>()

export default function WorkoutStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AddWorkoutMain" component={AddWorkoutScreen} />
      <Stack.Screen name="ExerciseDetails" component={ExerciseDetailsScreen} />
    </Stack.Navigator>
  )
}
