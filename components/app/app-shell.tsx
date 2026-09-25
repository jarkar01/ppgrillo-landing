'use client'

import { useRef, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, type UIMessage } from 'ai'
import { AppSidebar } from './app-sidebar'
import { TutorChat } from './tutor-chat'
import type { StudentProfile, TutorSession } from './types'

function deriveTitle(messages: UIMessage[]): string {
  const firstUser = messages.find((m) => m.role === 'user')
  if (firstUser) {
    const text = firstUser.parts
      .map((p) => (p.type === 'text' ? p.text : ''))
      .join(' ')
      .trim()
    if (text) return text.length > 34 ? `${text.slice(0, 34)}…` : text
    return 'Foto del ejercicio'
  }
  return 'Nueva consulta'
}

export function AppShell({ profile, onLogout }: { profile: StudentProfile; onLogout: () => void }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sessions, setSessions] = useState<TutorSession[]>([])
  const [activeId, setActiveId] = useState<string>(() => crypto.randomUUID())

  const { messages, sendMessage, setMessages, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/tutor',
      body: { studentName: profile.studentName, grade: profile.grade },
    }),
  })

  // keep latest messages reachable for save operations
  const messagesRef = useRef(messages)
  messagesRef.current = messages

  function persistCurrent() {
    const list = messagesRef.current
    if (list.length === 0) return
    const title = deriveTitle(list)
    setSessions((prev) => {
      const exists = prev.some((s) => s.id === activeId)
      if (exists) return prev.map((s) => (s.id === activeId ? { ...s, title, messages: list } : s))
      return [{ id: activeId, title, messages: list }, ...prev]
    })
  }

  function handleNewConsulta() {
    persistCurrent()
    setActiveId(crypto.randomUUID())
    setMessages([])
    setSidebarOpen(false)
  }

  function handleSelectSession(id: string) {
    if (id === activeId) {
      setSidebarOpen(false)
      return
    }
    persistCurrent()
    const target = sessions.find((s) => s.id === id)
    setActiveId(id)
    setMessages(target ? target.messages : [])
    setSidebarOpen(false)
  }

  function handleSend(text: string, files?: FileList) {
    const trimmed = text.trim()
    if (files && files.length > 0) {
      sendMessage({ text: trimmed, files })
    } else {
      sendMessage({ text: trimmed })
    }
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <AppSidebar
        profile={profile}
        sessions={sessions}
        activeId={activeId}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewConsulta={handleNewConsulta}
        onSelectSession={handleSelectSession}
        onLogout={onLogout}
      />
      <TutorChat
        profile={profile}
        messages={messages}
        status={status}
        onSend={handleSend}
        onOpenSidebar={() => setSidebarOpen(true)}
      />
    </div>
  )
}
