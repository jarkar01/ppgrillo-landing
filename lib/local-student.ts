'use client'

import { useSyncExternalStore } from 'react'

export type LocalStudent = {
  name: string
  tasksUsed: number
  currentTask?: string
  lastActivityAt?: number
}

const STORAGE_KEY = 'ppgrillo:student'
const CHANGE_EVENT = 'ppgrillo:student-change'

let cachedRaw: string | null = null
let cachedValue: LocalStudent | null = null

function parse(raw: string | null): LocalStudent | null {
  if (!raw) return null
  try {
    const data = JSON.parse(raw) as Partial<LocalStudent>
    if (typeof data.name !== 'string' || !data.name.trim()) return null
    return {
      name: data.name,
      tasksUsed: Number.isFinite(data.tasksUsed) ? Math.max(0, Number(data.tasksUsed)) : 0,
      currentTask: typeof data.currentTask === 'string' ? data.currentTask : undefined,
      lastActivityAt: typeof data.lastActivityAt === 'number' ? data.lastActivityAt : undefined,
    }
  } catch {
    return null
  }
}

export function readLocalStudent(): LocalStudent | null {
  let raw: string | null = null
  try {
    raw = window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw
    cachedValue = parse(raw)
  }
  return cachedValue
}

export function saveLocalStudent(student: LocalStudent) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(student))
  } catch {
    // Storage can be unavailable (private mode); the session still works in memory.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function updateLocalStudent(patch: Partial<LocalStudent>) {
  const current = readLocalStudent()
  if (!current) return
  saveLocalStudent({ ...current, ...patch })
}

function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange)
  window.addEventListener(CHANGE_EVENT, onChange)
  return () => {
    window.removeEventListener('storage', onChange)
    window.removeEventListener(CHANGE_EVENT, onChange)
  }
}

const SERVER_SNAPSHOT = undefined

/** Returns `undefined` until hydrated, then the stored student or `null`. */
export function useLocalStudent(): LocalStudent | null | undefined {
  return useSyncExternalStore(subscribe, readLocalStudent, () => SERVER_SNAPSHOT)
}
