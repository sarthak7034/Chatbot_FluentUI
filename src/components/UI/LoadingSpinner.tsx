import React, { memo } from "react";
import { Spinner, Text } from "@fluentui/react-components";
import "./LoadingSpinner.scss";

interface LoadingSpinnerProps {
  size?:
    | "tiny"
    | "extra-small"
    | "small"
    | "medium"
    | "large"
    | "extra-large"
    | "huge";
  message?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = memo(
  ({ size = "medium", message = "Loading...", className = "" }) => {
    return (
      <div
        className={`loading-spinner ${className}`}
        role="status"
        aria-live="polite"
      >
        <Spinner size={size} />
        {message && (
          <Text size={300} className="loading-spinner__message">
            {message}
          </Text>
        )}
      </div>
    );
  }
);

LoadingSpinner.displayName = "LoadingSpinner";

export default LoadingSpinner;
