import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import AddWorkoutScreen from '../screens/AddWorkoutScreen'
import ExerciseLogScreen from '../screens/ExerciseLogScreen'
import ExerciseOptionsScreen from '../screens/ExerciseOptionsScreen'
import { View } from 'react-native'
import AddWorkoutHeader from '../components/AddWorkoutHeader'
import ExercisePreviewScreen from '../screens/ExercisePreviewScreen'

export type WorkoutStackParamList = {
  AddWorkoutMain: undefined
  ExerciseLog: { exercise: any; returnTab?: string }
  ExerciseOptions: { exerciseId: string; returnTab: string }
  ExercisePreview: { exerciseId: string; returnTab?: string }
}

const Stack = createNativeStackNavigator<WorkoutStackParamList>()

export default function WorkoutStackNavigator() {
  return (
    <View style={{ flex: 1, backgroundColor: "#111" }}>
          {/* ✅ Persistent Header */}
          <AddWorkoutHeader />
    
          {/* ✅ Stack BELOW header */}
          <View style={{ flex: 1 }}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="AddWorkoutMain" component={AddWorkoutScreen} />
              <Stack.Screen name="ExerciseOptions" component={ExerciseOptionsScreen} />
              <Stack.Screen name="ExercisePreview" component={ExercisePreviewScreen} />
              <Stack.Screen name="ExerciseLog" component={ExerciseLogScreen} />
            </Stack.Navigator>
          </View>
    </View>
  )
}
