import type { User } from '@supabase/supabase-js'
import type { Space } from '../types'
import type { Page } from '../App'

interface Props {
  space: Space
  user: User | null
  goToPage: (page: Page) => void
}

export default function DetailPage({ space, user, goToPage }: Props) {
  return (
    <>
      <div className="back-bar">
        <a onClick={() => goToPage('listing')}>← Voltar à listagem</a>
      </div>
      <div className="det-layout">
        <div>
          <img
            src={space.media_urls[0] || 'https://via.placeholder.com/800x450?text=Sem+foto'}
            className="det-main-img"
            alt={space.name}
          />
          {space.media_urls.length > 1 && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 18, overflowX: 'auto' }}>
              {space.media_urls.map((url, i) => (
                <img key={i} src={url} alt="" style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8 }} />
              ))}
            </div>
          )}
          <div className="card-tags" style={{ marginBottom: 10 }}>
            {space.event_types.map(t => <span key={t} className="tag">{t}</span>)}
          </div>
          <h1 className="det-title">{space.name}</h1>
          <div className="det-loc">📍 {space.city}, {space.state} · {space.category}</div>
          <div className="stats-row">
            <div className="stat-item">
              <div className="stat-val">{space.capacity}</div>
              <div className="stat-lab">Capacidade</div>
            </div>
            <div className="stat-item">
              <div className="stat-val">{space.min_hours}h</div>
              <div className="stat-lab">Mínimo</div>
            </div>
            <div className="stat-item">
              <div className="stat-val" style={{ color: '#5aa800' }}>Ativo</div>
              <div className="stat-lab">Status</div>
            </div>
          </div>
          {space.description && (
            <p className="det-desc" style={{ marginTop: 16 }}>
              {space.description}
            </p>
          )}
          {space.attributes.length > 0 && (
            <>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, marginTop: 20 }}>O que o local oferece</h3>
              <div className="attrs">
                {space.attributes.map(a => (
                  <div key={a} className="attr">✓ {a}</div>
                ))}
              </div>
            </>
          )}
        </div>
        <aside>
          <div className="quote-box">
            <div className="qb-price">
              {space.price_per_hour ? `R$ ${space.price_per_hour}/hora` : `R$ ${space.price_per_day}/dia`}
            </div>
            <div className="qb-sub">Preço orientativo · sujeito a negociação</div>
            <button
              className="btn-primary"
              style={{ width: '100%', padding: 13 }}
              onClick={() => !user && goToPage('login')}
            >
              {user ? 'Solicitar orçamento' : 'Entre para solicitar'}
            </button>
            <div className="qb-sec">🔒 Seus dados são protegidos.</div>
          </div>
        </aside>
      </div>
    </>
  )
}
