import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../lib/supabase";

const PROFILE_DONE_KEY = "PROFILE_COMPLETED";

export const markProfileCompleted = async () => {
  await AsyncStorage.setItem(PROFILE_DONE_KEY, "true");
};

export const hasCompletedProfile = async () => {
  return (await AsyncStorage.getItem(PROFILE_DONE_KEY)) === "true";
};

export const clearProfileCompleted = async () => {
  await AsyncStorage.removeItem(PROFILE_DONE_KEY);
};

// 🔥 NEW: check Supabase first
export const checkProfileCompletion = async (userId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.log("Profile check error:", error.message);
    return false;
  }

  const completed = !!data;

  // ✅ Sync local cache
  if (completed) {
    await markProfileCompleted();
  } else {
    await clearProfileCompleted();
  }

  return completed;
};