/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from "react";

interface SabbathModeContextType {
  sabbathMode: boolean;
  manualOverride: boolean;
  toggleManualOverride: () => void;
  isAutomaticSabbathTime: boolean;
}

const SabbathModeContext = createContext<SabbathModeContextType | undefined>(undefined);

export const isSabbathTimeCheck = (): boolean => {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 5 = Friday, 6 = Saturday
  const hour = now.getHours();

  // Friday sunset begins approximately at 6:00 PM (18:00) local time
  if (day === 5 && hour >= 18) {
    return true;
  }
  // Saturday until sunset at 6:00 PM (18:00) local time
  if (day === 6 && hour < 18) {
    return true;
  }
  return false;
};

export const SabbathModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [manualOverride, setManualOverride] = useState<boolean>(() => {
    const saved = localStorage.getItem("stba_manual_override");
    return saved === "true";
  });

  const [isAutomaticSabbathTime, setIsAutomaticSabbathTime] = useState<boolean>(isSabbathTimeCheck());

  // Periodically update the automatic time-based calculation
  useEffect(() => {
    const timer = setInterval(() => {
      setIsAutomaticSabbathTime(isSabbathTimeCheck());
    }, 30000); // Check every 30 seconds

    return () => clearInterval(timer);
  }, []);

  const sabbathMode = isAutomaticSabbathTime || manualOverride;

  const toggleManualOverride = () => {
    setManualOverride((prev) => {
      const next = !prev;
      localStorage.setItem("stba_manual_override", String(next));
      return next;
    });
  };

  // Dispatch custom events and log on activations
  useEffect(() => {
    if (sabbathMode) {
      const event = new CustomEvent("sabbath-start");
      window.dispatchEvent(event);
      console.log("Sabbath Mode activated");
    }
  }, [sabbathMode]);

  return (
    <SabbathModeContext.Provider
      value={{
        sabbathMode,
        manualOverride,
        toggleManualOverride,
        isAutomaticSabbathTime
      }}
    >
      {children}
    </SabbathModeContext.Provider>
  );
};

export const useSabbathMode = (): SabbathModeContextType => {
  const context = useContext(SabbathModeContext);
  if (!context) {
    throw new Error("useSabbathMode must be used within a SabbathModeProvider");
  }
  return context;
};
