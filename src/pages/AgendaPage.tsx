import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import type { User } from '@supabase/supabase-js'
import type { EventItem, EventContract, ContractPayment, AgendaReminder, Page } from '../types'
import { useEventFeedback, Toast, ConfirmModal } from '../components/useEventFeedback'

interface Props {
  user: User
  goToPage: (p: Page, data?: any) => void
  openEvent: (ev: EventItem) => void
}

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export default function AgendaPage({ user, goToPage, openEvent }: Props) {
  const fb = useEventFeedback()
  const [events, setEvents] = useState<EventItem[]>([])
  const [contracts, setContracts] = useState<EventContract[]>([])
  const [payments, setPayments] = useState<ContractPayment[]>([])
  const [reminders, setReminders] = useState<AgendaReminder[]>([])
  const [loading, setLoading] = useState(true)

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  // dia aberto no modal (chave YYYY-MM-DD)
  const [openDay, setOpenDay] = useState<string | null>(null)
  // contrato em modo "remarcar": usuário escolhe o novo dia
  const [movingCt, setMovingCt] = useState<EventContract | null>(null)
  const [draggingCt, setDraggingCt] = useState<string | null>(null)
  const [dragOverDay, setDragOverDay] = useState<string | null>(null)

  // form de lembrete (dentro do modal do dia)
  const [rTitle, setRTitle] = useState('')
  const [rNotes, setRNotes] = useState('')
  const [savingReminder, setSavingReminder] = useState(false)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const [{ data: evs }, { data: rems }] = await Promise.all([
      supabase.from('events').select('*').eq('owner_id', user.id),
      supabase.from('agenda_reminders').select('*').eq('owner_id', user.id),
    ])
    const list = (evs as EventItem[]) || []
    setEvents(list)
    setReminders((rems as AgendaReminder[]) || [])
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
  const money = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const fmtLong = (key: string) => {
    const [y, m, d] = key.split('-').map(Number)
    return `${d} de ${MONTHS[m - 1].toLowerCase()} de ${y}`
  }

  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const dayEvents    = (key: string) => events.filter(e => e.event_date === key)
  const dayContracts = (key: string) => contracts.filter(c => c.service_date === key)
  const dayPayments  = (key: string) => payments.filter(p => p.due_date === key)
  const dayReminders = (key: string) => reminders.filter(r => r.date === key)
  const dayCount = (key: string) =>
    dayEvents(key).length + dayContracts(key).length + dayPayments(key).length + dayReminders(key).length

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(year - 1) } else setMonth(month - 1) }
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(year + 1) } else setMonth(month + 1) }
  const goToday = () => { setYear(now.getFullYear()); setMonth(now.getMonth()) }

  // ── ações ──
  const moveContract = async (ctId: string, newDate: string) => {
    const ok = await fb.run(() => supabase.from('event_contracts').update({ service_date: newDate }).eq('id', ctId))
    setMovingCt(null); setDraggingCt(null); setDragOverDay(null)
    if (ok) { fb.showSuccess('Serviço remarcado.'); load() }
  }

  const togglePaid = async (p: ContractPayment) => {
    const ok = await fb.run(() => supabase.from('contract_payments').update({
      paid: !p.paid, paid_date: !p.paid ? todayStr : null,
    }).eq('id', p.id))
    if (ok) { fb.showSuccess(!p.paid ? 'Parcela marcada como paga.' : 'Parcela reaberta.'); load() }
  }

  const addReminder = async () => {
    if (!rTitle.trim() || !openDay || savingReminder) return
    setSavingReminder(true)
    const ok = await fb.run(() => supabase.from('agenda_reminders').insert({
      owner_id: user.id, date: openDay, title: rTitle.trim(), notes: rNotes.trim() || null,
    }))
    setSavingReminder(false)
    if (!ok) return
    setRTitle(''); setRNotes('')
    load()
  }

  const toggleReminder = async (r: AgendaReminder) => {
    const ok = await fb.run(() => supabase.from('agenda_reminders').update({ done: !r.done }).eq('id', r.id))
    if (ok) load()
  }

  const deleteReminder = (r: AgendaReminder) => {
    fb.confirm('Excluir este lembrete?', async () => {
      const ok = await fb.run(() => supabase.from('agenda_reminders').delete().eq('id', r.id))
      if (ok) load()
    })
  }

  const clickDay = (key: string) => {
    if (movingCt) { moveContract(movingCt.id, key); return }
    setOpenDay(key)
    setRTitle(''); setRNotes('')
  }

  const eventOf = (eventId: string) => events.find(e => e.id === eventId)
  const contractOf = (contractId: string) => contracts.find(c => c.id === contractId)

  return (
    <div className="page-transition" style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 16px' }}>
      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1a1a1a', marginBottom: 6 }}>📅 Agenda</h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>Clique em um dia para ver os detalhes, marcar pagamentos ou adicionar lembretes.</p>
        </div>
        <button onClick={() => goToPage('events')} style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', background: '#fff', border: '1.5px solid #e8e8e8', borderRadius: 8, padding: '9px 16px', cursor: 'pointer', fontFamily: 'inherit' }}>
          ← Meus eventos
        </button>
      </div>

      {/* Navegação do mês */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={prevMonth} style={{ fontSize: 16, background: '#fff', border: '1.5px solid #e8e8e8', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit' }}>‹</button>
          <span style={{ fontSize: 18, fontWeight: 800, minWidth: 185, textAlign: 'center' }}>{MONTHS[month]} {year}</span>
          <button onClick={nextMonth} style={{ fontSize: 16, background: '#fff', border: '1.5px solid #e8e8e8', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit' }}>›</button>
          <button onClick={goToday} style={{ fontSize: 12, fontWeight: 600, color: '#3f6212', background: '#f0fdf4', border: '1.5px solid #a3e635', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontFamily: 'inherit' }}>Hoje</button>
        </div>
        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#6b7280', flexWrap: 'wrap' }}>
          <span>🎉 Evento</span>
          <span>📄 Serviço</span>
          <span>💰 Parcela</span>
          <span>📌 Lembrete</span>
        </div>
      </div>

      {/* Barra de remarcação */}
      {movingCt && (
        <div style={{ position: 'sticky', top: 0, zIndex: 10, background: '#1a2e05', color: '#fff', borderRadius: 10, padding: '12px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13 }}>📍 Clique no novo dia para remarcar <strong>{movingCt.supplier_name}</strong></span>
          <button onClick={() => setMovingCt(null)} style={{ fontSize: 12, background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
        </div>
      )}

      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: '#9ca3af' }}>Carregando...</div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: '#f9fafb', borderBottom: '1px solid #e8e8e8' }}>
            {WEEKDAYS.map(w => (
              <div key={w} style={{ padding: '10px 4px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#9ca3af' }}>{w}</div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {cells.map((d, i) => {
              if (d == null) return <div key={`x${i}`} style={{ minHeight: 96, borderBottom: '1px solid #f5f5f5', borderRight: '1px solid #f5f5f5', background: '#fafafa' }} />
              const key = dateKey(year, month, d)
              const isToday = key === todayStr
              const isTarget = dragOverDay === key
              const evs = dayEvents(key), cts = dayContracts(key), pms = dayPayments(key), rms = dayReminders(key)
              const total = evs.length + cts.length + pms.length + rms.length
              const hasOverdue = pms.some(p => !p.paid && p.due_date < todayStr)
              const visible: { icon: string; label: string; style?: any }[] = [
                ...evs.map(e => ({ icon: '🎉', label: e.name, style: { background: '#1a2e05', color: '#a3e635', fontWeight: 700 } })),
                ...cts.map(c => ({ icon: '📄', label: c.supplier_name, style: { background: '#f0fdf4', color: '#3f6212', border: '1px solid #d9f99d' } })),
                ...pms.map(p => ({ icon: '💰', label: money(p.amount), style: p.paid ? { background: '#f0fdf4', color: '#16a34a' } : (p.due_date < todayStr ? { background: '#fef2f2', color: '#dc2626', fontWeight: 700 } : { background: '#fffbeb', color: '#d97706' }) })),
                ...rms.map(r => ({ icon: '📌', label: r.title, style: { background: '#f5f3ff', color: '#6d28d9', textDecoration: r.done ? 'line-through' : 'none' } })),
              ]
              const shown = visible.slice(0, 3)
              const extra = total - shown.length
              return (
                <div key={key}
                  onClick={() => clickDay(key)}
                  onDragOver={e => { e.preventDefault(); setDragOverDay(key) }}
                  onDragLeave={() => setDragOverDay(null)}
                  onDrop={() => { if (draggingCt) moveContract(draggingCt, key) }}
                  style={{
                    minHeight: 96, padding: 6, borderBottom: '1px solid #f5f5f5', borderRight: '1px solid #f5f5f5',
                    background: isTarget && draggingCt ? '#f0fdf4' : (isToday ? '#fdfeee' : '#fff'),
                    outline: isTarget && draggingCt ? '2px dashed #a3e635' : 'none', outlineOffset: -2,
                    cursor: 'pointer', transition: 'background .1s',
                  }}>
                  <div style={{ fontSize: 12, fontWeight: isToday ? 800 : 600, color: isToday ? '#3f6212' : '#9ca3af', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    {isToday && <span style={{ width: 6, height: 6, background: '#a3e635', borderRadius: '50%', display: 'inline-block' }} />}
                    {d}
                    {hasOverdue && <span title="Parcela atrasada" style={{ marginLeft: 'auto', fontSize: 10 }}>⚠️</span>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {shown.map((it, j) => (
                      <div key={j} style={{ fontSize: 11, fontWeight: 600, padding: '2px 6px', borderRadius: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', ...it.style }}>
                        {it.icon} {it.label}
                      </div>
                    ))}
                    {extra > 0 && <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, paddingLeft: 4 }}>+{extra} mais</div>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 14, textAlign: 'center' }}>
        💡 Clique em qualquer dia para ver os detalhes e adicionar lembretes.
      </p>

      {/* ═══ MODAL DO DIA ═══ */}
      {openDay && (
        <div onClick={() => setOpenDay(null)} style={{ position: 'fixed', inset: 0, zIndex: 900, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480, maxHeight: '86vh', overflowY: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
            {/* header */}
            <div style={{ padding: '18px 22px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800 }}>{fmtLong(openDay)}</div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>{dayCount(openDay)} item(ns) neste dia</div>
              </div>
              <button onClick={() => setOpenDay(null)} style={{ fontSize: 18, background: '#f3f4f6', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: '#6b7280' }}>✕</button>
            </div>

            <div style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Eventos */}
              {dayEvents(openDay).map(ev => (
                <div key={ev.id} style={{ border: '1.5px solid #1a2e05', borderRadius: 12, padding: 14, background: '#f7fee7' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 2 }}>🎉 {ev.name}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 10 }}>{ev.type} · dia do evento</div>
                  <button onClick={() => { setOpenDay(null); openEvent(ev) }} className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>Abrir evento</button>
                </div>
              ))}

              {/* Serviços contratados */}
              {dayContracts(openDay).map(ct => {
                const ev = eventOf(ct.event_id)
                return (
                  <div key={ct.id} style={{ border: '1px solid #e8e8e8', borderRadius: 12, padding: 14 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>📄 {ct.supplier_name}</div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 10 }}>
                      {ct.category || 'Serviço'} · {money(ct.total_value)}{ev ? ` · ${ev.name}` : ''}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {ev && <button onClick={() => { setOpenDay(null); openEvent(ev) }} style={{ fontSize: 12, fontWeight: 600, padding: '7px 14px', borderRadius: 8, border: '1.5px solid #e8e8e8', background: '#fff', cursor: 'pointer', fontFamily: 'inherit', color: '#374151' }}>Abrir evento</button>}
                      <button onClick={() => { setMovingCt(ct); setOpenDay(null) }} style={{ fontSize: 12, fontWeight: 600, padding: '7px 14px', borderRadius: 8, border: '1.5px solid #a3e635', background: '#f0fdf4', cursor: 'pointer', fontFamily: 'inherit', color: '#3f6212' }}>📍 Remarcar data</button>
                    </div>
                  </div>
                )
              })}

              {/* Parcelas */}
              {dayPayments(openDay).map(pm => {
                const ct = contractOf(pm.contract_id)
                const overdue = !pm.paid && pm.due_date < todayStr
                return (
                  <div key={pm.id} style={{ border: `1px solid ${overdue ? '#fecaca' : '#e8e8e8'}`, borderRadius: 12, padding: 14, background: overdue ? '#fff7f7' : '#fff' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>
                      💰 {pm.label || 'Parcela'} · {money(pm.amount)}
                    </div>
                    <div style={{ fontSize: 12, color: overdue ? '#dc2626' : '#6b7280', marginBottom: 10 }}>
                      {ct ? `${ct.supplier_name} · ` : ''}{pm.paid ? `Paga em ${pm.paid_date ? new Date(pm.paid_date + 'T12:00:00').toLocaleDateString('pt-BR') : ''}` : overdue ? 'ATRASADA — requer ação' : 'A vencer'}
                    </div>
                    <button onClick={() => togglePaid(pm)} style={{ fontSize: 12, fontWeight: 700, padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: pm.paid ? '#f3f4f6' : '#16a34a', color: pm.paid ? '#6b7280' : '#fff' }}>
                      {pm.paid ? 'Desfazer pagamento' : '✓ Marcar como paga'}
                    </button>
                  </div>
                )
              })}

              {/* Lembretes */}
              {dayReminders(openDay).map(r => (
                <div key={r.id} style={{ border: '1px solid #e9d5ff', borderRadius: 12, padding: 14, background: '#faf5ff', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <input type="checkbox" checked={r.done} onChange={() => toggleReminder(r)} style={{ width: 17, height: 17, marginTop: 2, accentColor: '#7c3aed', cursor: 'pointer' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, textDecoration: r.done ? 'line-through' : 'none', color: r.done ? '#9ca3af' : '#1a1a1a' }}>📌 {r.title}</div>
                    {r.notes && <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{r.notes}</div>}
                  </div>
                  <button onClick={() => deleteReminder(r)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, opacity: 0.45, padding: 2 }}>🗑️</button>
                </div>
              ))}

              {dayCount(openDay) === 0 && (
                <div style={{ textAlign: 'center', padding: '18px 0 6px', color: '#9ca3af', fontSize: 13 }}>Nada agendado neste dia ainda.</div>
              )}

              {/* Adicionar lembrete */}
              <div style={{ borderTop: '1px dashed #e8e8e8', paddingTop: 14, marginTop: 4 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#374151' }}>+ Adicionar lembrete neste dia</div>
                <input value={rTitle} onChange={e => setRTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && addReminder()} placeholder="Ex: Ligar pro buffet, pagar sinal..."
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e8e8e8', borderRadius: 10, fontSize: 14, fontFamily: 'inherit', marginBottom: 8, boxSizing: 'border-box' }} />
                <input value={rNotes} onChange={e => setRNotes(e.target.value)} placeholder="Observação (opcional)"
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e8e8e8', borderRadius: 10, fontSize: 13, fontFamily: 'inherit', marginBottom: 10, boxSizing: 'border-box' }} />
                <button onClick={addReminder} disabled={!rTitle.trim() || savingReminder} className="btn-primary" style={{ padding: '9px 20px', fontSize: 13 }}>
                  {savingReminder ? 'Salvando...' : 'Adicionar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Toast toast={fb.toast} />
      <ConfirmModal state={fb.confirmState} onClose={() => fb.setConfirmState(null)} />
    </div>
  )
}
