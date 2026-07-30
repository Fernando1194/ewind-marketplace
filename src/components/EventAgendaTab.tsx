import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'
import type { User } from '@supabase/supabase-js'
import type { EventItem, EventContract, ContractPayment, AgendaReminder } from '../types'
import AgendaCalendar from './AgendaCalendar'

interface Props {
  user: User
  event: EventItem
}

export default function EventAgendaTab({ user, event }: Props) {
  const [contracts, setContracts] = useState<EventContract[]>([])
  const [payments, setPayments] = useState<ContractPayment[]>([])
  const [reminders, setReminders] = useState<AgendaReminder[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const [{ data: cts }, { data: rems }] = await Promise.all([
      supabase.from('event_contracts').select('*').eq('event_id', event.id),
      supabase.from('agenda_reminders').select('*').eq('event_id', event.id),
    ])
    const ctList = (cts as EventContract[]) || []
    setContracts(ctList)
    setReminders((rems as AgendaReminder[]) || [])
    if (ctList.length) {
      const { data: pms } = await supabase.from('contract_payments').select('*').in('contract_id', ctList.map(c => c.id))
      setPayments((pms as ContractPayment[]) || [])
    } else setPayments([])
    setLoading(false)
  }, [event.id])

  useEffect(() => { load() }, [load])

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Carregando...</div>

  return (
    <AgendaCalendar
      user={user}
      events={[event]}
      contracts={contracts}
      payments={payments}
      reminders={reminders}
      reminderEventId={event.id}
      onChanged={load}
      title="📅 Agenda do evento"
      subtitle="Só os marcos deste evento: data, serviços, parcelas e lembretes. Clique em um dia para agir."
    />
  )
}
