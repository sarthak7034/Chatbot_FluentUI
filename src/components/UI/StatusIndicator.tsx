import React, { useEffect, useRef } from "react";
import { Text } from "@fluentui/react-components";
import {
  CheckmarkCircle24Regular,
  Warning24Regular,
  ErrorCircle24Regular,
  Circle24Regular,
} from "@fluentui/react-icons";
import "./StatusIndicator.scss";

export type ConnectionStatus =
  | "connected"
  | "connecting"
  | "disconnected"
  | "error";

export interface StatusIndicatorProps {
  status: ConnectionStatus;
  showText?: boolean;
  size?: "small" | "medium" | "large";
  className?: string;
  "aria-label"?: string;
}

const statusConfig = {
  connected: {
    icon: CheckmarkCircle24Regular,
    text: "Online",
    className: "status-connected",
    ariaLabel: "Connected to server",
  },
  connecting: {
    icon: Circle24Regular,
    text: "Connecting...",
    className: "status-connecting",
    ariaLabel: "Connecting to server",
  },
  disconnected: {
    icon: Warning24Regular,
    text: "Offline",
    className: "status-disconnected",
    ariaLabel: "Disconnected from server",
  },
  error: {
    icon: ErrorCircle24Regular,
    text: "Connection Error",
    className: "status-error",
    ariaLabel: "Connection error occurred",
  },
};

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  showText = true,
  size = "medium",
  className = "",
  "aria-label": ariaLabel,
}) => {
  const config = statusConfig[status];
  const IconComponent = config.icon;
  const announceRef = useRef<HTMLDivElement>(null);
  const prevStatusRef = useRef<ConnectionStatus>(status);

  // Announce status changes for screen readers
  useEffect(() => {
    if (prevStatusRef.current !== status && announceRef.current) {
      // Clear and set the announcement text to trigger screen reader
      announceRef.current.textContent = "";
      setTimeout(() => {
        if (announceRef.current) {
          announceRef.current.textContent = `Connection status changed to ${config.text}`;
        }
      }, 100);
    }
    prevStatusRef.current = status;
  }, [status, config.text]);

  return (
    <div
      className={`status-indicator ${config.className} status-indicator--${size} ${className}`}
      role="status"
      aria-label={ariaLabel || config.ariaLabel}
    >
      <div className="status-indicator__icon">
        <IconComponent />
        {status === "connecting" && <div className="status-indicator__pulse" />}
      </div>

      {showText && (
        <Text
          size={size === "small" ? 200 : size === "medium" ? 300 : 400}
          className="status-indicator__text"
        >
          {config.text}
        </Text>
      )}

      {/* Screen reader announcements */}
      <div
        ref={announceRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      />
    </div>
  );
};

export default StatusIndicator;
