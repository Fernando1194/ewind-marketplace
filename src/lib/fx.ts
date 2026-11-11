// Efeitos de interface que precisam de um pouco de JS: menu que ganha vidro e sombra ao rolar,
// e brilho que acompanha o cursor nos cartões (.fx-glow, .card). Tudo é descartado quando o
// visitante pede menos movimento, e o brilho só roda com mouse (não em telas de toque).
export function initFx(): () => void {
  if (typeof window === 'undefined') return () => {}
  const root = document.documentElement
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)')

  let ticking = false
  const onScroll = () => {
    if (ticking) return
    ticking = true
    requestAnimationFrame(() => {
      root.toggleAttribute('data-scrolled', window.scrollY > 8)
      ticking = false
    })
  }
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })

  let raf = 0
  const onMove = (e: PointerEvent) => {
    if (reduce.matches || !fine.matches) return
    const el = (e.target as Element | null)?.closest?.('.fx-glow, .card') as HTMLElement | null
    if (!el) return
    cancelAnimationFrame(raf)
    raf = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect()
      el.style.setProperty('--mx', `${e.clientX - r.left}px`)
      el.style.setProperty('--my', `${e.clientY - r.top}px`)
    })
  }
  document.addEventListener('pointermove', onMove, { passive: true })

  return () => {
    window.removeEventListener('scroll', onScroll)
    document.removeEventListener('pointermove', onMove)
    cancelAnimationFrame(raf)
  }
}
