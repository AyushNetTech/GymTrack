import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";
import { LineChart } from "react-native-chart-kit";

const { width } = Dimensions.get("window");

type WorkoutData = {
  created_at: string;
  workout_id: string;
  sets: number;
  reps: number;
  weight: number;
};

export default function AnalysisScreen() {
  const [loading, setLoading] = useState(true);
  const [workouts, setWorkouts] = useState<WorkoutData[]>([]);
  const [filter, setFilter] = useState<"week" | "month" | "year">("week");

  useEffect(() => {
    fetchWorkoutData();
  }, [filter]);

  const fetchWorkoutData = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("user_workouts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error) console.log(error.message);
    else setWorkouts(data as WorkoutData[]);

    setLoading(false);
  };

  const getFilteredData = () => {
    const now = new Date();
    let filtered = workouts;

    if (filter === "week") {
      filtered = workouts.filter(
        (w) => new Date(w.created_at) >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      );
    } else if (filter === "month") {
      filtered = workouts.filter(
        (w) => new Date(w.created_at) >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      );
    } else if (filter === "year") {
      filtered = workouts.filter(
        (w) => new Date(w.created_at) >= new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      );
    }

    return filtered;
  };

  const chartData = () => {
    const filtered = getFilteredData();
    const dataMap: { [date: string]: { weight: number; reps: number; sets: number } } = {};

    filtered.forEach((w) => {
      const date = new Date(w.created_at).toLocaleDateString();
      if (!dataMap[date]) dataMap[date] = { weight: 0, reps: 0, sets: 0 };
      dataMap[date].weight += w.weight * w.reps;
      dataMap[date].reps += w.reps;
      dataMap[date].sets += w.sets;
    });

    const labels = Object.keys(dataMap);
    const weightData = Object.values(dataMap).map((d) => d.weight);
    const repsData = Object.values(dataMap).map((d) => d.reps);
    const setsData = Object.values(dataMap).map((d) => d.sets);

    return {
      labels: labels.length ? labels : ["No Data"],
      datasets: [
        {
          data: weightData.length ? weightData : [0],
          color: (opacity = 1) => `rgba(208, 255, 42, ${opacity})`,
          strokeWidth: 3,
        },
        {
          data: repsData.length ? repsData : [0],
          color: (opacity = 1) => `rgba(255, 0, 128, ${opacity})`,
          strokeWidth: 3,
        },
        {
          data: setsData.length ? setsData : [0],
          color: (opacity = 1) => `rgba(0, 192, 255, ${opacity})`,
          strokeWidth: 3,
        },
      ],
      legend: ["Weight", "Reps", "Sets"],
    };
  };

  if (loading)
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#f4ff47" />
      </View>
    );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Workout Analysis</Text>

      {/* Filter buttons */}
      <View style={styles.filterContainer}>
        {["week", "month", "year"].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterButton, filter === f && styles.filterButtonActive]}
            onPress={() => setFilter(f as "week" | "month" | "year")}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
        <LineChart
          data={chartData()}
          width={width - 30}
          height={300}
          chartConfig={{
            backgroundGradientFrom: "#000000",
            backgroundGradientTo: "#111111",
            decimalPlaces: 0,
            color: (opacity = 1, index?: number) => {
              const colors = ["#f4ff47", "#ff0080", "#00c0ff"];
              return colors[index || 0];
            },
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            propsForDots: { r: "5", strokeWidth: "2", stroke: "#f4ff47" },
            propsForBackgroundLines: { stroke: "rgba(255,255,255,0.1)" },
          }}
          bezier
          withShadow={true}
          withInnerLines={true}
          withOuterLines={true}
          style={{ marginVertical: 20, borderRadius: 16 }}
        />

        {/* Stats summary */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {workouts.reduce((a, b) => a + b.reps, 0)}
            </Text>
            <Text style={styles.statLabel}>Total Reps</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {Math.round(workouts.reduce((a, b) => a + b.weight * b.reps, 0))}
            </Text>
            <Text style={styles.statLabel}>Total Weight</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{workouts.length}</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", paddingTop: 20 },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#f4ff47",
    marginLeft: 15,
    marginBottom: 10,
  },
  filterContainer: { flexDirection: "row", justifyContent: "center", marginVertical: 10 },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginHorizontal: 5,
    borderRadius: 12,
    backgroundColor: "#222",
  },
  filterButtonActive: { backgroundColor: "#f4ff47" },
  filterText: { color: "#fff", fontWeight: "bold" },
  filterTextActive: { color: "#000" },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
    paddingHorizontal: 15,
  },
  statBox: {
    alignItems: "center",
    backgroundColor: "#111",
    padding: 15,
    borderRadius: 12,
    width: width / 3.2,
  },
  statValue: { fontSize: 20, fontWeight: "bold", color: "#f4ff47" },
  statLabel: { fontSize: 14, color: "#fff", marginTop: 5 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" },
});
