import React, { Component, ReactNode } from "react";
import { Button, MessageBar } from "@fluentui/react-components";
import { ChatError, ErrorBoundaryState } from "../../types/error";
import "./ChatErrorBoundary.scss";

interface ChatErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  enableRecovery?: boolean;
}

class ChatErrorBoundary extends Component<
  ChatErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ChatErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Create a ChatError from the caught error
    const chatError: ChatError = {
      type: "rendering",
      message:
        error.message || "An unexpected error occurred in the chat interface",
      code: error.name,
      recoverable: true,
      timestamp: new Date(),
      context: {
        stack: error.stack,
        componentStack: "ChatErrorBoundary",
      },
    };

    return {
      hasError: true,
      error,
      chatError,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error for debugging
    console.error("ChatErrorBoundary caught an error:", error, errorInfo);

    // Update state with error info
    this.setState({
      errorInfo,
      chatError: {
        ...this.state.chatError!,
        context: {
          ...this.state.chatError?.context,
          componentStack: errorInfo.componentStack,
        },
      },
    });

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      chatError: undefined,
    });
  };

  handleReset = () => {
    // Clear any stored state and reload the component
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      chatError: undefined,
    });

    // Optionally reload the page for a complete reset
    if (
      window.confirm(
        "Would you like to reload the page to completely reset the chat?"
      )
    ) {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      const { fallback: FallbackComponent, enableRecovery = true } = this.props;
      const { error, chatError } = this.state;

      // Use custom fallback component if provided
      if (FallbackComponent && error) {
        return <FallbackComponent error={error} retry={this.handleRetry} />;
      }

      // Default error UI
      return (
        <div className="chat-error-boundary">
          <div className="chat-error-boundary__container">
            <MessageBar intent="error" className="chat-error-boundary__message">
              <div className="chat-error-boundary__content">
                <h3 className="chat-error-boundary__title">
                  Something went wrong with the chat
                </h3>
                <p className="chat-error-boundary__description">
                  {chatError?.message ||
                    "An unexpected error occurred. Please try again."}
                </p>

                {enableRecovery && chatError?.recoverable && (
                  <div className="chat-error-boundary__actions">
                    <Button
                      appearance="primary"
                      onClick={this.handleRetry}
                      className="chat-error-boundary__retry-btn"
                    >
                      Try Again
                    </Button>
                    <Button
                      appearance="secondary"
                      onClick={this.handleReset}
                      className="chat-error-boundary__reset-btn"
                    >
                      Reset Chat
                    </Button>
                  </div>
                )}

                {import.meta.env.MODE === "development" && (
                  <details className="chat-error-boundary__details">
                    <summary>Error Details (Development)</summary>
                    <pre className="chat-error-boundary__error-text">
                      {error?.stack}
                    </pre>
                    {this.state.errorInfo && (
                      <pre className="chat-error-boundary__component-stack">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </details>
                )}
              </div>
            </MessageBar>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ChatErrorBoundary;
