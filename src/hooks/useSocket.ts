import { useState, useEffect, useCallback } from 'react'
import {
  SocketCallbacks,
  createUserMessage,
  createBotMessage,
  updateMessageStatus,
} from "../types/chat";
import { mockResponses } from "../data/mockData";

export const useSocket = ({ onMessage, onTyping }: SocketCallbacks) => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Simulate connection
    const timer = setTimeout(() => {
      setIsConnected(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const sendMessage = useCallback(
    (text: string) => {
      // Create user message with sending status
      const userMessage = createUserMessage(text);

      // Send user message immediately with sending status
      onMessage(userMessage);

      // Simulate typing indicator
      onTyping();

      // Simulate network delay and bot response
      setTimeout(() => {
        const response = getRandomResponse(text);
        const botMessage = createBotMessage(response);
        onMessage(botMessage);
      }, 1000 + Math.random() * 2000); // 1-3 seconds delay
    },
    [onMessage, onTyping]
  );

  return {
    sendMessage,
    isConnected,
  };
};

const getRandomResponse = (userMessage: string): string => {
  const lowerMessage = userMessage.toLowerCase()
  
  // Check for specific keywords
  for (const [keywords, responses] of Object.entries(mockResponses)) {
    if (keywords.split(',').some(keyword => lowerMessage.includes(keyword.trim()))) {
      return responses[Math.floor(Math.random() * responses.length)]
    }
  }
  
  // Default responses
  const defaultResponses = mockResponses.default
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
}