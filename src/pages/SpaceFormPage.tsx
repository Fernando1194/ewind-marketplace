import { useState } from 'react'
import { supabase } from '../supabase'
import type { User } from '@supabase/supabase-js'
import { CATEGORIES, EVENT_TYPES, ATTRIBUTES } from '../types'
import type { Space } from '../types'
import type { Page } from '../App'

interface Props {
  user: User
  goToPage: (page: Page) => void
  editingSpace?: Space | null
}

export default function SpaceFormPage({ user, goToPage, editingSpace }: Props) {
  const isEditing = !!editingSpace
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)

  const totalSteps = 6

  // Etapa 1 — Informações
  const [name, setName] = useState(editingSpace?.name || '')
  const [description, setDescription] = useState(editingSpace?.description || '')
  const [category, setCategory] = useState(editingSpace?.category || '')
  const [eventTypes, setEventTypes] = useState<string[]>(editingSpace?.event_types || [])

  // Etapa 2 — Localização
  const [city, setCity] = useState(editingSpace?.city || '')
  const [state, setState] = useState(editingSpace?.state || 'PR')
  const [address, setAddress] = useState(editingSpace?.address || '')
  const [neighborhood, setNeighborhood] = useState((editingSpace as any)?.neighborhood || '')
  const [areaCovered, setAreaCovered] = useState((editingSpace as any)?.area_covered?.toString() || '')
  const [areaUncovered, setAreaUncovered] = useState((editingSpace as any)?.area_uncovered?.toString() || '')

  // Etapa 3 — Capacidade e preços
  const [capacity, setCapacity] = useState(editingSpace?.capacity?.toString() || '')
  const [minHours, setMinHours] = useState(editingSpace?.min_hours?.toString() || '3')
  const [pricePerHour, setPricePerHour] = useState(editingSpace?.price_per_hour?.toString() || '')
  const [pricePerDay, setPricePerDay] = useState(editingSpace?.price_per_day?.toString() || '')

  // Etapa 4 — Atributos
  const [attributes, setAttributes] = useState<string[]>(editingSpace?.attributes || [])

  // Etapa 5 — Links e redes sociais
  const [whatsapp, setWhatsapp] = useState((editingSpace as any)?.whatsapp || '')
  const [instagram, setInstagram] = useState((editingSpace as any)?.instagram || '')
  const [facebook, setFacebook] = useState((editingSpace as any)?.facebook || '')
  const [website, setWebsite] = useState((editingSpace as any)?.website || '')
  const [cardapioUrl, setCardapioUrl] = useState((editingSpace as any)?.cardapio_url || '')

  // Etapa 6 — Fotos
  const [files, setFiles] = useState<File[]>([])
  const [existingUrls, setExistingUrls] = useState<string[]>(editingSpace?.media_urls || [])

  const toggleArr = (arr: string[], val: string, set: (v: string[]) => void) => {
    set(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])
  }

  const validateStep = () => {
    setError('')
    if (step === 1 && (!name || !category || eventTypes.length === 0)) {
      setError('Preencha nome, categoria e pelo menos um tipo de evento'); return false
    }
    if (step === 2 && (!city || !state)) {
      setError('Preencha cidade e estado'); return false
    }
    if (step === 3) {
      if (!capacity || parseInt(capacity) < 1) { setError('Informe a capacidade'); return false }
      if (!pricePerHour && !pricePerDay) { setError('Informe pelo menos um preço'); return false }
    }
    return true
  }

  const nextStep = () => { if (validateStep()) setStep(s => s + 1) }

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      const newUrls: string[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const ext = file.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}-${i}.${ext}`
        const { error: upErr } = await supabase.storage.from('space-media').upload(fileName, file)
        if (upErr) throw upErr
        const { data: urlData } = supabase.storage.from('space-media').getPublicUrl(fileName)
        newUrls.push(urlData.publicUrl)
        setUploadProgress(((i + 1) / files.length) * 100)
      }

      const spaceData = {
        host_id: user.id,
        name, description: description || null,
        category, event_types: eventTypes,
        city, state, address: address || null,
        neighborhood: neighborhood || null,
        area_covered: areaCovered ? parseInt(areaCovered) : null,
        area_uncovered: areaUncovered ? parseInt(areaUncovered) : null,
        capacity: parseInt(capacity),
        min_hours: parseInt(minHours) || 3,
        price_per_hour: pricePerHour ? parseFloat(pricePerHour) : null,
        price_per_day: pricePerDay ? parseFloat(pricePerDay) : null,
        attributes,
        whatsapp: whatsapp || null,
        instagram: instagram || null,
        facebook: facebook || null,
        website: website || null,
        cardapio_url: cardapioUrl || null,
        media_urls: [...existingUrls, ...newUrls],
        status: 'active'
      }

      const result = isEditing && editingSpace
        ? await supabase.from('spaces').update(spaceData).eq('id', editingSpace.id)
        : await supabase.from('spaces').insert(spaceData)

      if (result.error) throw result.error
      alert(isEditing ? '✅ Espaço atualizado com sucesso!' : '✅ Espaço cadastrado com sucesso!')
      goToPage('host-dashboard')
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar')
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  const steps = ['Informações', 'Localização', 'Capacidade', 'Atributos', 'Links', 'Fotos']

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
      <a onClick={() => goToPage('host-dashboard')} style={{ color: '#5aa800', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'block', marginBottom: 8 }}>
        ← Voltar ao painel
      </a>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
        {isEditing ? 'Editar espaço' : 'Cadastrar novo espaço'}
      </h1>

      {/* Progress com labels */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, marginTop: 16 }}>
        {steps.map((label, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center' }}>
            <div style={{
              height: 4, borderRadius: 100, marginBottom: 4,
              background: i < step ? '#a3e635' : '#e8e8e8',
              transition: 'background 0.3s'
            }} />
            <div style={{ fontSize: 10, color: i < step ? '#5aa800' : '#9ca3af', fontWeight: i + 1 === step ? 700 : 400 }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', border: '1.5px solid #e8e8e8', borderRadius: 14, padding: 28 }}>

        {/* ETAPA 1 */}
        {step === 1 && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 18 }}>📋 Informações básicas</h2>
            <div className="fg">
              <label>Nome do espaço *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Chácara Vila Verde" />
            </div>
            <div className="fg">
              <label>Descrição</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4}
                placeholder="Descreva seu espaço, ambientes, diferenciais..."
                style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e8e8e8', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', resize: 'vertical' }} />
            </div>
            <div className="fg">
              <label>Categoria *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
                {CATEGORIES.map(c => (
                  <button key={c.name} type="button" onClick={() => setCategory(c.name)}
                    className={`role-btn ${category === c.name ? 'on' : ''}`} style={{ fontSize: 12 }}>
                    {c.icon} {c.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="fg">
              <label>Tipos de evento *</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {EVENT_TYPES.map(t => (
                  <button key={t} type="button" onClick={() => toggleArr(eventTypes, t, setEventTypes)}
                    className={`chip-btn ${eventTypes.includes(t) ? 'on' : ''}`}>{t}</button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ETAPA 2 */}
        {step === 2 && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 18 }}>📍 Localização</h2>
            <div className="fg">
              <label>Cidade *</label>
              <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="Ex: Curitiba" />
            </div>
            <div className="fg">
              <label>Estado *</label>
              <input type="text" value={state} onChange={e => setState(e.target.value)} placeholder="PR" maxLength={2} />
            </div>
            <div className="fg">
              <label>Bairro (opcional)</label>
              <input type="text" value={neighborhood} onChange={e => setNeighborhood(e.target.value)} placeholder="Ex: Batel, Água Verde" />
            </div>
            <div className="fg">
              <label>Endereço completo (opcional)</label>
              <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Rua, número" />
              <p style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>💡 Compartilhado apenas com clientes que fecharem negócio.</p>
            </div>
          </>
        )}

        {/* ETAPA 3 */}
        {step === 3 && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 18 }}>👥 Capacidade e preços</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="fg">
                <label>Capacidade máxima *</label>
                <input type="number" value={capacity} onChange={e => setCapacity(e.target.value)} placeholder="Ex: 200" min={1} />
              </div>
              <div className="fg">
                <label>Mínimo de horas</label>
                <input type="number" value={minHours} onChange={e => setMinHours(e.target.value)} placeholder="3" min={1} />
              </div>
              <div className="fg">
                <label>💰 Preço por hora (R$)</label>
                <input type="number" value={pricePerHour} onChange={e => setPricePerHour(e.target.value)} placeholder="Ex: 800" min={0} step={0.01} />
              </div>
              <div className="fg">
                <label>💰 Preço por dia (R$)</label>
                <input type="number" value={pricePerDay} onChange={e => setPricePerDay(e.target.value)} placeholder="Ex: 5000" min={0} step={0.01} />
              </div>
            </div>
            <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #f3f4f6', paddingTop: 12, marginTop: 4 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: '#2d2d2d' }}>📐 Metragem do espaço (opcional)</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="fg">
                  <label>🏠 Área coberta (m²)</label>
                  <input type="number" value={areaCovered} onChange={e => setAreaCovered(e.target.value)} placeholder="Ex: 500" min={0} />
                </div>
                <div className="fg">
                  <label>🌤️ Área descoberta (m²)</label>
                  <input type="number" value={areaUncovered} onChange={e => setAreaUncovered(e.target.value)} placeholder="Ex: 1200" min={0} />
                </div>
              </div>
            </div>
            <p style={{ fontSize: 12, color: '#6b7280' }}>💡 Preencha pelo menos um dos preços.</p>
          </>
        )}

        {/* ETAPA 4 */}
        {step === 4 && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>✨ O que o local oferece</h2>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 18 }}>Selecione os atributos do seu espaço.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ATTRIBUTES.map(a => (
                <button key={a} type="button" onClick={() => toggleArr(attributes, a, setAttributes)}
                  className={`chip-btn ${attributes.includes(a) ? 'on' : ''}`}>
                  {attributes.includes(a) ? '✓ ' : ''}{a}
                </button>
              ))}
            </div>
          </>
        )}

        {/* ETAPA 5 — LINKS */}
        {step === 5 && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>🔗 Links e redes sociais</h2>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
              Adicione seus contatos e links para facilitar o contato de clientes. Todos os campos são opcionais.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="fg">
                <label>💬 WhatsApp</label>
                <input type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="(41) 99999-9999" />
              </div>
              <div className="fg">
                <label>📸 Instagram</label>
                <input type="text" value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="@seuespaco" />
              </div>
              <div className="fg">
                <label>📘 Facebook</label>
                <input type="text" value={facebook} onChange={e => setFacebook(e.target.value)} placeholder="facebook.com/seuespaco" />
              </div>
              <div className="fg">
                <label>🌐 Site próprio</label>
                <input type="text" value={website} onChange={e => setWebsite(e.target.value)} placeholder="www.seusite.com.br" />
              </div>
            </div>

            <div className="fg">
              <label>🍽️ Cardápio / Menu online (URL)</label>
              <input type="text" value={cardapioUrl} onChange={e => setCardapioUrl(e.target.value)} placeholder="Ex: link do iFood, site próprio, PDF..." />
              <p style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>
                💡 Ideal para restaurantes, buffets e espaços que oferecem catering.
              </p>
            </div>

            {/* Preview dos links */}
            {(whatsapp || instagram || facebook || website || cardapioUrl) && (
              <div style={{ marginTop: 16, padding: 14, background: '#f0fdf4', borderRadius: 10, border: '1px solid #d9f99d' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#5aa800', marginBottom: 8 }}>✓ Links que serão exibidos:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {whatsapp && <span className="tag">💬 WhatsApp</span>}
                  {instagram && <span className="tag">📸 Instagram</span>}
                  {facebook && <span className="tag">📘 Facebook</span>}
                  {website && <span className="tag">🌐 Site</span>}
                  {cardapioUrl && <span className="tag">🍽️ Cardápio</span>}
                </div>
              </div>
            )}
          </>
        )}

        {/* ETAPA 6 — FOTOS */}
        {step === 6 && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>📸 Fotos do espaço</h2>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 18 }}>Adicione até 8 fotos. Boas fotos aumentam muito as chances de contato!</p>

            {existingUrls.length > 0 && (
              <>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Fotos atuais:</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8, marginBottom: 16 }}>
                  {existingUrls.map((url, i) => (
                    <div key={i} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', height: 85 }}>
                      <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button onClick={() => setExistingUrls(existingUrls.filter((_, idx) => idx !== i))}
                        style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', fontSize: 12 }}>×</button>
                    </div>
                  ))}
                </div>
              </>
            )}

            <label style={{ display: 'block', border: '2px dashed #e8e8e8', borderRadius: 12, padding: 32, textAlign: 'center', cursor: 'pointer', background: '#fafafa' }}>
              <input type="file" multiple accept="image/*" onChange={e => e.target.files && setFiles(Array.from(e.target.files).slice(0, 8))} style={{ display: 'none' }} />
              <div style={{ fontSize: 36, marginBottom: 8 }}>📷</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                {files.length > 0 ? `${files.length} foto(s) selecionada(s)` : 'Clique para escolher fotos'}
              </div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>JPG, PNG até 50MB cada</div>
            </label>

            {files.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8, marginTop: 12 }}>
                {files.map((f, i) => (
                  <div key={i} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', height: 85 }}>
                    <img src={URL.createObjectURL(f)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                      style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', fontSize: 12 }}>×</button>
                  </div>
                ))}
              </div>
            )}

            {loading && uploadProgress > 0 && (
              <div style={{ marginTop: 16, padding: 12, background: '#f0fdf4', borderRadius: 8 }}>
                <div style={{ fontSize: 12, marginBottom: 6 }}>Enviando fotos... {uploadProgress.toFixed(0)}%</div>
                <div style={{ height: 4, background: '#e8e8e8', borderRadius: 100, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${uploadProgress}%`, background: '#a3e635', transition: 'width 0.3s' }} />
                </div>
              </div>
            )}
          </>
        )}

        {error && <div className="auth-error" style={{ marginTop: 16 }}>⚠️ {error}</div>}

        {/* Navegação */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, paddingTop: 18, borderTop: '1px solid #e8e8e8' }}>
          {step > 1
            ? <button onClick={() => setStep(s => s - 1)} style={{ padding: '10px 20px', fontSize: 14, fontWeight: 600, background: '#fff', border: '1.5px solid #e8e8e8', borderRadius: 8, cursor: 'pointer' }}>← Anterior</button>
            : <div />}
          {step < totalSteps
            ? <button onClick={nextStep} className="btn-primary">Próximo →</button>
            : <button onClick={handleSubmit} className="btn-primary" disabled={loading}>{loading ? 'Salvando...' : (isEditing ? '✓ Salvar alterações' : '✓ Publicar espaço')}</button>
          }
        </div>
      </div>
    </div>
  )
}
