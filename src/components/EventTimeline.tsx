import { useState } from 'react'
import type { EventItem, EventContract, ContractPayment } from '../types'

interface ContractWithPayments extends EventContract {
  payments: ContractPayment[]
}

interface Props {
  event: EventItem
  contracts: ContractWithPayments[]
}

type MarkerType = 'payment' | 'service' | 'event' | 'signed'

interface Marker {
  date: string
  type: MarkerType
  title: string
  subtitle: string
  amount: number | null
  status: 'paid' | 'overdue' | 'pending' | 'done' | 'future'
  contractName: string
}

const TYPE_META: Record<MarkerType, { icon: string; label: string; color: string }> = {
  payment: { icon: '💰', label: 'Pagamento', color: '#d97706' },
  service:  { icon: '🛠️', label: 'Serviço',  color: '#7c3aed' },
  signed:   { icon: '✍️', label: 'Assinatura', color: '#6b7280' },
  event:    { icon: '🎉', label: 'Evento',    color: '#16a34a' },
}

export default function EventTimeline({ event, contracts }: Props) {
  const [filter, setFilter] = useState<'all' | 'payment' | 'service'>('all')
  const today = new Date().toISOString().split('T')[0]
  const money = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const fmtDate = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
  const monthYear = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  // Build markers from all data
  const markers: Marker[] = []

  contracts.forEach(c => {
    // payments
    c.payments.forEach(p => {
      markers.push({
        date: p.due_date,
        type: 'payment',
        title: p.label || 'Parcela',
        subtitle: c.supplier_name,
        amount: Number(p.amount),
        status: p.paid ? 'paid' : (p.due_date < today ? 'overdue' : 'pending'),
        contractName: c.supplier_name,
      })
    })
    // service date
    if (c.service_date) {
      markers.push({
        date: c.service_date,
        type: 'service',
        title: `Serviço: ${c.category || c.supplier_name}`,
        subtitle: c.supplier_name,
        amount: null,
        status: c.service_date < today ? 'done' : 'future',
        contractName: c.supplier_name,
      })
    }
  })

  // event day as final milestone
  if (event.event_date) {
    markers.push({
      date: event.event_date,
      type: 'event',
      title: `🎉 ${event.name}`,
      subtitle: 'Dia do evento',
      amount: null,
      status: event.event_date < today ? 'done' : 'future',
      contractName: '',
    })
  }

  // filter + sort chronologically
  const filtered = markers
    .filter(m => filter === 'all' || m.type === filter || (filter === 'payment' && m.type === 'payment') || (filter === 'service' && m.type === 'service'))
    .sort((a, b) => a.date.localeCompare(b.date))

  if (markers.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', background: '#f9fafb', borderRadius: 14, marginBottom: 24 }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>🗺️</div>
        <p style={{ fontSize: 14, color: '#6b7280' }}>
          A linha do tempo aparece aqui conforme você adiciona contratos, parcelas e datas.
        </p>
      </div>
    )
  }

  const statusStyle = (s: Marker['status']) => {
    switch (s) {
      case 'paid':    return { dot: '#16a34a', label: 'Pago', labelColor: '#16a34a', bg: '#f0fdf4' }
      case 'overdue': return { dot: '#dc2626', label: 'Em atraso', labelColor: '#dc2626', bg: '#fef2f2' }
      case 'pending': return { dot: '#d97706', label: 'Pendente', labelColor: '#d97706', bg: '#fffbeb' }
      case 'done':    return { dot: '#9ca3af', label: 'Concluído', labelColor: '#9ca3af', bg: '#f9fafb' }
      default:        return { dot: '#a3e635', label: '', labelColor: '#5aa800', bg: '#fff' }
    }
  }

  // group by month for headers
  let lastMonth = ''

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>🗺️ Linha do tempo</h2>
        <div style={{ display: 'flex', gap: 6 }}>
          {([['all', 'Tudo'], ['payment', '💰 Pagamentos'], ['service', '🛠️ Serviços']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setFilter(key)}
              className="chip-btn"
              style={{
                fontSize: 12, padding: '5px 12px', borderRadius: 100, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
                border: `1.5px solid ${filter === key ? '#a3e635' : '#e8e8e8'}`,
                background: filter === key ? '#f0fdf4' : '#fff',
                color: filter === key ? '#3f6212' : '#6b7280',
              }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ position: 'relative', paddingLeft: 8 }}>
        {/* vertical line */}
        <div style={{ position: 'absolute', left: 15, top: 8, bottom: 8, width: 2, background: '#eee' }} />

        {filtered.map((m, i) => {
          const ss = statusStyle(m.status)
          const meta = TYPE_META[m.type]
          const my = monthYear(m.date)
          const showMonth = my !== lastMonth
          lastMonth = my
          const isPast = m.date < today

          return (
            <div key={i}>
              {showMonth && (
                <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, margin: '18px 0 10px 36px' }}>
                  {my}
                </div>
              )}
              <div className="reveal visible" style={{ position: 'relative', display: 'flex', gap: 14, marginBottom: 12, alignItems: 'flex-start' }}>
                {/* dot */}
                <div style={{
                  width: 16, height: 16, borderRadius: '50%', flexShrink: 0, marginTop: 4, zIndex: 1,
                  background: ss.dot, border: '3px solid #fff', boxShadow: '0 0 0 1.5px ' + ss.dot,
                  marginLeft: 0,
                }} />
                {/* card */}
                <div style={{
                  flex: 1, background: m.type === 'event' ? '#f0fdf4' : '#fff',
                  border: `1px solid ${m.type === 'event' ? '#a3e635' : '#e8e8e8'}`,
                  borderRadius: 12, padding: '12px 16px', opacity: isPast && m.status !== 'overdue' ? 0.75 : 1,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 140 }}>
                      <div style={{ fontSize: 11, color: meta.color, fontWeight: 700, marginBottom: 2 }}>
                        {meta.icon} {meta.label.toUpperCase()}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>{m.title}</div>
                      {m.subtitle && m.type !== 'event' && (
                        <div style={{ fontSize: 12, color: '#9ca3af' }}>{m.subtitle}</div>
                      )}
                      {m.type === 'event' && <div style={{ fontSize: 12, color: '#5aa800', fontWeight: 600 }}>{m.subtitle}</div>}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#2d2d2d' }}>{fmtDate(m.date)}</div>
                      {m.amount != null && <div style={{ fontSize: 14, fontWeight: 800, color: '#1a1a1a' }}>{money(m.amount)}</div>}
                      {ss.label && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: ss.labelColor, background: ss.bg, padding: '2px 8px', borderRadius: 100, display: 'inline-block', marginTop: 3 }}>
                          {ss.label}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
