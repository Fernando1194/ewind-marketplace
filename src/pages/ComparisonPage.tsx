import { memo } from 'react'
import type { Space } from '../types'
import type { Page } from '../App'
import { useCopy } from '../i18n'
import { useLabel } from '../i18n/labels'

const COPY = {
  pt: {
    title: 'Comparar espaços', selected: (n: number) => `${n} de 3 espaços selecionados`, back: '← Voltar à listagem', none: 'Nenhum espaço selecionado',
    noneP: 'Volte à listagem e clique em "+ Comparar" nos espaços que deseja comparar.', explore: 'Explorar espaços', noPhoto: 'Sem+foto', details: 'Ver detalhes',
    space: 'Espaço', add: 'Volte à listagem para adicionar', general: '📋 Informações gerais', category: 'Categoria', city: 'Cidade', eventTypes: 'Tipos de evento',
    capTime: '👥 Capacidade e tempo', maxCap: 'Capacidade máxima', people: 'pessoas', minHours: 'Mínimo de horas', prices: '💰 Preços orientativos', perHour: 'Preço por hora', perDay: 'Preço por dia',
    attrs: '✨ Atributos e comodidades', request: 'Solicitar orçamento', locale: 'pt-BR',
  },
  en: {
    title: 'Compare venues', selected: (n: number) => `${n} of 3 venues selected`, back: '← Back to listings', none: 'No venue selected',
    noneP: 'Go back to the listings and click "+ Compare" on the venues you want to compare.', explore: 'Explore venues', noPhoto: 'No+photo', details: 'View details',
    space: 'Venue', add: 'Go back to the listings to add one', general: '📋 General information', category: 'Category', city: 'City', eventTypes: 'Event types',
    capTime: '👥 Capacity and time', maxCap: 'Maximum capacity', people: 'people', minHours: 'Minimum hours', prices: '💰 Indicative prices', perHour: 'Price per hour', perDay: 'Price per day',
    attrs: '✨ Features and amenities', request: 'Request a quote', locale: 'en-US',
  },
}

interface Props {
  spaces: Space[]
  goToPage: (page: Page, space?: Space) => void
  onRemove: (id: string) => void
}

const Row = memo(({ label, values }: { label: string; values: (string | number | boolean | null)[] }) => (
  <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
    <td style={{
      padding: '12px 16px', fontSize: 13, fontWeight: 600,
      color: '#6b7280', background: '#f9fafb', whiteSpace: 'nowrap',
      borderRight: '1px solid #e8e8e8', minWidth: 160
    }}>
      {label}
    </td>
    {values.map((v, i) => (
      <td key={i} style={{
        padding: '12px 16px', fontSize: 14, textAlign: 'center',
        color: v ? '#2d2d2d' : '#d1d5db', fontWeight: v ? 500 : 400
      }}>
        {v === true ? '✅' : v === false ? '—' : v || '—'}
      </td>
    ))}
    {/* Colunas vazias se menos de 3 espaços */}
    {Array.from({ length: 3 - values.length }).map((_, i) => (
      <td key={`empty-${i}`} style={{ padding: '12px 16px', textAlign: 'center', color: '#e5e7eb' }}>—</td>
    ))}
  </tr>
))

