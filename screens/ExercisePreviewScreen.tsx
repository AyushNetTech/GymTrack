import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { VideoView, useVideoPlayer } from "expo-video";
import { supabase } from "../lib/supabase";
import LoadingScreen from "../components/LoadingScreen";
import { useRoute, useNavigation } from "@react-navigation/native";
import WorkoutHeader, { HEADER_HEIGHT } from "../components/WorkoutHeader";

const R2_BASE_URL =
  "https://pub-df2239b39e864531a0e2248637235dab.r2.dev";

export default function ExercisePreviewScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { exerciseId } = route.params;

  const [loading, setLoading] = useState(true);
  const [exercise, setExercise] = useState<any>(null);
  const [videoReady, setVideoReady] = useState(false);

  // ✅ Player init (mute, loop, autoplay)
  const player = useVideoPlayer(null, (player) => {
    player.volume = 0;
    player.loop = true;
    player.muted = true;
    player.play();
  });

  useEffect(() => {
    async function loadExercise() {
      const { data } = await supabase
        .from("exercises")
        .select("*")
        .eq("id", exerciseId)
        .single();

      setExercise(data);
      setLoading(false);
    }

    loadExercise();
  }, [exerciseId]);

  useEffect(() => {
    if (!exercise?.video_path || !player) return;

    let mounted = true;

    const loadVideo = async () => {
      try {
        const videoUrl = `${R2_BASE_URL}/${exercise.video_path}`;
        await player.replaceAsync(videoUrl);
        if (mounted) setVideoReady(true);
      } catch (e) {
        console.warn("Video load failed", e);
      }
    };

    loadVideo();

    // ❌ DO NOT pause / stop / release here
    return () => {
      mounted = false;
    };
  }, [exercise, player]);

  if (loading || !exercise) return <LoadingScreen visible />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#111" }} edges={[]}>
      {/* TITLE */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: "#f4ff47", fontSize: 16, fontWeight:900 }}>← Back</Text>
        </TouchableOpacity>

        <Text style={{ color: "#aaa", marginTop: 6 }}>
          {exercise.muscle_group} • {exercise.difficulty}
        </Text>

        <Text style={{ color: "#fff", fontSize: 24, fontWeight: "700", marginTop: 4 }}>
          {exercise.exercise_name}
        </Text>
      </View>

      {/* CONTENT */}
      <ScrollView contentContainerStyle={{ paddingBottom: 150, paddingHorizontal: 16 }}>
        {/* VIDEO */}
          <View
            style={{
              marginTop: 14,
              height: 200,
              borderRadius: 16,
              overflow: "hidden",
              backgroundColor: "#fff",
              borderWidth: 2,
              borderColor: "#222",
            }}
            pointerEvents="none" // 🔒 disables ALL touch interaction
          >
            {!videoReady && (
              <View
                style={{
                  ...StyleSheet.absoluteFillObject,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#000", fontSize: 12, letterSpacing: 1 }}>
                  LOADING VIDEO
                </Text>
              </View>
            )}

            <VideoView
              style={{ width: "100%", height: "100%" }}
              player={player}
              nativeControls={false}
              fullscreenOptions={{ enable: false }}
            />
          </View>
        {/* EQUIPMENT */}
        <Text style={{ color: "#fff", fontSize: 18, fontWeight: "600", marginTop: 22 }}>
          Equipment
        </Text>
        <Text style={{ color: "#ccc", marginTop: 6 }}>
          {exercise.equipment || "No equipment required"}
        </Text>

        {/* INSTRUCTIONS */}
        <Text style={{ color: "#fff", fontSize: 18, fontWeight: "600", marginTop: 24 }}>
          Instructions
        </Text>
        <Text style={{ color: "#ccc", marginTop: 8, lineHeight: 24 }}>
          {exercise.instructions || "Instructions will be added soon."}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
