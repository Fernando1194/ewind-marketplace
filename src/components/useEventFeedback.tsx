import { useState, useCallback } from 'react'

// Hook + componentes de feedback para operações de banco:
// - toast de erro/sucesso (substitui falha silenciosa)
// - modal de confirmação (substitui o confirm() nativo)

export interface ConfirmState {
  message: string
  onConfirm: () => void
}

export function useEventFeedback() {
  const [toast, setToast] = useState<{ msg: string; type: 'error' | 'success' } | null>(null)
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null)

  const showError = useCallback((msg: string) => {
    setToast({ msg, type: 'error' })
    setTimeout(() => setToast(null), 4000)
  }, [])

  const showSuccess = useCallback((msg: string) => {
    setToast({ msg, type: 'success' })
    setTimeout(() => setToast(null), 2500)
  }, [])

  const confirm = useCallback((message: string, onConfirm: () => void) => {
    setConfirmState({ message, onConfirm })
  }, [])

  // Envolve uma operação async de banco: se falhar, mostra erro e retorna false.
  const run = useCallback(async (
    op: () => Promise<{ error: any } | void>,
    errMsg = 'Não foi possível salvar. Verifique sua conexão e tente novamente.'
  ): Promise<boolean> => {
    try {
      const res = await op()
      if (res && (res as any).error) {
        showError(errMsg)
        return false
      }
      return true
    } catch {
      showError(errMsg)
      return false
    }
  }, [showError])

  return { toast, confirmState, setConfirmState, showError, showSuccess, confirm, run }
}

// Toast visual (canto inferior)
export function Toast({ toast }: { toast: { msg: string; type: 'error' | 'success' } | null }) {
  if (!toast) return null
  const isErr = toast.type === 'error'
  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, maxWidth: 420, width: 'calc(100% - 32px)',
      background: isErr ? '#991b1b' : '#16a34a', color: '#fff',
      padding: '13px 18px', borderRadius: 12, fontSize: 14, fontWeight: 600,
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: 10,
      animation: 'toastIn .25s ease-out',
    }}>
      <span style={{ fontSize: 16 }}>{isErr ? '⚠️' : '✅'}</span>
      <span>{toast.msg}</span>
    </div>
  )
}

// Modal de confirmação (substitui confirm() nativo)
export function ConfirmModal({ state, onClose }: { state: ConfirmState | null; onClose: () => void }) {
  if (!state) return null
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 16, padding: 24, maxWidth: 380, width: '100%',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
      }}>
        <div style={{ fontSize: 15, color: '#1a1a1a', lineHeight: 1.5, marginBottom: 20 }}>{state.message}</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '9px 18px', fontSize: 14, fontWeight: 600, background: '#f3f4f6', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', color: '#6b7280' }}>
            Cancelar
          </button>
          <button onClick={() => { state.onConfirm(); onClose() }} style={{ padding: '9px 18px', fontSize: 14, fontWeight: 700, background: '#dc2626', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', color: '#fff' }}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}
