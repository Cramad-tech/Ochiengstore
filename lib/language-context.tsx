"use client"

import type React from "react"
import { createContext, useContext, useEffect, useSyncExternalStore } from "react"

import { areFunctionalCookiesAllowed, subscribeToCookiePreferences } from "@/lib/cookie-consent"

type Language = "en" | "sw"

const LANGUAGE_STORAGE_KEY = "app_language"
const LANGUAGE_CHANGE_EVENT = "ochieng-language-change"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

function subscribeToLanguageStore(callback: () => void) {
  const unsubscribeCookies = subscribeToCookiePreferences(callback)

  if (typeof window === "undefined") {
    return unsubscribeCookies
  }

  const handleChange = (event: Event) => {
    if (event instanceof StorageEvent && event.key && event.key !== LANGUAGE_STORAGE_KEY) {
      return
    }

    callback()
  }

  window.addEventListener("storage", handleChange)
  window.addEventListener(LANGUAGE_CHANGE_EVENT, handleChange)

  return () => {
    unsubscribeCookies()
    window.removeEventListener("storage", handleChange)
    window.removeEventListener(LANGUAGE_CHANGE_EVENT, handleChange)
  }
}

function readLanguageSnapshot(): Language {
  if (typeof window === "undefined" || !areFunctionalCookiesAllowed()) {
    return "en"
  }

  return window.localStorage.getItem(LANGUAGE_STORAGE_KEY) === "sw" ? "sw" : "en"
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const functionalCookiesAllowed = useSyncExternalStore(
    subscribeToCookiePreferences,
    areFunctionalCookiesAllowed,
    () => false,
  )
  const language = useSyncExternalStore<Language>(
    subscribeToLanguageStore,
    readLanguageSnapshot,
    () => "en",
  )

  useEffect(() => {
    if (!functionalCookiesAllowed) {
      localStorage.removeItem(LANGUAGE_STORAGE_KEY)
      window.dispatchEvent(new Event(LANGUAGE_CHANGE_EVENT))
    }
  }, [functionalCookiesAllowed])

  const setLanguage = (lang: Language) => {
    if (typeof window !== "undefined" && functionalCookiesAllowed) {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang)
      window.dispatchEvent(new Event(LANGUAGE_CHANGE_EVENT))
    }
  }

  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return context
}
