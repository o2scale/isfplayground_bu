import React, { createContext, useContext, useState, useEffect } from "react";
import { getWtfSettings } from "../api";

const WtfBackgroundContext = createContext();

export const useWtfBackground = () => {
  const context = useContext(WtfBackgroundContext);
  if (!context) {
    throw new Error(
      "useWtfBackground must be used within a WtfBackgroundProvider"
    );
  }
  return context;
};

export const WtfBackgroundProvider = ({ children }) => {
  const [backgroundSettings, setBackgroundSettings] = useState({
    backgroundType: "color",
    backgroundColor: "#f8fafc",
    backgroundImage: null,
    isLoading: true,
    error: null,
  });

  const fetchBackgroundSettings = async () => {
    try {
      setBackgroundSettings((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));
      const response = await getWtfSettings();
      const settings = response.data;

      setBackgroundSettings({
        backgroundType: settings.backgroundType || "color",
        backgroundColor: settings.backgroundColor || "#f8fafc",
        backgroundImage: settings.backgroundImage || null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error fetching WTF background settings:", error);
      setBackgroundSettings((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to load background settings",
      }));
    }
  };

  const updateBackgroundSettings = (newSettings) => {
    setBackgroundSettings((prev) => ({
      ...prev,
      backgroundType: newSettings.backgroundType,
      backgroundColor: newSettings.backgroundColor,
      backgroundImage: newSettings.backgroundImage,
    }));
  };

  const getBackgroundStyle = () => {
    if (
      backgroundSettings.backgroundType === "image" &&
      backgroundSettings.backgroundImage
    ) {
      return {
        backgroundImage: `url(${backgroundSettings.backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      };
    } else {
      return {
        backgroundColor: backgroundSettings.backgroundColor,
      };
    }
  };

  useEffect(() => {
    fetchBackgroundSettings();
  }, []);

  const value = {
    backgroundSettings,
    updateBackgroundSettings,
    refreshBackgroundSettings: fetchBackgroundSettings,
    getBackgroundStyle,
  };

  return (
    <WtfBackgroundContext.Provider value={value}>
      {children}
    </WtfBackgroundContext.Provider>
  );
};

export default WtfBackgroundContext;
