import React, { useMemo, useCallback, useEffect } from "react";
import { FixedSizeList as List, ListChildComponentProps } from "react-window";
import { Message as MessageType } from "../../types/chat";
import Message from "./Message";
import WelcomeMessage from "./WelcomeMessage";
import useVirtualScrolling from "../../hooks/useVirtualScrolling";
import "./MessageList.scss";

interface EnhancedMessageListProps {
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
  // Virtual scrolling configuration
  height?: number;
  virtualScrolling?: boolean;
  maxCachedMessages?: number;
  onScrollToMessage?: (messageId: string) => void;
}

interface GroupedMessage extends MessageType {
  isGroupStart: boolean;
}

const EnhancedMessageList: React.FC<EnhancedMessageListProps> = ({
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
  height = 400,
  virtualScrolling = true,
  maxCachedMessages = 1000,
  onScrollToMessage,
}) => {
  // Calculate item height based on density
  const itemHeight = useMemo(() => {
    switch (density) {
      case "compact":
        return 60;
      case "comfortable":
        return 100;
      default:
        return 80;
    }
  }, [density]);

  // Virtual scrolling configuration
  const virtualConfig = useMemo(
    () => ({
      itemHeight,
      overscanCount: 5,
      threshold: virtualScrolling ? 50 : Infinity,
      maxCachedMessages,
      scrollBehavior: "smooth" as const,
    }),
    [itemHeight, virtualScrolling, maxCachedMessages]
  );

  // Message grouping logic
  const groupMessagesByTime = useCallback(
    (messages: MessageType[]): GroupedMessage[] => {
      if (!groupMessages)
        return messages.map((msg) => ({ ...msg, isGroupStart: true }));

      const grouped: GroupedMessage[] = [];
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

  const groupedMessages = useMemo(
    () => groupMessagesByTime(messages),
    [messages, groupMessagesByTime]
  );

  // Virtual scrolling hook
  const {
    listRef,
    containerRef,
    state,
    scrollToMessage,
    shouldVirtualize,
    onItemsRendered,
  } = useVirtualScrolling(groupedMessages, virtualConfig);

  // Expose scroll to message function to parent
  useEffect(() => {
    if (onScrollToMessage) {
      // This would typically be handled through a ref or callback
      // For now, we'll just store the function reference
    }
  }, [onScrollToMessage, scrollToMessage]);

  // Memory management: Slice messages if too many
  const optimizedMessages = useMemo(() => {
    if (groupedMessages.length <= maxCachedMessages) {
      return groupedMessages;
    }

    // Keep the most recent messages
    const startIndex = groupedMessages.length - maxCachedMessages;
    return groupedMessages.slice(startIndex);
  }, [groupedMessages, maxCachedMessages]);

  // Row renderer for virtual list
  const MessageRow: React.FC<ListChildComponentProps> = useCallback(
    ({ index, style }) => {
      const message = optimizedMessages[index];

      if (!message) {
        return <div style={style} />;
      }

      return (
        <div style={style} className="virtual-message-row">
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
        </div>
      );
    },
    [
      optimizedMessages,
      showTimestamps,
      timestampFormat,
      density,
      onRetry,
      onMessageAction,
    ]
  );

  // Handle scroll events for smooth scrolling
  const handleScroll = useCallback(() => {
    // Custom scroll handling if needed
  }, []);

  // Regular rendering for small message lists or when virtualization is disabled
  if (!shouldVirtualize) {
    return (
      <div
        className={`message-list density-${density}`}
        ref={containerRef}
        style={{ height: `${height}px`, overflowY: "auto" }}
      >
        {messages.length === 0 && showWelcomeMessage && (
          <WelcomeMessage
            title={welcomeTitle}
            subtitle={welcomeSubtitle}
            density={density}
          />
        )}

        {optimizedMessages.map((message) => (
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

  // Virtual scrolling rendering
  return (
    <div
      className={`message-list virtualized density-${density}`}
      ref={containerRef}
    >
      {messages.length === 0 && showWelcomeMessage ? (
        <div
          style={{
            height: `${height}px`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <WelcomeMessage
            title={welcomeTitle}
            subtitle={welcomeSubtitle}
            density={density}
          />
        </div>
      ) : (
        <List
          ref={listRef}
          height={height}
          width="100%"
          itemCount={optimizedMessages.length}
          itemSize={itemHeight}
          overscanCount={5}
          className="virtual-message-list"
          onItemsRendered={onItemsRendered}
          onScroll={handleScroll}
        >
          {MessageRow}
        </List>
      )}

      {/* Debug info for development */}
      {false && (
        <div className="virtual-scroll-debug">
          <small>
            Virtual: {state.isVirtualized ? "Yes" : "No"} | Messages:{" "}
            {optimizedMessages.length} | Visible: {state.visibleRange.start}-
            {state.visibleRange.end}
          </small>
        </div>
      )}
    </div>
  );
};

export default EnhancedMessageList;
