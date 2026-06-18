import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import type { User } from '@supabase/supabase-js'
import type { EventItem, Page } from '../types'

interface Props {
  user: User
  goToPage: (p: Page, data?: any) => void
  openEvent: (ev: EventItem) => void
}

const EVENT_TYPES = ['Casamento', 'Aniversário', 'Formatura', 'Corporativo', 'Chá de bebê', 'Bodas', 'Outro']

const TYPE_ICON: Record<string, string> = {
  'Casamento': '💍', 'Aniversário': '🎂', 'Formatura': '🎓',
  'Corporativo': '💼', 'Chá de bebê': '🍼', 'Bodas': '🥂', 'Outro': '🎉',
}

export default function EventsListPage({ user, openEvent }: Props) {
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  // form
  const [name, setName] = useState('')
  const [type, setType] = useState('Casamento')
  const [eventDate, setEventDate] = useState('')
  const [guests, setGuests] = useState('')
  const [budget, setBudget] = useState('')

  // summary per event (totals)
  const [totals, setTotals] = useState<Record<string, { contracted: number; paid: number; nextDue: string | null }>>({})

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const { data: evs } = await supabase
      .from('events')
      .select('*')
      .eq('owner_id', user.id)
      .order('event_date', { ascending: true })
    const list = (evs as EventItem[]) || []
    setEvents(list)

    // Load totals for each event
    if (list.length) {
      const ids = list.map(e => e.id)
      const { data: contracts } = await supabase
        .from('event_contracts')
        .select('id, event_id, total_value')
        .in('event_id', ids)
      const { data: payments } = await supabase
        .from('contract_payments')
        .select('contract_id, amount, paid, due_date')
        .eq('owner_id', user.id)

      const contractToEvent: Record<string, string> = {}
      const t: Record<string, { contracted: number; paid: number; nextDue: string | null }> = {}
      list.forEach(e => { t[e.id] = { contracted: 0, paid: 0, nextDue: null } })
      ;(contracts || []).forEach((c: any) => {
        contractToEvent[c.id] = c.event_id
        if (t[c.event_id]) t[c.event_id].contracted += Number(c.total_value || 0)
      })
      const today = new Date().toISOString().split('T')[0]
      ;(payments || []).forEach((p: any) => {
        const evId = contractToEvent[p.contract_id]
        if (!evId || !t[evId]) return
        if (p.paid) t[evId].paid += Number(p.amount || 0)
        else if (p.due_date >= today) {
          if (!t[evId].nextDue || p.due_date < t[evId].nextDue!) t[evId].nextDue = p.due_date
        }
      })
      setTotals(t)
    }
    setLoading(false)
  }

  const createEvent = async () => {
    if (!name.trim()) return
    setSaving(true)
    const { data, error } = await supabase.from('events').insert({
      owner_id: user.id,
      name: name.trim(),
      type,
      event_date: eventDate || null,
      guests_estimate: guests ? parseInt(guests) : null,
      budget_total: budget ? parseFloat(budget) : null,
    }).select().single()
    setSaving(false)
    if (!error && data) {
      setShowForm(false)
      setName(''); setEventDate(''); setGuests(''); setBudget(''); setType('Casamento')
      openEvent(data as EventItem)
    }
  }

  const money = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const fmtDate = (d: string | null) => d ? new Date(d + 'T12:00:00').toLocaleDateString('pt-BR') : '—'
  const daysUntil = (d: string | null) => {
    if (!d) return null
    const diff = Math.ceil((new Date(d + 'T12:00:00').getTime() - Date.now()) / 86400000)
    return diff
  }

  return (
    <div className="page-transition" style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1a1a1a', marginBottom: 6 }}>Meus eventos</h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>Gerencie contratos, pagamentos e prazos de cada evento em um só lugar.</p>
        </div>
        {!showForm && (
          <button className="btn-primary" onClick={() => setShowForm(true)} style={{ padding: '11px 22px', fontSize: 14 }}>
            + Novo evento
          </button>
        )}
      </div>

      {/* New event form */}
      {showForm && (
        <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 16, padding: 24, marginBottom: 28 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 18 }}>Criar novo evento</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            <div className="fg" style={{ gridColumn: '1 / -1' }}>
              <label>Nome do evento *</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Casamento João & Maria" autoFocus />
            </div>
            <div className="fg">
              <label>Tipo</label>
              <select value={type} onChange={e => setType(e.target.value)}>
                {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="fg">
              <label>Data do evento</label>
              <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} />
            </div>
            <div className="fg">
              <label>Convidados (estimativa)</label>
              <input type="number" value={guests} onChange={e => setGuests(e.target.value)} placeholder="Ex: 120" />
            </div>
            <div className="fg">
              <label>Orçamento total (R$)</label>
              <input type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="Ex: 50000" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
            <button className="btn-primary" onClick={createEvent} disabled={!name.trim() || saving} style={{ padding: '10px 22px', fontSize: 14 }}>
              {saving ? 'Criando...' : 'Criar evento'}
            </button>
            <button onClick={() => setShowForm(false)} style={{ padding: '10px 18px', fontSize: 14, background: '#f3f4f6', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', color: '#6b7280' }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Events list */}
      {loading ? (
        <div style={{ display: 'grid', gap: 14 }}>
          {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 14 }} />)}
        </div>
      ) : events.length === 0 && !showForm ? (
        <div style={{ textAlign: 'center', padding: '70px 24px', background: '#f9fafb', borderRadius: 16 }}>
          <div style={{ fontSize: 52, marginBottom: 14 }}>🗓️</div>
          <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 8 }}>Você ainda não tem eventos</h2>
          <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 22, maxWidth: 420, margin: '0 auto 22px' }}>
            Crie seu primeiro evento e comece a organizar contratos, pagamentos e prazos sem perder nenhum detalhe.
          </p>
          <button className="btn-primary" onClick={() => setShowForm(true)} style={{ padding: '12px 26px', fontSize: 15 }}>
            + Criar meu primeiro evento
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {events.map(ev => {
            const t = totals[ev.id] || { contracted: 0, paid: 0, nextDue: null }
            const pending = t.contracted - t.paid
            const dUntil = daysUntil(ev.event_date)
            const dNext = daysUntil(t.nextDue)
            return (
              <div key={ev.id} className="card" onClick={() => openEvent(ev)}
                style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 16, padding: 20, cursor: 'pointer', display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'center' }}>
                <div style={{ width: 52, height: 52, background: '#f0fdf4', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
                  {TYPE_ICON[ev.type] || '🎉'}
                </div>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 3 }}>{ev.name}</div>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>
                    {ev.type} · {fmtDate(ev.event_date)}
                    {dUntil !== null && dUntil >= 0 && <span style={{ color: '#5aa800', fontWeight: 600 }}> · faltam {dUntil} dias</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2 }}>Contratado</div>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{money(t.contracted)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2 }}>A pagar</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: pending > 0 ? '#d97706' : '#16a34a' }}>{money(pending)}</div>
                  </div>
                  {t.nextDue && (
                    <div>
                      <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2 }}>Próx. vencimento</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: dNext !== null && dNext <= 7 ? '#dc2626' : '#2d2d2d' }}>
                        {fmtDate(t.nextDue)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
