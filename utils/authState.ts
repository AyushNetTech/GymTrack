import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "AUTH_STARTED";

export const markAuthStarted = async () => {
  await AsyncStorage.setItem(KEY, "true");
};

export const hasAuthStarted = async (): Promise<boolean> => {
  const value = await AsyncStorage.getItem(KEY);
  return value === "true";
};
