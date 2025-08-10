import React, { memo, useMemo } from "react";
import { Avatar, Text } from "@fluentui/react-components";
import { Bot24Regular } from "@fluentui/react-icons";
import { useTheme } from "../../contexts/ThemeContext";
import { useResponsive } from "../../hooks/useResponsive";
import "./WelcomeMessage.scss";

interface WelcomeMessageProps {
  /** Custom title for the welcome message */
  title?: string;
  /** Custom subtitle for the welcome message */
  subtitle?: string;
  /** Custom avatar icon */
  avatarIcon?: React.ReactElement;
  /** Avatar size */
  avatarSize?: 32 | 40 | 48 | 56 | 64 | 72 | 96 | 120 | 128;
  /** Density setting for spacing */
  density?: "compact" | "normal" | "comfortable";
  /** Custom CSS class name */
  className?: string;
  /** Animation delay in milliseconds */
  animationDelay?: number;
  /** Whether to show the welcome message with reduced motion */
  reduceMotion?: boolean;
}

const WelcomeMessage: React.FC<WelcomeMessageProps> = memo(
  ({
    title = "Welcome! 👋",
    subtitle = "I'm your AI assistant. How can I help you today?",
    avatarIcon = <Bot24Regular />,
    avatarSize = 48,
    density = "normal",
    className = "",
    animationDelay = 0,
    reduceMotion = false,
  }) => {
    useTheme(); // Keep theme context active
    const { isMobile, isTablet, reducedMotion } = useResponsive();

    // Memoized responsive avatar size
    const responsiveAvatarSize = useMemo((): typeof avatarSize => {
      if (isMobile) {
        return Math.min(avatarSize, 40) as typeof avatarSize;
      }
      if (isTablet) {
        return Math.min(avatarSize, 48) as typeof avatarSize;
      }
      return avatarSize;
    }, [isMobile, isTablet, avatarSize]);

    // Memoized motion preference
    const shouldReduceMotion = useMemo(() => {
      return reduceMotion || reducedMotion;
    }, [reduceMotion, reducedMotion]);

    // Memoized responsive text sizes
    const titleSize = useMemo(() => {
      if (isMobile) return 400;
      if (isTablet) return 500;
      return 500;
    }, [isMobile, isTablet]);

    const subtitleSize = useMemo(() => {
      if (isMobile) return 200;
      if (isTablet) return 300;
      return 300;
    }, [isMobile, isTablet]);

    return (
      <div
        className={`welcome-message density-${density} ${className} ${
          shouldReduceMotion ? "reduced-motion" : ""
        }`}
        style={{
          animationDelay: shouldReduceMotion ? "0ms" : `${animationDelay}ms`,
        }}
        role="region"
        aria-label="Welcome message"
      >
        <Avatar
          icon={avatarIcon}
          color="brand"
          size={responsiveAvatarSize}
          className="welcome-avatar"
          aria-hidden="true"
        />
        <div className="welcome-content">
          <Text
            weight="semibold"
            size={titleSize}
            className="welcome-title"
            as="h2"
          >
            {title}
          </Text>
          <Text size={subtitleSize} className="welcome-subtitle" as="p">
            {subtitle}
          </Text>
        </div>
      </div>
    );
  }
);

WelcomeMessage.displayName = "WelcomeMessage";

export default WelcomeMessage;
