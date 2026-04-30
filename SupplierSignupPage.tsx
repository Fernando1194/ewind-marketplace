import { useState, useEffect } from 'react'
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

  // Form state - inicializa com dados do espaço se for edição
  const [name, setName] = useState(editingSpace?.name || '')
  const [description, setDescription] = useState(editingSpace?.description || '')
  const [category, setCategory] = useState(editingSpace?.category || '')
  const [eventTypes, setEventTypes] = useState<string[]>(editingSpace?.event_types || [])
  const [city, setCity] = useState(editingSpace?.city || '')
  const [state, setState] = useState(editingSpace?.state || 'PR')
  const [address, setAddress] = useState(editingSpace?.address || '')
  const [capacity, setCapacity] = useState(editingSpace?.capacity?.toString() || '')
  const [minHours, setMinHours] = useState(editingSpace?.min_hours?.toString() || '3')
  const [pricePerHour, setPricePerHour] = useState(editingSpace?.price_per_hour?.toString() || '')
  const [pricePerDay, setPricePerDay] = useState(editingSpace?.price_per_day?.toString() || '')
  const [attributes, setAttributes] = useState<string[]>(editingSpace?.attributes || [])
  const [files, setFiles] = useState<File[]>([])
  const [existingUrls, setExistingUrls] = useState<string[]>(editingSpace?.media_urls || [])

  const totalSteps = 5

  const toggleArr = (arr: string[], val: string, set: (v: string[]) => void) => {
    set(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files).slice(0, 8))
    }
  }

  const removeExistingUrl = (url: string) => {
    setExistingUrls(existingUrls.filter(u => u !== url))
  }

  const validateStep = () => {
    setError('')
    if (step === 1) {
      if (!name || !category || eventTypes.length === 0) {
        setError('Preencha nome, categoria e pelo menos um tipo de evento')
        return false
      }
    }
    if (step === 2) {
      if (!city || !state) {
        setError('Preencha cidade e estado')
        return false
      }
    }
    if (step === 3) {
      if (!capacity || parseInt(capacity) < 1) {
        setError('Informe a capacidade')
        return false
      }
      if (!pricePerHour && !pricePerDay) {
        setError('Informe pelo menos um preço (por hora ou diária)')
        return false
      }
    }
    return true
  }

  const nextStep = () => {
    if (validateStep()) setStep(step + 1)
  }

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      // Upload de fotos novas (se houver)
      const newUploadedUrls: string[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const ext = file.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}-${i}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('space-media')
          .upload(fileName, file)

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('space-media')
          .getPublicUrl(fileName)

        newUploadedUrls.push(urlData.publicUrl)
        setUploadProgress(((i + 1) / files.length) * 100)
      }

      // Combinar URLs existentes (mantidas) + novas
      const finalUrls = [...existingUrls, ...newUploadedUrls]

      const spaceData = {
        host_id: user.id,
        name,
        description: description || null,
        category,
        event_types: eventTypes,
        city,
        state,
        address: address || null,
        capacity: parseInt(capacity),
        min_hours: parseInt(minHours) || 3,
        price_per_hour: pricePerHour ? parseFloat(pricePerHour) : null,
        price_per_day: pricePerDay ? parseFloat(pricePerDay) : null,
        attributes,
        media_urls: finalUrls,
        status: 'active',
      }

      let result
      if (isEditing && editingSpace) {
        // UPDATE
        result = await supabase
          .from('spaces')
          .update(spaceData)
          .eq('id', editingSpace.id)
      } else {
        // INSERT
        result = await supabase.from('spaces').insert(spaceData)
      }

      if (result.error) throw result.error

      alert(isEditing ? '✅ Espaço atualizado com sucesso!' : '✅ Espaço cadastrado com sucesso!')
      goToPage('host-dashboard')
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar espaço')
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <a onClick={() => goToPage('host-dashboard')} style={{ color: '#5aa800', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          ← Voltar ao painel
        </a>
      </div>

      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
        {isEditing ? 'Editar espaço' : 'Cadastrar novo espaço'}
      </h1>
      <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>Etapa {step} de {totalSteps}</p>

      {/* Progress bar */}
      <div style={{ background: '#e8e8e8', height: 4, borderRadius: 100, marginBottom: 24, overflow: 'hidden' }}>
        <div style={{ background: '#a3e635', height: '100%', width: `${(step / totalSteps) * 100}%`, transition: 'width 0.3s' }} />
      </div>

      <div style={{ background: '#fff', border: '1.5px solid #e8e8e8', borderRadius: 14, padding: 28 }}>
        {step === 1 && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 18 }}>📋 Informações básicas</h2>
            <div className="fg">
              <label>Nome do espaço *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Salão Villa Verde" />
            </div>
            <div className="fg">
              <label>Descrição</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Descreva o seu espaço, ambientes, diferenciais..."
                rows={4}
                style={{
                  width: '100%', padding: '11px 14px', border: '1.5px solid #e8e8e8',
                  borderRadius: 8, fontSize: 14, fontFamily: 'inherit', resize: 'vertical'
                }}
              />
            </div>
            <div className="fg">
              <label>Categoria *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
                {CATEGORIES.map(c => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setCategory(c.name)}
                    className={`role-btn ${category === c.name ? 'on' : ''}`}
                  >
                    {c.icon} {c.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="fg">
              <label>Tipos de evento *</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {EVENT_TYPES.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleArr(eventTypes, t, setEventTypes)}
                    className={`chip-btn ${eventTypes.includes(t) ? 'on' : ''}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

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
              <label>Endereço (opcional)</label>
              <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Rua, número, bairro" />
              <p style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>
                💡 O endereço só será mostrado para clientes que confirmarem o orçamento.
              </p>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 18 }}>👥 Capacidade e preços</h2>
            <div className="fg">
              <label>Capacidade máxima (pessoas) *</label>
              <input type="number" value={capacity} onChange={e => setCapacity(e.target.value)} placeholder="Ex: 200" min={1} />
            </div>
            <div className="fg">
              <label>Mínimo de horas</label>
              <input type="number" value={minHours} onChange={e => setMinHours(e.target.value)} placeholder="3" min={1} />
            </div>
            <div className="fg">
              <label>Preço por hora (R$)</label>
              <input type="number" value={pricePerHour} onChange={e => setPricePerHour(e.target.value)} placeholder="Ex: 800" min={0} step={0.01} />
            </div>
            <div className="fg">
              <label>Preço da diária (R$)</label>
              <input type="number" value={pricePerDay} onChange={e => setPricePerDay(e.target.value)} placeholder="Ex: 5000" min={0} step={0.01} />
            </div>
            <p style={{ fontSize: 12, color: '#6b7280' }}>
              💡 Você pode preencher um ou os dois preços. Pelo menos um é obrigatório.
            </p>
          </>
        )}

        {step === 4 && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>✨ O que o local oferece</h2>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 18 }}>Selecione todos os atributos que se aplicam.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ATTRIBUTES.map(a => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleArr(attributes, a, setAttributes)}
                  className={`chip-btn ${attributes.includes(a) ? 'on' : ''}`}
                >
                  {attributes.includes(a) ? '✓ ' : ''}{a}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 5 && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>📸 Fotos do espaço</h2>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 18 }}>Adicione até 8 fotos do seu espaço.</p>

            {existingUrls.length > 0 && (
              <>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Fotos atuais:</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8, marginBottom: 16 }}>
                  {existingUrls.map((url, i) => (
                    <div key={i} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', height: 90 }}>
                      <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        onClick={() => removeExistingUrl(url)}
                        style={{
                          position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)',
                          color: '#fff', border: 'none', borderRadius: '50%', width: 22, height: 22,
                          cursor: 'pointer', fontSize: 12
                        }}
                      >×</button>
                    </div>
                  ))}
                </div>
              </>
            )}

            <label
              style={{
                display: 'block', border: '2px dashed #e8e8e8', borderRadius: 12,
                padding: 32, textAlign: 'center', cursor: 'pointer', background: '#fafafa'
              }}
            >
              <input type="file" multiple accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
              <div style={{ fontSize: 36, marginBottom: 8 }}>📷</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                {files.length > 0 ? `${files.length} foto(s) nova(s) selecionada(s)` : 'Clique para adicionar fotos'}
              </div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>JPG, PNG até 50MB cada</div>
            </label>

            {files.length > 0 && (
              <>
                <div style={{ fontSize: 13, fontWeight: 600, margin: '16px 0 8px' }}>Fotos novas a adicionar:</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
                  {files.map((f, i) => (
                    <div key={i} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', height: 90 }}>
                      <img src={URL.createObjectURL(f)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                        style={{
                          position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)',
                          color: '#fff', border: 'none', borderRadius: '50%', width: 22, height: 22,
                          cursor: 'pointer', fontSize: 12
                        }}
                      >×</button>
                    </div>
                  ))}
                </div>
              </>
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

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, paddingTop: 18, borderTop: '1px solid #e8e8e8' }}>
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              style={{
                padding: '10px 20px', fontSize: 14, fontWeight: 600,
                background: '#fff', border: '1.5px solid #e8e8e8',
                borderRadius: 8, cursor: 'pointer', color: '#2d2d2d'
              }}
            >
              ← Anterior
            </button>
          ) : <div />}

          {step < totalSteps ? (
            <button onClick={nextStep} className="btn-primary">Próximo →</button>
          ) : (
            <button onClick={handleSubmit} className="btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : (isEditing ? '✓ Salvar alterações' : '✓ Publicar espaço')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
