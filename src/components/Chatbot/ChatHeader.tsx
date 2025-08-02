import React from "react";
import { Avatar, Text } from "@fluentui/react-components";
import { Bot24Regular } from "@fluentui/react-icons";
import { ThemeToggle, StatusIndicator } from "../UI";
import type { ConnectionStatus } from "../UI";
import { useResponsive } from "../../hooks/useResponsive";
import "./ChatHeader.scss";

export interface ChatHeaderProps {
  title?: string;
  subtitle?: string;
  isConnected: boolean;
  showThemeToggle?: boolean;
  compact?: boolean;
  className?: string;
  onTitleClick?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  title = "AI Assistant",
  subtitle,
  isConnected,
  showThemeToggle = true,
  compact = false,
  className = "",
  onTitleClick,
}) => {
  const { isMobile, isTablet, isMobileOrTablet } = useResponsive();

  // Determine connection status for StatusIndicator
  const getConnectionStatus = (): ConnectionStatus => {
    if (isConnected) return "connected";
    return "connecting";
  };

  // Responsive avatar size
  const getAvatarSize = () => {
    if (compact) return 32;
    if (isMobile) return 40;
    return 48;
  };

  // Responsive text size
  const getTitleSize = () => {
    if (compact) return 500;
    if (isMobile) return 500;
    return 600;
  };

  // Show subtitle based on screen size and content
  const shouldShowSubtitle = () => {
    if (compact) return false;
    if (isMobile && !subtitle) return false;
    return true;
  };

  return (
    <header
      className={`chat-header ${
        compact ? "chat-header--compact" : ""
      } ${className}`}
      role="banner"
    >
      <div className="chat-header__left">
        <Avatar
          icon={<Bot24Regular />}
          color="brand"
          size={getAvatarSize()}
          className="chat-header__avatar"
        />
        <div className="chat-header__info">
          <Text
            weight="semibold"
            size={getTitleSize()}
            className="chat-header__title"
            onClick={onTitleClick}
            role={onTitleClick ? "button" : undefined}
            tabIndex={onTitleClick ? 0 : undefined}
            onKeyDown={
              onTitleClick
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onTitleClick();
                    }
                  }
                : undefined
            }
          >
            {isMobileOrTablet && title.length > 15
              ? `${title.substring(0, 15)}...`
              : title}
          </Text>
          {shouldShowSubtitle() && (
            <div className="chat-header__status">
              <StatusIndicator
                status={getConnectionStatus()}
                size={compact ? "small" : isMobile ? "small" : "medium"}
                showText={!isMobile || !compact}
                aria-label={`Connection status: ${getConnectionStatus()}`}
              />
              {subtitle && !isMobile && (
                <Text size={300} className="chat-header__subtitle">
                  {subtitle}
                </Text>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="chat-header__right">
        {showThemeToggle && (
          <ThemeToggle
            size={compact ? "small" : isMobile ? "small" : "medium"}
            showLabel={false}
            className="chat-header__theme-toggle"
          />
        )}
      </div>
    </header>
  );
};

export default ChatHeader;
