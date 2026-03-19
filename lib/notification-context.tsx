"use client"

import type React from "react"
import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react"

export interface Notification {
  id: string
  title?: string
  message: string
  type: "success" | "error" | "info"
  duration?: number
}

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (
    message: string,
    type?: "success" | "error" | "info",
    duration?: number,
    title?: string,
  ) => void
  removeNotification: (id: string) => void
}

const NotificationContext = createContext<NotificationContextType | null>(null)

export function NotificationProvider({
  children,
  initialNotifications = [],
}: {
  children: React.ReactNode
  initialNotifications?: Notification[]
}) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const hydratedIdsRef = useRef(new Set<string>())

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const addNotification = useCallback(
    (message: string, type: "success" | "error" | "info" = "success", duration = 3200, title?: string) => {
      const id = Date.now().toString()
      const notification: Notification = { id, title, message, type, duration }

      setNotifications((prev) => [...prev, notification])

      if (duration) {
        setTimeout(() => {
          removeNotification(id)
        }, duration)
      }
    },
    [removeNotification],
  )

  useEffect(() => {
    if (initialNotifications.length === 0) {
      return
    }

    setNotifications((prev) => {
      const next = [...prev]

      for (const notification of initialNotifications) {
        if (hydratedIdsRef.current.has(notification.id) || next.some((entry) => entry.id === notification.id)) {
          continue
        }

        hydratedIdsRef.current.add(notification.id)
        next.push(notification)

        if (notification.duration ?? 3200) {
          setTimeout(() => {
            removeNotification(notification.id)
          }, notification.duration ?? 3200)
        }
      }

      return next
    })

    void fetch("/api/flash/clear", {
      method: "POST",
      credentials: "same-origin",
    }).catch(() => undefined)
  }, [initialNotifications, removeNotification])

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider")
  }
  return context
}
