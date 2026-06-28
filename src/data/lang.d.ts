// Déclarations TS pour le bundle i18n vanilla (lang.js).
/* eslint-disable @typescript-eslint/no-explicit-any */

export const LANG: {
  t: (key: string, vars?: Record<string, any>) => string
  tr: (src: string) => string
  setLang: (code: string) => void
  getLang: () => string
  pickLang: (obj: { fr: string; en: string }) => string
}
export const T: (key: string, vars?: Record<string, any>) => string
export const tr: (src: string) => string
export const pickLang: (obj: { fr: string; en: string }) => string
