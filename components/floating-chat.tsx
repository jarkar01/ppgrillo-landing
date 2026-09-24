"use client"

import React, { useState } from "react"
import { MessageCircle, X, Send } from "lucide-react"

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "¡Hola! Soy PpGrillo, tu compañero de estudio 🦗. ¿Cómo te llamas y qué grado escolar cursas?",
    },
  ])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userText = input.trim()
    setMessages((prev) => [...prev, { role: "user", text: userText }])
    setInput("")

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "¡Mucho gusto! Recuerda que conmigo aprendes razonando paso a paso. ¿En qué ejercicio o materia te gustaría que trabajemos hoy?",
        },
      ])
    }, 700)
  }

  return (
