import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'
import type { User } from '@supabase/supabase-js'
import type { EventItem, EventContract, ContractPayment, AgendaReminder, Page } from '../types'
import AgendaCalendar from '../components/AgendaCalendar'

interface Props {
  user: User
  goToPage: (p: Page, data?: any) => void
  openEvent: (ev: EventItem) => void
}

export default function AgendaPage({ user, goToPage, openEvent }: Props) {
  const [events, setEvents] = useState<EventItem[]>([])
  const [contracts, setContracts] = useState<EventContract[]>([])
  const [payments, setPayments] = useState<ContractPayment[]>([])
  const [reminders, setReminders] = useState<AgendaReminder[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
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
  }, [user.id])

  useEffect(() => { load() }, [load])

  return (
    <div className="page-transition" style={{ maxWidth: 1180, margin: '0 auto', padding: '32px 16px' }}>
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: '#9ca3af' }}>Carregando...</div>
      ) : (
        <AgendaCalendar
          user={user}
          events={events}
          contracts={contracts}
          payments={payments}
          reminders={reminders}
          onChanged={load}
          openEvent={openEvent}
          title="📅 Agenda anual"
          subtitle="Os próximos 12 meses com os marcos de todos os seus eventos. Clique em um dia para detalhes e ações."
          headerActions={
            <button onClick={() => goToPage('events')} style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', background: '#fff', border: '1.5px solid #e8e8e8', borderRadius: 8, padding: '9px 16px', cursor: 'pointer', fontFamily: 'inherit' }}>
              ← Meus eventos
            </button>
          }
        />
      )}
    </div>
  )
}
