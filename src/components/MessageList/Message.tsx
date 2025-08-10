import React, { useEffect, useState, memo, useCallback, useMemo } from "react";
import { Avatar, Text, Spinner } from "@fluentui/react-components";
import {
  Bot24Regular,
  Person24Regular,
  CheckmarkCircle16Regular,
  ErrorCircle16Regular,
} from "@fluentui/react-icons";
import { Message as MessageType, MessageStatus } from "../../types/chat";
import "./Message.scss";

interface MessageProps {
  message: MessageType;
  isGroupStart: boolean;
  showTimestamps?: boolean;
  timestampFormat?: "relative" | "absolute" | "both";
  density?: "compact" | "normal" | "comfortable";
  onRetry?: (messageId: string) => void;
  onMessageAction?: (messageId: string, action: string) => void;
}

const Message: React.FC<MessageProps> = memo(
  ({
    message,
    isGroupStart,
    showTimestamps = true,
    timestampFormat = "relative",
    density = "normal",
    onRetry,
  }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(true);

    // Trigger entrance animation
    useEffect(() => {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 50);

      const animationTimer = setTimeout(() => {
        setIsAnimating(false);
      }, 400);

      return () => {
        clearTimeout(timer);
        clearTimeout(animationTimer);
      };
    }, []);

    // Enhanced timestamp formatting - memoized for performance
    const formatTime = useCallback(
      (
        timestamp: Date,
        format: "relative" | "absolute" | "both" = timestampFormat
      ) => {
        const now = new Date();
        const diff = now.getTime() - timestamp.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        const getRelativeTime = () => {
          if (minutes < 1) return "Just now";
          if (minutes < 60) return `${minutes}m ago`;
          if (hours < 24) return `${hours}h ago`;
          if (days < 7) return `${days}d ago`;
          return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
          }).format(timestamp);
        };

        const getAbsoluteTime = () => {
          return new Intl.DateTimeFormat("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }).format(timestamp);
        };

        switch (format) {
          case "relative":
            return getRelativeTime();
          case "absolute":
            return getAbsoluteTime();
          case "both":
            return `${getRelativeTime()} • ${getAbsoluteTime()}`;
          default:
            return getRelativeTime();
        }
      },
      [timestampFormat]
    );

    // Memoized formatted timestamp
    const formattedTime = useMemo(() => {
      return formatTime(message.timestamp);
    }, [message.timestamp, formatTime]);

    // Status indicator component - memoized
    const MessageStatusIndicator: React.FC<{ status?: MessageStatus }> = memo(
      ({ status }) => {
        if (!status) return null;

        const handleRetryClick = useCallback(() => {
          if (status === "failed" && onRetry) {
            onRetry(message.id);
          }
        }, [status, onRetry, message.id]);

        switch (status) {
          case "sending":
            return (
              <div className="message-status sending">
                <Spinner size="extra-small" />
              </div>
            );
          case "sent":
            return (
              <div className="message-status sent">
                <CheckmarkCircle16Regular />
              </div>
            );
          case "delivered":
            return (
              <div className="message-status delivered">
                <CheckmarkCircle16Regular />
              </div>
            );
          case "failed":
            return (
              <div
                className="message-status failed"
                onClick={handleRetryClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleRetryClick();
                  }
                }}
                title="Click to retry"
              >
                <ErrorCircle16Regular />
              </div>
            );
          default:
            return null;
        }
      }
    );

    // Memoized CSS classes
    const messageClasses = useMemo(
      () =>
        [
          "message",
          message.sender === "user" ? "user-message" : "bot-message",
          isGroupStart ? "group-start" : "group-continue",
          `density-${density}`,
          isVisible ? "visible" : "hidden",
          isAnimating ? "animating" : "",
        ].join(" "),
      [message.sender, isGroupStart, density, isVisible, isAnimating]
    );

    return (
      <div className={messageClasses}>
        {isGroupStart && (
          <Avatar
            icon={
              message.sender === "user" ? <Person24Regular /> : <Bot24Regular />
            }
            color={message.sender === "user" ? "colorful" : "brand"}
            size={density === "compact" ? 32 : 36}
            className="message-avatar"
          />
        )}
        {!isGroupStart && <div className="message-avatar-spacer" />}

        <div className="message-content">
          <div className="message-bubble">
            <Text size={density === "compact" ? 300 : 400}>{message.text}</Text>
            {message.metadata?.edited && (
              <Text size={200} className="message-edited">
                (edited)
              </Text>
            )}
          </div>

          <div className="message-meta">
            {showTimestamps && (
              <Text size={200} className="message-time">
                {formattedTime}
              </Text>
            )}
            <MessageStatusIndicator status={message.status} />
          </div>
        </div>
      </div>
    );
  }
);

Message.displayName = "Message";

export default Message;
