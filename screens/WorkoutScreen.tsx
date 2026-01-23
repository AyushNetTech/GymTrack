import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";
import LoadingScreen from "../components/LoadingScreen";
import { useNavigation } from "@react-navigation/native";
import WorkoutHeader, { HEADER_HEIGHT } from "../components/WorkoutHeader";
import { useUser } from "../context/UserContext";

const DIFFICULTIES = [
  {
    Title: "beginner",
    Image:
      "https://mftvgiceccapzcgheaom.supabase.co/storage/v1/object/public/Workout%20Images/WorkoutLevelHeader/abs/beginner.jpg",
  },
  {
    Title: "intermediate",
    Image:
      "https://mftvgiceccapzcgheaom.supabase.co/storage/v1/object/public/Workout%20Images/WorkoutLevelHeader/abs/intermediate.jpg",
  },
  {
    Title: "advanced",
    Image:
      "https://mftvgiceccapzcgheaom.supabase.co/storage/v1/object/public/Workout%20Images/WorkoutLevelHeader/abs/advanced.jpg",
  },
  {
    Title: "stretching",
    Image:
      "https://mftvgiceccapzcgheaom.supabase.co/storage/v1/object/public/Workout%20Images/WorkoutLevelHeader/abs/beginner.jpg",
  },
];

export default function WorkoutScreen() {
  const navigation = useNavigation<any>();
  const { gender } = useUser();

  const [initialLoading, setInitialLoading] = useState(true);
  const [exerciseLoading, setExerciseLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  
  const mapGenderToDB = (gender?: string) => {
  if (!gender) return null;

  const g = gender.toLowerCase();

  if (g === "female" || g === "women") return "women";
  if (g === "male" || g === "men") return "men";

  return null;
};

const dbGender = mapGenderToDB(gender);


  useEffect(() => {
  setInitialLoading(true);
  setSelectedCategory(null);
  setSelectedDifficulty(null);
  setExercises([]);

  async function reload() {
  const { data, error } = await supabase
    .from("exercises")
    .select("muscle_group")
    .eq("gender", dbGender)
    .eq("status", "active");

  console.log("APP GENDER:", gender);
console.log("DB GENDER:", dbGender);

  const unique = [
    ...new Set(
      data
        ?.map(i => i.muscle_group?.trim())
        .filter(Boolean)
    ),
  ];

  console.log("CATEGORIES:", unique);

  setCategories(unique);
  setSelectedCategory(unique[0] || null);
  setInitialLoading(false);
}



  console.log("CATEGORIES:", gender);
  reload();
}, [gender]);

  useEffect(() => {
    if (!selectedCategory || !selectedDifficulty) return;

    async function loadExercises() {
      setExerciseLoading(true);

      const { data } = await supabase
        .from("exercises")
        .select("id, exercise_name, equipment")
        .eq("gender", gender)
        .eq("muscle_group", selectedCategory)
        .eq("difficulty", selectedDifficulty)
        .eq("status", "active")
        .order("exercise_name");

      setExercises(data || []);
      setExerciseLoading(false);
    }

    loadExercises();
  }, [selectedCategory, selectedDifficulty, gender]);

  if (initialLoading) return <LoadingScreen visible />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#111" }} edges={[]}>
      {/* CATEGORY SCROLL */}
      {!selectedDifficulty && (
        <View style={{ height: 70 }}>
          <FlatList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 15,
              alignItems: "center",
            }}
            keyExtractor={(item) => item}
            renderItem={({ item }) => {
              const active = selectedCategory === item;
              return (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedCategory(item);
                    setSelectedDifficulty(null);
                  }}
                  style={{ marginRight: 12 }}
                >
                  <View
                    style={{
                      paddingHorizontal: 18,
                      paddingVertical: 8,
                      borderRadius: 15,
                      backgroundColor: active ? "#f4ff47" : "#1c1c1e",
                    }}
                  >
                    <Text
                      style={{
                        color: active ? "#000" : "#fff",
                        fontWeight: "bold",
                        fontSize:15,
                        // textTransform: "capitalize",
                      }}
                    >
                    {item}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      )}

      {/* TITLE + BACK */}
      {selectedDifficulty && (
        <View style={{ paddingHorizontal: 15, paddingBottom: 10, paddingTop:16}}>
          <TouchableOpacity onPress={() => setSelectedDifficulty(null)}>
            <Text style={{ color: "#f4ff47", fontSize: 16 }}>← Back</Text>
          </TouchableOpacity>
          <Text style={{ color: "#fff", fontSize: 22, fontWeight: "700", marginTop: 6 }}>
            {selectedCategory} • {selectedDifficulty}
          </Text>
        </View>
      )}

      {/* CONTENT */}
      {!selectedDifficulty ? (
        <FlatList
          data={DIFFICULTIES}
          keyExtractor={(item) => item.Title}
          contentContainerStyle={{
            paddingHorizontal: 15,
            paddingBottom: 150,
          }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedDifficulty(item.Title)}
              style={{
                height: 120,
                borderRadius: 18,
                marginBottom: 18,
                overflow: "hidden",
                backgroundColor: "#202020",
                justifyContent: "flex-end",
              }}
            >
              <Image
                source={{ uri: item.Image }}
                style={StyleSheet.absoluteFillObject}
              />

              <View
                style={{
                  height:"100%",
                  width:"auto",
                  padding: 20,
                  display:"flex",
                  justifyContent:"flex-end",
                  alignItems:"flex-start",
                  backgroundColor: "rgba(0,0,0,0.35)",
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 22,
                    fontWeight: "800",
                    textTransform: "capitalize",
                  }}
                >
                  {item.Title}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <FlatList
          data={exercises}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 15, paddingBottom: 120 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("ExerciseDetail", { exerciseId: item.id })
              }
              style={{
                flexDirection: "row",
                backgroundColor: "#1c1c1e",
                borderRadius: 16,
                marginBottom: 14,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: 110,
                  height: 90,
                  backgroundColor: "#000",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#f4ff47", fontSize: 22 }}>▶</Text>
              </View>

              <View style={{ flex: 1, padding: 12, justifyContent: "center" }}>
                <Text
                  style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}
                  numberOfLines={2}
                >
                  {item.exercise_name}
                </Text>

                <Text style={{ color: "#aaa", marginTop: 4, fontSize: 13 }}>
                  {item.equipment || "No equipment"}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}
