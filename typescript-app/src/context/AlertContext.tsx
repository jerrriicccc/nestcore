import React, { createContext, useContext, useState, ReactNode } from "react";

type AlertSeverity = "success" | "error" | "warning" | "info";

interface AlertMessage {
  severity: AlertSeverity;
  title: string;
  message: string;
  key?: number;
}

interface AlertContextType {
  alert: AlertMessage | null;
  setAlert: (alert: AlertMessage | null) => void;
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
  const [alert, setAlert] = useState<AlertMessage | null>(null);

  return <AlertContext.Provider value={{ alert, setAlert }}>{children}</AlertContext.Provider>;
};
