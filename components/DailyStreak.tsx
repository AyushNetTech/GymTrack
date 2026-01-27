import React, { useEffect, useMemo, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";

/* ---------------------------------------
   Types
--------------------------------------- */
type Props = {
  currentStreak: number;
  lastActiveDate: string | null;
  loading?: boolean;
};

/* ---------------------------------------
   Helpers
--------------------------------------- */
function normalizeLocalDate(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/* ---------------------------------------
   Component
--------------------------------------- */
export default function DailyStreak({
  currentStreak,
  lastActiveDate,
  loading,
}: Props) {
  /* ---------- STREAK ---------- */
  const streak = useMemo(() => {
    return Math.min(currentStreak ?? 0, 7);
  }, [currentStreak]);

  /* ---------- FIRE ANIMATION ---------- */
  const prevStreak = useRef(streak);
  const countOpacity = useRef(new Animated.Value(0)).current;
  const todayScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    countOpacity.setValue(0);
    Animated.timing(countOpacity, {
      toValue: 1,
      duration: 300,
      delay: 150,
      useNativeDriver: true,
    }).start();
  }, [streak]);

  useEffect(() => {
  if (streak > prevStreak.current) {
    todayScale.setValue(1.8);

    Animated.spring(todayScale, {
      toValue: 1,
      friction: 6,
      tension: 200,
      useNativeDriver: true,
    }).start();
  }

  prevStreak.current = streak;
}, [streak]);


  /* ---------- CORRECT DAY LOGIC ---------- */
const today = normalizeLocalDate(new Date());

const days = useMemo(() => {
  const result: {
    date: Date;
    label: string;
    isDone: boolean;
  }[] = [];

  // how many days before today are part of the streak
  const pastDays = Math.max(streak - 1, 0);

  // start date = (today - pastDays)
  const start = new Date(today);
  start.setDate(today.getDate() - pastDays);

  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);

    const isToday = isSameDay(d, today);
    const isDone =
      d <= today && i < pastDays + 1;

    result.push({
      date: d,
      label: isToday
        ? "Today"
        : d.toLocaleDateString("en-US", { weekday: "short" }),
      isDone,
    });
  }

  return result;
}, [today, streak]);


  /* ---------- CIRCLE FILL ANIMATIONS ---------- */
  const animations = useRef(
    Array.from({ length: 7 }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    animations.forEach((anim, index) => {
      if (days[index]?.isDone) {
        Animated.timing(anim, {
          toValue: 1,
          duration: 300,
          delay: index * 120,
          useNativeDriver: false,
        }).start();
      } else {
        anim.setValue(0);
      }
    });
  }, [days]);

  /* ---------- SKELETON ---------- */
  if (loading) {
    return (
      <View style={[styles.container, { opacity: 0.4 }]}>
        <View style={styles.header}>
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonCount} />
        </View>

        <View style={styles.row}>
          {Array.from({ length: 7 }).map((_, i) => (
            <View key={i} style={styles.dayWrapper}>
              <View style={[styles.circle, { backgroundColor: "#333" }]} />
              <View style={styles.skeletonLabel} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  /* ---------- UI ---------- */
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Daily Streak</Text>

        <View style={styles.count}>
          <View style={{ position: "relative" }}>
            <View style={{ position: "relative" }}>
              <Ionicons name="flame" size={16} color="#f4ff47" />
            </View>
          </View>
          <Animated.Text style={[styles.countText, { opacity: countOpacity }]}>
            {streak} day{streak !== 1 && "s"}
          </Animated.Text>
        </View>
      </View>

      <View style={styles.row}>
        {days.map((day, index) => {
          const bg = animations[index].interpolate({
            inputRange: [0, 1],
            outputRange: ["#333", "#f4ff47"],
          });

          return (
            <View key={index} style={styles.dayWrapper}>
              <Animated.View
                style={[
                  day.label === "Today" && styles.today,
                  {
                    transform: [
                      { scale: day.label === "Today" ? todayScale : 1 },
                    ],
                  },
                ]}
              >
                <Animated.View
                  style={[
                    styles.circle,
                    { backgroundColor: bg },
                  ]}
                >
                  {day.isDone ? (
                    <Ionicons name="checkmark" size={18} color="#000" />
                  ) : (
                    <Text style={styles.dot}>•</Text>
                  )}
                </Animated.View>
              </Animated.View>
              <Text style={styles.dayText}>{day.label}</Text>
            </View>
          );
        })}

        <View style={styles.dayWrapper}>
          <View style={styles.reward}>
            <Ionicons
              name={streak === 7 ? "gift" : "gift-outline"}
              size={18}
              color="#f4ff47"
            />
          </View>
          <Text style={styles.dayText}></Text>
        </View>
      </View>
      <Text style={{color:"#afafaf", textAlign:"center", paddingTop:14}}>Complete 7 Days Streak And Get <Text style={{color:"#f4ff47"}}>Reward</Text></Text>
    </View>
  );
}

/* ---------------------------------------
   Styles (UNCHANGED)
--------------------------------------- */
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1a1a1a",
    borderRadius: 18,
    padding: 16,
    marginTop: 10,
    shadowColor: "#838383",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  count: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  countText: {
    color: "#aaa",
    fontSize: 13,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 6,
  },

  dayWrapper: {
    alignItems: "center",
    width: 36,
  },

  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },

  today: {
    shadowRadius: 30,
    // borderWidth: 2,
    // borderColor: "#f4ff47",
    shadowColor: "#f4ff47",
    shadowOpacity: 0.8,
    elevation: 4,
  },

  dot: {
    color: "#777",
    fontSize: 14,
  },

  dayText: {
    color: "#999",
    fontSize: 11,
    marginTop: 6,
    fontWeight: "600",
  },

  skeletonTitle: {
    width: 100,
    height: 16,
    backgroundColor: "#333",
    borderRadius: 6,
  },
  skeletonCount: {
    width: 60,
    height: 14,
    backgroundColor: "#333",
    borderRadius: 6,
  },
  skeletonLabel: {
    width: 24,
    height: 10,
    backgroundColor: "#333",
    marginTop: 6,
    borderRadius: 4,
  },

  reward: {
    marginLeft: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#222",
    justifyContent: "center",
    alignItems: "center",
  },
});
