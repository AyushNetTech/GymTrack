import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";
import { useNavigation } from "@react-navigation/native";
import LoadingScreen from "../components/LoadingScreen"; // <-- import your LoadingScreen

const { width } = Dimensions.get("window");

type Category = { id: string; name: string; description?: string; image_url?: string };
type Exercise = { id: string; category_id: string; name: string };

export default function AddWorkoutScreen() {
  const navigation = useNavigation<any>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true); // <-- full screen loading

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("workout_categories")
      .select("*")
      .order("name");
    if (error) console.log(error.message);
    else setCategories(data as Category[]);
    setLoading(false);
  };

  const fetchExercises = async (categoryId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("workouts")
      .select("*")
      .eq("category_id", categoryId)
      .order("name");
    if (error) console.log(error.message);
    else setExercises(data as Exercise[]);
    setLoading(false);
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    fetchExercises(category.id);
  };

  const handleExercisePress = (exercise: Exercise) => {
    navigation.navigate("ExerciseDetails", { exercise });
  };

  if (loading) return <LoadingScreen visible={true} />; // <-- use LoadingScreen here

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Select Category</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 15 }}
      >
        {categories.map((cat: Category) => (
          <TouchableOpacity
            key={cat.id}
            style={styles.categoryCardWrapper}
            onPress={() => handleCategorySelect(cat)}
          >
            <ImageBackground
              source={{ uri: cat.image_url || "https://via.placeholder.com/300x100.png" }}
              style={styles.categoryCard}
              imageStyle={{ borderRadius: 12 }}
            >
              <View style={styles.categoryOverlay}>
                <Text style={styles.categoryText}>{cat.name}</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedCategory && (
        <>
          <Text style={[styles.heading, { marginTop: 25 }]}>Select Exercise</Text>
          <ScrollView
            contentContainerStyle={{
              flexDirection: "row",
              flexWrap: "wrap",
              paddingBottom: 150, // keep above tab bar
              paddingHorizontal: 10,
            }}
          >
            {exercises.map((ex: Exercise) => (
              <TouchableOpacity
                key={ex.id}
                style={styles.exerciseButton}
                onPress={() => handleExercisePress(ex)}
              >
                <Text style={styles.exerciseText}>{ex.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
}

const CARD_WIDTH = width * 0.35; // slightly smaller card
const CARD_HEIGHT = 90;
const EXERCISE_WIDTH = width * 0.42;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", paddingTop: 20 },
  heading: { color: "#d0ff2a", fontSize: 20, fontWeight: "bold", marginBottom: 12, marginLeft: 15 },

  categoryCardWrapper: { marginRight: 15, marginBottom: 20 },
  categoryCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  categoryOverlay: {
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  categoryText: { color: "#fff", fontWeight: "bold", fontSize: 14, textAlign: "center" },

  exerciseButton: {
    width: EXERCISE_WIDTH,
    height: 50,
    margin: 8,
    borderRadius: 12,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#d0ff2a",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  exerciseText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
