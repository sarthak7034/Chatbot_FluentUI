import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  ThemeMode,
  ThemeContextValue,
  ThemeProviderProps,
} from "../types/theme";
import { themes } from "../utils/themes";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = "chatbot-theme-preference";

// Hook to detect system theme preference
const useSystemTheme = (): boolean => {
  const [isSystemDark, setIsSystemDark] = useState<boolean>(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      setIsSystemDark(e.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
    // Legacy browsers (fallback)
    else {
      // For very old browsers, we'll just use the initial value
      console.warn(
        "MediaQueryList.addEventListener not supported, theme detection may not work properly"
      );
    }
  }, []);

  return isSystemDark;
};

// Hook to manage localStorage persistence
const useThemeStorage = (storageKey: string, defaultTheme: ThemeMode) => {
  const [storedTheme, setStoredTheme] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") {
      return defaultTheme;
    }

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored && ["light", "dark", "auto"].includes(stored)) {
        return stored as ThemeMode;
      }
    } catch (error) {
      console.warn("Failed to read theme from localStorage:", error);
    }

    return defaultTheme;
  });

  const updateStoredTheme = useCallback(
    (theme: ThemeMode) => {
      setStoredTheme(theme);

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(storageKey, theme);
        } catch (error) {
          console.warn("Failed to save theme to localStorage:", error);
        }
      }
    },
    [storageKey]
  );

  return [storedTheme, updateStoredTheme] as const;
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = "auto",
  storageKey = THEME_STORAGE_KEY,
}) => {
  const isSystemDark = useSystemTheme();
  const [themeMode, setThemeMode] = useThemeStorage(storageKey, defaultTheme);

  // Calculate the effective theme (light or dark)
  const effectiveTheme: "light" | "dark" =
    themeMode === "auto" ? (isSystemDark ? "dark" : "light") : themeMode;

  // Get the current theme configuration
  const theme = themes[effectiveTheme];

  // Toggle between light and dark (skips auto)
  const toggleTheme = useCallback(() => {
    const newTheme: ThemeMode = (() => {
      if (themeMode === "light") return "dark";
      if (themeMode === "dark") return "light";
      // If auto, toggle to opposite of current system preference
      return isSystemDark ? "light" : "dark";
    })();
    setThemeMode(newTheme);
  }, [themeMode, isSystemDark, setThemeMode]);

  // Apply theme to document root for CSS custom properties
  useEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    const { colors, spacing, typography, borderRadius, shadows } = theme;

    // Set CSS custom properties for colors
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(
        `--color-${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`,
        value
      );
    });

    // Set spacing variables
    Object.entries(spacing.normal).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });

    // Set typography variables
    Object.entries(typography.fontSize).forEach(([key, value]) => {
      root.style.setProperty(`--font-size-${key}`, value);
    });

    Object.entries(typography.fontWeight).forEach(([key, value]) => {
      root.style.setProperty(`--font-weight-${key}`, value.toString());
    });

    Object.entries(typography.lineHeight).forEach(([key, value]) => {
      root.style.setProperty(`--line-height-${key}`, value.toString());
    });

    // Set border radius variables
    Object.entries(borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--border-radius-${key}`, value);
    });

    // Set shadow variables
    Object.entries(shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });

    // Set animation variables
    Object.entries(theme.animations.duration).forEach(([key, value]) => {
      root.style.setProperty(`--duration-${key}`, value);
    });

    Object.entries(theme.animations.easing).forEach(([key, value]) => {
      root.style.setProperty(`--easing-${key}`, value);
    });

    // Set theme mode class on body for conditional styling
    document.body.className = document.body.className
      .replace(/theme-(light|dark)/g, "")
      .trim();
    document.body.classList.add(`theme-${effectiveTheme}`);
  }, [theme, effectiveTheme]);

  const contextValue: ThemeContextValue = {
    theme,
    themeMode,
    setThemeMode,
    toggleTheme,
    isSystemDark,
    effectiveTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
