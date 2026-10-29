import { setAutoTranslate } from './autoTranslate'
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'

// Idioma do site. Português é o padrão (o lançamento é em Curitiba); a escolha do
// visitante fica salva só no navegador dele. Textos novos entram em pares { pt, en }
// ao lado de cada página; o que ainda não foi traduzido continua em português.

export type Lang = 'pt' | 'en'
const KEY = 'ewind-lang'

let current: Lang = 'pt'
/** Idioma atual fora de componentes (datas, números). */
export const currentLang = (): Lang => current
/** Código de locale para toLocaleDateString / toLocaleString. */
export const loc = (): string => (current === 'en' ? 'en-US' : 'pt-BR')

function readSaved(): Lang {
  try {
    const v = localStorage.getItem(KEY)
    if (v === 'pt' || v === 'en') return v
  } catch { /* armazenamento indisponível */ }
  return 'pt'
}

interface Ctx { lang: Lang; setLang: (l: Lang) => void }
const LangContext = createContext<Ctx>({ lang: 'pt', setLang: () => {} })

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => { const l = readSaved(); current = l; return l })
  useEffect(() => {
    current = lang
    document.documentElement.lang = lang === 'en' ? 'en' : 'pt-BR'
    setAutoTranslate(lang === 'en')
  }, [lang])
  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try { localStorage.setItem(KEY, l) } catch { /* ignora */ }
  }, [])
  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>
}

export const useLang = () => useContext(LangContext)

/** Escolhe o texto do idioma atual. Ex.: const c = useCopy(COPY) */
export function useCopy<T>(copy: { pt: T; en: T }): T {
  return copy[useLang().lang]
}

export function LangToggle({ style }: { style?: React.CSSProperties }) {
  const { lang, setLang } = useLang()
  const btn = (l: Lang, label: string, aria: string) => (
    <button onClick={() => setLang(l)} aria-label={aria} aria-pressed={lang === l}
      style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 800, padding: '5px 9px', borderRadius: 100, background: lang === l ? '#a3e635' : 'transparent', color: lang === l ? '#1a2e05' : '#6b7280' }}>
      {label}
    </button>
  )
  return (
    <div role="group" aria-label="Idioma / Language" style={{ display: 'inline-flex', gap: 2, border: '1px solid #e8e8e8', borderRadius: 100, padding: 2, background: '#fff', ...style }}>
      {btn('pt', 'PT', 'Português')}
      {btn('en', 'EN', 'English')}
    </div>
  )
}
