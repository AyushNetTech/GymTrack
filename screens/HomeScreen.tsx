import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { emitter } from "../lib/emitter";
import { SafeAreaView } from "react-native-safe-area-context";



export default function HomeScreen({
  onReady,
}: {
  onReady?: () => void;
}) {
  const [weekDates, setWeekDates] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);


  const defaultAvatar = require("../assets/blankprofile.png"); // fallback

  useEffect(() => {
    generateWeek();
    loadProfile();

    const listener = (newAvatarUrl: string) => {
      setProfile((prev: any) => ({
        ...prev,
        avatar_url: newAvatarUrl,
      }));
    };

    emitter.on("profileUpdated", listener);
    return () => {
      emitter.off("profileUpdated", listener);
    };
  }, []);

  async function loadProfile() {
  try {
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) return;

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    setProfile(profileData ?? null);
  } catch (e) {
    console.log(e);
  } finally {
    onReady?.(); // ✅ THIS is the magic
  }
}

  const generateWeek = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const startOfWeek = new Date(today);
    const diff = currentDay === 0 ? -6 : 1 - currentDay;
    startOfWeek.setDate(today.getDate() + diff);

    let arr: any[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);

      arr.push({
        day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
        date: date.getDate(),
        isToday: date.toDateString() === today.toDateString(),
      });
    }
    setWeekDates(arr);
  };

  const graphHeights = [35, 45, 30, 60, 55, 50, 40];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "black" }} edges={[]}>
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.fixedHeader}>
        <View style={styles.headerRow}>
          <View style={styles.info}>
            <Image
              source={profile?.avatar_url ? { uri: profile.avatar_url } : defaultAvatar}
              style={styles.avatar}
              onError={() => {
                console.log("Image failed to load, falling back to default");
                setProfile((prev: any) => ({ ...prev, avatar_url: null }));
              }}
            />

            <View>
              <Text style={styles.username}>
                Hi, {profile?.first_name || "User"}
              </Text>
              <Text style={styles.welcome}>Welcome Back!</Text>
            </View>
          </View>

          <Ionicons name="notifications-outline" size={24} color="#fff" />
        </View>

        {/* WEEK ROW */}
        <View style={styles.weekRow}>
          {weekDates.map((item, index) => (
            <View key={index} style={styles.weekItem}>
              {item.isToday ? (
                <View style={styles.todayWrapper}>
                  <Text style={styles.todayDay}>{item.day}</Text>
                  <Text style={styles.todayDate}>{item.date}</Text>
                </View>
              ) : (
                <>
                  <Text style={styles.weekDay}>{item.day}</Text>
                  <Text style={styles.weekDate}>{item.date}</Text>
                </>
              )}

            </View>
          ))}
        </View>

      </View>

      {/* SCROLL CONTENT */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={{ paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Everything below is EXACTLY your UI unchanged */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>

        <View style={styles.activityContainer}>
          <View style={styles.stepsCard}>
            <View style={styles.stepsHeader}>
              <Ionicons name="walk-outline" size={18} color="#f4ff47" />
              <Text style={styles.stepsTitle}>Steps</Text>
            </View>

            <Text style={styles.stepsCount}>3246 steps</Text>
            <Text style={styles.stepsSub}>2.51 km | 123.24 kcal</Text>

            <View style={styles.graphRow}>
              {graphHeights.map((h, idx) => (
                <View key={idx} style={styles.graphBarContainer}>
                  <View style={[styles.graphBar, { height: h }]} />
                  <Text style={styles.graphLabel}>
                    {["M", "T", "W", "T", "F", "S", "S"][idx]}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.rowCards}>
            <View style={styles.smallCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="flame-outline" size={18} color="#ff4d4d" />
                <Text style={styles.cardTitle}>Calories</Text>
              </View>
              <Text style={styles.cardValue}>124 kcal</Text>

              <View style={styles.ringContainer}>
                <View style={[styles.ringBase, { borderColor: "#2a2a2a" }]} />
                <View
                  style={[styles.ringProgress, { borderColor: "#ff4d4d" }]}
                />
              </View>
            </View>

            <View style={styles.smallCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="time-outline" size={18} color="#4d7dff" />
                <Text style={styles.cardTitle}>Durations</Text>
              </View>
              <Text style={styles.cardValue}>120 kcal</Text>

              <View style={styles.ringContainer}>
                <View style={[styles.ringBase, { borderColor: "#2a2a2a" }]} />
                <View
                  style={[styles.ringProgressBlue, { borderColor: "#4d7dff" }]}
                />
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Trending Workout</Text>

        <View style={styles.trendingRow}>
          <View style={styles.workoutCard}>
            <Image
              source={require("../assets/workout1.jpg")}
              style={styles.workoutImg}
            />
            <Text style={styles.workoutTitle}>Lunges Workout</Text>
          </View>

          <View style={styles.workoutCard}>
            <Image
              source={require("../assets/workout2.jpg")}
              style={styles.workoutImg}
            />
            <Text style={styles.workoutTitle}>Gym Strength</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111" },

  fixedHeader: {
  paddingHorizontal: 20,
  paddingTop: 50,     // FIXED — no more extra gap
  paddingBottom: 10,
  backgroundColor: "#111",
},


  scrollArea: {
    flex: 1,
    paddingHorizontal: 20,
  },

  info: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: "#222",
  },

  username: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },

  welcome: {
    color: "#aaa",
    marginTop: 3,
    fontSize: 13,
  },


  dateBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  dateBubbleActive: {
    backgroundColor: "#f4ff47",
  },

  dateText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  dateTextActive: {
    color: "#000",
  },

  sectionTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 10,
    marginBottom: 10,
  },

  activityContainer: {},

  stepsCard: {
    backgroundColor: "#1a1a1a",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },

  stepsHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  stepsTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 6,
  },

  stepsCount: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 8,
  },

  stepsSub: {
    color: "#777",
    fontSize: 12,
    marginBottom: 12,
  },

  graphRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },

  graphBarContainer: { alignItems: "center" },

  graphBar: {
    width: 12,
    backgroundColor: "#f4ff47",
    borderRadius: 6,
  },

  graphLabel: {
    color: "#888",
    fontSize: 10,
    marginTop: 3,
  },

  rowCards: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  smallCard: {
    width: "48%",
    backgroundColor: "#1a1a1a",
    padding: 16,
    borderRadius: 16,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  cardTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 6,
  },

  cardValue: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 8,
  },

  ringContainer: {
    marginTop: 10,
    width: 60,
    height: 60,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
  },

  ringBase: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 6,
    opacity: 0.2,
  },

  ringProgress: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 6,
    borderRightColor: "transparent",
    borderBottomColor: "transparent",
    transform: [{ rotate: "45deg" }],
  },

  ringProgressBlue: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 6,
    borderRightColor: "transparent",
    borderBottomColor: "transparent",
    transform: [{ rotate: "45deg" }],
  },

  trendingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  workoutCard: {
    width: "48%",
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    overflow: "hidden",
  },

  workoutImg: {
    width: "100%",
    height: 120,
  },

  workoutTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    padding: 10,
  },
  todayBox: {
  backgroundColor: "#f4ff47",
  paddingHorizontal: 14,
  paddingVertical: 8,
  borderRadius: 14,
},

todayText: {
  color: "#000",
  fontSize: 14,
  fontWeight: "700",
},

weekRow: {
  flexDirection: "row",
  justifyContent: "space-around",   // better spacing than space-between
  marginTop: 20,
  height: 60,
  alignItems:"center",
  backgroundColor:"#272727",
  borderRadius:16,
},

weekItem: {
  alignItems: "center",
  width: 45,                        // makes items wider & more balanced
},

weekDay: {
  color: "#999",
  fontSize: 14,
  marginBottom: 5,
},

weekDate: {
  color: "#fff",
  fontSize: 16,
  fontWeight: "700",
},

todayWrapper: {
  width: 48,                        // was 36 → bigger
  height: 60,                       // was 48 → taller
  backgroundColor: "#f4ff47",
  borderRadius: 16,                 // smoother rounded rectangle
  justifyContent: "center",
  alignItems: "center",
},

todayDay: {
  color: "#000",
  fontSize: 14,
  fontWeight: "700",
  marginBottom: 4,
},

todayDate: {
  color: "#000",
  fontSize: 16,
  fontWeight: "800",
},

});
