import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  FluentProvider,
  webLightTheme,
  webDarkTheme,
} from "@fluentui/react-components";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import App from "./App.tsx";
import "./styles/index.scss";

// Wrapper component to integrate Fluent UI with our theme system
const FluentThemeWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { effectiveTheme } = useTheme();
  const fluentTheme = effectiveTheme === "dark" ? webDarkTheme : webLightTheme;

  return <FluentProvider theme={fluentTheme}>{children}</FluentProvider>;
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="auto">
      <FluentThemeWrapper>
        <App />
      </FluentThemeWrapper>
    </ThemeProvider>
  </React.StrictMode>
);