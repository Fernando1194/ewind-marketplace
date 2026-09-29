import { useState } from 'react'
import { supabase } from '../supabase'
import type { User } from '@supabase/supabase-js'

interface Props {
  user: User
  /** Tabelas extras (além de profiles) a incluir na exportação de dados deste perfil.
   *  Ex: para host, ['spaces']; para fornecedor, ['suppliers']. Cada entrada é filtrada
   *  pela coluna informada = user.id. */
  extraExportTables?: { table: string; column: string; label: string }[]
}

/**
 * Painel de direitos LGPD (Art. 18): exportar dados e solicitar exclusão de conta.
 * Compartilhado entre GuestDashboard, HostDashboard e SupplierDashboard para que
 * organizador, anunciante e fornecedor tenham o mesmo self-service, em vez de só
 * o organizador ter e os demais precisarem escrever um email.
 */
export default function LgpdRightsPanel({ user, extraExportTables = [] }: Props) {
  const [deletionReason, setDeletionReason] = useState('')
  const [deletionRequested, setDeletionRequested] = useState(false)
  const [deletionSending, setDeletionSending] = useState(false)
  const [deletionError, setDeletionError] = useState('')
  const [exporting, setExporting] = useState(false)

  const downloadData = async () => {
    setExporting(true)
    try {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      const extras: Record<string, any> = {}
      for (const t of extraExportTables) {
        const { data } = await supabase.from(t.table).select('*').eq(t.column, user.id)
        extras[t.table] = data || []
      }
      const exportData = { profile, ...extras, exportedAt: new Date().toISOString() }
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `ewind-meus-dados-${new Date().toISOString().split('T')[0]}.json`
      a.click()
    } finally {
      setExporting(false)
    }
  }

  const requestDeletion = async () => {
    setDeletionSending(true)
    setDeletionError('')
    try {
      const { error } = await supabase.from('deletion_requests').insert({
        user_id: user.id,
        user_email: user.email,
        reason: deletionReason || null,
      })
      if (error) throw error
      setDeletionRequested(true)
    } catch (err: any) {
      setDeletionError(err.message || 'Erro ao registrar solicitação. Tente novamente ou envie um email para privacidade@ewind.com.br.')
    }
    setDeletionSending(false)
  }

  return (
    <div style={{ maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Seus direitos */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8e8e8', padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>🔒 Seus direitos pela LGPD</h3>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>Conforme a Lei 13.709/2018, você tem os seguintes direitos sobre seus dados pessoais:</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { icon: '👁️', title: 'Acesso', desc: 'Saber quais dados temos sobre você' },
            { icon: '✏️', title: 'Correção', desc: 'Corrigir dados incompletos ou desatualizados' },
            { icon: '🚫', title: 'Eliminação', desc: 'Solicitar exclusão dos seus dados pessoais' },
            { icon: '📦', title: 'Portabilidade', desc: 'Receber seus dados em formato estruturado' },
            { icon: '↩️', title: 'Revogação', desc: 'Retirar consentimento a qualquer momento' },
          ].map(r => (
            <div key={r.title} style={{ display: 'flex', gap: 12, padding: '10px 14px', background: '#f9fafb', borderRadius: 8 }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{r.icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{r.title}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{r.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Exportar dados */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8e8e8', padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>📦 Exportar meus dados</h3>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>Baixe uma cópia dos seus dados pessoais armazenados no Ewind (direito de portabilidade).</p>
        <button onClick={downloadData} disabled={exporting} className="btn-primary" style={{ fontSize: 13, padding: '9px 20px', opacity: exporting ? 0.7 : 1 }}>
          {exporting ? 'Preparando...' : '📥 Baixar meus dados (JSON)'}
        </button>
      </div>

      {/* Solicitar exclusão */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #fecaca', padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#991b1b', marginBottom: 4 }}>🗑️ Solicitar exclusão da conta</h3>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
          Conforme o Art. 18 da LGPD, você pode solicitar a exclusão dos seus dados pessoais. Processaremos em até 15 dias úteis.
          <strong style={{ color: '#dc2626' }}> Esta ação é irreversível.</strong>
        </p>
        {deletionRequested ? (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '14px 18px', fontSize: 13, color: '#991b1b' }}>
            ✅ Solicitação registrada. Nossa equipe entrará em contato em {user.email} em até 15 dias úteis.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="fg">
              <label style={{ color: '#374151' }}>Motivo (opcional)</label>
              <select value={deletionReason} onChange={e => setDeletionReason(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #fecaca', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', background: '#fff' }}>
                <option value="">Selecione...</option>
                <option>Não quero mais usar o Ewind</option>
                <option>Preocupações com privacidade</option>
                <option>Criou conta por engano</option>
                <option>Outro</option>
              </select>
            </div>
            {deletionError && (
              <div style={{ fontSize: 12, color: '#dc2626' }}>⚠️ {deletionError}</div>
            )}
            <button onClick={requestDeletion} disabled={deletionSending}
              style={{ alignSelf: 'flex-start', padding: '10px 20px', fontSize: 13, fontWeight: 700, background: '#fff', border: '2px solid #dc2626', color: '#dc2626', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', opacity: deletionSending ? 0.7 : 1 }}>
              {deletionSending ? 'Enviando...' : '🗑️ Solicitar exclusão da minha conta'}
            </button>
          </div>
        )}
      </div>

    </div>
  )
}
