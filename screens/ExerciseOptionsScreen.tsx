import { useEffect, useState } from "react"
import { TouchableOpacity, Text } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { supabase } from "../lib/supabase"

export default function ExerciseOptionsScreen({ route, navigation }: any) {
  const { exerciseId, returnTab } = route.params
  const [exercise, setExercise] = useState<any>(null)

  useEffect(() => {
    async function loadExercise() {
      const { data } = await supabase
        .from("exercises")
        .select("*")
        .eq("id", exerciseId)
        .single()

      setExercise(data)
    }

    loadExercise()
  }, [exerciseId])

  if (!exercise) {
    return (
        <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#aaa" }}>Loading…</Text>
        </SafeAreaView>
    )
    }


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000", justifyContent: "center" }}>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("ExercisePreview", {
            exerciseId,
            returnTab,
          })
        }
      >
        <Text>👀 Watch Workout Video</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() =>
          navigation.navigate("AddWorkout", {
            screen: "ExerciseLog",
            params: {
                exercise,
                returnTab: "Workout",
            },
            })
        }
      >
        <Text>➕ Add This Workout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}
