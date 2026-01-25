import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";

export default function ExerciseOptionsScreen({ route, navigation }: any) {
  const { exerciseId, returnTab } = route.params;
  const [exercise, setExercise] = useState<any>(null);

  useEffect(() => {
    async function loadExercise() {
      const { data } = await supabase
        .from("exercises")
        .select("*")
        .eq("id", exerciseId)
        .single();

      setExercise(data);
    }

    loadExercise();
  }, [exerciseId]);

  if (!exercise) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f4ff47" />
        <Text style={styles.loadingText}>Loading exercise…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* BACK + TITLE */}
      <View style={styles.top}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.exerciseName}>{exercise.exercise_name}</Text>
        <Text style={styles.subText}>
          {exercise.muscle_group.toUpperCase()} • {exercise.difficulty}
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.85}
          onPress={() =>
            navigation.navigate("ExercisePreview", {
              exerciseId,
              returnTab,
            })
          }
        >
          <Ionicons name="play-circle-outline" size={28} color="#1E90FF" />
          <Text style={styles.cardText}>Watch Workout Video</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, styles.primaryCard]}
          activeOpacity={0.85}
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
          <Ionicons name="add-circle-outline" size={28} color="#000" />
          <Text style={[styles.cardText, { color: "#000" }]}>
            Add This Workout
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 15,
    paddingTop:-20
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#aaa",
    marginTop: 12,
  },

  header: {
    marginTop: 40,
    marginBottom: 40,
    alignItems: "center",
  },
  exerciseName: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
  },
  subText: {
    color: "#aaa",
    marginTop: 8,
    fontSize: 14,
  },

  actions: {
    gap: 16,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#222",
    padding: 18,
    borderRadius: 14,
  },

  primaryCard: {
    backgroundColor: "#f4ff47",
  },

  cardText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  top: {
    paddingTop: 0,
    paddingBottom: 0,
  },

  backText: {
    color: "#f4ff47",
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 0,
  },
});
