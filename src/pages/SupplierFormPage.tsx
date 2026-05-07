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
  const onlyInt = (v: string) => v.replace(/[^0-9]/g, '')
  const onlyDecimal = (v: string) => v.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
  const onlyUF = (v: string) => v.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 2)

  // Máscara de telefone
  const maskPhone = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 11)
    if (d.length <= 2) return d
    if (d.length <= 7) return `(${d.slice(0,2)}) ${d.slice(2)}`
    return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`
  }

  // Limpar Instagram — aceita URL completa ou @handle
  const cleanInstagram = (v: string) => {
    const match = v.match(/instagram\.com\/([^/?]+)/)
    if (match) return '@' + match[1]
    return v.startsWith('@') ? v : v ? '@' + v.replace('@', '') : ''
  }

  // Limpar site — adiciona https:// se faltar
  const cleanWebsite = (v: string) => {
    if (!v) return ''
    if (v.startsWith('http')) return v
    return 'https://' + v
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
  const [neighborhood, setNeighborhood] = useState(editingSupplier?.neighborhood || '')
  const [whatsapp, setWhatsapp] = useState(editingSupplier?.whatsapp || '')
  const [instagram, setInstagram] = useState(editingSupplier?.instagram || '')
  const [email, setEmail] = useState(editingSupplier?.email || '')
  const [website, setWebsite] = useState(editingSupplier?.website || '')
  const [facebook, setFacebook] = useState(editingSupplier?.facebook || '')
  const [youtube, setYoutube] = useState(editingSupplier?.youtube || '')
  const [tiktok, setTiktok] = useState(editingSupplier?.tiktok || '')
  const [portfolioUrl, setPortfolioUrl] = useState(editingSupplier?.portfolio_url || '')
  const [priceInfo, setPriceInfo] = useState(editingSupplier?.price_info || '')
  const [eventTypes, setEventTypes] = useState<string[]>(editingSupplier?.event_types || [])
  const [attributes, setAttributes] = useState<string[]>(editingSupplier?.attributes || [])
  const [files, setFiles] = useState<File[]>([])
  const [existingUrls, setExistingUrls] = useState<string[]>(editingSupplier?.media_urls || [])

  const totalSteps = 5

  const toggleArr = (arr: string[], val: string, set: (v: string[]) => void) => {
    set(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])
  }

  const addCity = () => {
    const trimmed = cityInput.trim()
    if (trimmed && !cities.includes(trimmed)) {
      setCities([...cities, trimmed])
      setCityInput('')
    }
  }

  const removeCity = (city: string) => setCities(cities.filter(c => c !== city))

  const validateStep = () => {
    setError('')
    if (step === 1 && (!name || !category)) {
      setError('Preencha o nome e a categoria')
      return false
    }
    if (step === 2 && cities.length === 0) {
      setError('Adicione pelo menos uma cidade de atendimento')
      return false
    }
    if (step === 3 && !whatsapp.trim()) {
      setError('O WhatsApp é obrigatório — é como os clientes vão te contatar via Ewind')
      return false
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
      const newUrls: string[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const ext = file.name.split('.').pop()
        const fileName = `suppliers/${user.id}/${Date.now()}-${i}.${ext}`
        const { error: upErr } = await supabase.storage.from('space-media').upload(fileName, file)
        if (upErr) throw upErr
        const { data: urlData } = supabase.storage.from('space-media').getPublicUrl(fileName)
        newUrls.push(urlData.publicUrl)
        setUploadProgress(((i + 1) / files.length) * 100)
      }

      const data = {
        owner_id: user.id,
        name, description: description || null,
        category, subcategory: subcategory || null,
        cities, state,
        whatsapp: whatsapp || null,
        available_dates: availableDates.length > 0 ? availableDates : null,
        availability_note: availabilityNote || null,
        instagram: instagram || null,
        email: email || null,
        website: website || null,
        price_info: priceInfo || null,
        event_types: eventTypes,
        attributes,
        media_urls: [...existingUrls, ...newUrls],
        status: 'active'
      }

      const result = isEditing && editingSupplier
        ? await supabase.from('suppliers').update(data).eq('id', editingSupplier.id)
        : await supabase.from('suppliers').insert(data)

      if (result.error) throw result.error

      alert(isEditing ? '✅ Serviço atualizado!' : '✅ Serviço cadastrado com sucesso!')
      goToPage('supplier-dashboard')
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar')
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
      <a onClick={() => goToPage('supplier-dashboard')} style={{ color: '#5aa800', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'block', marginBottom: 8 }}>
        ← Voltar ao painel
      </a>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
        {isEditing ? 'Editar serviço' : 'Anunciar meu serviço'}
      </h1>
      <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>Etapa {step} de {totalSteps}</p>

      <div style={{ background: '#e8e8e8', height: 4, borderRadius: 100, marginBottom: 24, overflow: 'hidden' }}>
        <div style={{ background: '#a3e635', height: '100%', width: `${(step / totalSteps) * 100}%`, transition: 'width 0.3s' }} />
      </div>

      <div style={{ background: '#fff', border: '1.5px solid #e8e8e8', borderRadius: 14, padding: 28 }}>

        {/* STEP 1: Info básica */}
        {step === 1 && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 18 }}>📋 Informações básicas</h2>
            <div className="fg">
              <label>Nome profissional / empresa *</label>
              <input type="text" value={name} onChange={e => setName(capitalizeFirst(e.target.value))} placeholder="Ex: João Silva Fotografia" />
            </div>
            <div className="fg">
              <label>Categoria *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
                {SUPPLIER_CATEGORIES.map(c => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setCategory(c.name)}
                    className={`role-btn ${category === c.name ? 'on' : ''}`}
                    style={{ fontSize: 12 }}
                  >
                    {c.icon} {c.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="fg">
              <label>Especialidade (opcional)</label>
              <input type="text" value={subcategory} onChange={e => setSubcategory(e.target.value)} placeholder="Ex: Foto documental, DJ para casamentos..." />
            </div>
            <div className="fg">
              <label>Descrição</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Fale sobre seu trabalho, experiência e diferenciais..."
                rows={4}
                style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e8e8e8', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', resize: 'vertical' }}
              />
            </div>
          </>
        )}

        {/* STEP 2: Localização */}
        {step === 2 && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 18 }}>📍 Onde você atende</h2>
            <div className="fg">
              <label>Cidades de atendimento *</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input
                  type="text"
                  value={cityInput}
                  onChange={e => setCityInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCity()}
                  placeholder="Digite uma cidade e pressione Enter"
                  style={{ flex: 1 }}
                />
                <button type="button" className="btn-primary" onClick={addCity} style={{ whiteSpace: 'nowrap' }}>
                  + Adicionar
                </button>
              </div>
              {cities.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {cities.map(c => (
                    <span key={c} style={{
                      background: '#f0fdf4', border: '1px solid #a3e635',
                      borderRadius: 20, padding: '4px 10px', fontSize: 12,
                      fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6
                    }}>
                      {c}
                      <button onClick={() => removeCity(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', fontSize: 14 }}>×</button>
                    </span>
                  ))}
                </div>
              )}
              <p style={{ fontSize: 11, color: '#6b7280', marginTop: 6 }}>💡 Adicione todas as cidades que você atende</p>
            </div>
            <div className="fg">
              <label>Estado principal</label>
              <input type="text" value={state} onChange={e => setState(onlyUF(e.target.value))} placeholder="PR" maxLength={2} />
            </div>
            <div className="fg">
              <label>Bairro principal de atuação (opcional)</label>
              <input type="text" value={neighborhood} onChange={e => setNeighborhood(e.target.value)} placeholder="Ex: Batel, Centro" />
            </div>
            <div className="fg">
              <label>Tipos de evento que atende</label>
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

        {/* STEP 3: Contato */}
        {step === 3 && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 18 }}>📞 Contato e redes sociais</h2>
            <div className="fg">
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                💬 WhatsApp
                <span style={{ background: '#fee2e2', color: '#dc2626', fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 100, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Obrigatório
                </span>
              </label>
              <input
                type="tel"
                value={whatsapp}
                onChange={e => setWhatsapp(maskPhone(e.target.value))}
                placeholder="(41) 99999-9999"
                maxLength={16}
                style={{ borderColor: !whatsapp ? '#fca5a5' : undefined }}
              />
              {!whatsapp && (
                <p style={{ fontSize: 11, color: '#dc2626', marginTop: 5, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span>⚠️</span>
                  Sem WhatsApp, clientes não conseguem te contatar diretamente via Ewind.
                </p>
              )}
              {whatsapp && (
                <p style={{ fontSize: 11, color: '#16a34a', marginTop: 5 }}>
                  ✓ Clientes interessados vão te chamar neste número com mensagem do Ewind.
                </p>
              )}
            </div>
            <div className="fg">
              <label>Instagram</label>
              <input
                type="text"
                value={instagram}
                onChange={e => setInstagram(e.target.value)}
                onBlur={e => setInstagram(cleanInstagram(e.target.value))}
                placeholder="@seuperfil ou cole o link completo"
              />
            </div>
            <div className="fg">
              <label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="contato@email.com" />
            </div>
            <div className="fg">
              <label>🌐 Site próprio</label>
              <input type="text" value={website} onChange={e => setWebsite(e.target.value)} placeholder="www.seusite.com.br" />
            </div>
            <div className="fg">
              <label>📘 Facebook</label>
              <input type="text" value={facebook} onChange={e => setFacebook(e.target.value)} placeholder="facebook.com/seuperfil" />
            </div>
            <div className="fg">
              <label>🎬 YouTube</label>
              <input type="text" value={youtube} onChange={e => setYoutube(e.target.value)} placeholder="youtube.com/@seucanal" />
            </div>
            <div className="fg">
              <label>🎵 TikTok</label>
              <input type="text" value={tiktok} onChange={e => setTiktok(e.target.value)} placeholder="@seutikok" />
            </div>
            <div className="fg">
              <label>💼 Portfólio / Behance / Website</label>
              <input type="text" value={portfolioUrl} onChange={e => setPortfolioUrl(e.target.value)} placeholder="Ex: behance.net/seuperfil ou portfolio.com" />
            </div>
            <div className="fg">
              <label>💰 Faixa de preço (opcional)</label>
              <input
                type="text"
                value={priceInfo}
                onChange={e => setPriceInfo(e.target.value)}
                onBlur={e => {
                  const v = e.target.value.trim()
                  if (v && !isNaN(Number(v.replace(/[^0-9.,]/g, ''))) && !v.toLowerCase().includes('r$')) {
                    setPriceInfo(`R$ ${v}`)
                  }
                }}
                placeholder="Ex: R$ 800/hora · A partir de R$ 2.500"
              />
              <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
                💡 Dica: use "A partir de R$ 500" ou "R$ 800/hora" para facilitar a decisão do cliente
              </p>
            </div>
          </>
        )}

        {/* STEP 4: Atributos */}
        {step === 4 && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>✨ Diferenciais do seu serviço</h2>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 18 }}>Marque os que se aplicam ao seu trabalho.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {SUPPLIER_ATTRIBUTES.map(a => (
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

        {/* STEP 5: Fotos portfólio */}
        {step === 5 && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>📅 Disponibilidade</h3>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20, lineHeight: 1.5 }}>
              Marque as datas em que você está disponível para trabalhar. Isso evita pedidos de orçamento em datas já ocupadas. Se não marcar nenhuma, qualquer data poderá ser solicitada.
            </p>
            <AvailabilityCalendar
              availableDates={availableDates}
              onChange={setAvailableDates}
            />
            <div className="fg" style={{ marginTop: 20 }}>
              <label>Observação sobre disponibilidade (opcional)</label>
              <input
                type="text"
                value={availabilityNote}
                onChange={e => setAvailabilityNote(e.target.value)}
                placeholder="Ex: Disponível apenas fins de semana · Agenda cheia em dezembro"
              />
            </div>
          </div>
        )}

        {step === 6 && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>📸 Fotos do portfólio</h2>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 18 }}>Adicione fotos do seu trabalho (até 8).</p>

            {existingUrls.length > 0 && (
              <>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Fotos atuais:</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8, marginBottom: 16 }}>
                  {existingUrls.map((url, i) => (
                    <div key={i} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', height: 85 }}>
                      <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        onClick={() => setExistingUrls(existingUrls.filter((_, idx) => idx !== i))}
                        style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', fontSize: 12 }}
                      >×</button>
                    </div>
                  ))}
                </div>
              </>
            )}

            <label style={{ display: 'block', border: '2px dashed #e8e8e8', borderRadius: 12, padding: 32, textAlign: 'center', cursor: 'pointer', background: '#fafafa' }}>
              <input type="file" multiple accept="image/*,video/*" onChange={e => {
                  if (!e.target.files) return
                  const newFiles = Array.from(e.target.files)
                  setFiles(prev => {
                    const all = [...prev, ...newFiles]
                    const unique = all.filter((f, i, arr) => arr.findIndex(x => x.name === f.name && x.size === f.size) === i)
                    return unique.slice(0, 8)
                  })
                  e.target.value = ''
                }} style={{ display: 'none' }} />
              <div style={{ fontSize: 36, marginBottom: 8 }}>📷</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                {files.length > 0 ? `${files.length} arquivo(s) selecionado(s)` : 'Clique para adicionar fotos e vídeos e vídeos do portfólio'}
              </div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Fotos (JPG, PNG) e vídeos (MP4, MOV) · até 50MB cada</div>
            </label>

            {files.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8, marginTop: 12 }}>
                {files.map((f, i) => (
                  <div key={i} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', height: 85 }}>
                    <img src={URL.createObjectURL(f)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                      style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', fontSize: 12 }}
                    >×</button>
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

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, paddingTop: 18, borderTop: '1px solid #e8e8e8' }}>
          {step > 1
            ? <button onClick={() => setStep(step - 1)} style={{ padding: '10px 20px', fontSize: 14, fontWeight: 600, background: '#fff', border: '1.5px solid #e8e8e8', borderRadius: 8, cursor: 'pointer' }}>← Anterior</button>
            : <div />}
          {step < totalSteps
            ? <button onClick={nextStep} className="btn-primary">Próximo →</button>
            : <button onClick={handleSubmit} className="btn-primary" disabled={loading}>{loading ? 'Salvando...' : (isEditing ? '✓ Salvar alterações' : '✓ Publicar serviço')}</button>
          }
        </div>
      </div>
    </div>
  )
}
