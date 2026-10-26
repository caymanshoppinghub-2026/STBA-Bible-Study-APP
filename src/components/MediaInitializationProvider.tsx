/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { createContext, useContext, useState, useEffect } from "react";

interface MediaInitializationContextType {
  isMediaInitialized: boolean;
  initializeMedia: () => void;
}

const MediaInitializationContext = createContext<MediaInitializationContextType | undefined>(undefined);

export const MediaInitializationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMediaInitialized, setIsMediaInitialized] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("stba_media_initialized") === "true";
    }
    return false;
  });

  const initializeMedia = () => {
    if (isMediaInitialized) return;
    setIsMediaInitialized(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("stba_media_initialized", "true");
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        try {
          const tempCtx = new AudioContextClass();
          if (tempCtx.state === "suspended") {
            tempCtx.resume();
          }
        } catch (e) {
          console.warn("Warming up AudioContext failed in user click handler:", e);
        }
      }
    }
  };

  // Automatically initialize on any user interaction with the window
  useEffect(() => {
    if (isMediaInitialized) return;
    const handleFirstInteraction = () => {
      initializeMedia();
      cleanup();
    };
    const cleanup = () => {
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
    };
    window.addEventListener("click", handleFirstInteraction);
    window.addEventListener("keydown", handleFirstInteraction);
    window.addEventListener("touchstart", handleFirstInteraction);
    return cleanup;
  }, [isMediaInitialized]);

  return (
    <MediaInitializationContext.Provider value={{ isMediaInitialized, initializeMedia }}>
      {children}
    </MediaInitializationContext.Provider>
  );
};

export const useMediaInitialization = () => {
  const context = useContext(MediaInitializationContext);
  if (!context) {
    throw new Error("useMediaInitialization must be used within a MediaInitializationProvider");
  }
  return context;
};

interface StartupSafetyWrapperProps {
  children: React.ReactNode;
}

/**
 * StartupSafetyWrapper Component
 * Renders an elegant lightweight loader instantly to allow first paint,
 * delaying mounting/rendering of the full layout tree until after the browser is ready.
 */
export const StartupSafetyWrapper: React.FC<StartupSafetyWrapperProps> = ({ children }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-stone-50 font-sans text-stone-700">
        <div className="flex flex-col items-center space-y-4 max-w-sm px-6 text-center">
          <div className="w-10 h-10 rounded-full border-4 border-stone-200 border-t-teal-600 animate-spin" />
          <h2 className="font-serif font-black tracking-tight text-xl text-stone-900">Study To Be Approved</h2>
          <p className="text-xs text-stone-500 font-mono tracking-wider uppercase">
            Entering Scripture Sanctuary...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
