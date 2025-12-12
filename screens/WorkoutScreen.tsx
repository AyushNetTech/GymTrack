import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  Dimensions,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LoadingScreen from "../components/LoadingScreen"; // your existing loader

const { width } = Dimensions.get("window");

const categories = ["Full Body", "Cardio", "Chest", "Stretching", "Strength"];

const workouts = [
  { id: "1", title: "10-Min HIIT Cardio", duration: "22 min", img: "https://picsum.photos/400/600?1" },
  { id: "2", title: "Cycling Sprint Routine", duration: "20 min", img: "https://picsum.photos/400/600?2" },
  { id: "3", title: "Bodyweight Burn", duration: "18 min", img: "https://picsum.photos/400/600?3" },
  { id: "4", title: "Yoga Flex Flow", duration: "25 min", img: "https://picsum.photos/400/600?4" },
];

export default function WorkoutScreen() {
  const [selectedCategory, setSelectedCategory] = useState("Cardio");
  const [loading, setLoading] = useState(true);

  // Simulate loading for demonstration
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500); // simulate 1.5s loading
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <LoadingScreen visible={true} />; // full-screen loader

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }} edges={[]}>
      {/* ---------- HEADER IMAGE ---------- */}
      <View
        style={{
          width: "100%",
          height: 260,
          position: "absolute",
          top: 0,
          zIndex: 10,
        }}
      >
        <Image
          source={{
            uri: "https://mftvgiceccapzcgheaom.supabase.co/storage/v1/object/public/Workout%20Images/HeaderWorkoutScreen.jpg",
          }}
          style={{ width: "100%", height: "100%", opacity: 0.7 }}
        />
        <View style={{ position: "absolute", bottom: 20, right: 20 }}>
          <Text style={{ color: "#fff", fontSize: 14, opacity: 0.8 }}>
            Friday, 19 July
          </Text>
          <Text style={{ color: "#fff", fontSize: 32, fontWeight: "700" }}>
            Workouts
          </Text>
        </View>
      </View>

      {/* ---------- HORIZONTAL CATEGORY BAR ---------- */}
      <View
        style={{
          width: "100%",
          backgroundColor: "#000",
          position: "absolute",
          top: 260,
          zIndex: 10,
          paddingVertical: 12,
        }}
      >
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 15 }}
          keyExtractor={(item) => item}
          renderItem={({ item }) => {
            const active = selectedCategory === item;
            return (
              <TouchableOpacity onPress={() => setSelectedCategory(item)}>
                <View
                  style={{
                    paddingHorizontal: 18,
                    paddingVertical: 10,
                    borderRadius: 20,
                    backgroundColor: active ? "#f4ff47" : "#1c1c1e",
                    marginRight: 10,
                  }}
                >
                  <Text
                    style={{
                      color: active ? "#000" : "#fff",
                      fontSize: 14,
                      fontWeight: active ? "700" : "400",
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

      {/* ---------- SCROLLING WORKOUT GRID ---------- */}
      <FlatList
        data={workouts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        style={{ flex: 1, marginTop: 260 + 60 }} // push list below header & categories
        contentContainerStyle={{
          paddingHorizontal: 15,
          paddingBottom: 200,
          paddingTop: 10,
        }}
        columnWrapperStyle={{
          justifyContent: "space-between",
          marginBottom: 20,
        }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              width: (width - 45) / 2,
              backgroundColor: "#111",
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            <Image
              source={{ uri: item.img }}
              style={{ width: "100%", height: 160 }}
            />
            <View style={{ padding: 10 }}>
              <Text style={{ color: "#fff", fontWeight: "700" }}>
                {item.title}
              </Text>
              <Text style={{ color: "#aaa", marginTop: 2 }}>
                {item.duration} Beginner
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
