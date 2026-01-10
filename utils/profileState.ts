import AsyncStorage from "@react-native-async-storage/async-storage";

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
