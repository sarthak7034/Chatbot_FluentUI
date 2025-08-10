import React, {
  useRef,
  useEffect,
  memo,
  useMemo,
  useCallback,
  Suspense,
} from "react";
import { Avatar, Text } from "@fluentui/react-components";
import { Bot24Regular } from "@fluentui/react-icons";
import {
  LazyThemeToggle,
  LazyStatusIndicator,
  ThemeToggleLoading,
  StatusIndicatorLoading,
} from "../lazy/index";
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
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = memo(
  ({
    title = "AI Assistant",
    subtitle,
    isConnected,
    showThemeToggle = true,
    compact = false,
    className = "",
    onTitleClick,
    ariaLabel,
    ariaDescribedBy,
  }) => {
    const { isMobile, isTablet } = useResponsive();
    const headerRef = useRef<HTMLElement>(null);
    const titleRef = useRef<HTMLDivElement>(null);

    // Memoized connection status for StatusIndicator
    const connectionStatus = useMemo((): ConnectionStatus => {
      if (isConnected) return "connected";
      return "connecting";
    }, [isConnected]);

    // Memoized responsive avatar size
    const avatarSize = useMemo(() => {
      if (compact) return 32;
      if (isMobile) return 40;
      return 48;
    }, [compact, isMobile]);

    // Memoized responsive text size
    const titleSize = useMemo(() => {
      if (compact) return 500;
      if (isMobile) return 500;
      return 600;
    }, [compact, isMobile]);

    // Memoized subtitle visibility
    const shouldShowSubtitle = useMemo(() => {
      if (compact) return false;
      if (isMobile && !subtitle) return false;
      return true;
    }, [compact, isMobile, subtitle]);

    // Memoized responsive title handling
    const responsiveTitle = useMemo(() => {
      if (!title) return "";

      // Different truncation strategies based on screen size
      if (isMobile) {
        // More aggressive truncation on mobile
        return title.length > 12 ? `${title.substring(0, 12)}...` : title;
      } else if (isTablet) {
        // Moderate truncation on tablet
        return title.length > 20 ? `${title.substring(0, 20)}...` : title;
      }

      // Full title on desktop
      return title;
    }, [title, isMobile, isTablet]);

    // Memoized subtitle handling for responsive design
    const responsiveSubtitle = useMemo(() => {
      if (!subtitle) return "";

      if (isMobile) {
        // Very short subtitle on mobile
        return subtitle.length > 15
          ? `${subtitle.substring(0, 15)}...`
          : subtitle;
      } else if (isTablet) {
        // Moderate subtitle on tablet
        return subtitle.length > 25
          ? `${subtitle.substring(0, 25)}...`
          : subtitle;
      }

      // Full subtitle on desktop
      return subtitle;
    }, [subtitle, isMobile, isTablet]);

    // Memoized comprehensive ARIA label for the header
    const headerAriaLabel = useMemo(() => {
      if (ariaLabel) return ariaLabel;

      const connectionText = isConnected ? "connected" : "connecting";
      const baseLabel = `${title} chat interface, ${connectionText}`;

      if (subtitle && shouldShowSubtitle) {
        return `${baseLabel}, ${subtitle}`;
      }

      return baseLabel;
    }, [ariaLabel, isConnected, title, subtitle, shouldShowSubtitle]);

    // Memoized keyboard navigation handler for the entire header
    const handleHeaderKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLElement>) => {
        // Allow Tab navigation through interactive elements
        if (event.key === "Tab") {
          return; // Let default tab behavior work
        }

        // Handle Enter/Space on title if clickable
        if (
          (event.key === "Enter" || event.key === " ") &&
          onTitleClick &&
          event.target === titleRef.current
        ) {
          event.preventDefault();
          onTitleClick();
        }
      },
      [onTitleClick]
    );

    // Focus management for accessibility
    useEffect(() => {
      // Ensure proper focus order and accessibility
      if (headerRef.current) {
        const interactiveElements = headerRef.current.querySelectorAll(
          'button, [role="button"], [tabindex="0"]'
        );

        // Ensure all interactive elements have proper tab order
        interactiveElements.forEach((element) => {
          if (!element.getAttribute("tabindex")) {
            element.setAttribute("tabindex", "0");
          }
        });
      }
    }, [onTitleClick, showThemeToggle]);

    return (
      <header
        ref={headerRef}
        className={`chat-header ${
          compact ? "chat-header--compact" : ""
        } ${className}`}
        role="banner"
        aria-label={headerAriaLabel}
        aria-describedby={ariaDescribedBy}
        onKeyDown={handleHeaderKeyDown}
      >
        <div
          className="chat-header__left"
          role="group"
          aria-label="Chat information"
        >
          <Avatar
            icon={<Bot24Regular />}
            color="brand"
            size={avatarSize}
            className="chat-header__avatar"
            aria-label={`${title} avatar`}
            role="img"
          />
          <div
            className="chat-header__info"
            role="group"
            aria-label="Chat details"
          >
            <div
              ref={titleRef}
              className="chat-header__title"
              onClick={onTitleClick}
              role={onTitleClick ? "button" : "heading"}
              aria-level={onTitleClick ? undefined : 1}
              tabIndex={onTitleClick ? 0 : undefined}
              aria-label={onTitleClick ? `${title}, click to interact` : title}
              aria-describedby={
                shouldShowSubtitle ? "chat-header-status" : undefined
              }
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
              <Text
                weight="semibold"
                size={titleSize}
                as={onTitleClick ? "span" : "h1"}
              >
                {responsiveTitle}
              </Text>
            </div>
            {shouldShowSubtitle && (
              <div
                id="chat-header-status"
                className="chat-header__status"
                role="group"
                aria-label="Connection status and subtitle"
              >
                <Suspense fallback={<StatusIndicatorLoading />}>
                  <LazyStatusIndicator
                    status={connectionStatus}
                    size={compact ? "small" : isMobile ? "small" : "medium"}
                    showText={!isMobile || !compact}
                    aria-label={`Connection status: ${connectionStatus}`}
                  />
                </Suspense>
                {subtitle && (
                  <Text
                    size={300}
                    className="chat-header__subtitle"
                    aria-label={`Subtitle: ${responsiveSubtitle}`}
                    title={subtitle} // Show full subtitle on hover if truncated
                  >
                    {responsiveSubtitle}
                  </Text>
                )}
              </div>
            )}
          </div>
        </div>

        <div
          className="chat-header__right"
          role="group"
          aria-label="Header controls"
        >
          {showThemeToggle && (
            <Suspense fallback={<ThemeToggleLoading />}>
              <LazyThemeToggle
                size={compact ? "small" : isMobile ? "small" : "medium"}
                showLabel={false}
                className="chat-header__theme-toggle"
                aria-label="Toggle theme between light and dark mode"
              />
            </Suspense>
          )}
        </div>
      </header>
    );
  }
);

ChatHeader.displayName = "ChatHeader";

export default ChatHeader;
