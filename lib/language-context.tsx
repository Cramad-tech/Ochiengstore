"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useSyncExternalStore } from "react"

import { areFunctionalCookiesAllowed, subscribeToCookiePreferences } from "@/lib/cookie-consent"

type Language = "en" | "sw"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")
  const functionalCookiesAllowed = useSyncExternalStore(
    subscribeToCookiePreferences,
    areFunctionalCookiesAllowed,
    () => false,
  )

  useEffect(() => {
    if (!functionalCookiesAllowed) {
      localStorage.removeItem("app_language")
      return
    }

    const savedLanguage = localStorage.getItem("app_language")
    setLanguageState(savedLanguage === "sw" ? "sw" : "en")
  }, [functionalCookiesAllowed])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    if (typeof window !== "undefined" && functionalCookiesAllowed) {
      localStorage.setItem("app_language", lang)
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
