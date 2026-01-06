import React, { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from "react";

type AlertSeverity = "success" | "error" | "warning" | "info";

interface AlertMessage {
  severity: AlertSeverity;
  title: string;
  message: string;
  key?: number;
}

interface AlertContextType {
  alertMessage: AlertMessage | null;
  setAlertMessage: Dispatch<SetStateAction<AlertMessage | null>>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
};

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [alertMessage, setAlertMessage] = useState<AlertMessage | null>(null);

  return <AlertContext.Provider value={{ alertMessage, setAlertMessage }}>{children}</AlertContext.Provider>;
};
