import React, {
  useState,
  useEffect,
  useRef,
  memo,
  useCallback,
  useMemo,
  Suspense,
} from "react";
import { useSocket } from "../../hooks/useSocket";
import {
  Message,
  createUserMessage,
  updateMessageStatus,
} from "../../types/chat";
import MessageList from "../MessageList";
import {
  LazyTypingIndicator,
  TypingIndicatorLoading,
  preloadCriticalComponents,
  preloadNonCriticalComponents,
} from "../lazy/index";

import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import "./Chatbot.scss";

const Chatbot: React.FC = memo(() => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Memoized socket callbacks to prevent unnecessary re-renders
  const socketCallbacks = useMemo(
    () => ({
      onMessage: (message: Message) => {
        setMessages((prev) => [...prev, message]);
        setIsTyping(false);
      },
      onTyping: () => setIsTyping(true),
    }),
    []
  );

  const { sendMessage, isConnected } = useSocket(socketCallbacks);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // Preload components on mount
  useEffect(() => {
    preloadCriticalComponents();

    // Preload non-critical components after a delay
    const timer = setTimeout(() => {
      preloadNonCriticalComponents();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = useCallback(
    (message: string) => {
      if (!message.trim() || !isConnected) return;

      // Create user message with sending status
      const userMessage = createUserMessage(message);
      setMessages((prev) => [...prev, userMessage]);

      // Send message and update status
      sendMessage(message);

      // Update message status to sent after a brief delay (simulating network)
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === userMessage.id ? updateMessageStatus(msg, "sent") : msg
          )
        );
      }, 500);

      setInputValue("");
      setIsTyping(true);
    },
    [isConnected, sendMessage]
  );

  // Memoized message list props
  const messageListProps = useMemo(
    () => ({
      messages,
      showTimestamps: true,
      groupMessages: true,
      timestampFormat: "relative" as const,
      virtualScrolling: messages.length > 50,
      height: 400,
      maxCachedMessages: 1000,
    }),
    [messages]
  );

  return (
    <div className="chatbot">
      <ChatHeader
        title="AI Assistant"
        isConnected={isConnected}
        showThemeToggle={true}
      />

      <div className="chatbot-messages">
        <MessageList {...messageListProps} />
        <Suspense fallback={<TypingIndicatorLoading />}>
          <LazyTypingIndicator isVisible={isTyping} />
        </Suspense>
        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        value={inputValue}
        onChange={setInputValue}
        onSend={handleSendMessage}
        isConnected={isConnected}
        showCharCount={true}
        maxLength={2000}
        enableShortcuts={true}
        placeholder="Ask me anything... ✨"
      />
    </div>
  );
});

Chatbot.displayName = "Chatbot";

export default Chatbot;
