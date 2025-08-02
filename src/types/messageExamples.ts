// Example usage of enhanced message types
import {
  Message,
  MessageStatus,
  MessageType,
  Reaction,
  createUserMessage,
  createBotMessage,
  createSystemMessage,
  getMessageState,
  getMessageContentState,
  updateMessageStatus,
  addReactionToMessage,
  removeReactionFromMessage,
  markMessageAsEdited,
} from "./chat";

// Example 1: Creating different types of messages
export const exampleMessages = {
  // User message with sending status
  userMessage: createUserMessage("Hello, how are you?"),

  // Bot response message
  botMessage: createBotMessage("I'm doing great! How can I help you today?"),

  // System message
  systemMessage: createSystemMessage("User joined the chat"),

  // Message with custom options
  customMessage: createUserMessage("Custom message", {
    type: "text",
    metadata: {
      threadId: "thread-123",
      replyTo: "message-456",
    },
  }),
};

// Example 2: Working with message statuses
export const statusExamples = () => {
  const message = createUserMessage("Test message");

  // Update message through different states
  const sentMessage = updateMessageStatus(message, "sent");
  const deliveredMessage = updateMessageStatus(sentMessage, "delivered");
  const failedMessage = updateMessageStatus(message, "failed");

  return {
    original: message,
    sent: sentMessage,
    delivered: deliveredMessage,
    failed: failedMessage,
  };
};

// Example 3: Working with reactions
export const reactionExamples = () => {
  const message = createBotMessage("This is a great idea!");

  const reaction1: Reaction = {
    id: "reaction-1",
    emoji: "👍",
    userId: "user-123",
    timestamp: new Date(),
  };

  const reaction2: Reaction = {
    id: "reaction-2",
    emoji: "❤️",
    userId: "user-456",
    timestamp: new Date(),
  };

  // Add reactions
  const messageWithReaction1 = addReactionToMessage(message, reaction1);
  const messageWithBothReactions = addReactionToMessage(
    messageWithReaction1,
    reaction2
  );

  // Remove a reaction
  const messageWithOneReaction = removeReactionFromMessage(
    messageWithBothReactions,
    "reaction-1"
  );

  return {
    original: message,
    withOneReaction: messageWithReaction1,
    withTwoReactions: messageWithBothReactions,
    backToOneReaction: messageWithOneReaction,
  };
};

// Example 4: Working with message editing
export const editingExamples = () => {
  const message = createUserMessage("Original message text");

  // Mark as edited
  const editedMessage = markMessageAsEdited(message, "Edited message text");

  return {
    original: message,
    edited: editedMessage,
  };
};

// Example 5: Using message state utilities
export const stateExamples = () => {
  const pendingMessage = createUserMessage("Pending message");
  const failedMessage = updateMessageStatus(pendingMessage, "failed");
  const editedMessage = markMessageAsEdited(
    createUserMessage("Test"),
    "Edited"
  );

  return {
    pendingState: getMessageState(pendingMessage),
    failedState: getMessageState(failedMessage),
    editedState: getMessageState(editedMessage),

    pendingContentState: getMessageContentState(pendingMessage),
    botContentState: getMessageContentState(createBotMessage("Bot message")),
  };
};

// Example 6: Complex message with all features
export const complexMessageExample = (): Message => {
  const baseMessage = createUserMessage(
    "This is a complex message with all features"
  );

  // Add metadata
  const messageWithMetadata: Message = {
    ...baseMessage,
    status: "sent",
    type: "text",
    metadata: {
      edited: true,
      editedAt: new Date(Date.now() - 60000), // 1 minute ago
      reactions: [
        {
          id: "reaction-1",
          emoji: "👍",
          userId: "user-1",
          timestamp: new Date(Date.now() - 30000),
        },
        {
          id: "reaction-2",
          emoji: "❤️",
          userId: "user-2",
          timestamp: new Date(Date.now() - 15000),
        },
      ],
      threadId: "thread-abc123",
      replyTo: "message-xyz789",
      retryCount: 0,
    },
  };

  return messageWithMetadata;
};

// Example 7: Message validation helpers
export const validateMessage = (message: Message): boolean => {
  // Basic validation
  if (!message.id || !message.text || !message.sender || !message.timestamp) {
    return false;
  }

  // Status validation
  const validStatuses: MessageStatus[] = [
    "sending",
    "sent",
    "delivered",
    "failed",
  ];
  if (message.status && !validStatuses.includes(message.status)) {
    return false;
  }

  // Type validation
  const validTypes: MessageType[] = ["text", "image", "file", "system"];
  if (message.type && !validTypes.includes(message.type)) {
    return false;
  }

  return true;
};

// Example 8: Message filtering utilities
export const filterMessages = (messages: Message[]) => {
  return {
    pending: messages.filter((m) => m.status === "sending"),
    failed: messages.filter((m) => m.status === "failed"),
    edited: messages.filter((m) => m.metadata?.edited),
    withReactions: messages.filter(
      (m) => (m.metadata?.reactions?.length || 0) > 0
    ),
    threaded: messages.filter(
      (m) => m.metadata?.threadId || m.metadata?.replyTo
    ),
    system: messages.filter((m) => m.type === "system"),
    userMessages: messages.filter((m) => m.sender === "user"),
    botMessages: messages.filter((m) => m.sender === "bot"),
  };
};
