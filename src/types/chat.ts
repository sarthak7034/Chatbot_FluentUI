export interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  status?: MessageStatus;
  type?: MessageType;
  metadata?: MessageMetadata;
}

export type MessageStatus = "sending" | "sent" | "delivered" | "failed";

export type MessageType = "text" | "image" | "file" | "system";

export interface MessageMetadata {
  edited?: boolean;
  editedAt?: Date;
  reactions?: Reaction[];
  threadId?: string;
  replyTo?: string;
  retryCount?: number;
  errorMessage?: string;
}

export interface Reaction {
  id: string;
  emoji: string;
  userId: string;
  timestamp: Date;
}

export interface EnhancedMessage extends Message {
  status: MessageStatus;
  metadata: MessageMetadata;
}

export interface SocketCallbacks {
  onMessage: (message: Message) => void;
  onTyping: () => void;
}

// Message state helpers and utility types
export interface MessageState {
  isPending: boolean;
  hasError: boolean;
  isEdited: boolean;
  hasReactions: boolean;
  isThreaded: boolean;
}

export interface MessageContentState {
  isLoading: boolean;
  hasContent: boolean;
  contentType: MessageType;
  canEdit: boolean;
  canReact: boolean;
  canReply: boolean;
}

// Factory functions for creating messages with different states
export const createUserMessage = (
  text: string,
  options?: Partial<Message>
): Message => ({
  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  text,
  sender: "user",
  timestamp: new Date(),
  status: "sending",
  type: "text",
  metadata: {
    retryCount: 0,
  },
  ...options,
});

export const createBotMessage = (
  text: string,
  options?: Partial<Message>
): Message => ({
  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  text,
  sender: "bot",
  timestamp: new Date(),
  status: "sent",
  type: "text",
  metadata: {},
  ...options,
});

export const createSystemMessage = (
  text: string,
  options?: Partial<Message>
): Message => ({
  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  text,
  sender: "bot",
  timestamp: new Date(),
  status: "sent",
  type: "system",
  metadata: {},
  ...options,
});

// Message state utility functions
export const getMessageState = (message: Message): MessageState => ({
  isPending: message.status === "sending",
  hasError: message.status === "failed",
  isEdited: message.metadata?.edited || false,
  hasReactions: (message.metadata?.reactions?.length || 0) > 0,
  isThreaded: !!message.metadata?.threadId || !!message.metadata?.replyTo,
});

export const getMessageContentState = (
  message: Message
): MessageContentState => ({
  isLoading: message.status === "sending",
  hasContent: !!message.text.trim(),
  contentType: message.type || "text",
  canEdit: message.sender === "user" && message.status === "sent",
  canReact: message.status === "sent" || message.status === "delivered",
  canReply: message.status === "sent" || message.status === "delivered",
});

// Message update helpers
export const updateMessageStatus = (
  message: Message,
  status: MessageStatus
): Message => ({
  ...message,
  status,
  metadata: {
    ...message.metadata,
    ...(status === "failed" && {
      retryCount: (message.metadata?.retryCount || 0) + 1,
    }),
  },
});

export const addReactionToMessage = (
  message: Message,
  reaction: Reaction
): Message => ({
  ...message,
  metadata: {
    ...message.metadata,
    reactions: [...(message.metadata?.reactions || []), reaction],
  },
});

export const removeReactionFromMessage = (
  message: Message,
  reactionId: string
): Message => ({
  ...message,
  metadata: {
    ...message.metadata,
    reactions:
      message.metadata?.reactions?.filter((r) => r.id !== reactionId) || [],
  },
});

export const markMessageAsEdited = (
  message: Message,
  newText: string
): Message => ({
  ...message,
  text: newText,
  metadata: {
    ...message.metadata,
    edited: true,
    editedAt: new Date(),
  },
});