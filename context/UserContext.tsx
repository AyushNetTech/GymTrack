import React, { createContext, useContext, useState } from "react";

type UserContextType = {
  gender: "men" | "women";
  setGender: (gender: "men" | "women") => void;
};

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [gender, setGender] = useState<"men" | "women">("men");

  return (
    <UserContext.Provider value={{ gender, setGender }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside UserProvider");
  return ctx;
};
