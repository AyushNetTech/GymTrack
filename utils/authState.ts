import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "AUTH_STARTED";
const VERIFY_KEY = "SHOW_VERIFY_DIALOG";
const INTRO_KEY = "INTRO_COMPLETED";


export const markAuthStarted = async () => {
  await AsyncStorage.multiSet([
    [KEY, "true"],
    [VERIFY_KEY, "true"],
  ]);
};

export const hasAuthStarted = async (): Promise<boolean> => {
  return (await AsyncStorage.getItem(KEY)) === "true";
};

export const shouldShowVerifyDialog = async (): Promise<boolean> => {
  return (await AsyncStorage.getItem(VERIFY_KEY)) === "true";
};

export const clearAuthStarted = async () => {
  await AsyncStorage.multiRemove([KEY, VERIFY_KEY]);
};

export const markIntroCompleted = async () => {
  await AsyncStorage.setItem(INTRO_KEY, "true");
};

export const hasCompletedIntro = async (): Promise<boolean> => {
  return (await AsyncStorage.getItem(INTRO_KEY)) === "true";
};

