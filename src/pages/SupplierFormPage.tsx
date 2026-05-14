import AvailabilityCalendar from '../components/AvailabilityCalendar'
import { useState } from 'react'
import { supabase } from '../supabase'
import type { User } from '@supabase/supabase-js'
import { SUPPLIER_CATEGORIES, SUPPLIER_ATTRIBUTES, EVENT_TYPES } from '../types'
import type { Supplier } from '../types'
import type { Page } from '../App'

interface Props {
  user: User
  goToPage: (page: Page) => void
  editingSupplier?: Supplier | null
}

export default function SupplierFormPage({ user, goToPage, editingSupplier }: Props) {
  const isEditing = !!editingSupplier

  const capitalizeWords = (v: string) => v.replace(/\b\w/g, c => c.toUpperCase())
  const capitalizeFirst = (v: string) => v.charAt(0).toUpperCase() + v.slice(1)
  const maskPhone = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 11)
    if (d.length <= 2) return d
    if (d.length <= 7) return `(${d.slice(0,2)}) ${d.slice(2)}`
    return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`
  }
  const cleanInstagram = (v: string) => {
    const match = v.match(/instagram\.com\/([^/?]+)/)
    if (match) return '@' + match[1]
    return v.startsWith('@') ? v : v ? '@' + v.replace('@', '') : ''
  }

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [name, setName] = useState(editingSupplier?.name || '')
  const [description, setDescription] = useState(editingSupplier?.description || '')
  const [category, setCategory] = useState(editingSupplier?.category || '')
  const [subcategory, setSubcategory] = useState(editingSupplier?.subcategory || '')
  const [cityInput, setCityInput] = useState('')
  const [cities, setCities] = useState<string[]>(editingSupplier?.cities || [])
  const [state, setState] = useState(editingSupplier?.state || 'PR')
  const [whatsapp, setWhatsapp] = useState(editingSupplier?.whatsapp || '')
  const [instagram, setInstagram] = useState(editingSupplier?.instagram || '')
  const [email, setEmail] = useState(editingSupplier?.email || '')
  const [website, setWebsite] = useState(editingSupplier?.website || '')
  const [facebook, setFacebook] = useState(editingSupplier?.facebook || '')
  const [youtube, setYoutube] = useState(editingSupplier?.youtube || '')
  const [tiktok, setTiktok] = useState(editingSupplier?.tiktok || '')
  const [portfolioUrl, setPortfolioUrl] = useState(editingSupplier?.portfolio_url || '')
  const [availableDates, setAvailableDates] = useState<string[]>(editingSupplier?.available_dates || [])
  const [availabilityNote, setAvailabilityNote] = useState(editingSupplier?.availability_note || '')
  const [priceInfo, setPriceInfo] = useState(editingSupplier?.price_info || '')
  const [eventTypes, setEventTypes] = useState<string[]>(editingSupplier?.event_types || [])
  const [attributes, setAttributes] = useState<string[]>(editingSupplier?.attributes || [])
  const [files, setFiles] = useState<File[]>([])
  const [existingUrls, setExistingUrls] = useState<string[]>(editingSupplier?.media_urls || [])

  const totalSteps = 6

  const toggleArr = (arr: string[], val: string, set: (v: string[]) => void) => {
    set(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])
  }

  const addCity = () => {
    const c = cityInput.trim()
    if (c && !cities.includes(c)) setCities([...cities, c])
    setCityInput('')
  }

  const validateStep = () => {
    setError('')
    if (step === 1 && (!name || !category)) { setError('Preencha o nome e a categoria'); return false }
    if (step === 2 && cities.length === 0) { setError('Adicione pelo menos uma cidade de atendimento'); return false }
    if (step === 3 && !whatsapp.trim()) { setError('O WhatsApp é obrigatório'); return false }
    return true
  }

  const nextStep = () => { if (validateStep()) setStep(step + 1) }

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      const newUrls: string[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const ext = file.name.split('.').pop()
        const path = `suppliers/${user.id}/${Date.now()}-${i}.${ext}`
        setUploadProgress(Math.round((i / files.length) * 80))
        const { error: uploadError } = await supabase.storage.from('space-media').upload(path, file, { upsert: true })
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from('space-media').getPublicUrl(path)
          newUrls.push(publicUrl)
        }
      }
      setUploadProgress(90)
      const allUrls = [...existingUrls, ...newUrls]
      const payload = {
        owner_id: user.id,
        name: name.trim(),
        description: description.trim() || null,
        category,
        subcategory: subcategory.trim() || null,
        cities,
        state,
        whatsapp: whatsapp.trim(),
        instagram: instagram.trim() || null,
        email: email.trim() || null,
        website: website.trim() || null,
        facebook: facebook.trim() || null,
        youtube: youtube.trim() || null,
        tiktok: tiktok.trim() || null,
        portfolio_url: portfolioUrl.trim() || null,
        price_info: priceInfo.trim() || null,
        event_types: eventTypes.length > 0 ? eventTypes : null,
        attributes: attributes.length > 0 ? attributes : null,
        available_dates: availableDates.length > 0 ? availableDates : null,
        availability_note: availabilityNote || null,
        media_urls: allUrls,
        status: 'pending',
      }
      if (isEditing && editingSupplier) {
        const { error } = await supabase.from('suppliers').update(payload).eq('id', editingSupplier.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('suppliers').insert(payload)
        if (error) throw error
      }
      setUploadProgress(100)
      goToPage('supplier-dashboard')
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar. Tente novamente.')
    }
    setLoading(false)
    setUploadProgress(0)
  }

  const STEPS = ['Informações', 'Cidades', 'Contato', 'Diferenciais', 'Disponibilidade', 'Fotos']

  return (
    <div style={{ maxWidth: 680, margin: '32px auto', padding: '0 20px' }}>
      <a onClick={() => goToPage('supplier-dashboard')} style={{ fontSize: 13, color: '#5aa800', cursor: 'pointer', display: 'inline-block', marginBottom: 16 }}>← Voltar ao painel</a>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{isEditing ? 'Editar serviço' : 'Cadastrar novo serviço'}</h1>
      <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>Etapa {step} de {totalSteps}</p>

      {/* Progress bar */}
      <div style={{ height: 6, background: '#e8e8e8', borderRadius: 3, marginBottom: 8, overflow: 'hidden' }}>
        <div style={{ background: '#a3e635', height: '100%', width: `${(step / totalSteps) * 100}%`, transition: 'width 0.3s' }} />
      </div>

      {/* Step labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 28 }}>
        {STEPS.map((s, i) => (
          <span key={s} style={{ fontSize: 10, color: i + 1 <= step ? '#5aa800' : '#9ca3af', fontWeight: i + 1 === step ? 700 : 400 }}>{s}</span>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8e8e8', padding: 28 }}>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 18 }}>🎯 Informações básicas</h2>
            <div className="fg">
              <label>Nome do serviço / empresa *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Foto & Vídeo Studio Silva" />
            </div>
            <div className="fg">
              <label>Categoria *</label>
              <select value={category} onChange={e => setCategory(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e8e8e8', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', background: '#fff' }}>
                <option value="">Selecione sua categoria...</option>
                {SUPPLIER_CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div className="fg">
              <label>Especialidade (opcional)</label>
              <input type="text" value={subcategory} onChange={e => setSubcategory(e.target.value)} placeholder="Ex: Casamentos · Festas infantis · Corporativo" />
            </div>
            <div className="fg">
              <label>Tipos de evento atendidos</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                {EVENT_TYPES.map(t => (
                  <button key={t} type="button" onClick={() => toggleArr(eventTypes, t, setEventTypes)}
                    className={`chip-btn ${eventTypes.includes(t) ? 'on' : ''}`} style={{ fontSize: 12 }}>
                    {eventTypes.includes(t) ? '✓ ' : ''}{t}
                  </button>
                ))}
              </div>
            </div>
            <div className="fg">
              <label>Descrição do serviço</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4}
                placeholder="Fale sobre seu trabalho, experiência, diferenciais..."
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e8e8e8', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', resize: 'vertical' }} />
            </div>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 18 }}>📍 Cidades de atuação</h2>
            <div className="fg">
              <label>Estado</label>
              <select value={state} onChange={e => setState(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e8e8e8', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', background: '#fff' }}>
                {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>
            <div className="fg">
              <label>Cidades atendidas *</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="text" value={cityInput} onChange={e => setCityInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCity())}
                  placeholder="Digite uma cidade e pressione Enter" style={{ flex: 1 }} />
                <button type="button" onClick={addCity} className="btn-primary" style={{ padding: '0 16px', fontSize: 13, whiteSpace: 'nowrap' }}>Adicionar</button>
              </div>
              {cities.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                  {cities.map(c => (
                    <span key={c} style={{ background: '#f0fdf4', border: '1px solid #a3e635', color: '#166534', padding: '4px 10px', borderRadius: 100, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {c}
                      <button type="button" onClick={() => setCities(cities.filter(x => x !== c))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 18 }}>📞 Contato e redes sociais</h2>
            <div className="fg">
              <label>💬 WhatsApp <span style={{ background: '#fee2e2', color: '#dc2626', fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 100 }}>Obrigatório</span></label>
              <input type="tel" value={whatsapp} onChange={e => setWhatsapp(maskPhone(e.target.value))} placeholder="(41) 99999-9999" maxLength={16} />
            </div>
            <div className="fg"><label>Instagram</label><input type="text" value={instagram} onChange={e => setInstagram(e.target.value)} onBlur={e => setInstagram(cleanInstagram(e.target.value))} placeholder="@seuperfil" /></div>
            <div className="fg"><label>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="contato@email.com" /></div>
            <div className="fg"><label>Site próprio</label><input type="text" value={website} onChange={e => setWebsite(e.target.value)} placeholder="www.seusite.com.br" /></div>
            <div className="fg"><label>Facebook</label><input type="text" value={facebook} onChange={e => setFacebook(e.target.value)} placeholder="facebook.com/seuperfil" /></div>
            <div className="fg"><label>YouTube</label><input type="text" value={youtube} onChange={e => setYoutube(e.target.value)} placeholder="youtube.com/@seucanal" /></div>
            <div className="fg"><label>TikTok</label><input type="text" value={tiktok} onChange={e => setTiktok(e.target.value)} placeholder="@seutiktok" /></div>
            <div className="fg"><label>Portfólio / Behance</label><input type="text" value={portfolioUrl} onChange={e => setPortfolioUrl(e.target.value)} placeholder="behance.net/seuperfil" /></div>
            <div className="fg">
              <label>💰 Faixa de preço (opcional)</label>
              <input type="text" value={priceInfo} onChange={e => setPriceInfo(e.target.value)} placeholder="Ex: A partir de R$ 800 · R$ 500/hora" />
              <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>💡 Use "A partir de R$ X" para facilitar a decisão do cliente</p>
            </div>
          </>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>✨ Diferenciais do seu serviço</h2>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 18 }}>Marque os que se aplicam ao seu trabalho.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {SUPPLIER_ATTRIBUTES.map(a => (
                <button key={a} type="button" onClick={() => toggleArr(attributes, a, setAttributes)}
                  className={`chip-btn ${attributes.includes(a) ? 'on' : ''}`}>
                  {attributes.includes(a) ? '✓ ' : ''}{a}
                </button>
              ))}
            </div>
          </>
        )}

        {/* STEP 5 */}
        {step === 5 && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>📅 Disponibilidade</h3>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20, lineHeight: 1.5 }}>
              Marque os dias da semana em que você está disponível para trabalhar.
            </p>
            <AvailabilityCalendar availableDates={availableDates} onChange={setAvailableDates} />
            <div className="fg" style={{ marginTop: 20 }}>
              <label>Observação sobre disponibilidade (opcional)</label>
              <input type="text" value={availabilityNote} onChange={e => setAvailabilityNote(e.target.value)}
                placeholder="Ex: Disponível apenas fins de semana · Agenda cheia em dezembro" />
            </div>
          </div>
        )}

        {/* STEP 6 */}
        {step === 6 && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>📸 Fotos do portfólio</h2>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 18 }}>Adicione fotos do seu trabalho (até 8).</p>
            {existingUrls.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {existingUrls.map((url, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={url} style={{ width: 100, height: 80, objectFit: 'cover', borderRadius: 8 }} alt="" />
                    <button type="button" onClick={() => setExistingUrls(existingUrls.filter((_, j) => j !== i))}
                      style={{ position: 'absolute', top: -6, right: -6, background: '#dc2626', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                  </div>
                ))}
              </div>
            )}
            <label style={{ display: 'block', border: '2px dashed #d1d5db', borderRadius: 12, padding: 32, textAlign: 'center', cursor: (files.length + existingUrls.length) >= 8 ? 'not-allowed' : 'pointer', background: '#f9fafb', opacity: (files.length + existingUrls.length) >= 8 ? 0.5 : 1 }}>
              <input type="file" multiple accept="image/*,video/*" disabled={(files.length + existingUrls.length) >= 8}
                onChange={e => {
                  const selected = Array.from(e.target.files || [])
                  const available = 8 - existingUrls.length - files.length
                  const dedup = selected.filter(f => !files.some(x => x.name === f.name && x.size === f.size))
                  setFiles(prev => [...prev, ...dedup].slice(0, available))
                }} style={{ display: 'none' }} />
              <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
              <div style={{ fontSize: 14, color: '#6b7280' }}>
                {files.length > 0 ? `${files.length} arquivo(s) selecionado(s)` : 'Clique para adicionar fotos e vídeos do portfólio'}
              </div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Fotos (JPG, PNG) e vídeos (MP4, MOV) · até 50MB cada</div>
            </label>
            {files.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                {files.map((f, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={URL.createObjectURL(f)} style={{ width: 100, height: 80, objectFit: 'cover', borderRadius: 8 }} alt="" />
                    <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))}
                      style={{ position: 'absolute', top: -6, right: -6, background: '#dc2626', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: 12 }}>×</button>
                  </div>
                ))}
              </div>
            )}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ height: 6, background: '#e8e8e8', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: '#a3e635', width: `${uploadProgress}%`, transition: 'width 0.3s' }} />
                </div>
                <p style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Enviando... {uploadProgress}%</p>
              </div>
            )}
          </>
        )}

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginTop: 16 }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28, paddingTop: 20, borderTop: '1px solid #f3f4f6' }}>
          {step > 1
            ? <button onClick={() => setStep(step - 1)} style={{ padding: '10px 20px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600 }}>← Anterior</button>
            : <div />}
          {step < totalSteps
            ? <button onClick={nextStep} className="btn-primary">Próximo →</button>
            : <button onClick={handleSubmit} disabled={loading} className="btn-primary" style={{ opacity: loading ? 0.7 : 1 }}>
                {loading ? `Publicando... ${uploadProgress}%` : '✓ Publicar serviço'}
              </button>}
        </div>
      </div>
    </div>
  )
}
