/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext, useCallback, useState, type ReactNode } from "react"
import { LANG, T as Traw, tr as trRaw } from "@/data/lang"
import { DICT_EN } from "./dict"

type Lang = "fr" | "en"

interface I18nCtx {
  lang: Lang
  /** Traduit une clé UI courte (avec interpolation {var}). */
  t: (key: string, vars?: Record<string, any>) => string
  /** Traduit une chaîne source (issue des fichiers data vanilla). */
  tr: (src: string) => string
  /** Traducteur React : 1) dict React local, 2) dict vanilla, 3) fallback identique. */
  tt: (src: string, vars?: Record<string, any>) => string
  setLang: (l: Lang) => void
  toggle: () => void
}

const Ctx = createContext<I18nCtx | null>(null)

function interp(s: string, vars?: Record<string, any>): string {
  if (!vars) return s
  let out = s
  for (const k of Object.keys(vars)) {
    out = out.split(`{${k}}`).join(String(vars[k]))
  }
  return out
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      return (LANG?.getLang?.() as Lang) || "fr"
    } catch {
      return "fr"
    }
  })

  const setLang = useCallback((l: Lang) => {
    try {
      LANG?.setLang?.(l)
    } catch {
      /* le bundle vanilla tente d'appeler un R() global absent — sans danger */
    }
    setLangState(l)
  }, [])

  const t = useCallback(
    (key: string, vars?: Record<string, any>) => {
      void lang
      try {
        return Traw(key, vars)
      } catch {
        return key
      }
    },
    [lang],
  )

  const tr = useCallback(
    (src: string) => {
      void lang
      try {
        return trRaw(src)
      } catch {
        return src
      }
    },
    [lang],
  )

  // tt : essaye notre dict EN, sinon dict vanilla, sinon source identique.
  const tt = useCallback(
    (src: string, vars?: Record<string, any>) => {
      if (lang === "fr") return interp(src, vars)
      // priorité 1 : notre dict React
      if (DICT_EN[src]) return interp(DICT_EN[src], vars)
      // priorité 2 : dict vanilla (D)
      try {
        const v = trRaw(src)
        if (v && v !== src) return interp(v, vars)
      } catch {
        /* ignore */
      }
      // fallback : source
      return interp(src, vars)
    },
    [lang],
  )

  const toggle = useCallback(() => setLang(lang === "fr" ? "en" : "fr"), [lang, setLang])

  return <Ctx.Provider value={{ lang, t, tr, tt, setLang, toggle }}>{children}</Ctx.Provider>
}

export function useI18n(): I18nCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useI18n must be used within I18nProvider")
  return ctx
}
