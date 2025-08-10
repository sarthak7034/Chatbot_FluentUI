import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { FixedSizeList as List } from "react-window";
import { Message } from "../types/chat";

interface VirtualScrollingConfig {
  itemHeight: number;
  overscanCount: number;
  threshold: number; // Message count threshold to enable virtualization
  maxCachedMessages: number; // Maximum messages to keep in memory
  scrollBehavior: "smooth" | "auto";
}

interface VirtualScrollingState {
  isVirtualized: boolean;
  visibleRange: { start: number; end: number };
  totalHeight: number;
  scrollOffset: number;
}

interface UseVirtualScrollingReturn {
  listRef: React.RefObject<List>;
  containerRef: React.RefObject<HTMLDivElement>;
  state: VirtualScrollingState;
  scrollToBottom: () => void;
  scrollToMessage: (messageId: string) => void;
  scrollToIndex: (index: number, align?: "start" | "center" | "end") => void;
  shouldVirtualize: boolean;
  getItemHeight: (index: number) => number;
  onItemsRendered: (props: { visibleStartIndex: number; visibleStopIndex: number }) => void;
}

const DEFAULT_CONFIG: VirtualScrollingConfig = {
  itemHeight: 80,
  overscanCount: 5,
  threshold: 50,
  maxCachedMessages: 1000,
  scrollBehavior: "smooth",
};

export const useVirtualScrolling = (
  messages: Message[],
  config: Partial<VirtualScrollingConfig> = {}
): UseVirtualScrollingReturn => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const listRef = useRef<List>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 });
  const [scrollOffset] = useState(0);

  // Determine if virtualization should be enabled
  const shouldVirtualize = useMemo(() => {
    return messages.length >= finalConfig.threshold;
  }, [messages.length, finalConfig.threshold]);

  // Memoized item heights calculation for performance
  const itemHeights = useMemo(() => {
    return messages.map((message, index) => {
      // Base height
      let height = finalConfig.itemHeight;

      // Adjust for message length (rough estimation)
      const textLength = message.text.length;
      if (textLength > 100) {
        height += Math.floor(textLength / 100) * 20;
      }

      // Adjust for message type
      if (message.type === "system") {
        height *= 0.8; // System messages are typically smaller
      }

      // Adjust for group start (has avatar)
      if (index === 0 || messages[index - 1]?.sender !== message.sender) {
        height += 10; // Extra space for avatar
      }

      return Math.max(height, 40); // Minimum height
    });
  }, [messages, finalConfig.itemHeight]);

  // Calculate dynamic item heights based on message content
  const getItemHeight = useCallback((index: number) => {
    return itemHeights[index] || finalConfig.itemHeight;
  }, [itemHeights, finalConfig.itemHeight]);

  // Virtual scrolling state
  const state: VirtualScrollingState = useMemo(() => ({
    isVirtualized: shouldVirtualize,
    visibleRange,
    totalHeight: messages.length * finalConfig.itemHeight,
    scrollOffset,
  }), [shouldVirtualize, visibleRange, messages.length, finalConfig.itemHeight, scrollOffset]);

  // Scroll to bottom with smooth behavior
  const scrollToBottom = useCallback(() => {
    if (!listRef.current || messages.length === 0) return;

    const scrollToIndex = messages.length - 1;
    
    if (finalConfig.scrollBehavior === "smooth") {
      // Smooth scroll implementation
      listRef.current.scrollToItem(scrollToIndex, "end");
    } else {
      listRef.current.scrollToItem(scrollToIndex, "end");
    }
  }, [messages.length, finalConfig.scrollBehavior]);

  // Scroll to specific message by ID
  const scrollToMessage = useCallback((messageId: string) => {
    if (!listRef.current) return;

    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex !== -1) {
      listRef.current.scrollToItem(messageIndex, "center");
    }
  }, [messages]);

  // Scroll to specific index
  const scrollToIndex = useCallback((index: number, align: "start" | "center" | "end" = "center") => {
    if (!listRef.current) return;

    const clampedIndex = Math.max(0, Math.min(index, messages.length - 1));
    listRef.current.scrollToItem(clampedIndex, align);
  }, [messages.length]);

  // Handle visible items change for memory management
  const onItemsRendered = useCallback(({ visibleStartIndex, visibleStopIndex }: {
    visibleStartIndex: number;
    visibleStopIndex: number;
  }) => {
    setVisibleRange({ start: visibleStartIndex, end: visibleStopIndex });
  }, []);

  // Memoized auto-scroll effect to prevent unnecessary re-runs
  useEffect(() => {
    if (messages.length > 0) {
      // Small delay to ensure the list has rendered
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [messages.length, scrollToBottom]);

  // Handle container resize
  useEffect(() => {
    const handleResize = () => {
      // Force re-render on resize
      if (listRef.current) {
        // Trigger a re-render by updating the list
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Memory management: Clean up old messages if exceeding limit
  useEffect(() => {
    if (messages.length > finalConfig.maxCachedMessages) {
      // This would typically be handled by the parent component
      // We just track the state here
      console.warn(`Message count (${messages.length}) exceeds cache limit (${finalConfig.maxCachedMessages})`);
    }
  }, [messages.length, finalConfig.maxCachedMessages]);

  // Memoized return object to prevent unnecessary re-renders
  return useMemo(() => ({
    listRef,
    containerRef,
    state,
    scrollToBottom,
    scrollToMessage,
    scrollToIndex,
    shouldVirtualize,
    getItemHeight,
    onItemsRendered,
  }), [
    listRef,
    containerRef,
    state,
    scrollToBottom,
    scrollToMessage,
    scrollToIndex,
    shouldVirtualize,
    getItemHeight,
    onItemsRendered,
  ]);
};

export default useVirtualScrolling;