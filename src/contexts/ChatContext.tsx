import React, { createContext, useContext } from "react";

// Placeholder ChatContext - will be implemented in future tasks
interface ChatContextValue {
  // Placeholder for future chat context implementation
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const contextValue: ChatContextValue = {
    // Placeholder implementation
  };

  return (
    <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
  );
};

export const useChat = (): ChatContextValue => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
