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
const MONTHS_SHORT = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']
const WEEKDAYS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']

type Landmark = {
  key: string          // YYYY-MM-DD
  kind: 'event' | 'contract' | 'payment' | 'reminder'
  label: string
  sub: string
  color: string
  bg: string
  overdue?: boolean
}

export default function AgendaPage({ user, goToPage, openEvent }: Props) {
  const fb = useEventFeedback()
  const [events, setEvents] = useState<EventItem[]>([])
  const [contracts, setContracts] = useState<EventContract[]>([])
  const [payments, setPayments] = useState<ContractPayment[]>([])
  const [reminders, setReminders] = useState<AgendaReminder[]>([])
  const [loading, setLoading] = useState(true)

  const [openDay, setOpenDay] = useState<string | null>(null)
  const [movingCt, setMovingCt] = useState<EventContract | null>(null)
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
  const money = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const dateKey = (y: number, m: number, d: number) =>
    `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  const fmtLong = (key: string) => {
    const [y, m, d] = key.split('-').map(Number)
    return `${d} de ${MONTHS[m - 1].toLowerCase()} de ${y}`
  }
  const fmtShort = (key: string) => {
    const [, m, d] = key.split('-').map(Number)
    return `${String(d).padStart(2, '0')} ${MONTHS_SHORT[m - 1]}`
  }

  // ── todos os marcos, indexados por dia ──
  const landmarksOf = (key: string): Landmark[] => {
    const out: Landmark[] = []
    events.forEach(e => { if (e.event_date === key) out.push({ key, kind: 'event', label: e.name.replace('[DEMO] ', ''), sub: e.type, color: '#1a2e05', bg: '#d9f99d' }) })
    contracts.forEach(c => {
      if (c.service_date === key) {
        const ev = events.find(e => e.id === c.event_id)
        out.push({ key, kind: 'contract', label: c.supplier_name.replace('[DEMO] ', ''), sub: ev ? ev.name.replace('[DEMO] ', '') : 'Serviço', color: '#3f6212', bg: '#f0fdf4' })
      }
    })
    payments.forEach(p => {
      if (p.due_date === key) {
        const ct = contracts.find(c => c.id === p.contract_id)
        const overdue = !p.paid && p.due_date < todayStr
        out.push({
          key, kind: 'payment', overdue,
          label: `${money(p.amount)}${p.paid ? ' ✓' : ''}`,
          sub: ct ? ct.supplier_name.replace('[DEMO] ', '') : 'Parcela',
          color: p.paid ? '#16a34a' : overdue ? '#dc2626' : '#d97706',
          bg: p.paid ? '#f0fdf4' : overdue ? '#fef2f2' : '#fffbeb',
        })
      }
    })
    reminders.forEach(r => { if (r.date === key) out.push({ key, kind: 'reminder', label: r.title, sub: r.done ? 'concluído' : 'lembrete', color: '#6d28d9', bg: '#f5f3ff' }) })
    return out
  }

  // ── 12 meses contínuos a partir do mês atual ──
  const now = new Date()
  const monthsRange = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  // semanas de um mês (linhas de 7 células; null = fora do mês)
  const weeksOf = (year: number, month: number): (number | null)[][] => {
    const first = new Date(year, month, 1).getDay()
    const days = new Date(year, month + 1, 0).getDate()
    const cells: (number | null)[] = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)]
    while (cells.length % 7 !== 0) cells.push(null)
    const weeks: (number | null)[][] = []
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
    return weeks
  }

  // ── linha do tempo: todos os marcos ordenados ──
  const timeline: Landmark[] = []
  const allKeys = new Set<string>()
  events.forEach(e => e.event_date && allKeys.add(e.event_date))
  contracts.forEach(c => c.service_date && allKeys.add(c.service_date))
  payments.forEach(p => p.due_date && allKeys.add(p.due_date))
  reminders.forEach(r => allKeys.add(r.date))
  Array.from(allKeys).sort().forEach(k => timeline.push(...landmarksOf(k)))

  // ── ações (iguais à v2) ──
  const moveContract = async (ctId: string, newDate: string) => {
    const ok = await fb.run(() => supabase.from('event_contracts').update({ service_date: newDate }).eq('id', ctId))
    setMovingCt(null)
    if (ok) { fb.showSuccess('Serviço remarcado.'); load() }
  }
  const togglePaid = async (p: ContractPayment) => {
    const ok = await fb.run(() => supabase.from('contract_payments').update({ paid: !p.paid, paid_date: !p.paid ? todayStr : null }).eq('id', p.id))
    if (ok) { fb.showSuccess(!p.paid ? 'Parcela marcada como paga.' : 'Parcela reaberta.'); load() }
  }
  const addReminder = async () => {
    if (!rTitle.trim() || !openDay || savingReminder) return
    setSavingReminder(true)
    const ok = await fb.run(() => supabase.from('agenda_reminders').insert({ owner_id: user.id, date: openDay, title: rTitle.trim(), notes: rNotes.trim() || null }))
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
    setOpenDay(key); setRTitle(''); setRNotes('')
  }
  const scrollToToday = () => {
    document.getElementById('mes-atual')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const dayEvents = (k: string) => events.filter(e => e.event_date === k)
  const dayContracts = (k: string) => contracts.filter(c => c.service_date === k)
  const dayPayments = (k: string) => payments.filter(p => p.due_date === k)
  const dayReminders = (k: string) => reminders.filter(r => r.date === k)
  const eventOf = (id: string) => events.find(e => e.id === id)
  const contractOf = (id: string) => contracts.find(c => c.id === id)

  return (
    <div className="page-transition" style={{ maxWidth: 1180, margin: '0 auto', padding: '32px 16px' }}>
      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 18 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1a1a1a', marginBottom: 6 }}>📅 Agenda anual</h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>Os próximos 12 meses com os marcos dos seus eventos e serviços. Clique em um dia para detalhes e ações.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={scrollToToday} style={{ fontSize: 12, fontWeight: 700, color: '#3f6212', background: '#f0fdf4', border: '1.5px solid #a3e635', borderRadius: 8, padding: '9px 16px', cursor: 'pointer', fontFamily: 'inherit' }}>Hoje</button>
          <button onClick={() => goToPage('events')} style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', background: '#fff', border: '1.5px solid #e8e8e8', borderRadius: 8, padding: '9px 16px', cursor: 'pointer', fontFamily: 'inherit' }}>← Meus eventos</button>
        </div>
      </div>

      {movingCt && (
        <div style={{ position: 'sticky', top: 0, zIndex: 20, background: '#1a2e05', color: '#fff', borderRadius: 10, padding: '12px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13 }}>📍 Clique no novo dia para remarcar <strong>{movingCt.supplier_name}</strong></span>
          <button onClick={() => setMovingCt(null)} style={{ fontSize: 12, background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
        </div>
      )}

      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: '#9ca3af' }}>Carregando...</div>
      ) : (
        <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* ═══ CALENDÁRIO CONTÍNUO (12 meses, rolável) ═══ */}
          <div style={{ flex: '2 1 560px', minWidth: 0, background: '#fff', border: '1px solid #e8e8e8', borderRadius: 14, overflow: 'hidden' }}>
            {/* cabeçalho fixo dos dias da semana */}
            <div style={{ display: 'grid', gridTemplateColumns: '52px repeat(7, 1fr)', background: '#1a2e05', position: 'sticky', top: 0, zIndex: 5 }}>
              <div style={{ padding: '9px 4px', fontSize: 10, fontWeight: 800, color: '#a3e635', textAlign: 'center', letterSpacing: 0.5 }}>MÊS</div>
              {WEEKDAYS.map(w => (
                <div key={w} style={{ padding: '9px 2px', textAlign: 'center', fontSize: 10, fontWeight: 800, color: '#fff', letterSpacing: 0.5 }}>{w}</div>
              ))}
            </div>

            {/* área rolável com os 12 meses */}
            <div style={{ maxHeight: '68vh', overflowY: 'auto' }}>
              {monthsRange.map(({ year, month }, mi) => {
                const weeks = weeksOf(year, month)
                const isCurrent = mi === 0
                const bandBg = mi % 2 === 0 ? '#1a2e05' : '#3f6212'
                return (
                  <div key={`${year}-${month}`} id={isCurrent ? 'mes-atual' : undefined} style={{ display: 'flex', borderBottom: '2px solid #e8e8e8' }}>
                    {/* faixa lateral do mês */}
                    <div style={{ width: 52, flexShrink: 0, background: bandBg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, padding: '10px 0' }}>
                      <span style={{ fontSize: 12, fontWeight: 900, color: '#a3e635', letterSpacing: 1 }}>{MONTHS_SHORT[month]}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.75)' }}>{year}</span>
                    </div>
                    {/* semanas do mês */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {weeks.map((week, wi) => (
                        <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                          {week.map((d, di) => {
                            if (d == null) return <div key={di} style={{ minHeight: 52, background: '#f6f7f4', borderBottom: '1px solid #f0f0f0', borderRight: '1px solid #f0f0f0' }} />
                            const key = dateKey(year, month, d)
                            const isToday = key === todayStr
                            const marks = landmarksOf(key)
                            const hasOverdue = marks.some(m => m.overdue)
                            return (
                              <div key={di} onClick={() => clickDay(key)}
                                style={{
                                  minHeight: 52, padding: '3px 4px', borderBottom: '1px solid #f0f0f0', borderRight: '1px solid #f0f0f0',
                                  background: isToday ? '#f7fee7' : '#fff', cursor: 'pointer', overflow: 'hidden',
                                }}>
                                <div style={{ fontSize: 10, fontWeight: isToday ? 900 : 600, color: isToday ? '#3f6212' : '#9ca3af', display: 'flex', alignItems: 'center', gap: 3 }}>
                                  {isToday && <span style={{ width: 5, height: 5, background: '#a3e635', borderRadius: '50%', display: 'inline-block' }} />}
                                  {d}
                                  {hasOverdue && <span style={{ fontSize: 8, marginLeft: 'auto' }}>⚠️</span>}
                                </div>
                                {marks.slice(0, 2).map((m, j) => (
                                  <div key={j} style={{ fontSize: 9, fontWeight: 700, color: m.color, background: m.bg, borderRadius: 4, padding: '1px 4px', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {m.label}
                                  </div>
                                ))}
                                {marks.length > 2 && <div style={{ fontSize: 9, color: '#6b7280', fontWeight: 700, paddingLeft: 2 }}>+{marks.length - 2}</div>}
                              </div>
                            )
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ═══ LINHA DO TEMPO VERTICAL ═══ */}
          <div style={{ flex: '1 1 260px', minWidth: 260, background: '#fff', border: '1px solid #e8e8e8', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ background: '#1a2e05', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#fff', letterSpacing: 0.5 }}>LINHA DO TEMPO</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#a3e635' }}>{timeline.length} marcos</span>
            </div>
            <div style={{ maxHeight: '64vh', overflowY: 'auto', padding: '6px 0' }}>
              {timeline.length === 0 && (
                <div style={{ padding: '24px 16px', fontSize: 13, color: '#9ca3af', textAlign: 'center' }}>
                  Nenhum marco ainda. Datas de eventos, serviços, parcelas e lembretes aparecem aqui.
                </div>
              )}
              {timeline.map((m, i) => {
                const isPast = m.key < todayStr
                return (
                  <div key={i} onClick={() => clickDay(m.key)}
                    style={{ display: 'flex', gap: 10, padding: '8px 14px', cursor: 'pointer', opacity: isPast && !m.overdue ? 0.45 : 1, borderLeft: `3px solid ${m.overdue ? '#dc2626' : m.key === todayStr ? '#a3e635' : 'transparent'}` }}>
                    <div style={{ width: 52, flexShrink: 0, fontSize: 11, fontWeight: 800, color: m.overdue ? '#dc2626' : '#3f6212', paddingTop: 1 }}>{fmtShort(m.key)}</div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: m.color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.kind === 'event' ? '🎉 ' : m.kind === 'contract' ? '📄 ' : m.kind === 'payment' ? '💰 ' : '📌 '}{m.label}
                      </div>
                      <div style={{ fontSize: 11, color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.sub}{m.overdue ? ' · ATRASADA' : ''}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL DO DIA (mesmo da v2) ═══ */}
      {openDay && (
        <div onClick={() => setOpenDay(null)} style={{ position: 'fixed', inset: 0, zIndex: 900, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480, maxHeight: '86vh', overflowY: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800 }}>{fmtLong(openDay)}</div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>{landmarksOf(openDay).length} item(ns) neste dia</div>
              </div>
              <button onClick={() => setOpenDay(null)} style={{ fontSize: 18, background: '#f3f4f6', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: '#6b7280' }}>✕</button>
            </div>
            <div style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {dayEvents(openDay).map(ev => (
                <div key={ev.id} style={{ border: '1.5px solid #1a2e05', borderRadius: 12, padding: 14, background: '#f7fee7' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 2 }}>🎉 {ev.name}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 10 }}>{ev.type} · dia do evento</div>
                  <button onClick={() => { setOpenDay(null); openEvent(ev) }} className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>Abrir evento</button>
                </div>
              ))}
              {dayContracts(openDay).map(ct => {
                const ev = eventOf(ct.event_id)
                return (
                  <div key={ct.id} style={{ border: '1px solid #e8e8e8', borderRadius: 12, padding: 14 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>📄 {ct.supplier_name}</div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 10 }}>{ct.category || 'Serviço'} · {money(ct.total_value)}{ev ? ` · ${ev.name}` : ''}</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {ev && <button onClick={() => { setOpenDay(null); openEvent(ev) }} style={{ fontSize: 12, fontWeight: 600, padding: '7px 14px', borderRadius: 8, border: '1.5px solid #e8e8e8', background: '#fff', cursor: 'pointer', fontFamily: 'inherit', color: '#374151' }}>Abrir evento</button>}
                      <button onClick={() => { setMovingCt(ct); setOpenDay(null) }} style={{ fontSize: 12, fontWeight: 600, padding: '7px 14px', borderRadius: 8, border: '1.5px solid #a3e635', background: '#f0fdf4', cursor: 'pointer', fontFamily: 'inherit', color: '#3f6212' }}>📍 Remarcar data</button>
                    </div>
                  </div>
                )
              })}
              {dayPayments(openDay).map(pm => {
                const ct = contractOf(pm.contract_id)
                const overdue = !pm.paid && pm.due_date < todayStr
                return (
                  <div key={pm.id} style={{ border: `1px solid ${overdue ? '#fecaca' : '#e8e8e8'}`, borderRadius: 12, padding: 14, background: overdue ? '#fff7f7' : '#fff' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>💰 {pm.label || 'Parcela'} · {money(pm.amount)}</div>
                    <div style={{ fontSize: 12, color: overdue ? '#dc2626' : '#6b7280', marginBottom: 10 }}>
                      {ct ? `${ct.supplier_name} · ` : ''}{pm.paid ? 'Paga' : overdue ? 'ATRASADA — requer ação' : 'A vencer'}
                    </div>
                    <button onClick={() => togglePaid(pm)} style={{ fontSize: 12, fontWeight: 700, padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: pm.paid ? '#f3f4f6' : '#16a34a', color: pm.paid ? '#6b7280' : '#fff' }}>
                      {pm.paid ? 'Desfazer pagamento' : '✓ Marcar como paga'}
                    </button>
                  </div>
                )
              })}
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
              {landmarksOf(openDay).length === 0 && (
                <div style={{ textAlign: 'center', padding: '18px 0 6px', color: '#9ca3af', fontSize: 13 }}>Nada agendado neste dia ainda.</div>
              )}
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
