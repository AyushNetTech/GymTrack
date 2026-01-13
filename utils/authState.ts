import AsyncStorage from "@react-native-async-storage/async-storage";

const INTRO_KEY = "INTRO_COMPLETED";

export const markIntroCompleted = async () => {
  await AsyncStorage.setItem(INTRO_KEY, "true");
};

export const hasCompletedIntro = async (): Promise<boolean> => {
  return (await AsyncStorage.getItem(INTRO_KEY)) === "true";
};

