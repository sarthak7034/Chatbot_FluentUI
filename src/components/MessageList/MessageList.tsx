import React, { memo, useMemo, useCallback, Suspense } from "react";
import { Message as MessageType } from "../../types/chat";
import Message from "./Message";
import {
  LazyWelcomeMessage,
  WelcomeMessageLoading,
  LazyEnhancedMessageList,
  EnhancedMessageListLoading,
} from "../lazy/index";
import "./MessageList.scss";

interface MessageListProps {
  messages: MessageType[];
  showTimestamps?: boolean;
  groupMessages?: boolean;
  timestampFormat?: "relative" | "absolute" | "both";
  density?: "compact" | "normal" | "comfortable";
  onRetry?: (messageId: string) => void;
  onMessageAction?: (messageId: string, action: string) => void;
  // Welcome message customization
  welcomeTitle?: string;
  welcomeSubtitle?: string;
  showWelcomeMessage?: boolean;
  // Virtual scrolling options
  virtualScrolling?: boolean;
  height?: number;
  maxCachedMessages?: number;
}

const MessageList: React.FC<MessageListProps> = memo(
  ({
    messages,
    showTimestamps = true,
    groupMessages = true,
    timestampFormat = "relative",
    density = "normal",
    onRetry,
    onMessageAction,
    welcomeTitle,
    welcomeSubtitle,
    showWelcomeMessage = true,
    virtualScrolling = false,
    height = 400,
    maxCachedMessages = 1000,
  }) => {
    // Use enhanced message list with virtual scrolling if enabled
    if (virtualScrolling) {
      return (
        <Suspense fallback={<EnhancedMessageListLoading />}>
          <LazyEnhancedMessageList
            messages={messages}
            showTimestamps={showTimestamps}
            groupMessages={groupMessages}
            timestampFormat={timestampFormat}
            density={density}
            onRetry={onRetry}
            onMessageAction={onMessageAction}
            welcomeTitle={welcomeTitle}
            welcomeSubtitle={welcomeSubtitle}
            showWelcomeMessage={showWelcomeMessage}
            height={height}
            virtualScrolling={virtualScrolling}
            maxCachedMessages={maxCachedMessages}
          />
        </Suspense>
      );
    }

    // Message grouping logic - memoized for performance
    const groupMessagesByTime = useCallback(
      (messages: MessageType[]) => {
        if (!groupMessages)
          return messages.map((msg) => ({ ...msg, isGroupStart: true }));

        const grouped = [];
        let lastSender = "";
        let lastTimestamp = 0;
        const GROUP_TIME_THRESHOLD = 5 * 60 * 1000; // 5 minutes

        for (let i = 0; i < messages.length; i++) {
          const message = messages[i];
          const timeDiff = message.timestamp.getTime() - lastTimestamp;
          const isGroupStart =
            message.sender !== lastSender ||
            timeDiff > GROUP_TIME_THRESHOLD ||
            i === 0;

          grouped.push({
            ...message,
            isGroupStart,
          });

          lastSender = message.sender;
          lastTimestamp = message.timestamp.getTime();
        }

        return grouped;
      },
      [groupMessages]
    );

    // Memoized grouped messages
    const groupedMessages = useMemo(() => {
      return groupMessagesByTime(messages);
    }, [messages, groupMessagesByTime]);

    return (
      <div className={`message-list density-${density}`}>
        {messages.length === 0 && showWelcomeMessage && (
          <Suspense fallback={<WelcomeMessageLoading />}>
            <LazyWelcomeMessage
              title={welcomeTitle}
              subtitle={welcomeSubtitle}
              density={density}
            />
          </Suspense>
        )}

        {groupedMessages.map((message) => (
          <Message
            key={message.id}
            message={message}
            isGroupStart={message.isGroupStart}
            showTimestamps={showTimestamps}
            timestampFormat={timestampFormat}
            density={density}
            onRetry={onRetry}
            onMessageAction={onMessageAction}
          />
        ))}
      </div>
    );
  }
);

MessageList.displayName = "MessageList";

export default MessageList;
