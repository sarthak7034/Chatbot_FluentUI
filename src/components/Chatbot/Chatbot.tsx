import React, { useState, useEffect, useRef } from "react";
import { Button, Input, Avatar, Text } from "@fluentui/react-components";
import { Send24Regular, Bot24Regular } from "@fluentui/react-icons";
import { useSocket } from "../../hooks/useSocket";
import { Message } from "../../types/chat";
import MessageList from "../MessageList";
import { ThemeToggle, StatusIndicator } from "../UI";
import type { ConnectionStatus } from "../UI";
import "./Chatbot.scss";

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { sendMessage, isConnected } = useSocket({
    onMessage: (message: Message) => {
      setMessages((prev) => [...prev, message]);
      setIsTyping(false);
    },
    onTyping: () => setIsTyping(true),
  });

  // Determine connection status for StatusIndicator
  const getConnectionStatus = (): ConnectionStatus => {
    if (isConnected) return "connected";
    return "connecting";
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = () => {
    if (!inputValue.trim() || !isConnected) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    sendMessage(inputValue);
    setInputValue("");
    setIsTyping(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chatbot">
      <div className="chatbot-header">
        <div className="header-left">
          <Avatar icon={<Bot24Regular />} color="brand" size={48} />
          <div className="header-info">
            <Text weight="semibold" size={600}>
              AI Assistant
            </Text>
            <StatusIndicator
              status={getConnectionStatus()}
              size="small"
              showText={true}
            />
          </div>
        </div>
        <div className="header-right">
          <ThemeToggle size="medium" />
        </div>
      </div>

      <div className="chatbot-messages">
        <MessageList messages={messages} />
        {isTyping && (
          <div className="typing-indicator">
            <Avatar icon={<Bot24Regular />} color="brand" size={32} />
            <div className="typing-bubble">
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <Text size={300}>AI is thinking...</Text>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chatbot-input">
        <Input
          value={inputValue}
          onChange={(_, data) => setInputValue(data.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ask me anything... ✨"
          className="message-input"
          contentAfter={
            <Button
              appearance="transparent"
              icon={<Send24Regular />}
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || !isConnected}
              title={!isConnected ? "Connecting..." : "Send message"}
            />
          }
        />
      </div>
    </div>
  );
};

export default Chatbot;
