import { useState, useCallback } from 'react'

interface Props {
  availableDates: string[]        // datas marcadas como disponíveis (formato YYYY-MM-DD)
  onChange?: (dates: string[]) => void  // modo edição
  selectedDate?: string           // data selecionada pelo cliente
  onSelectDate?: (date: string) => void // modo leitura — cliente seleciona
  readOnly?: boolean
  availabilityNote?: string
}

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const DAYS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

const toKey = (y: number, m: number, d: number) =>
  `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`

const today = new Date()
today.setHours(0,0,0,0)

export default function AvailabilityCalendar({ availableDates, onChange, selectedDate, onSelectDate, readOnly = false, availabilityNote }: Props) {
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const prevMonth = useCallback(() => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }, [viewMonth])

  const nextMonth = useCallback(() => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }, [viewMonth])

  const toggleDate = (key: string) => {
    if (!onChange) return
    const next = availableDates.includes(key)
      ? availableDates.filter(d => d !== key)
      : [...availableDates, key].sort()
    onChange(next)
  }

  // Gerar dias do mês
  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({length: daysInMonth}, (_, i) => i + 1)]

  const hasAvailableDates = availableDates.length > 0
  const noRestriction = !hasAvailableDates

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <button onClick={prevMonth} style={{ background: 'none', border: '1.5px solid #e8e8e8', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>‹</button>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{MONTHS[viewMonth]} {viewYear}</div>
        <button onClick={nextMonth} style={{ background: 'none', border: '1.5px solid #e8e8e8', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>›</button>
      </div>

      {/* Dias da semana */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#9ca3af', padding: '4px 0' }}>{d}</div>
        ))}
      </div>

      {/* Grid de dias */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />
          const key = toKey(viewYear, viewMonth, day)
          const isPast = new Date(viewYear, viewMonth, day) < today
          const isAvailable = availableDates.includes(key)
          const isSelected = selectedDate === key
          const isToday = key === toKey(today.getFullYear(), today.getMonth(), today.getDate())

          // Lógica de cores
          let bg = '#f9fafb'
          let color = '#2d2d2d'
          let border = '1.5px solid #e8e8e8'
          let cursor = 'default'
          let opacity = 1

          if (isPast) {
            bg = '#f9fafb'; color = '#d1d5db'; opacity = 0.5
          } else if (isSelected) {
            bg = '#a3e635'; color = '#1a2e05'; border = '1.5px solid #a3e635'
          } else if (isAvailable) {
            bg = '#f0fdf4'; color = '#166534'; border = '1.5px solid #a3e635'
            cursor = readOnly ? (onSelectDate ? 'pointer' : 'default') : 'pointer'
          } else if (!readOnly) {
            cursor = 'pointer'
          } else if (hasAvailableDates) {
            // Data não disponível no modo leitura
            bg = '#f9fafb'; color = '#d1d5db'
          } else {
            // Sem restrição — todas disponíveis
            cursor = onSelectDate ? 'pointer' : 'default'
            if (onSelectDate && !isPast) bg = '#f9fafb'
          }

          const isClickable = !isPast && (
            !readOnly ||
            (onSelectDate && (isAvailable || noRestriction))
          )

          return (
            <div
              key={key}
              onClick={() => {
                if (isPast) return
                if (!readOnly && onChange) { toggleDate(key); return }
                if (readOnly && onSelectDate && (isAvailable || noRestriction)) onSelectDate(key)
              }}
              style={{
                textAlign: 'center', padding: '7px 0', borderRadius: 8,
                fontSize: 13, fontWeight: isAvailable || isSelected ? 700 : 400,
                background: bg, color, border, cursor: isClickable ? 'pointer' : 'default',
                opacity, transition: 'all .15s',
                outline: isToday && !isSelected ? '2px solid #a3e635' : 'none',
                outlineOffset: '-2px'
              }}
            >
              {day}
            </div>
          )
        })}
      </div>

      {/* Legenda */}
      <div style={{ display: 'flex', gap: 14, marginTop: 12, flexWrap: 'wrap' }}>
        {!readOnly && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#6b7280' }}>
            <div style={{ width: 14, height: 14, borderRadius: 4, background: '#f0fdf4', border: '1.5px solid #a3e635' }} />
            Disponível
          </div>
        )}
        {readOnly && hasAvailableDates && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#6b7280' }}>
              <div style={{ width: 14, height: 14, borderRadius: 4, background: '#f0fdf4', border: '1.5px solid #a3e635' }} />
              Disponível
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#6b7280' }}>
              <div style={{ width: 14, height: 14, borderRadius: 4, background: '#f9fafb', border: '1.5px solid #e8e8e8' }} />
              Indisponível
            </div>
          </>
        )}
        {readOnly && noRestriction && (
          <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 600 }}>✓ Consulte a disponibilidade enviando um orçamento</div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#6b7280' }}>
          <div style={{ width: 14, height: 14, borderRadius: 4, background: '#a3e635', border: '1.5px solid #a3e635' }} />
          Selecionado
        </div>
      </div>

      {/* Nota do anunciante */}
      {readOnly && availabilityNote && (
        <div style={{ marginTop: 12, padding: '10px 14px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, fontSize: 12, color: '#92400e', lineHeight: 1.5 }}>
          📌 <strong>Observação:</strong> {availabilityNote}
        </div>
      )}

      {/* Resumo em modo edição */}
      {!readOnly && (
        <div style={{ marginTop: 12, fontSize: 12, color: '#6b7280' }}>
          {availableDates.length === 0
            ? '⚠️ Nenhuma data marcada — clientes poderão solicitar qualquer data'
            : `✓ ${availableDates.length} data${availableDates.length > 1 ? 's' : ''} disponível${availableDates.length > 1 ? 'is' : ''} marcada${availableDates.length > 1 ? 's' : ''}`
          }
        </div>
      )}
    </div>
  )
}
