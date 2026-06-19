import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import type { User } from '@supabase/supabase-js'
import type { EventItem, EventTask } from '../types'

interface Props {
  user: User
  event: EventItem
}

// Marcos regressivos (dias antes do evento) — para agrupar e calcular datas
const MILESTONES = [
  { days: 365, label: '12 meses antes' },
  { days: 180, label: '6 meses antes' },
  { days: 90,  label: '3 meses antes' },
  { days: 30,  label: '1 mês antes' },
  { days: 10,  label: '10 dias antes' },
  { days: 0,   label: 'Semana do evento' },
]

// Template de casamento — inspirado na planilha real
const WEDDING_TEMPLATE: { title: string; category: string; days: number }[] = [
  { title: 'Definir orçamento total', category: 'Planejamento', days: 365 },
  { title: 'Escolher e reservar o espaço', category: 'Espaço', days: 365 },
  { title: 'Reservar a igreja / local da cerimônia', category: 'Cerimônia', days: 365 },
  { title: 'Contratar fotógrafo e filmagem', category: 'Foto e Vídeo', days: 180 },
  { title: 'Contratar buffet / cardápio', category: 'Buffet', days: 180 },
  { title: 'Contratar decoração', category: 'Decoração', days: 180 },
  { title: 'Contratar cerimonialista', category: 'Cerimônia', days: 180 },
  { title: 'Enviar Save the Date', category: 'Convidados', days: 180 },
  { title: 'Definir lista de convidados', category: 'Convidados', days: 90 },
  { title: 'Escolher e provar doces e bolo', category: 'Buffet', days: 90 },
  { title: 'Comprar / alugar traje dos noivos', category: 'Noivos', days: 90 },
  { title: 'Definir músicas da cerimônia', category: 'Cerimônia', days: 90 },
  { title: 'Enviar convites', category: 'Convidados', days: 90 },
  { title: 'Documentação do cartório', category: 'Documentos', days: 90 },
  { title: 'Comprar alianças', category: 'Noivos', days: 90 },
  { title: 'Fechar confirmações de presença', category: 'Convidados', days: 30 },
  { title: 'Definir mapa de mesas', category: 'Planejamento', days: 30 },
  { title: 'Prova final do traje', category: 'Noivos', days: 30 },
  { title: 'Teste de cabelo e maquiagem', category: 'Noivos', days: 30 },
  { title: 'Confirmar horários com fornecedores', category: 'Planejamento', days: 10 },
  { title: 'Separar pagamentos finais', category: 'Financeiro', days: 10 },
  { title: 'Montar kit do dia (documentos, alianças)', category: 'Planejamento', days: 0 },
]

const CATEGORIES = ['Planejamento', 'Espaço', 'Cerimônia', 'Buffet', 'Decoração', 'Foto e Vídeo', 'Convidados', 'Documentos', 'Financeiro', 'Noivos', 'Outro']

