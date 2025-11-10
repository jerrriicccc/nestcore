import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";

interface TitleContextType {
  section: string;
  setTitle: (section: string, mode?: string) => void;
  setExplicitTitle: (title: string) => void;
}

const TitleContext = createContext<TitleContextType | undefined>(undefined);

export function TitleProvider({ children }: { children: ReactNode }) {
  const [section, setSection] = useState("PAWS & PALS");
  const [explicitTitle, setExplicitTitle] = useState<string | null>(null);
  const location = useLocation();
  const { mode } = useParams<{ mode?: string }>();

  const capitalizeWords = (str: string) => str.replace(/\b\w/g, (char) => char.toUpperCase());

  const setTitle = (newSection: string, newMode?: string) => {
    setSection(newSection);
    const fullTitle = newMode ? `NEST CORE | ${newSection} | ${capitalizeWords(newMode)}` : `NEST CORE | ${newSection}`;
    document.title = fullTitle;
  };

  const updateTitleFromPath = () => {
    if (explicitTitle) {
      document.title = `NEST CORE | ${explicitTitle}`;
      return;
    }

    const pathParts = location.pathname.split("/").filter(Boolean);
    const sectionFromPath = pathParts[0] || "Dashboard";
    const modeFromPath = pathParts[1];

    const sectionTitle = capitalizeWords(sectionFromPath.replace("-", " "));
    const modeTitle = modeFromPath ? capitalizeWords(modeFromPath) : "";

    setTitle(sectionTitle, modeTitle);
  };

  useEffect(() => {
    updateTitleFromPath();
  }, [location, explicitTitle]);

  return <TitleContext.Provider value={{ section, setTitle, setExplicitTitle }}>{children}</TitleContext.Provider>;
}

export function useTitle() {
  const context = useContext(TitleContext);
  if (!context) {
    throw new Error("useTitle must be used within a TitleProvider");
  }
  return context;
}
