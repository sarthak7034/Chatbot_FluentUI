import React from 'react'
import { Avatar, Text } from '@fluentui/react-components'
import { Bot24Regular, Person24Regular } from '@fluentui/react-icons'
import { Message } from '../types/chat'
import './MessageList.scss'

interface MessageListProps {
  messages: Message[]
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const formatTime = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(timestamp)
  }

  return (
    <div className="message-list">
      {messages.length === 0 && (
        <div className="welcome-message">
          <Avatar 
            icon={<Bot24Regular />}
            color="brand"
            size={48}
          />
          <div className="welcome-content">
            <Text weight="semibold" size={500}>Welcome! 👋</Text>
            <Text size={300} className="welcome-subtitle">
              I'm your AI assistant. How can I help you today?
            </Text>
          </div>
        </div>
      )}
      
      {messages.map((message) => (
        <div 
          key={message.id} 
          className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
        >
          <Avatar 
            icon={message.sender === 'user' ? <Person24Regular /> : <Bot24Regular />}
            color={message.sender === 'user' ? 'colorful' : 'brand'}
            size={36}
            className="message-avatar"
          />
          <div className="message-content">
            <div className="message-bubble">
              <Text>{message.text}</Text>
            </div>
            <Text size={200} className="message-time">
              {formatTime(message.timestamp)}
            </Text>
          </div>
        </div>
      ))}
    </div>
  )
}

export default MessageList