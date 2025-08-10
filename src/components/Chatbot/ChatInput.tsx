import React, { useState, useRef, memo, useCallback, useMemo } from "react";
import { Button, Input } from "@fluentui/react-components";
import { Send24Regular } from "@fluentui/react-icons";
import "./ChatInput.scss";

export interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  showCharCount?: boolean;
  enableShortcuts?: boolean;
  isConnected?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = memo(
  ({
    value,
    onChange,
    onSend,
    disabled = false,
    placeholder = "Ask me anything... ✨",
    maxLength = 2000,
    showCharCount = false,
    enableShortcuts = true,
    isConnected = true,
  }) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Memoized character count logic
    const charCount = useMemo(() => value.length, [value.length]);
    const isNearLimit = useMemo(
      () => charCount > maxLength * 0.8,
      [charCount, maxLength]
    );
    const isOverLimit = useMemo(
      () => charCount > maxLength,
      [charCount, maxLength]
    );

    // Memoized input validation
    const isInputValid = useMemo(
      () => value.trim().length > 0 && !isOverLimit,
      [value, isOverLimit]
    );
    const canSend = useMemo(
      () => isInputValid && isConnected && !disabled,
      [isInputValid, isConnected, disabled]
    );

    const handleSendMessage = useCallback(() => {
      if (!canSend) return;
      onSend(value);
    }, [canSend, onSend, value]);

    const handleKeyPress = useCallback(
      (e: React.KeyboardEvent) => {
        if (!enableShortcuts) return;

        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          handleSendMessage();
        } else if (e.key === "Escape") {
          e.preventDefault();
          onChange("");
          inputRef.current?.blur();
        }
      },
      [enableShortcuts, handleSendMessage, onChange]
    );

    // Input change is handled directly in the Input component's onChange prop

    const handleFocus = useCallback(() => setIsFocused(true), []);
    const handleBlur = useCallback(() => setIsFocused(false), []);

    // Memoized send button title based on state
    const sendButtonTitle = useMemo((): string => {
      if (!isConnected) return "Connecting...";
      if (disabled) return "Input disabled";
      if (!isInputValid) return "Enter a message to send";
      if (isOverLimit) return "Message too long";
      return "Send message (Enter)";
    }, [isConnected, disabled, isInputValid, isOverLimit]);

    // Memoized input status for styling
    const inputStatus = useMemo(() => {
      if (isOverLimit) return "error";
      if (isNearLimit) return "warning";
      return "default";
    }, [isOverLimit, isNearLimit]);

    return (
      <div className="chat-input">
        <div
          className={`chat-input__container ${
            isFocused ? "focused" : ""
          } ${inputStatus}`}
        >
          <Input
            ref={inputRef}
            value={value}
            onChange={(_, data) => onChange(data.value)}
            onKeyDown={handleKeyPress}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            className="chat-input__field"
            aria-label="Message input"
            aria-describedby={showCharCount ? "char-count" : undefined}
            contentAfter={
              <Button
                appearance="transparent"
                icon={<Send24Regular />}
                onClick={handleSendMessage}
                disabled={!canSend}
                title={sendButtonTitle}
                className="chat-input__send-button"
                aria-label="Send message"
              />
            }
          />
        </div>

        {showCharCount && (
          <div
            id="char-count"
            className={`chat-input__char-count ${
              isNearLimit ? "warning" : ""
            } ${isOverLimit ? "error" : ""}`}
            aria-live="polite"
          >
            {charCount}/{maxLength}
            {isOverLimit && (
              <span className="chat-input__error-text">
                {" "}
                - Message too long
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
);

ChatInput.displayName = "ChatInput";

export default ChatInput;
