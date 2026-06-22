import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import type { User } from '@supabase/supabase-js'
import type { EventItem, EventGuest, EventTable } from '../types'
import { useEventFeedback, Toast, ConfirmModal } from './useEventFeedback'

interface Props {
  user: User
  event: EventItem
}

const CATEGORY_ICON: Record<string, string> = { adult: '🧑', child: '🧒', baby: '👶' }

export default function EventTablesTab({ user, event }: Props) {
  const fb = useEventFeedback()
  const [tables, setTables] = useState<EventTable[]>([])
  const [guests, setGuests] = useState<EventGuest[]>([])
  const [loading, setLoading] = useState(true)

  const [showAddTable, setShowAddTable] = useState(false)
  const [tLabel, setTLabel] = useState('')
  const [tCapacity, setTCapacity] = useState('8')

  // tap-para-alocar (mobile): convidado selecionado aguardando escolher mesa
  const [pendingGuest, setPendingGuest] = useState<EventGuest | null>(null)
  // drag (desktop)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverTable, setDragOverTable] = useState<string | null>(null)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const [{ data: tbls }, { data: gsts }] = await Promise.all([
      supabase.from('event_tables').select('*').eq('event_id', event.id).order('sort_order', { ascending: true }).order('created_at', { ascending: true }),
      supabase.from('event_guests').select('*').eq('event_id', event.id).eq('status', 'confirmed').order('name', { ascending: true }),
    ])
    setTables((tbls as EventTable[]) || [])
    setGuests((gsts as EventGuest[]) || [])
    setLoading(false)
  }

  const addTable = async () => {
    if (!tLabel.trim()) return
    const ok = await fb.run(() => supabase.from('event_tables').insert({
      event_id: event.id, owner_id: user.id, label: tLabel.trim(),
      capacity: tCapacity ? parseInt(tCapacity) : 8, sort_order: tables.length,
    }))
    if (!ok) return
    setTLabel(''); setTCapacity('8'); setShowAddTable(false)
    load()
  }

  const updateTable = async (id: string, patch: Partial<EventTable>) => {
    const ok = await fb.run(() => supabase.from('event_tables').update(patch).eq('id', id))
    if (ok) load()
  }

  const deleteTable = (id: string) => {
    fb.confirm('Excluir esta mesa? Os convidados dela voltam para "não alocados".', async () => {
      const ok = await fb.run(() => supabase.from('event_tables').delete().eq('id', id))
      if (ok) load()
    })
  }

  // aloca/desaloca convidado
  const assignGuest = async (guestId: string, tableId: string | null) => {
    const ok = await fb.run(() => supabase.from('event_guests').update({ table_id: tableId }).eq('id', guestId))
    setPendingGuest(null)
    if (ok) load()
  }

  const unassigned = guests.filter(g => !g.table_id)
  const guestsOf = (tableId: string) => guests.filter(g => g.table_id === tableId)

  // drag handlers (desktop)
  const onDrop = (tableId: string) => {
    if (draggingId) {
      const table = tables.find(t => t.id === tableId)
      if (table && guestsOf(tableId).length >= table.capacity) {
        // mesa cheia — não aloca
      } else {
        assignGuest(draggingId, tableId)
      }
    }
    setDraggingId(null); setDragOverTable(null)
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Carregando...</div>

  const totalConfirmed = guests.length
  const totalSeated = guests.filter(g => g.table_id).length

  return (
    <div>
      {/* Intro + resumo */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
        <div style={{ fontSize: 13, color: '#6b7280' }}>
          <strong style={{ color: '#1a1a1a' }}>{totalSeated}</strong> de <strong style={{ color: '#1a1a1a' }}>{totalConfirmed}</strong> convidados confirmados alocados
        </div>
        <button className="btn-primary" onClick={() => setShowAddTable(!showAddTable)} style={{ padding: '9px 18px', fontSize: 13 }}>+ Nova mesa</button>
      </div>

      {pendingGuest && (
        <div style={{ position: 'sticky', top: 0, zIndex: 10, background: '#1a2e05', color: '#fff', borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13 }}>📍 Toque em uma mesa para alocar <strong>{pendingGuest.name}</strong></span>
          <button onClick={() => setPendingGuest(null)} style={{ fontSize: 12, background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
        </div>
      )}

      {/* Form nova mesa */}
      {showAddTable && (
        <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, padding: 16, marginBottom: 18, display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="fg" style={{ margin: 0, flex: 1, minWidth: 160 }}><label>Nome da mesa</label><input value={tLabel} onChange={e => setTLabel(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTable()} placeholder="Ex: Mesa 1, Família" autoFocus /></div>
          <div className="fg" style={{ margin: 0, width: 110 }}><label>Lugares</label><input type="number" value={tCapacity} onChange={e => setTCapacity(e.target.value)} min="1" /></div>
          <button className="btn-primary" onClick={addTable} disabled={!tLabel.trim()} style={{ padding: '9px 18px', fontSize: 13 }}>Criar</button>
          <button onClick={() => setShowAddTable(false)} style={{ padding: '9px 14px', fontSize: 13, background: '#f3f4f6', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', color: '#6b7280' }}>Cancelar</button>
        </div>
      )}

      {/* Sem convidados confirmados */}
      {totalConfirmed === 0 && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#92400e', marginBottom: 18 }}>
          💡 Só aparecem aqui os convidados com status <strong>confirmado</strong>. Confirme presenças na aba 👥 Convidados para alocá-los nas mesas.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 20 }}>
        {/* NÃO ALOCADOS */}
        <div style={{ background: '#f9fafb', borderRadius: 14, padding: 16, border: dragOverTable === 'unassigned' ? '2px dashed #a3e635' : '1px solid #e8e8e8' }}
          onDragOver={e => { e.preventDefault(); setDragOverTable('unassigned') }}
          onDragLeave={() => setDragOverTable(null)}
          onDrop={() => { if (draggingId) assignGuest(draggingId, null); setDraggingId(null); setDragOverTable(null) }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', marginBottom: 12 }}>
            Não alocados ({unassigned.length})
          </div>
          {unassigned.length === 0 ? (
            <div style={{ fontSize: 13, color: '#9ca3af', padding: '8px 0' }}>Todos os confirmados estão em mesas. 🎉</div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {unassigned.map(g => (
                <div key={g.id}
                  draggable
                  onDragStart={() => setDraggingId(g.id)}
                  onDragEnd={() => setDraggingId(null)}
                  onClick={() => setPendingGuest(pendingGuest?.id === g.id ? null : g)}
                  style={{
                    fontSize: 13, fontWeight: 600, padding: '7px 12px', borderRadius: 100, cursor: 'pointer', userSelect: 'none',
                    background: pendingGuest?.id === g.id ? '#1a2e05' : '#fff',
                    color: pendingGuest?.id === g.id ? '#fff' : '#2d2d2d',
                    border: `1.5px solid ${pendingGuest?.id === g.id ? '#1a2e05' : '#e8e8e8'}`,
                    opacity: draggingId === g.id ? 0.4 : 1,
                  }}>
                  {CATEGORY_ICON[g.category] || '🧑'} {g.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MESAS */}
        {tables.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 24px', background: '#f9fafb', borderRadius: 14 }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🪑</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Nenhuma mesa ainda</h3>
            <p style={{ fontSize: 13, color: '#6b7280', maxWidth: 420, margin: '0 auto 18px' }}>
              Crie suas mesas e arraste os convidados confirmados para cada uma. No celular, toque no convidado e depois na mesa.
            </p>
            <button className="btn-primary" onClick={() => setShowAddTable(true)} style={{ padding: '11px 24px', fontSize: 14 }}>+ Criar primeira mesa</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {tables.map(table => {
              const seated = guestsOf(table.id)
              const isFull = seated.length >= table.capacity
              const isTarget = dragOverTable === table.id
              const canDropPending = pendingGuest && !isFull
              return (
                <div key={table.id}
                  onDragOver={e => { e.preventDefault(); setDragOverTable(table.id) }}
                  onDragLeave={() => setDragOverTable(null)}
                  onDrop={() => onDrop(table.id)}
                  onClick={() => { if (pendingGuest && !isFull) assignGuest(pendingGuest.id, table.id) }}
                  style={{
                    background: '#fff', borderRadius: 14, padding: 16,
                    border: isTarget && !isFull ? '2px dashed #a3e635' : (canDropPending ? '2px solid #a3e635' : '1px solid #e8e8e8'),
                    cursor: canDropPending ? 'pointer' : 'default',
                    boxShadow: canDropPending ? '0 4px 12px rgba(163,230,53,0.2)' : 'none',
                    transition: 'all .15s',
                  }}>
                  {/* Header da mesa */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 8 }}>
                    <input
                      defaultValue={table.label}
                      onBlur={e => { if (e.target.value.trim() && e.target.value !== table.label) updateTable(table.id, { label: e.target.value.trim() }) }}
                      onClick={e => e.stopPropagation()}
                      style={{ fontSize: 15, fontWeight: 700, border: 'none', background: 'none', fontFamily: 'inherit', color: '#1a1a1a', width: '60%', padding: 0 }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: isFull ? '#dc2626' : '#16a34a', background: isFull ? '#fef2f2' : '#f0fdf4', padding: '2px 10px', borderRadius: 100 }}>
                        {seated.length}/{table.capacity}
                      </span>
                      <button onClick={e => { e.stopPropagation(); deleteTable(table.id) }} title="Excluir mesa" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, opacity: 0.4, padding: 2 }}>🗑️</button>
                    </div>
                  </div>

                  {/* Convidados na mesa */}
                  {seated.length === 0 ? (
                    <div style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', padding: '16px 0', border: '1px dashed #e8e8e8', borderRadius: 8 }}>
                      {canDropPending ? 'Toque para alocar aqui' : 'Arraste convidados para cá'}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {seated.map(g => (
                        <div key={g.id}
                          draggable
                          onDragStart={e => { e.stopPropagation(); setDraggingId(g.id) }}
                          onDragEnd={() => setDraggingId(null)}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, padding: '6px 10px', background: '#f9fafb', borderRadius: 8, cursor: 'grab', opacity: draggingId === g.id ? 0.4 : 1 }}>
                          <span>{CATEGORY_ICON[g.category] || '🧑'} {g.name}</span>
                          <button onClick={e => { e.stopPropagation(); assignGuest(g.id, null) }} title="Remover da mesa" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, opacity: 0.4, padding: 2 }}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                  {isFull && pendingGuest && (
                    <div style={{ fontSize: 11, color: '#dc2626', textAlign: 'center', marginTop: 8 }}>Mesa cheia</div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
      <Toast toast={fb.toast} />
      <ConfirmModal state={fb.confirmState} onClose={() => fb.setConfirmState(null)} />
    </div>
  )
}
