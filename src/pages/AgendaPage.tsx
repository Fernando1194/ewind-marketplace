import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import type { User } from '@supabase/supabase-js'
import type { EventItem, EventContract, ContractPayment, Page } from '../types'
import { useEventFeedback, Toast, ConfirmModal } from '../components/useEventFeedback'

interface Props {
  user: User
  goToPage: (p: Page, data?: any) => void
  openEvent: (ev: EventItem) => void
}

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

type DayItem =
  | { kind: 'event'; ev: EventItem }
  | { kind: 'contract'; ct: EventContract; ev: EventItem | undefined }
  | { kind: 'payment'; pm: ContractPayment; ct: EventContract | undefined }

export default function AgendaPage({ user, goToPage, openEvent }: Props) {
  const fb = useEventFeedback()
  const [events, setEvents] = useState<EventItem[]>([])
  const [contracts, setContracts] = useState<EventContract[]>([])
  const [payments, setPayments] = useState<ContractPayment[]>([])
  const [loading, setLoading] = useState(true)

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth()) // 0-11

  // contrato aguardando remarcação (desktop: drag | mobile: tap)
  const [draggingCt, setDraggingCt] = useState<string | null>(null)
  const [pendingCt, setPendingCt] = useState<EventContract | null>(null)
  const [dragOverDay, setDragOverDay] = useState<string | null>(null)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const { data: evs } = await supabase.from('events').select('*').eq('owner_id', user.id)
    const list = (evs as EventItem[]) || []
    setEvents(list)
    if (list.length) {
      const ids = list.map(e => e.id)
      const { data: cts } = await supabase.from('event_contracts').select('*').in('event_id', ids)
      const ctList = (cts as EventContract[]) || []
      setContracts(ctList)
      if (ctList.length) {
        const { data: pms } = await supabase.from('contract_payments').select('*').in('contract_id', ctList.map(c => c.id))
        setPayments((pms as ContractPayment[]) || [])
      } else setPayments([])
    } else { setContracts([]); setPayments([]) }
    setLoading(false)
  }

  const todayStr = new Date().toISOString().slice(0, 10)
  const dateKey = (y: number, m: number, d: number) =>
    `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

  // grade do mês: células vazias antes do dia 1 + dias do mês
  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const itemsOf = (key: string): DayItem[] => {
    const out: DayItem[] = []
    events.forEach(ev => { if (ev.event_date === key) out.push({ kind: 'event', ev }) })
    contracts.forEach(ct => {
      if (ct.service_date === key) out.push({ kind: 'contract', ct, ev: events.find(e => e.id === ct.event_id) })
    })
    payments.forEach(pm => {
      if (pm.due_date === key) out.push({ kind: 'payment', pm, ct: contracts.find(c => c.id === pm.contract_id) })
    })
    return out
  }

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(year - 1) } else setMonth(month - 1) }
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(year + 1) } else setMonth(month + 1) }
  const goToday = () => { setYear(now.getFullYear()); setMonth(now.getMonth()) }

  const moveContract = async (ctId: string, newDate: string) => {
    const ok = await fb.run(() => supabase.from('event_contracts').update({ service_date: newDate }).eq('id', ctId))
    setPendingCt(null); setDraggingCt(null); setDragOverDay(null)
    if (ok) { fb.showSuccess('Data do serviço atualizada.'); load() }
  }

  const monthHasItems = cells.some(d => d != null && itemsOf(dateKey(year, month, d)).length > 0)

  const money = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className="page-transition" style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 16px' }}>
      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1a1a1a', marginBottom: 6 }}>📅 Agenda</h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>Todos os seus eventos, serviços contratados e vencimentos num calendário só.</p>
        </div>
        <button onClick={() => goToPage('events')} style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', background: '#fff', border: '1.5px solid #e8e8e8', borderRadius: 8, padding: '9px 16px', cursor: 'pointer', fontFamily: 'inherit' }}>
          ← Meus eventos
        </button>
      </div>

      {/* Navegação do mês */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={prevMonth} style={{ fontSize: 16, background: '#fff', border: '1.5px solid #e8e8e8', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit' }}>‹</button>
          <span style={{ fontSize: 18, fontWeight: 800, minWidth: 190, textAlign: 'center' }}>{MONTHS[month]} {year}</span>
          <button onClick={nextMonth} style={{ fontSize: 16, background: '#fff', border: '1.5px solid #e8e8e8', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit' }}>›</button>
          <button onClick={goToday} style={{ fontSize: 12, fontWeight: 600, color: '#3f6212', background: '#f0fdf4', border: '1.5px solid #a3e635', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontFamily: 'inherit' }}>Hoje</button>
        </div>
        {/* Legenda */}
        <div style={{ display: 'flex', gap: 14, fontSize: 12, color: '#6b7280', flexWrap: 'wrap' }}>
          <span>🎉 Evento</span>
          <span>📄 Serviço contratado</span>
          <span><span style={{ color: '#16a34a' }}>●</span> Parcela paga</span>
          <span><span style={{ color: '#d97706' }}>●</span> A vencer</span>
          <span><span style={{ color: '#dc2626' }}>●</span> Atrasada</span>
        </div>
      </div>

      {/* Barra de remarcação (tap mobile) */}
      {pendingCt && (
        <div style={{ position: 'sticky', top: 0, zIndex: 10, background: '#1a2e05', color: '#fff', borderRadius: 10, padding: '12px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13 }}>📍 Toque em um dia para remarcar <strong>{pendingCt.supplier_name}</strong></span>
          <button onClick={() => setPendingCt(null)} style={{ fontSize: 12, background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
        </div>
      )}

      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: '#9ca3af' }}>Carregando...</div>
      ) : (
        <>
          {/* Grade do calendário */}
          <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: '#f9fafb', borderBottom: '1px solid #e8e8e8' }}>
              {WEEKDAYS.map(w => (
                <div key={w} style={{ padding: '10px 4px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#9ca3af' }}>{w}</div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {cells.map((d, i) => {
                if (d == null) return <div key={`x${i}`} style={{ minHeight: 92, borderBottom: '1px solid #f5f5f5', borderRight: '1px solid #f5f5f5', background: '#fafafa' }} />
                const key = dateKey(year, month, d)
                const items = itemsOf(key)
                const isToday = key === todayStr
                const isTarget = dragOverDay === key
                const canReceive = !!pendingCt || !!draggingCt
                return (
                  <div key={key}
                    onDragOver={e => { e.preventDefault(); setDragOverDay(key) }}
                    onDragLeave={() => setDragOverDay(null)}
                    onDrop={() => { if (draggingCt) moveContract(draggingCt, key) }}
                    onClick={() => { if (pendingCt) moveContract(pendingCt.id, key) }}
                    style={{
                      minHeight: 92, padding: 6, borderBottom: '1px solid #f5f5f5', borderRight: '1px solid #f5f5f5',
                      background: isTarget && draggingCt ? '#f0fdf4' : (isToday ? '#fdfeee' : '#fff'),
                      outline: isTarget && draggingCt ? '2px dashed #a3e635' : 'none', outlineOffset: -2,
                      cursor: canReceive ? 'pointer' : 'default',
                    }}>
                    <div style={{ fontSize: 12, fontWeight: isToday ? 800 : 600, color: isToday ? '#3f6212' : '#9ca3af', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                      {isToday && <span style={{ width: 6, height: 6, background: '#a3e635', borderRadius: '50%', display: 'inline-block' }} />}
                      {d}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {items.map((item, j) => {
                        if (item.kind === 'event') return (
                          <div key={j} onClick={e => { e.stopPropagation(); openEvent(item.ev) }}
                            title={`Evento: ${item.ev.name}`}
                            style={{ fontSize: 11, fontWeight: 700, padding: '3px 6px', borderRadius: 6, background: '#1a2e05', color: '#a3e635', cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            🎉 {item.ev.name}
                          </div>
                        )
                        if (item.kind === 'contract') return (
                          <div key={j}
                            draggable
                            onDragStart={e => { e.stopPropagation(); setDraggingCt(item.ct.id) }}
                            onDragEnd={() => { setDraggingCt(null); setDragOverDay(null) }}
                            onClick={e => { e.stopPropagation(); setPendingCt(pendingCt?.id === item.ct.id ? null : item.ct) }}
                            title={`${item.ct.supplier_name}${item.ev ? ' · ' + item.ev.name : ''} — arraste ou toque para remarcar`}
                            style={{
                              fontSize: 11, fontWeight: 600, padding: '3px 6px', borderRadius: 6, cursor: 'grab',
                              background: pendingCt?.id === item.ct.id ? '#1a2e05' : '#f0fdf4',
                              color: pendingCt?.id === item.ct.id ? '#fff' : '#3f6212',
                              border: '1px solid #d9f99d', opacity: draggingCt === item.ct.id ? 0.4 : 1,
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                            📄 {item.ct.supplier_name}
                          </div>
                        )
                        // payment
                        const paid = item.pm.paid
                        const overdue = !paid && item.pm.due_date < todayStr
                        return (
                          <div key={j}
                            title={`${item.pm.label || 'Parcela'} · ${money(item.pm.amount)}${item.ct ? ' · ' + item.ct.supplier_name : ''}`}
                            style={{
                              fontSize: 11, padding: '3px 6px', borderRadius: 6,
                              background: paid ? '#f0fdf4' : overdue ? '#fef2f2' : '#fffbeb',
                              color: paid ? '#16a34a' : overdue ? '#dc2626' : '#d97706',
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                            ● {money(item.pm.amount)}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {!monthHasItems && (
            <div style={{ textAlign: 'center', padding: '28px 20px', color: '#9ca3af', fontSize: 13 }}>
              Nada agendado em {MONTHS[month].toLowerCase()}. Datas de eventos, serviços contratados e parcelas aparecem aqui automaticamente.
            </div>
          )}

          <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 14, textAlign: 'center' }}>
            💡 Arraste um serviço 📄 para outro dia para remarcar a data (no celular: toque no serviço e depois no dia).
          </p>
        </>
      )}

      <Toast toast={fb.toast} />
      <ConfirmModal state={fb.confirmState} onClose={() => fb.setConfirmState(null)} />
    </div>
  )
}