export default function ComparisonPage({ spaces, goToPage, onRemove }: Props) {
  const k = useCopy(COPY)
  const lab = useLabel()
  const hasAttr = (space: Space, attr: string) => space.attributes.includes(attr)

  const allAttrs = Array.from(
    new Set(spaces.flatMap(s => s.attributes))
  ).sort()

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>{k.title}</h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>
            {k.selected(spaces.length)}
          </p>
        </div>
        <button
          onClick={() => goToPage('listing')}
          style={{
            padding: '10px 20px', fontSize: 14, fontWeight: 600,
            background: '#fff', border: '1.5px solid #e8e8e8',
            borderRadius: 8, cursor: 'pointer', color: '#2d2d2d'
          }}
        >
          {k.back}
        </button>
      </div>

      {spaces.length === 0 && (
        <div style={{ textAlign: 'center', padding: 80, background: '#f9fafb', borderRadius: 16 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{k.none}</h3>
          <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>
            {k.noneP}
          </p>
          <button className="btn-primary" onClick={() => goToPage('listing')}>
            {k.explore}
          </button>
        </div>
      )}

      {spaces.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #e8e8e8', borderRadius: 14, overflow: 'hidden' }}>
            {/* Fotos e nome dos espaços */}
            <thead>
              <tr style={{ background: '#fff' }}>
                <th style={{
                  padding: '16px', background: '#f9fafb',
                  borderRight: '1px solid #e8e8e8', minWidth: 160
                }} />
                {spaces.map(s => (
                  <th key={s.id} style={{ padding: '16px', textAlign: 'center', borderRight: '1px solid #f3f4f6', minWidth: 220 }}>
                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={() => onRemove(s.id)}
                        style={{
                          position: 'absolute', top: -8, right: -8,
                          background: '#ef4444', color: '#fff', border: 'none',
                          borderRadius: '50%', width: 22, height: 22,
                          cursor: 'pointer', fontSize: 12, fontWeight: 700,
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                      >×</button>
                      <img
                        src={s.media_urls[0] || 'https://via.placeholder.com/200x120?text=' + k.noPhoto}
                        alt={s.name}
                        style={{ width: '100%', height: 130, objectFit: 'cover', borderRadius: 10, marginBottom: 10 }}
                      />
                      <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>{s.name}</div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 10 }}>
                        📍 {s.city}, {s.state}
                      </div>
                      <button
                        className="btn-primary"
                        style={{ fontSize: 12, padding: '7px 14px' }}
                        onClick={() => goToPage('detail', s)}
                      >
                        {k.details}
                      </button>
                    </div>
                  </th>
                ))}
                {/* Colunas vazias */}
                {Array.from({ length: 3 - spaces.length }).map((_, i) => (
                  <th key={`empty-${i}`} style={{ padding: '16px', minWidth: 220, borderRight: '1px solid #f3f4f6' }}>
                    <div style={{
                      height: 130, borderRadius: 10, border: '2px dashed #e8e8e8',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: 10, color: '#d1d5db', fontSize: 13
                    }}>
                      + {k.space} {spaces.length + i + 1}
                    </div>
                    <div style={{ fontSize: 12, color: '#d1d5db' }}>
                      {k.add}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {/* SEÇÃO: INFORMAÇÕES GERAIS */}
              <tr style={{ background: '#f0fdf4' }}>
                <td colSpan={4} style={{ padding: '8px 16px', fontSize: 11, fontWeight: 800, color: '#5aa800', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {k.general}
                </td>
              </tr>

              <Row
                label={k.category}
                values={spaces.map(s => lab(s.category))}
              />
              <Row
                label={k.city}
                values={spaces.map(s => `${s.city}, ${s.state}`)}
              />
              <Row
                label={k.eventTypes}
                values={spaces.map(s => s.event_types.map(lab).join(', '))}
              />

              {/* SEÇÃO: CAPACIDADE */}
              <tr style={{ background: '#f0fdf4' }}>
                <td colSpan={4} style={{ padding: '8px 16px', fontSize: 11, fontWeight: 800, color: '#5aa800', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {k.capTime}
                </td>
              </tr>

              <Row
                label={k.maxCap}
                values={spaces.map(s => `${s.capacity} ${k.people}`)}
              />
              <Row
                label={k.minHours}
                values={spaces.map(s => `${s.min_hours}h`)}
              />

              {/* SEÇÃO: PREÇOS */}
              <tr style={{ background: '#f0fdf4' }}>
                <td colSpan={4} style={{ padding: '8px 16px', fontSize: 11, fontWeight: 800, color: '#5aa800', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {k.prices}
                </td>
              </tr>

              <Row
                label={k.perHour}
                values={spaces.map(s => s.price_per_hour ? `R$ ${s.price_per_hour.toLocaleString('pt-BR')}` : null)}
              />
              <Row
                label={k.perDay}
                values={spaces.map(s => s.price_per_day ? `R$ ${s.price_per_day.toLocaleString('pt-BR')}` : null)}
              />

              {/* SEÇÃO: ATRIBUTOS */}
              {allAttrs.length > 0 && (
                <>
                  <tr style={{ background: '#f0fdf4' }}>
                    <td colSpan={4} style={{ padding: '8px 16px', fontSize: 11, fontWeight: 800, color: '#5aa800', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {k.attrs}
                    </td>
                  </tr>
                  {allAttrs.map(attr => (
                    <Row
                      key={attr}
                      label={lab(attr)}
                      values={spaces.map(s => hasAttr(s, attr) ? true : false)}
                    />
                  ))}
                </>
              )}

              {/* SEÇÃO: AÇÃO */}
              <tr style={{ background: '#fff' }}>
                <td style={{ padding: '16px', background: '#f9fafb', borderRight: '1px solid #e8e8e8' }} />
                {spaces.map(s => (
                  <td key={s.id} style={{ padding: '16px', textAlign: 'center', borderRight: '1px solid #f3f4f6' }}>
                    <button
                      className="btn-primary"
                      style={{ width: '100%', padding: 12, fontSize: 14 }}
                      onClick={() => goToPage('detail', s)}
                    >
                      {k.request}
                    </button>
                  </td>
                ))}
                {Array.from({ length: 3 - spaces.length }).map((_, i) => (
                  <td key={`empty-btn-${i}`} style={{ padding: '16px' }} />
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
