import React, { Component, ReactNode } from "react";
import { Button, MessageBar } from "@fluentui/react-components";
import { DismissRegular, ArrowClockwiseRegular } from "@fluentui/react-icons";
import { ChatError, ErrorBoundaryState } from "../../types/error";
import "./MessageErrorBoundary.scss";

interface MessageErrorBoundaryProps {
  children: ReactNode;
  messageId?: string;
  onError?: (error: Error, messageId?: string) => void;
  onRetry?: (messageId?: string) => void;
  fallback?: React.ComponentType<{
    error: Error;
    messageId?: string;
    retry: () => void;
  }>;
  showErrorDetails?: boolean;
}

interface MessageErrorBoundaryState extends ErrorBoundaryState {
  dismissed: boolean;
}

class MessageErrorBoundary extends Component<
  MessageErrorBoundaryProps,
  MessageErrorBoundaryState
> {
  constructor(props: MessageErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      dismissed: false,
    };
  }

  static getDerivedStateFromError(
    error: Error
  ): Partial<MessageErrorBoundaryState> {
    // Create a ChatError for message-specific errors
    const chatError: ChatError = {
      type: "rendering",
      message: "Failed to render this message",
      code: error.name,
      recoverable: true,
      timestamp: new Date(),
      context: {
        stack: error.stack,
        componentType: "Message",
      },
    };

    return {
      hasError: true,
      error,
      chatError,
      dismissed: false,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error for debugging
    console.error("MessageErrorBoundary caught an error:", error, errorInfo);

    // Update state with error info
    this.setState({
      errorInfo,
      chatError: {
        ...this.state.chatError!,
        context: {
          ...this.state.chatError?.context,
          componentStack: errorInfo.componentStack,
          messageId: this.props.messageId,
        },
      },
    });

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, this.props.messageId);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      chatError: undefined,
      dismissed: false,
    });

    // Call the onRetry callback if provided
    if (this.props.onRetry) {
      this.props.onRetry(this.props.messageId);
    }
  };

  handleDismiss = () => {
    this.setState({ dismissed: true });
  };

  render() {
    if (this.state.hasError && !this.state.dismissed) {
      const { fallback: FallbackComponent, showErrorDetails = false } =
        this.props;
      const { error, chatError } = this.state;

      // Use custom fallback component if provided
      if (FallbackComponent && error) {
        return (
          <FallbackComponent
            error={error}
            messageId={this.props.messageId}
            retry={this.handleRetry}
          />
        );
      }

      // Default error UI for individual messages
      return (
        <div className="message-error-boundary">
          <MessageBar
            intent="warning"
            className="message-error-boundary__message"
          >
            <div className="message-error-boundary__content">
              <div className="message-error-boundary__text">
                <span className="message-error-boundary__title">
                  Message failed to load
                </span>
                {showErrorDetails && chatError && (
                  <span className="message-error-boundary__details">
                    {chatError.message}
                  </span>
                )}
              </div>

              <div className="message-error-boundary__actions">
                <Button
                  appearance="subtle"
                  size="small"
                  icon={<ArrowClockwiseRegular />}
                  onClick={this.handleRetry}
                  className="message-error-boundary__retry-btn"
                  title="Retry loading this message"
                >
                  Retry
                </Button>
                <Button
                  appearance="subtle"
                  size="small"
                  icon={<DismissRegular />}
                  onClick={this.handleDismiss}
                  className="message-error-boundary__dismiss-btn"
                  title="Dismiss this error"
                >
                  Dismiss
                </Button>
              </div>
            </div>

            {import.meta.env.MODE === "development" && showErrorDetails && (
              <details className="message-error-boundary__debug">
                <summary>Debug Info</summary>
                <div className="message-error-boundary__debug-content">
                  <p>
                    <strong>Message ID:</strong>{" "}
                    {this.props.messageId || "Unknown"}
                  </p>
                  <p>
                    <strong>Error:</strong> {error?.message}
                  </p>
                  <p>
                    <strong>Timestamp:</strong>{" "}
                    {chatError?.timestamp.toISOString()}
                  </p>
                  {error?.stack && (
                    <pre className="message-error-boundary__stack">
                      {error.stack}
                    </pre>
                  )}
                </div>
              </details>
            )}
          </MessageBar>
        </div>
      );
    }

    // If dismissed, show a minimal placeholder
    if (this.state.hasError && this.state.dismissed) {
      return (
        <div className="message-error-boundary message-error-boundary--dismissed">
          <span className="message-error-boundary__placeholder">
            [Message unavailable]
          </span>
          <Button
            appearance="subtle"
            size="small"
            onClick={this.handleRetry}
            className="message-error-boundary__restore-btn"
            title="Try to restore this message"
          >
            Restore
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default MessageErrorBoundary;
