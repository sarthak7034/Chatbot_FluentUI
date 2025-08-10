import React, { useRef, useEffect, useMemo, useCallback } from "react";
import { FixedSizeList as List, ListChildComponentProps } from "react-window";
import { Message as MessageType } from "../../types/chat";
import Message from "./Message";
import WelcomeMessage from "./WelcomeMessage";
import "./MessageList.scss";

interface VirtualizedMessageListProps {
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
  itemHeight?: number;
  overscanCount?: number;
  enableVirtualScrolling?: boolean;
}

interface GroupedMessage extends MessageType {
  isGroupStart: boolean;
}

const VirtualizedMessageList: React.FC<VirtualizedMessageListProps> = ({
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
  itemHeight,
  overscanCount = 5,
  enableVirtualScrolling = true,
}) => {
  const listRef = useRef<List>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate dynamic item height based on density
  const getItemHeight = useMemo(() => {
    if (itemHeight) return itemHeight;

    switch (density) {
      case "compact":
        return 60;
      case "comfortable":
        return 100;
      default:
        return 80;
    }
  }, [density, itemHeight]);

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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (listRef.current && groupedMessages.length > 0) {
      // Small delay to ensure the list has rendered
      const timer = setTimeout(() => {
        listRef.current?.scrollToItem(groupedMessages.length - 1, "end");
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [groupedMessages.length]);

  // Smooth scroll to specific message (available for future use)
  // const scrollToMessage = useCallback(
  //   (messageId: string) => {
  //     const messageIndex = groupedMessages.findIndex(
  //       (msg) => msg.id === messageId
  //     );
  //     if (messageIndex !== -1 && listRef.current) {
  //       listRef.current.scrollToItem(messageIndex, "center");
  //     }
  //   },
  //   [groupedMessages]
  // );

  // Scroll to bottom programmatically (available for future use)
  // const scrollToBottom = useCallback(() => {
  //   if (listRef.current && groupedMessages.length > 0) {
  //     listRef.current.scrollToItem(groupedMessages.length - 1, "end");
  //   }
  // }, [groupedMessages.length]);

  // Row renderer for virtual list
  const MessageRow: React.FC<ListChildComponentProps> = ({ index, style }) => {
    const message = groupedMessages[index];

    return (
      <div style={style}>
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
  };

  // Handle container resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      // Force re-render on resize
      if (listRef.current) {
        // Trigger a re-render by updating the list
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // If virtual scrolling is disabled or message count is low, use regular rendering
  if (!enableVirtualScrolling || groupedMessages.length < 50) {
    return (
      <div className={`message-list density-${density}`} ref={containerRef}>
        {messages.length === 0 && showWelcomeMessage && (
          <WelcomeMessage
            title={welcomeTitle}
            subtitle={welcomeSubtitle}
            density={density}
          />
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

  return (
    <div
      className={`message-list virtualized density-${density}`}
      ref={containerRef}
    >
      {messages.length === 0 && showWelcomeMessage ? (
        <WelcomeMessage
          title={welcomeTitle}
          subtitle={welcomeSubtitle}
          density={density}
        />
      ) : (
        <List
          ref={listRef}
          height={height}
          width="100%"
          itemCount={groupedMessages.length}
          itemSize={getItemHeight}
          overscanCount={overscanCount}
          className="virtual-message-list"
        >
          {MessageRow}
        </List>
      )}
    </div>
  );
};

export default VirtualizedMessageList;
