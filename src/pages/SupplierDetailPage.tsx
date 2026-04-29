import type { Supplier } from '../types'
import { SUPPLIER_CATEGORIES } from '../types'
import type { Page } from '../App'

interface Props {
  supplier: Supplier
  goToPage: (page: Page) => void
}

export default function SupplierDetailPage({ supplier, goToPage }: Props) {
  const cat = SUPPLIER_CATEGORIES.find(c => c.name === supplier.category)

  const handleWhatsApp = () => {
    if (!supplier.whatsapp) return
    const num = supplier.whatsapp.replace(/\D/g, '')
    window.open(`https://wa.me/55${num}?text=Olá! Vi seu perfil no Ewind e gostaria de saber mais sobre seus serviços.`, '_blank')
  }

  const handleInstagram = () => {
    if (!supplier.instagram) return
    const handle = supplier.instagram.replace('@', '')
    window.open(`https://instagram.com/${handle}`, '_blank')
  }

  return (
    <>
      <div className="back-bar">
        <a onClick={() => goToPage('suppliers')}>← Voltar aos fornecedores</a>
      </div>

      <div className="det-layout">
        <div>
          {/* Galeria */}
          <img
            src={supplier.media_urls[0] || 'https://via.placeholder.com/800x400?text=Sem+foto'}
            className="det-main-img"
            alt={supplier.name}
          />
          {supplier.media_urls.length > 1 && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 18, overflowX: 'auto' }}>
              {supplier.media_urls.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt=""
                  style={{ width: 90, height: 65, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
                />
              ))}
            </div>
          )}

          {/* Badge categoria */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
            <span style={{
              background: cat?.bg || '#f0fdf4', fontSize: 13, fontWeight: 700,
              padding: '5px 14px', borderRadius: 20
            }}>
              {cat?.icon} {supplier.category}
            </span>
            {supplier.subcategory && (
              <span style={{ fontSize: 13, color: '#5aa800', fontWeight: 600 }}>
                · {supplier.subcategory}
              </span>
            )}
          </div>

          <h1 className="det-title">{supplier.name}</h1>
          <div className="det-loc">
            📍 {supplier.cities.join(', ')}, {supplier.state}
          </div>

          {/* Stats */}
          <div className="stats-row" style={{ marginTop: 16 }}>
            <div className="stat-item">
              <div className="stat-val">{supplier.cities.length}</div>
              <div className="stat-lab">{supplier.cities.length === 1 ? 'Cidade' : 'Cidades'}</div>
            </div>
            <div className="stat-item">
              <div className="stat-val">{supplier.event_types.length || '—'}</div>
              <div className="stat-lab">Tipos de evento</div>
            </div>
            <div className="stat-item">
              <div className="stat-val" style={{ color: '#5aa800' }}>Ativo</div>
              <div className="stat-lab">Status</div>
            </div>
          </div>

          {/* Descrição */}
          {supplier.description && (
            <div style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Sobre o serviço</h3>
              <p className="det-desc">{supplier.description}</p>
            </div>
          )}

          {/* Tipos de evento */}
          {supplier.event_types.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Tipos de evento atendidos</h3>
              <div className="card-tags">
                {supplier.event_types.map(t => <span key={t} className="tag">{t}</span>)}
              </div>
            </div>
          )}

          {/* Atributos */}
          {supplier.attributes.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Diferenciais</h3>
              <div className="attrs">
                {supplier.attributes.map(a => (
                  <div key={a} className="attr">✓ {a}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar contato */}
        <aside>
          <div className="quote-box">
            {supplier.price_info && (
              <>
                <div className="qb-price" style={{ fontSize: 18 }}>{supplier.price_info}</div>
                <div className="qb-sub">Valor orientativo · sujeito a negociação</div>
              </>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
              {supplier.whatsapp && (
                <button
                  onClick={handleWhatsApp}
                  style={{
                    width: '100%', padding: 13, fontSize: 14, fontWeight: 700,
                    background: '#25d366', border: 'none', borderRadius: 8,
                    color: '#fff', cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                  }}
                >
                  💬 Falar no WhatsApp
                </button>
              )}

              {supplier.instagram && (
                <button
                  onClick={handleInstagram}
                  style={{
                    width: '100%', padding: 13, fontSize: 14, fontWeight: 700,
                    background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)',
                    border: 'none', borderRadius: 8,
                    color: '#fff', cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                  }}
                >
                  📸 Ver Instagram
                </button>
              )}

              {supplier.email && (
                <a
                  href={`mailto:${supplier.email}`}
                  style={{
                    width: '100%', padding: 13, fontSize: 14, fontWeight: 700,
                    background: '#fff', border: '1.5px solid #e8e8e8', borderRadius: 8,
                    color: '#2d2d2d', textDecoration: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                  }}
                >
                  ✉️ Enviar email
                </a>
              )}

              {supplier.website && (
                <a
                  href={supplier.website.startsWith('http') ? supplier.website : `https://${supplier.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: '100%', padding: 13, fontSize: 14, fontWeight: 700,
                    background: '#fff', border: '1.5px solid #e8e8e8', borderRadius: 8,
                    color: '#2d2d2d', textDecoration: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                  }}
                >
                  🌐 Visitar site
                </a>
              )}

              {!supplier.whatsapp && !supplier.instagram && !supplier.email && !supplier.website && (
                <div style={{ textAlign: 'center', padding: 16, fontSize: 13, color: '#6b7280' }}>
                  Nenhum contato disponível
                </div>
              )}
            </div>

            <div className="qb-sec" style={{ marginTop: 16 }}>
              🔒 Contrate com segurança. Verifique referências antes de fechar contrato.
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}
