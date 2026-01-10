import { createContext } from "react";

export const AuthContext = createContext<{
  setAuthStarted: (v: boolean) => void;
} | null>(null);
