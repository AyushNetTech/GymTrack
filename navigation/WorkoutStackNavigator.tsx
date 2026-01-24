import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import AddWorkoutScreen from '../screens/AddWorkoutScreen'
import ExerciseLogScreen from '../screens/ExerciseLogScreen'

export type WorkoutStackParamList = {
  AddWorkoutMain: undefined
  ExerciseLog: { exercise: { id: string; name: string; category_id: string } }
}

const Stack = createNativeStackNavigator<WorkoutStackParamList>()

export default function WorkoutStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AddWorkoutMain" component={AddWorkoutScreen} />
      <Stack.Screen name="ExerciseLog" component={ExerciseLogScreen} />
    </Stack.Navigator>
  )
}
