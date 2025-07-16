import React, { useState, useEffect, useRef } from 'react'
import { 
  Button, 
  Input, 
  Avatar,
  Text,
  Spinner
} from '@fluentui/react-components'
import { 
  Send24Regular, 
  Bot24Regular, 
  Person24Regular 
} from '@fluentui/react-icons'
import { useSocket } from '../hooks/useSocket'
import { Message } from '../types/chat'
import MessageList from './MessageList'
import './Chatbot.scss'

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { sendMessage, isConnected } = useSocket({
    onMessage: (message: Message) => {
      setMessages(prev => [...prev, message])
      setIsTyping(false)
    },
    onTyping: () => setIsTyping(true)
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    sendMessage(inputValue)
    setInputValue('')
    setIsTyping(true)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="chatbot">
      <div className="chatbot-header">
        <Avatar 
          icon={<Bot24Regular />}
          color="brand"
          size={40}
        />
        <div className="header-info">
          <Text weight="semibold" size={500}>AI Assistant</Text>
          <Text size={200} className="status-text">
            {isConnected ? 'Online' : 'Connecting...'}
          </Text>
        </div>
      </div>

      <div className="chatbot-messages">
        <MessageList messages={messages} />
        {isTyping && (
          <div className="typing-indicator">
            <Avatar 
              icon={<Bot24Regular />}
              color="brand"
              size={32}
            />
            <div className="typing-bubble">
              <Spinner size="tiny" />
              <Text size={200}>AI is typing...</Text>
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
          placeholder="Type your message..."
          className="message-input"
          contentAfter={
            <Button
              appearance="transparent"
              icon={<Send24Regular />}
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
            />
          }
        />
      </div>
    </div>
  )
}

export default Chatbot