export default function EventChecklistTab({ user, event }: Props) {
  const [tasks, setTasks] = useState<EventTask[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [hidecompleted, setHideCompleted] = useState(false)

  // novo
  const [tTitle, setTTitle] = useState('')
  const [tCategory, setTCategory] = useState('')
  const [tAssignee, setTAssignee] = useState('')
  const [tNotes, setTNotes] = useState('')
  const [tMode, setTMode] = useState<'offset' | 'date'>('offset')
  const [tOffset, setTOffset] = useState('90')
  const [tDate, setTDate] = useState('')

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('event_tasks')
      .select('*')
      .eq('event_id', event.id)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })
    setTasks((data as EventTask[]) || [])
    setLoading(false)
  }

  const eventDate = event.event_date ? new Date(event.event_date + 'T12:00:00') : null
  const today = new Date(); today.setHours(0, 0, 0, 0)

  // Calcula a data efetiva de uma tarefa (offset tem prioridade)
  const taskDate = (t: EventTask): Date | null => {
    if (t.due_offset_days != null && eventDate) {
      const d = new Date(eventDate)
      d.setDate(d.getDate() - t.due_offset_days)
      return d
    }
    if (t.due_date) return new Date(t.due_date + 'T12:00:00')
    return null
  }

  const fmtDate = (d: Date | null) => d ? d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Sem prazo'

  const addTask = async () => {
    if (!tTitle.trim()) return
    await supabase.from('event_tasks').insert({
      event_id: event.id, owner_id: user.id, title: tTitle.trim(),
      category: tCategory || null, assignee: tAssignee || null, notes: tNotes || null,
      due_offset_days: tMode === 'offset' ? parseInt(tOffset) : null,
      due_date: tMode === 'date' ? (tDate || null) : null,
    })
    setTTitle(''); setTCategory(''); setTAssignee(''); setTNotes(''); setShowAdd(false)
    load()
  }

  const toggleDone = async (t: EventTask) => {
    await supabase.from('event_tasks').update({
      done: !t.done, done_at: !t.done ? new Date().toISOString() : null,
    }).eq('id', t.id)
    load()
  }

  const removeTask = async (id: string) => {
    await supabase.from('event_tasks').delete().eq('id', id)
    load()
  }

  const seedWedding = async () => {
    if (!confirm('Adicionar as tarefas sugeridas de casamento? Você poderá editar ou remover qualquer uma depois.')) return
    setSeeding(true)
    const rows = WEDDING_TEMPLATE.map((t, i) => ({
      event_id: event.id, owner_id: user.id, title: t.title, category: t.category,
      due_offset_days: t.days, sort_order: i,
    }))
    await supabase.from('event_tasks').insert(rows)
    setSeeding(false)
    load()
  }

  const total = tasks.length
  const done = tasks.filter(t => t.done).length
  const pct = total ? Math.round((done / total) * 100) : 0

  // Agrupa por marco mais próximo (com base no offset ou data)
  const offsetToMilestone = (t: EventTask): string => {
    let days: number | null = t.due_offset_days
    if (days == null && t.due_date && eventDate) {
      const diff = Math.round((eventDate.getTime() - new Date(t.due_date + 'T12:00:00').getTime()) / 86400000)
      days = diff
    }
    if (days == null) return 'Sem prazo'
    // acha o marco cujo "days" é o mais próximo acima ou igual
    const m = MILESTONES.find(ms => days! >= ms.days) || MILESTONES[MILESTONES.length - 1]
    return m.label
  }

  const visible = hidecompleted ? tasks.filter(t => !t.done) : tasks
  const groups: Record<string, EventTask[]> = {}
  visible.forEach(t => {
    const g = offsetToMilestone(t)
    if (!groups[g]) groups[g] = []
    groups[g].push(t)
  })
  // ordem dos grupos: pelos marcos + "Sem prazo" no fim
  const groupOrder = [...MILESTONES.map(m => m.label), 'Sem prazo'].filter(l => groups[l])

  return (
    <div>
      {/* Progresso */}
      {total > 0 && (
        <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 14, padding: 18, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>{done} de {total} tarefas concluídas</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#5aa800' }}>{pct}%</span>
          </div>
          <div style={{ height: 10, background: '#f0f0f0', borderRadius: 100, overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #a3e635, #84cc16)', borderRadius: 100, transition: 'width .4s' }} />
          </div>
        </div>
      )}

      {/* Ações */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        <button className="btn-primary" onClick={() => setShowAdd(!showAdd)} style={{ padding: '9px 18px', fontSize: 13 }}>+ Nova tarefa</button>
        {event.type === 'Casamento' && (
          <button onClick={seedWedding} disabled={seeding} style={{ fontSize: 13, fontWeight: 600, color: '#3f6212', background: '#f0fdf4', border: '1.5px solid #a3e635', borderRadius: 8, padding: '9px 16px', cursor: 'pointer', fontFamily: 'inherit' }}>
            {seeding ? 'Adicionando...' : '💍 Sugerir tarefas de casamento'}
          </button>
        )}
        {total > 0 && (
          <label style={{ fontSize: 13, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', marginLeft: 'auto' }}>
            <input type="checkbox" checked={hidecompleted} onChange={e => setHideCompleted(e.target.checked)} style={{ accentColor: '#a3e635' }} />
            Ocultar concluídas
          </label>
        )}
      </div>

      {!eventDate && total === 0 && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#92400e', marginBottom: 16 }}>
          💡 Defina a data do evento para que os prazos "X meses antes" calculem datas automaticamente.
        </div>
      )}

      {/* Form nova tarefa */}
      {showAdd && (
        <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <div className="fg"><label>Tarefa *</label><input value={tTitle} onChange={e => setTTitle(e.target.value)} placeholder="Ex: Contratar fotógrafo" autoFocus /></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginTop: 10 }}>
            <div className="fg"><label>Categoria</label><select value={tCategory} onChange={e => setTCategory(e.target.value)}><option value="">—</option>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
            <div className="fg"><label>Responsável</label><input value={tAssignee} onChange={e => setTAssignee(e.target.value)} placeholder="Ex: Eu, Maria..." /></div>
          </div>
          {/* Prazo */}
          <div style={{ marginTop: 10 }}>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Prazo</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <button type="button" onClick={() => setTMode('offset')} style={{ fontSize: 12, padding: '5px 12px', borderRadius: 100, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, border: `1.5px solid ${tMode === 'offset' ? '#a3e635' : '#e8e8e8'}`, background: tMode === 'offset' ? '#f0fdf4' : '#fff', color: tMode === 'offset' ? '#3f6212' : '#6b7280' }}>Antes do evento</button>
              <button type="button" onClick={() => setTMode('date')} style={{ fontSize: 12, padding: '5px 12px', borderRadius: 100, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, border: `1.5px solid ${tMode === 'date' ? '#a3e635' : '#e8e8e8'}`, background: tMode === 'date' ? '#f0fdf4' : '#fff', color: tMode === 'date' ? '#3f6212' : '#6b7280' }}>Data específica</button>
            </div>
            {tMode === 'offset' ? (
              <select value={tOffset} onChange={e => setTOffset(e.target.value)} style={{ padding: '8px 12px', border: '1.5px solid #e8e8e8', borderRadius: 8, fontSize: 13, fontFamily: 'inherit' }}>
                {MILESTONES.map(m => <option key={m.days} value={m.days}>{m.label}</option>)}
              </select>
            ) : (
              <input type="date" value={tDate} onChange={e => setTDate(e.target.value)} style={{ padding: '8px 12px', border: '1.5px solid #e8e8e8', borderRadius: 8, fontSize: 13, fontFamily: 'inherit' }} />
            )}
          </div>
          <div className="fg" style={{ marginTop: 10 }}><label>Notas</label><input value={tNotes} onChange={e => setTNotes(e.target.value)} placeholder="Observações (opcional)" /></div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="btn-primary" onClick={addTask} disabled={!tTitle.trim()} style={{ padding: '8px 18px', fontSize: 13 }}>Adicionar</button>
            <button onClick={() => setShowAdd(false)} style={{ padding: '8px 14px', fontSize: 13, background: '#f3f4f6', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', color: '#6b7280' }}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Vazio */}
      {total === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '40px 24px', background: '#f9fafb', borderRadius: 14 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Nenhuma tarefa ainda</h3>
          <p style={{ fontSize: 13, color: '#6b7280', maxWidth: 420, margin: '0 auto' }}>
            Crie tarefas manualmente{event.type === 'Casamento' ? ' ou use o botão "Sugerir tarefas de casamento" para começar com uma lista pronta.' : '.'}
          </p>
        </div>
      )}

      {/* Grupos por marco */}
      {groupOrder.map(groupLabel => (
        <div key={groupLabel} style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
            {groupLabel}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {groups[groupLabel].map(t => {
              const d = taskDate(t)
              const overdue = !t.done && d && d < today
              return (
                <div key={t.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', background: '#fff', border: `1px solid ${overdue ? '#fecaca' : '#e8e8e8'}`, borderRadius: 10 }}>
                  <input type="checkbox" checked={t.done} onChange={() => toggleDone(t)} style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#a3e635', marginTop: 2, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, textDecoration: t.done ? 'line-through' : 'none', color: t.done ? '#9ca3af' : '#1a1a1a' }}>
                      {t.title}
                    </div>
                    <div style={{ fontSize: 12, color: overdue ? '#dc2626' : '#9ca3af', marginTop: 2, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span>📅 {fmtDate(d)}{overdue && ' · atrasada'}</span>
                      {t.category && <span style={{ color: '#7c3aed' }}>· {t.category}</span>}
                      {t.assignee && <span>· 👤 {t.assignee}</span>}
                    </div>
                    {t.notes && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2, fontStyle: 'italic' }}>{t.notes}</div>}
                  </div>
                  <button onClick={() => removeTask(t.id)} title="Remover" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, opacity: 0.5, padding: 4, flexShrink: 0 }}>🗑️</button>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
