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
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(timestamp)
  }

  return (
    <div className="message-list">
      {messages.map((message) => (
        <div 
          key={message.id} 
          className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
        >
          <Avatar 
            icon={message.sender === 'user' ? <Person24Regular /> : <Bot24Regular />}
            color={message.sender === 'user' ? 'colorful' : 'brand'}
            size={32}
            className="message-avatar"
          />
          <div className="message-content">
            <div className="message-bubble">
              <Text>{message.text}</Text>
            </div>
            <Text size={100} className="message-time">
              {formatTime(message.timestamp)}
            </Text>
          </div>
        </div>
      ))}
    </div>
  )
}

export default MessageList