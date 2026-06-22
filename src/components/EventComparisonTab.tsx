import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import type { User } from '@supabase/supabase-js'
import type { EventItem, EventComparison, ComparisonOption } from '../types'
import { useEventFeedback, Toast, ConfirmModal } from './useEventFeedback'

interface Props {
  user: User
  event: EventItem
}

// Itens inclusos pré-definidos sugeridos (o usuário pode adicionar outros)
const SUGGESTED_ITEMS = ['Decoração', 'Buffet', 'DJ / Som', 'Fotografia', 'Mesas e cadeiras', 'Estacionamento', 'Limpeza', 'Bebidas']

export default function EventComparisonTab({ user, event }: Props) {
  const fb = useEventFeedback()
  const [comparisons, setComparisons] = useState<EventComparison[]>([])
  const [savingOption, setSavingOption] = useState(false)
  const [options, setOptions] = useState<ComparisonOption[]>([])
  const [loading, setLoading] = useState(true)
  const [activeComp, setActiveComp] = useState<string | null>(null)

  const [newCompTitle, setNewCompTitle] = useState('')
  const [showNewComp, setShowNewComp] = useState(false)

  // form de nova opção
  const [showAddOption, setShowAddOption] = useState(false)
  const [oName, setOName] = useState('')
  const [oPrice, setOPrice] = useState('')
  const [oCapacity, setOCapacity] = useState('')
  const [oContact, setOContact] = useState('')
  const [oNotes, setONotes] = useState('')
  const [oIncluded, setOIncluded] = useState<Record<string, boolean>>({})

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const { data: comps } = await supabase
      .from('event_comparisons')
      .select('*')
      .eq('event_id', event.id)
      .order('created_at', { ascending: true })
    const list = (comps as EventComparison[]) || []
    setComparisons(list)
    if (list.length && !activeComp) setActiveComp(list[0].id)

    if (list.length) {
      const { data: opts } = await supabase
        .from('comparison_options')
        .select('*')
        .in('comparison_id', list.map(c => c.id))
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true })
      setOptions((opts as ComparisonOption[]) || [])
    } else {
      setOptions([])
    }
    setLoading(false)
  }

  const money = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const createComparison = async () => {
    if (!newCompTitle.trim()) return
    let created: any = null
    const ok = await fb.run(async () => {
      const res = await supabase.from('event_comparisons').insert({
        event_id: event.id, owner_id: user.id, title: newCompTitle.trim(),
      }).select().single()
      created = res.data
      return res
    })
    if (!ok) return
    setNewCompTitle(''); setShowNewComp(false)
    if (created) setActiveComp((created as EventComparison).id)
    load()
  }

  const deleteComparison = (id: string) => {
    fb.confirm('Excluir esta comparação e todas as cotações dentro dela?', async () => {
      const ok = await fb.run(() => supabase.from('event_comparisons').delete().eq('id', id))
      if (!ok) return
      if (activeComp === id) setActiveComp(null)
      load()
    })
  }

  const toggleIncludedItem = (item: string) => {
    setOIncluded(prev => ({ ...prev, [item]: !prev[item] }))
  }

  const addOption = async () => {
    if (!oName.trim() || !activeComp || savingOption) return
    setSavingOption(true)
    const maxOrder = options.filter(o => o.comparison_id === activeComp).length
    const ok = await fb.run(() => supabase.from('comparison_options').insert({
      comparison_id: activeComp, owner_id: user.id, name: oName.trim(),
      price: oPrice ? parseFloat(oPrice) : null,
      capacity: oCapacity ? parseInt(oCapacity) : null,
      contact: oContact || null, notes: oNotes || null,
      included: oIncluded, sort_order: maxOrder,
    }))
    setSavingOption(false)
    if (!ok) return
    setOName(''); setOPrice(''); setOCapacity(''); setOContact(''); setONotes(''); setOIncluded({}); setShowAddOption(false)
    load()
  }

  const deleteOption = async (id: string) => {
    const ok = await fb.run(() => supabase.from('comparison_options').delete().eq('id', id))
    if (ok) load()
  }

  const setChosen = async (opt: ComparisonOption) => {
    // desmarca as outras da mesma comparação, marca esta
    const sameComp = options.filter(o => o.comparison_id === opt.comparison_id)
    for (const o of sameComp) {
      if (o.chosen && o.id !== opt.id) await supabase.from('comparison_options').update({ chosen: false }).eq('id', o.id)
    }
    const ok = await fb.run(() => supabase.from('comparison_options').update({ chosen: !opt.chosen }).eq('id', opt.id))
    if (ok) load()
  }

  const currentOptions = options.filter(o => o.comparison_id === activeComp)

  // todas as chaves de itens inclusos usadas nas opções desta comparação (p/ montar as linhas da matriz)
  const allItems = new Set<string>()
  currentOptions.forEach(o => Object.keys(o.included || {}).forEach(k => allItems.add(k)))
  const itemRows = Array.from(allItems)

  // menor preço (p/ destacar)
  const prices = currentOptions.map(o => o.price).filter((p): p is number => p != null && p > 0)
  const minPrice = prices.length ? Math.min(...prices) : null

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Carregando...</div>
  }

  return (
    <div>
      {/* Intro */}
      <div style={{ background: '#f0fdf4', border: '1px dashed #a3e635', borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#3f6212' }}>
        💡 Recebeu vários orçamentos? Cadastre cada um aqui e compare lado a lado — preço, capacidade e o que está incluso. Quando o marketplace abrir, as cotações poderão vir direto dos anunciantes.
      </div>

      {/* Seletor de comparações */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        {comparisons.map(comp => (
          <button key={comp.id} onClick={() => setActiveComp(comp.id)}
            style={{ fontSize: 13, fontWeight: 600, padding: '8px 16px', borderRadius: 100, cursor: 'pointer', fontFamily: 'inherit',
              border: `1.5px solid ${activeComp === comp.id ? '#a3e635' : '#e8e8e8'}`,
              background: activeComp === comp.id ? '#f0fdf4' : '#fff',
              color: activeComp === comp.id ? '#3f6212' : '#6b7280' }}>
            {comp.title}
          </button>
        ))}
        {showNewComp ? (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input value={newCompTitle} onChange={e => setNewCompTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && createComparison()} placeholder="Ex: Espaços" autoFocus
              style={{ padding: '7px 12px', border: '1.5px solid #a3e635', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', width: 140 }} />
            <button className="btn-primary" onClick={createComparison} disabled={!newCompTitle.trim()} style={{ padding: '7px 14px', fontSize: 13 }}>Criar</button>
            <button onClick={() => setShowNewComp(false)} style={{ padding: '7px 10px', fontSize: 13, background: '#f3f4f6', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit' }}>✕</button>
          </div>
        ) : (
          <button onClick={() => setShowNewComp(true)} style={{ fontSize: 13, fontWeight: 600, padding: '8px 16px', borderRadius: 100, cursor: 'pointer', fontFamily: 'inherit', border: '1.5px dashed #d1d5db', background: '#fff', color: '#6b7280' }}>
            + Nova comparação
          </button>
        )}
      </div>

      {/* Vazio */}
      {comparisons.length === 0 && (
        <div style={{ textAlign: 'center', padding: '50px 24px', background: '#f9fafb', borderRadius: 14 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>⚖️</div>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Compare seus orçamentos</h3>
          <p style={{ fontSize: 13, color: '#6b7280', maxWidth: 440, margin: '0 auto 18px' }}>
            Crie uma comparação (ex: "Espaços", "Buffets") e adicione as cotações que você recebeu para ver tudo lado a lado.
          </p>
          <button className="btn-primary" onClick={() => setShowNewComp(true)} style={{ padding: '11px 24px', fontSize: 14 }}>+ Criar primeira comparação</button>
        </div>
      )}

      {/* Comparação ativa */}
      {activeComp && comparisons.find(c => c.id === activeComp) && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
            <button className="btn-primary" onClick={() => setShowAddOption(!showAddOption)} style={{ padding: '9px 18px', fontSize: 13 }}>+ Adicionar cotação</button>
            <button onClick={() => deleteComparison(activeComp)} style={{ fontSize: 12, color: '#991b1b', background: 'none', border: '1px solid #fecaca', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontFamily: 'inherit' }}>🗑️ Excluir comparação</button>
          </div>

          {/* Form nova cotação */}
          {showAddOption && (
            <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, padding: 18, marginBottom: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                <div className="fg" style={{ gridColumn: '1 / -1' }}><label>Nome *</label><input value={oName} onChange={e => setOName(e.target.value)} placeholder="Ex: Espaço Botânico" autoFocus /></div>
                <div className="fg"><label>Valor (R$)</label><input type="number" value={oPrice} onChange={e => setOPrice(e.target.value)} placeholder="Ex: 15000" /></div>
                <div className="fg"><label>Capacidade</label><input type="number" value={oCapacity} onChange={e => setOCapacity(e.target.value)} placeholder="Ex: 150" /></div>
                <div className="fg"><label>Contato</label><input value={oContact} onChange={e => setOContact(e.target.value)} placeholder="Telefone / email" /></div>
              </div>
              <div style={{ marginTop: 14 }}>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>O que está incluso?</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {SUGGESTED_ITEMS.map(item => (
                    <button key={item} type="button" onClick={() => toggleIncludedItem(item)}
                      style={{ fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 100, cursor: 'pointer', fontFamily: 'inherit',
                        border: `1.5px solid ${oIncluded[item] ? '#16a34a' : '#e8e8e8'}`,
                        background: oIncluded[item] ? '#f0fdf4' : '#fff',
                        color: oIncluded[item] ? '#16a34a' : '#9ca3af' }}>
                      {oIncluded[item] ? '✓ ' : ''}{item}
                    </button>
                  ))}
                </div>
              </div>
              <div className="fg" style={{ marginTop: 12 }}><label>Notas</label><input value={oNotes} onChange={e => setONotes(e.target.value)} placeholder="Observações (opcional)" /></div>
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button className="btn-primary" onClick={addOption} disabled={!oName.trim() || savingOption} style={{ padding: '8px 18px', fontSize: 13 }}>{savingOption ? 'Adicionando...' : 'Adicionar cotação'}</button>
                <button onClick={() => setShowAddOption(false)} style={{ padding: '8px 14px', fontSize: 13, background: '#f3f4f6', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', color: '#6b7280' }}>Cancelar</button>
              </div>
            </div>
          )}

          {/* Matriz comparativa */}
          {currentOptions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 24px', background: '#f9fafb', borderRadius: 14 }}>
              <p style={{ fontSize: 14, color: '#6b7280' }}>Nenhuma cotação ainda. Adicione as opções que você recebeu para comparar.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, minWidth: currentOptions.length * 180 + 140 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: 12, color: '#9ca3af', fontWeight: 700, position: 'sticky', left: 0, background: '#fff', minWidth: 130 }}></th>
                    {currentOptions.map(o => (
                      <th key={o.id} style={{ padding: '12px', minWidth: 170, verticalAlign: 'top', background: o.chosen ? '#f0fdf4' : '#fff', borderTopLeftRadius: 12, borderTopRightRadius: 12, border: o.chosen ? '1.5px solid #a3e635' : '1px solid #f0f0f0', borderBottom: 'none' }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#1a1a1a', marginBottom: 6 }}>{o.name}</div>
                        <button onClick={() => setChosen(o)} style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, cursor: 'pointer', fontFamily: 'inherit',
                          border: `1.5px solid ${o.chosen ? '#16a34a' : '#e8e8e8'}`, background: o.chosen ? '#16a34a' : '#fff', color: o.chosen ? '#fff' : '#9ca3af' }}>
                          {o.chosen ? '✓ Escolhida' : 'Escolher'}
                        </button>
                        <button onClick={() => deleteOption(o.id)} title="Remover" style={{ marginLeft: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, opacity: 0.4 }}>🗑️</button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Preço */}
                  <tr>
                    <td style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600, color: '#6b7280', position: 'sticky', left: 0, background: '#fff' }}>💰 Valor</td>
                    {currentOptions.map(o => (
                      <td key={o.id} style={{ padding: '10px 12px', textAlign: 'center', background: o.chosen ? '#f0fdf4' : '#fff', borderLeft: o.chosen ? '1.5px solid #a3e635' : '1px solid #f5f5f5', borderRight: o.chosen ? '1.5px solid #a3e635' : '1px solid #f5f5f5' }}>
                        {o.price != null ? (
                          <span style={{ fontSize: 15, fontWeight: 800, color: o.price === minPrice ? '#16a34a' : '#1a1a1a' }}>
                            {money(o.price)}{o.price === minPrice && <span style={{ fontSize: 10, display: 'block', color: '#16a34a', fontWeight: 700 }}>menor preço</span>}
                          </span>
                        ) : <span style={{ color: '#d1d5db' }}>—</span>}
                      </td>
                    ))}
                  </tr>
                  {/* Capacidade */}
                  <tr>
                    <td style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600, color: '#6b7280', position: 'sticky', left: 0, background: '#fff' }}>👥 Capacidade</td>
                    {currentOptions.map(o => (
                      <td key={o.id} style={{ padding: '10px 12px', textAlign: 'center', fontSize: 13, background: o.chosen ? '#f0fdf4' : '#fff' }}>
                        {o.capacity != null ? `${o.capacity} pessoas` : <span style={{ color: '#d1d5db' }}>—</span>}
                      </td>
                    ))}
                  </tr>
                  {/* Itens inclusos */}
                  {itemRows.map(item => (
                    <tr key={item}>
                      <td style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600, color: '#6b7280', position: 'sticky', left: 0, background: '#fff' }}>{item}</td>
                      {currentOptions.map(o => (
                        <td key={o.id} style={{ padding: '10px 12px', textAlign: 'center', fontSize: 14, background: o.chosen ? '#f0fdf4' : '#fff' }}>
                          {o.included?.[item] ? <span style={{ color: '#16a34a', fontWeight: 700 }}>✓</span> : <span style={{ color: '#d1d5db' }}>✕</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {/* Contato */}
                  <tr>
                    <td style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600, color: '#6b7280', position: 'sticky', left: 0, background: '#fff' }}>📞 Contato</td>
                    {currentOptions.map(o => (
                      <td key={o.id} style={{ padding: '10px 12px', textAlign: 'center', fontSize: 12, color: '#6b7280', background: o.chosen ? '#f0fdf4' : '#fff' }}>
                        {o.contact || <span style={{ color: '#d1d5db' }}>—</span>}
                      </td>
                    ))}
                  </tr>
                  {/* Notas */}
                  <tr>
                    <td style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600, color: '#6b7280', position: 'sticky', left: 0, background: '#fff' }}>📝 Notas</td>
                    {currentOptions.map(o => (
                      <td key={o.id} style={{ padding: '10px 12px', textAlign: 'center', fontSize: 12, color: '#6b7280', background: o.chosen ? '#f0fdf4' : '#fff', borderBottomLeftRadius: 12, borderBottomRightRadius: 12, border: o.chosen ? '1.5px solid #a3e635' : 'none', borderTop: 'none' }}>
                        {o.notes || <span style={{ color: '#d1d5db' }}>—</span>}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      <Toast toast={fb.toast} />
      <ConfirmModal state={fb.confirmState} onClose={() => fb.setConfirmState(null)} />
    </div>
  )
}
