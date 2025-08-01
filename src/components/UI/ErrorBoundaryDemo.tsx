import React, { useState } from "react";
import { Button } from "@fluentui/react-components";
import ChatErrorBoundary from "./ChatErrorBoundary";
import MessageErrorBoundary from "./MessageErrorBoundary";

// Component that can throw errors for testing
const ErrorTrigger: React.FC<{ shouldError: boolean; errorType: string }> = ({
  shouldError,
  errorType,
}) => {
  if (shouldError) {
    if (errorType === "render") {
      throw new Error("Simulated rendering error for testing");
    } else if (errorType === "message") {
      throw new Error("Simulated message rendering error");
    }
  }

  return <div>Component rendered successfully!</div>;
};

// Demo component to test ErrorBoundary functionality
const ErrorBoundaryDemo: React.FC = () => {
  const [triggerChatError, setTriggerChatError] = useState(false);
  const [triggerMessageError, setTriggerMessageError] = useState(false);

  const handleChatErrorTest = () => {
    setTriggerChatError(true);
  };

  const handleMessageErrorTest = () => {
    setTriggerMessageError(true);
  };

  const handleReset = () => {
    setTriggerChatError(false);
    setTriggerMessageError(false);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px" }}>
      <h2>ErrorBoundary Demo</h2>
      <p>This component demonstrates the ErrorBoundary components in action.</p>

      <div style={{ marginBottom: "20px" }}>
        <Button onClick={handleChatErrorTest} style={{ marginRight: "10px" }}>
          Trigger Chat Error
        </Button>
        <Button
          onClick={handleMessageErrorTest}
          style={{ marginRight: "10px" }}
        >
          Trigger Message Error
        </Button>
        <Button onClick={handleReset}>Reset All</Button>
      </div>

      <div
        style={{
          border: "1px solid #ccc",
          padding: "15px",
          marginBottom: "20px",
        }}
      >
        <h3>ChatErrorBoundary Test</h3>
        <ChatErrorBoundary
          onError={(error, errorInfo) => {
            console.log("ChatErrorBoundary caught error:", error, errorInfo);
          }}
        >
          <ErrorTrigger shouldError={triggerChatError} errorType="render" />
        </ChatErrorBoundary>
      </div>

      <div style={{ border: "1px solid #ccc", padding: "15px" }}>
        <h3>MessageErrorBoundary Test</h3>
        <MessageErrorBoundary
          messageId="demo-message-123"
          onError={(error, messageId) => {
            console.log(
              "MessageErrorBoundary caught error:",
              error,
              "for message:",
              messageId
            );
          }}
          onRetry={(messageId) => {
            console.log("Retrying message:", messageId);
            setTriggerMessageError(false);
          }}
          showErrorDetails={true}
        >
          <ErrorTrigger shouldError={triggerMessageError} errorType="message" />
        </MessageErrorBoundary>
      </div>
    </div>
  );
};

export default ErrorBoundaryDemo;
