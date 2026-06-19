import { useState } from 'react'
import type { EventItem, EventContract, ContractPayment } from '../types'

interface ContractWithPayments extends EventContract {
  payments: ContractPayment[]
}

interface Props {
  event: EventItem
  contracts: ContractWithPayments[]
}

type MarkerType = 'payment' | 'service' | 'event'

interface Marker {
  date: string
  type: MarkerType
  title: string
  subtitle: string
  amount: number | null
  status: 'paid' | 'overdue' | 'pending' | 'done' | 'future'
}

const TYPE_META: Record<MarkerType, { icon: string; label: string; color: string }> = {
  payment: { icon: '💰', label: 'Pagamento', color: '#d97706' },
  service: { icon: '🛠️', label: 'Serviço', color: '#7c3aed' },
  event:   { icon: '🎉', label: 'Evento', color: '#16a34a' },
}

export default function EventTimeline({ event, contracts }: Props) {
  const [filter, setFilter] = useState<'all' | 'payment' | 'service'>('all')
  const [selected, setSelected] = useState<number | null>(null)
  const today = new Date().toISOString().split('T')[0]
  const money = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const fmtDate = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
  const fmtFull = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

  const markers: Marker[] = []
  contracts.forEach(c => {
    c.payments.forEach(p => {
      markers.push({
        date: p.due_date, type: 'payment', title: p.label || 'Parcela', subtitle: c.supplier_name,
        amount: Number(p.amount),
        status: p.paid ? 'paid' : (p.due_date < today ? 'overdue' : 'pending'),
      })
    })
    if (c.service_date) {
      markers.push({
        date: c.service_date, type: 'service', title: c.category || c.supplier_name, subtitle: c.supplier_name,
        amount: null, status: c.service_date < today ? 'done' : 'future',
      })
    }
  })
  if (event.event_date) {
    markers.push({
      date: event.event_date, type: 'event', title: event.name, subtitle: 'Dia do evento',
      amount: null, status: event.event_date < today ? 'done' : 'future',
    })
  }

  const filtered = markers
    .filter(m => filter === 'all' || m.type === filter)
    .sort((a, b) => a.date.localeCompare(b.date))

  const statusColor = (s: Marker['status']) => {
    switch (s) {
      case 'paid': return '#16a34a'
      case 'overdue': return '#dc2626'
      case 'pending': return '#d97706'
      case 'done': return '#9ca3af'
      default: return '#a3e635'
    }
  }
  const statusLabel = (s: Marker['status']) => (
    { paid: 'Pago', overdue: 'Em atraso', pending: 'Pendente', done: 'Concluído', future: 'A vir' }[s]
  )

  if (markers.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 20px', background: '#f9fafb', borderRadius: 14 }}>
        <div style={{ fontSize: 40, marginBottom: 10 }}>🗺️</div>
        <p style={{ fontSize: 14, color: '#6b7280' }}>
          A linha do tempo aparece aqui conforme você adiciona contratos, parcelas e datas.
        </p>
      </div>
    )
  }

  // Largura prefixada por ponto (cada marco ocupa um espaço fixo na trilha horizontal)
  const STEP = 150
  const trackWidth = Math.max(filtered.length * STEP + 60, 600)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>🗺️ Linha do tempo</h2>
          <p style={{ fontSize: 12, color: '#9ca3af' }}>{filtered.length} marco(s) · role para o lado para ver todos</p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {([['all', 'Tudo'], ['payment', '💰'], ['service', '🛠️']] as const).map(([key, label]) => (
            <button key={key} onClick={() => { setFilter(key); setSelected(null) }}
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

      {/* Trilha horizontal com scroll */}
      <div style={{ overflowX: 'auto', paddingBottom: 12 }}>
        <div style={{ position: 'relative', width: trackWidth, height: 140, minWidth: '100%' }}>
          {/* linha base */}
          <div style={{ position: 'absolute', top: 70, left: 30, right: 30, height: 3, background: 'linear-gradient(90deg, #e8e8e8, #d4d4d4)', borderRadius: 2 }} />

          {filtered.map((m, i) => {
            const x = 30 + i * STEP
            const color = statusColor(m.status)
            const meta = TYPE_META[m.type]
            const above = i % 2 === 0  // alterna acima/abaixo da linha
            const isSel = selected === i
            return (
              <div key={i}>
                {/* card do marco */}
                <div
                  onClick={() => setSelected(isSel ? null : i)}
                  style={{
                    position: 'absolute', left: x - 65, width: 130,
                    top: above ? 0 : 86, cursor: 'pointer',
                    textAlign: 'center',
                  }}>
                  <div style={{
                    background: m.type === 'event' ? '#f0fdf4' : '#fff',
                    border: `1.5px solid ${isSel ? color : (m.type === 'event' ? '#a3e635' : '#e8e8e8')}`,
                    borderRadius: 10, padding: '6px 8px', boxShadow: isSel ? `0 4px 12px ${color}33` : '0 1px 3px rgba(0,0,0,0.05)',
                    transition: 'all .15s',
                  }}>
                    <div style={{ fontSize: 15 }}>{meta.icon}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.title}</div>
                    {m.amount != null && <div style={{ fontSize: 11, fontWeight: 700, color }}>{money(m.amount)}</div>}
                  </div>
                </div>

                {/* ponto na linha */}
                <div style={{
                  position: 'absolute', left: x - 7, top: 63, width: 14, height: 14, borderRadius: '50%',
                  background: color, border: '3px solid #fff', boxShadow: `0 0 0 1.5px ${color}`, zIndex: 2,
                }} />

                {/* conector vertical */}
                <div style={{
                  position: 'absolute', left: x - 0.5, width: 1.5, background: '#e0e0e0',
                  top: above ? 56 : 70, height: above ? 14 : 16,
                }} />

                {/* data */}
                <div style={{
                  position: 'absolute', left: x - 40, width: 80, top: above ? 70 : 56,
                  textAlign: 'center', fontSize: 10, color: '#9ca3af', fontWeight: 600,
                  marginTop: above ? 18 : -18,
                }}>
                  {fmtDate(m.date)}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Detalhe do marco selecionado */}
      {selected != null && filtered[selected] && (
        <div style={{ marginTop: 8, background: '#fafafa', border: '1px solid #e8e8e8', borderRadius: 12, padding: '14px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: TYPE_META[filtered[selected].type].color }}>
                {TYPE_META[filtered[selected].type].icon} {TYPE_META[filtered[selected].type].label.toUpperCase()}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{filtered[selected].title}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>{filtered[selected].subtitle} · {fmtFull(filtered[selected].date)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              {filtered[selected].amount != null && <div style={{ fontSize: 18, fontWeight: 800 }}>{money(filtered[selected].amount!)}</div>}
              <span style={{ fontSize: 11, fontWeight: 700, color: statusColor(filtered[selected].status), background: '#fff', padding: '2px 10px', borderRadius: 100, border: `1px solid ${statusColor(filtered[selected].status)}33` }}>
                {statusLabel(filtered[selected].status)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
