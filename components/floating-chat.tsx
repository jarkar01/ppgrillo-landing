'use client'

import React, { useState } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState>([
    {
      sender: 'bot',
      text: '¡Hola! Soy PpGrillo 🦗, tu tutor socrático. ¿En qué problema o concepto te gustaría que pensemos juntos hoy?'
    }
  ])
  const [inputValue, setInputValue] = useState('')

  const handleSend = () => {
    if (!inputValue.trim()) return

    const userMessage = inputValue
    setMessages((prev) => [...prev, { sender: 'user', text: userMessage }])
    setInputValue('')

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'Interesante planteamiento. Antes de resolverlo directamente, cuéntame: ¿qué datos o pistas clave identificas primero?'
        }
      ])
    }, 700)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend()
    }
  }

  return (
