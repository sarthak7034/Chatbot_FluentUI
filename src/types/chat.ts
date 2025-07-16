export interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

export interface SocketCallbacks {
  onMessage: (message: Message) => void
  onTyping: () => void
}