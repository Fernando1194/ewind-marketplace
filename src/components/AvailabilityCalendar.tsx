// Seletor de dias da semana disponíveis

interface Props {
  availableDates: string[]         // armazena dias: ['monday','friday','saturday']
  onChange?: (days: string[]) => void
  readOnly?: boolean
  availabilityNote?: string
}

const DAYS = [
  { key: 'monday',    label: 'Segunda' },
  { key: 'tuesday',   label: 'Terça' },
  { key: 'wednesday', label: 'Quarta' },
  { key: 'thursday',  label: 'Quinta' },
  { key: 'friday',    label: 'Sexta' },
  { key: 'saturday',  label: 'Sábado' },
  { key: 'sunday',    label: 'Domingo' },
]

export default function AvailabilityCalendar({ availableDates, onChange, readOnly = false, availabilityNote }: Props) {
  const toggle = (key: string) => {
    if (!onChange) return
    const next = availableDates.includes(key)
      ? availableDates.filter(d => d !== key)
      : [...availableDates, key]
    onChange(next)
  }

  const selectedAll = DAYS.every(d => availableDates.includes(d.key))

  const toggleAll = () => {
    if (!onChange) return
    onChange(selectedAll ? [] : DAYS.map(d => d.key))
  }

  return (
    <div>
      {!readOnly && (
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16, lineHeight: 1.5 }}>
          Selecione os dias da semana em que você está disponível para receber eventos.
          Clientes só poderão solicitar orçamentos nesses dias.
        </p>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {DAYS.map(day => {
          const selected = availableDates.includes(day.key)
          return (
            <button
              key={day.key}
              type="button"
              onClick={() => !readOnly && toggle(day.key)}
              style={{
                padding: '10px 18px',
                borderRadius: 10,
                border: `2px solid ${selected ? '#a3e635' : '#e8e8e8'}`,
                background: selected ? '#f0fdf4' : '#f9fafb',
                color: selected ? '#166534' : '#9ca3af',
                fontWeight: selected ? 700 : 400,
                fontSize: 13,
                cursor: readOnly ? 'default' : 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
            >
              {selected && !readOnly && <span style={{ marginRight: 4 }}>✓</span>}
              {readOnly && selected && <span style={{ marginRight: 4 }}>✓</span>}
              {day.label}
            </button>
          )
        })}
      </div>

      {!readOnly && (
        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button type="button" onClick={toggleAll}
            style={{ fontSize: 12, color: '#5aa800', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, padding: 0 }}>
            {selectedAll ? 'Desmarcar todos' : 'Marcar todos os dias'}
          </button>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>
            {availableDates.length === 0
              ? '⚠️ Nenhum dia selecionado — clientes podem solicitar qualquer dia'
              : `✓ ${availableDates.length} dia${availableDates.length > 1 ? 's' : ''} selecionado${availableDates.length > 1 ? 's' : ''}`}
          </span>
        </div>
      )}

      {readOnly && availableDates.length > 0 && (
        <div style={{ marginTop: 10, fontSize: 12, color: '#6b7280' }}>
          Disponível: {DAYS.filter(d => availableDates.includes(d.key)).map(d => d.label).join(', ')}
        </div>
      )}
      {readOnly && availableDates.length === 0 && (
        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>
          Consulte a disponibilidade enviando um orçamento
        </div>
      )}

      {readOnly && availabilityNote && (
        <div style={{ marginTop: 12, padding: '10px 14px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, fontSize: 12, color: '#92400e', lineHeight: 1.5 }}>
          📌 <strong>Observação:</strong> {availabilityNote}
        </div>
      )}
    </div>
  )
}
