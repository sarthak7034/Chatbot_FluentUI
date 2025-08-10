import React from "react";
import { createPreloadableLazyComponent } from "../../utils/lazyLoading";
import LoadingSpinner from "../UI/LoadingSpinner";

// Lazy-loaded components for better performance
export const LazyThemeToggle = createPreloadableLazyComponent(
  () => import("../UI/ThemeToggle")
);

export const LazyStatusIndicator = createPreloadableLazyComponent(
  () => import("../UI/StatusIndicator")
);

export const LazyWelcomeMessage = createPreloadableLazyComponent(
  () => import("../MessageList/WelcomeMessage")
);

export const LazyTypingIndicator = createPreloadableLazyComponent(
  () => import("../MessageList/TypingIndicator")
);

export const LazyEnhancedMessageList = createPreloadableLazyComponent(
  () => import("../MessageList/EnhancedMessageList")
);

// Loading fallback components
export const ThemeToggleLoading: React.FC = () => (
  <div
    style={{
      width: 40,
      height: 32,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <LoadingSpinner size="tiny" message="" />
  </div>
);

export const StatusIndicatorLoading: React.FC = () => (
  <div
    style={{
      width: 80,
      height: 24,
      display: "flex",
      alignItems: "center",
      gap: 8,
    }}
  >
    <LoadingSpinner size="tiny" message="" />
    <span style={{ fontSize: "12px", color: "var(--colorNeutralForeground2)" }}>
      Loading...
    </span>
  </div>
);

export const WelcomeMessageLoading: React.FC = () => (
  <div style={{ padding: 24, textAlign: "center" }}>
    <LoadingSpinner size="medium" message="Loading welcome message..." />
  </div>
);

export const TypingIndicatorLoading: React.FC = () => (
  <div style={{ padding: 8, display: "flex", alignItems: "center", gap: 8 }}>
    <LoadingSpinner size="tiny" message="" />
    <span style={{ fontSize: "12px", color: "var(--colorNeutralForeground2)" }}>
      Loading...
    </span>
  </div>
);

export const EnhancedMessageListLoading: React.FC = () => (
  <div
    style={{
      padding: 24,
      textAlign: "center",
      minHeight: 200,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <LoadingSpinner size="large" message="Loading messages..." />
  </div>
);

// Preload critical components on app initialization
export const preloadCriticalComponents = async () => {
  try {
    // Preload components that are likely to be used immediately
    await Promise.all([
      (LazyThemeToggle as any).preload?.(),
      (LazyStatusIndicator as any).preload?.(),
    ]);
  } catch (error) {
    console.warn("Failed to preload some components:", error);
  }
};

// Preload non-critical components after initial render
export const preloadNonCriticalComponents = async () => {
  try {
    // Preload components that might be used later
    await Promise.all([
      (LazyWelcomeMessage as any).preload?.(),
      (LazyTypingIndicator as any).preload?.(),
      (LazyEnhancedMessageList as any).preload?.(),
    ]);
  } catch (error) {
    console.warn("Failed to preload non-critical components:", error);
  }
};
