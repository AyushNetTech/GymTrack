import React, { createContext, useContext, useState } from "react";
import { Text } from "react-native";
import { Snackbar } from "react-native-paper";

const ToastContext = createContext({
  showToast: (msg: string) => {},
});

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: any) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");

  const showToast = (msg: string) => {
    setMessage(msg);
    setVisible(true);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={1500}
        style={{
          backgroundColor: "rgba(29, 185, 84, 0.95)",
          borderRadius: 14,
          marginBottom: 120,
          marginRight:30,
          marginLeft:30
        }}
      >
        <Text style={{ color: "white", fontWeight: "600" }}>
          {message}
        </Text>
      </Snackbar>
    </ToastContext.Provider>
  );
}
