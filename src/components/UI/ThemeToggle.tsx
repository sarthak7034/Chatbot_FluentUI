import React, { memo, useMemo } from "react";
import { Button, Tooltip } from "@fluentui/react-components";
import {
  WeatherSunny24Regular,
  WeatherMoon24Regular,
  Settings24Regular,
} from "@fluentui/react-icons";
import { useTheme } from "../../contexts/ThemeContext";
import "./ThemeToggle.scss";

interface ThemeToggleProps {
  size?: "small" | "medium" | "large";
  showLabel?: boolean;
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = memo(
  ({ size = "medium", showLabel = false, className = "" }) => {
    const { themeMode, toggleTheme, effectiveTheme, isSystemDark } = useTheme();

    // Memoized icon based on theme mode
    const icon = useMemo(() => {
      switch (themeMode) {
        case "light":
          return <WeatherSunny24Regular />;
        case "dark":
          return <WeatherMoon24Regular />;
        case "auto":
          return <Settings24Regular />;
        default:
          return <WeatherSunny24Regular />;
      }
    }, [themeMode]);

    // Memoized tooltip text
    const tooltipText = useMemo(() => {
      switch (themeMode) {
        case "light":
          return "Switch to dark theme";
        case "dark":
          return "Switch to light theme";
        case "auto":
          return `Auto theme (currently ${effectiveTheme}${
            isSystemDark ? " - system prefers dark" : " - system prefers light"
          })`;
        default:
          return "Toggle theme";
      }
    }, [themeMode, effectiveTheme, isSystemDark]);

    // Memoized label text
    const label = useMemo(() => {
      switch (themeMode) {
        case "light":
          return "Light";
        case "dark":
          return "Dark";
        case "auto":
          return "Auto";
        default:
          return "Theme";
      }
    }, [themeMode]);

    return (
      <div className={`theme-toggle ${className}`}>
        <Tooltip content={tooltipText} relationship="label">
          <Button
            appearance="subtle"
            icon={icon}
            onClick={toggleTheme}
            size={size}
            className={`theme-toggle-button theme-toggle-${size} theme-${effectiveTheme}`}
            aria-label={tooltipText}
          >
            {showLabel && label}
          </Button>
        </Tooltip>
      </div>
    );
  }
);

ThemeToggle.displayName = "ThemeToggle";

export default ThemeToggle;
