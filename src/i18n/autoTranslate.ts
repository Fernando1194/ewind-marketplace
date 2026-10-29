// Traduz na tela os painéis logados (que ainda estão escritos em português) quando o idioma é EN.
// Funciona sobre o DOM: troca o texto dos nós, placeholders e títulos que existirem em panels.ts,
// guarda o original para voltar ao PT e usa um MutationObserver para pegar o que o React desenhar depois.
// Também traduz alert()/confirm() nativos. Texto fora do dicionário continua em português.
import { translatePt } from './panels'

const ATTRS = ['placeholder', 'title', 'aria-label', 'alt'] as const
const SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'CODE'])

interface Rec { orig: string; out: string }
const textRec = new WeakMap<Text, Rec>()
const attrRec = new WeakMap<Element, Record<string, Rec>>()

let observer: MutationObserver | null = null
let nativeAlert: typeof window.alert | null = null
let nativeConfirm: typeof window.confirm | null = null
let queued = false
const pending = new Set<Node>()
const pendingShallow = new Set<Element>()

const skipped = (n: Node): boolean => {
  const el = n.nodeType === 1 ? (n as Element) : n.parentElement
  return !el || SKIP.has(el.tagName) || !!el.closest('[data-no-translate]')
}

function doText(t: Text) {
  if (skipped(t)) return
  const rec = textRec.get(t)
  // se o React reescreveu o nó, o valor atual passa a ser o novo original
  const orig = rec && t.data === rec.out ? rec.orig : t.data
  const out = translatePt(orig)
  if (out !== t.data) t.data = out
  if (out !== orig || rec) textRec.set(t, { orig, out })
}

function doAttrs(el: Element) {
  if (skipped(el)) return
  let recs = attrRec.get(el)
  for (const a of ATTRS) {
    const cur = el.getAttribute(a)
    if (cur === null) continue
    const rec = recs?.[a]
    const orig = rec && cur === rec.out ? rec.orig : cur
    const out = translatePt(orig)
    if (out !== cur) el.setAttribute(a, out)
    if (out !== orig || rec) { if (!recs) { recs = {}; attrRec.set(el, recs) } recs[a] = { orig, out } }
  }
}

function walk(root: Node) {
  if (root.nodeType === 3) { doText(root as Text); return }
  if (root.nodeType !== 1) return
  doAttrs(root as Element)
  const w = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT)
  let n: Node | null = w.nextNode()
  while (n) { if (n.nodeType === 3) doText(n as Text); else doAttrs(n as Element); n = w.nextNode() }
}

function flush() {
  queued = false
  const nodes = [...pending], shallow = [...pendingShallow]
  pending.clear(); pendingShallow.clear()
  observer?.disconnect()
  try {
    nodes.forEach(n => { if (n.isConnected) walk(n) })
    shallow.forEach(el => { if (el.isConnected) doAttrs(el) })
  } finally { observe() }
}

function observe() {
  observer?.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: [...ATTRS] })
}

function restore(root: Node) {
  const w = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT)
  let n: Node | null = w.currentNode
  while (n) {
    if (n.nodeType === 3) { const r = textRec.get(n as Text); if (r && (n as Text).data === r.out) (n as Text).data = r.orig }
    else if (n.nodeType === 1) {
      const recs = attrRec.get(n as Element)
      if (recs) for (const a of Object.keys(recs)) if ((n as Element).getAttribute(a) === recs[a].out) (n as Element).setAttribute(a, recs[a].orig)
    }
    n = w.nextNode()
  }
}

export function setAutoTranslate(on: boolean) {
  if (typeof document === 'undefined') return
  if (on) {
    if (observer) return
    observer = new MutationObserver(muts => {
      for (const m of muts) {
        if (m.type === 'childList') m.addedNodes.forEach(n => pending.add(n))
        else if (m.type === 'characterData') pending.add(m.target)
        else pendingShallow.add(m.target as Element)
      }
      if (!queued) { queued = true; queueMicrotask(flush) }
    })
    walk(document.body)
    observe()
    nativeAlert = window.alert; nativeConfirm = window.confirm
    window.alert = (msg?: unknown) => nativeAlert!.call(window, typeof msg === 'string' ? translatePt(msg) : msg as string)
    window.confirm = (msg?: string) => nativeConfirm!.call(window, typeof msg === 'string' ? translatePt(msg) : msg)
  } else {
    if (!observer) return
    observer.disconnect(); observer = null; pending.clear(); pendingShallow.clear()
    restore(document.body)
    if (nativeAlert) window.alert = nativeAlert
    if (nativeConfirm) window.confirm = nativeConfirm
    nativeAlert = nativeConfirm = null
  }
}
