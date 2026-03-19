"use client"

import { useNotification } from "@/lib/notification-context"
import { X, CheckCircle, AlertCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

export function NotificationToast() {
  const { notifications, removeNotification } = useNotification()

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[130] flex flex-col items-center gap-3 px-4">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={cn(
            "pointer-events-auto flex w-full max-w-2xl items-start gap-3 rounded-[1.35rem] border px-4 py-3 shadow-[0_20px_60px_-26px_rgba(15,23,42,0.42)] backdrop-blur animate-in fade-in slide-in-from-top-4",
            notification.type === "success" && "border-emerald-200 bg-emerald-50/95 text-emerald-950",
            notification.type === "error" && "border-rose-200 bg-rose-50/95 text-rose-950",
            notification.type === "info" && "border-primary/20 bg-white/95 text-foreground",
          )}
        >
          <div
            className={cn(
              "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full",
              notification.type === "success" && "bg-emerald-100 text-emerald-700",
              notification.type === "error" && "bg-rose-100 text-rose-700",
              notification.type === "info" && "bg-primary/10 text-primary",
            )}
          >
            {notification.type === "success" && <CheckCircle className="size-4" />}
            {notification.type === "error" && <AlertCircle className="size-4" />}
            {notification.type === "info" && <Info className="size-4" />}
          </div>
          <div className="min-w-0 flex-1">
            {notification.title ? <p className="text-sm font-semibold">{notification.title}</p> : null}
            <p className={cn("text-sm", notification.title ? "mt-1" : "font-medium")}>{notification.message}</p>
          </div>
          <button
            onClick={() => removeNotification(notification.id)}
            className="ml-auto shrink-0 rounded-full p-1 text-current/70 transition hover:bg-black/5 hover:text-current"
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
