import React, { memo } from "react";
import { Avatar, Text } from "@fluentui/react-components";
import { Bot24Regular } from "@fluentui/react-icons";
import "./TypingIndicator.scss";

interface TypingIndicatorProps {
  /** Whether the typing indicator should be visible */
  isVisible: boolean;
  /** Custom message to display while typing */
  message?: string;
  /** Custom avatar icon */
  avatarIcon?: React.ReactElement;
  /** Avatar color */
  avatarColor?:
    | "brand"
    | "colorful"
    | "neutral"
    | "dark-red"
    | "cranberry"
    | "red"
    | "pumpkin"
    | "peach"
    | "marigold"
    | "gold"
    | "brass"
    | "brown"
    | "forest"
    | "seafoam"
    | "dark-green"
    | "light-teal"
    | "teal"
    | "steel"
    | "blue"
    | "royal-blue"
    | "cornflower"
    | "navy"
    | "lavender"
    | "purple"
    | "grape"
    | "lilac"
    | "pink"
    | "magenta"
    | "plum"
    | "beige"
    | "mink"
    | "platinum"
    | "anchor";
  /** Avatar size */
  avatarSize?:
    | 16
    | 20
    | 24
    | 28
    | 32
    | 36
    | 40
    | 48
    | 56
    | 64
    | 72
    | 96
    | 120
    | 128;
  /** Additional CSS class name */
  className?: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = memo(
  ({
    isVisible,
    message = "AI is thinking...",
    avatarIcon = <Bot24Regular />,
    avatarColor = "brand",
    avatarSize = 32,
    className = "",
  }) => {
    if (!isVisible) {
      return null;
    }

    return (
      <div
        className={`typing-indicator ${className}`}
        role="status"
        aria-live="polite"
        aria-label="AI is typing"
      >
        <Avatar
          icon={avatarIcon}
          color={avatarColor}
          size={avatarSize}
          aria-hidden="true"
        />
        <div className="typing-bubble">
          <div className="typing-dots" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <Text size={300} aria-live="polite">
            {message}
          </Text>
        </div>
      </div>
    );
  }
);

TypingIndicator.displayName = "TypingIndicator";

export default TypingIndicator;
