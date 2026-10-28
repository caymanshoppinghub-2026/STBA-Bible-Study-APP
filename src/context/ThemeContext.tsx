/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from "react";

/**
 * Supported Theme Modes
 */
export type ThemeMode = "light" | "dark";

/**
 * Comprehensive Theme Design Tokens
 * 
 * Provides both utility classes (Tailwind) and absolute hex/color values
 * to ensure maximum design flexibility in any component context.
 */
export interface ThemeTokens {
  bg: {
    class: string;
    hex: string;
  };
  surface: {
    class: string;
    hex: string;
  };
  surfaceAlt: {
    class: string;
    hex: string;
  };
  text: {
    class: string;
    hex: string;
  };
  textSecondary: {
    class: string;
    hex: string;
  };
  accent: {
    class: string;
    hex: string;
  };
  border: {
    class: string;
    hex: string;
  };
  shadow: {
    class: string;
  };
}

/**
 * Pre-configured Theme Configurations for Dark and Light Modes.
 * Formatted with rich, modern, eye-safe SDA Sanctuary slate/stone color schemes.
 */
export const darkThemeTokens: ThemeTokens = {
  bg: {
    class: "bg-neutral-950 text-neutral-100",
    hex: "#0a0a0a",
  },
  surface: {
    class: "bg-neutral-900 border border-neutral-800",
    hex: "#171717",
  },
  surfaceAlt: {
    class: "bg-neutral-950 border border-neutral-850",
    hex: "#0d0d0d",
  },
  text: {
    class: "text-neutral-100",
    hex: "#f5f5f5",
  },
  textSecondary: {
    class: "text-neutral-450",
    hex: "#a3a3a3",
  },
  accent: {
    class: "text-amber-500 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/15",
    hex: "#f59e0b",
  },
  border: {
    class: "border-neutral-800",
    hex: "#262626",
  },
  shadow: {
    class: "shadow-2xl shadow-black/60",
  },
};

export const lightThemeTokens: ThemeTokens = {
  bg: {
    class: "bg-stone-50 text-stone-900",
    hex: "#f5f5f4",
  },
  surface: {
    class: "bg-white border border-stone-200/80 shadow-sm",
    hex: "#ffffff",
  },
  surfaceAlt: {
    class: "bg-stone-100/50 border border-stone-200/40",
    hex: "#fafaf9",
  },
  text: {
    class: "text-stone-900",
    hex: "#1c1917",
  },
  textSecondary: {
    class: "text-stone-550",
    hex: "#78716c",
  },
  accent: {
    class: "text-amber-700 bg-amber-50 border border-amber-200/60 hover:bg-amber-100/40",
    hex: "#b45309",
  },
  border: {
    class: "border-stone-200",
    hex: "#e7e5e4",
  },
  shadow: {
    class: "shadow-md shadow-stone-200/50",
  },
};

/**
 * Theme Context Shape
 */
interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  tokens: ThemeTokens;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Theme Provider component which manages the application's active theme,
 * persists the theme selection locally, and exposes active tokens.
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme");
      if (stored === "light" || stored === "dark") {
        return stored;
      }
      const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
      return mediaQuery.matches ? "light" : "dark";
    }
    return "dark";
  });

  useEffect(() => {
    localStorage.setItem("theme", theme);
    const root = window.document.documentElement;
    root.setAttribute("data-theme", theme);
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  const tokens = theme === "dark" ? darkThemeTokens : lightThemeTokens;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, tokens }}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Dedicated Custom Hook for reading and mutating Theme values
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: "dark" as ThemeMode,
      setTheme: () => {},
      toggleTheme: () => {},
      tokens: darkThemeTokens,
    };
  }
  return context;
};

/**
 * EXAMPLE DEMONSTRATING THEME-AWARE CARD COMPONENT
 * 
 * Consume the `useTheme()` hook to seamlessly apply active theme tokens.
 */
interface ThemeCardProps {
  id?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actionElement?: React.ReactNode;
}

export const ThemeCard: React.FC<ThemeCardProps> = ({
  id,
  title,
  subtitle,
  children,
  actionElement,
}) => {
  const { tokens } = useTheme();

  return (
    <div
      id={id || `theme-card-${Date.now()}`}
      className={`rounded-2xl p-6 transition-all duration-300 ${tokens.surface.class} ${tokens.shadow.class}`}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between gap-4 pb-4 mb-4 border-b border-inherit">
        <div>
          <h4 className={`text-base font-sans font-bold tracking-tight ${tokens.text.class}`}>
            {title}
          </h4>
          {subtitle && (
            <p className={`text-[11px] font-mono uppercase tracking-wider mt-0.5 ${tokens.textSecondary.class}`}>
              {subtitle}
            </p>
          )}
        </div>
        {actionElement && <div className="shrink-0">{actionElement}</div>}
      </div>

      {/* Card Body content */}
      <div className={`text-sm leading-relaxed ${tokens.text.class}`}>
        {children}
      </div>

      {/* Inner Decorative surfaceAlt box illustrating nested contrast */}
      <div className={`mt-5 p-4 rounded-xl text-xs font-mono border ${tokens.surfaceAlt.class}`}>
        <span className="text-amber-500 font-bold">Theme Active: </span>
        <span className={tokens.textSecondary.class}>Nested sanctuary container rendering.</span>
      </div>
    </div>
  );
};
