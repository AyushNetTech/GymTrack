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
import LoadingScreen from "../components/LoadingScreen";

const { width } = Dimensions.get("window");

type Category = { id: string; name: string; description?: string; image_url?: string };
type Exercise = { id: string; category_id: string; name: string };

export default function AddWorkoutScreen() {
  const navigation = useNavigation<any>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingExercises, setLoadingExercises] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoadingCategories(true);

    const { data, error } = await supabase
      .from("workout_categories")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.log("Error fetching categories:", error.message);
      setLoadingCategories(false);
      return;
    }

    setCategories(data as Category[]);

    // Automatically select the first category (e.g., Chest) and fetch its exercises
    if (data && data.length > 0) {
      const initialCategory = data[0]; // could filter by name if you want exact "Chest"
      setSelectedCategory(initialCategory);
      fetchExercises(initialCategory.id);
    }

    setLoadingCategories(false);
  };

  const fetchExercises = async (categoryId: string) => {
    setLoadingExercises(true);

    const { data, error } = await supabase
      .from("workouts")
      .select("*")
      .eq("category_id", categoryId)
      .order("name");

    if (error) {
      console.log("Error fetching exercises:", error.message);
      setLoadingExercises(false);
      return;
    }

    setExercises(data as Exercise[]);
    setLoadingExercises(false);
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    fetchExercises(category.id);
  };

  const handleExercisePress = (exercise: Exercise) => {
    navigation.navigate("ExerciseDetails", { exercise });
  };

  // Show LoadingScreen only while **categories are loading**
  if (loadingCategories) return <LoadingScreen visible={true} />;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Select Category</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 15 }}
      >
        {categories.map((cat: Category) => {
          const isSelected = selectedCategory?.id === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              onPress={() => handleCategorySelect(cat)}
              activeOpacity={0.9}
            >
              <View
                style={[
                  styles.categoryCardWrapper,
                  isSelected && styles.selectedCategoryWrapper,
                ]}
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
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {selectedCategory && (
        <>
          <Text style={[styles.heading, { marginTop: 25 }]}>Select Exercise</Text>

          {loadingExercises ? (
            <LoadingScreen visible={true} /> // show loader while exercises load
          ) : (
            <ScrollView
              contentContainerStyle={{
                flexDirection: "row",
                flexWrap: "wrap",
                paddingBottom: 150,
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
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const CARD_WIDTH = width * 0.35;
const CARD_HEIGHT = 90;
const EXERCISE_WIDTH = width * 0.42;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", paddingTop: 20 },
  heading: { color: "#d0ff2a", fontSize: 20, fontWeight: "bold", marginBottom: 12, marginLeft: 15 },

  categoryCardWrapper: {
    marginRight: 15,
    marginBottom: 40,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 0,
    borderColor: "transparent",
  },
  selectedCategoryWrapper: {
    borderWidth: 2,
    borderColor: "#d0ff2a",
    borderRadius: 12,
  },
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
    height: 60,
    margin: 8,
    borderRadius: 12,
    backgroundColor: "#202020ff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#d0ff2a",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  exerciseText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 10,
  },
});
