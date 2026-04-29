export interface Space {
  id: string
  host_id: string
  name: string
  description: string | null
  category: string
  event_types: string[]
  city: string
  state: string
  address: string | null
  capacity: number
  min_hours: number
  price_per_hour: number | null
  price_per_day: number | null
  attributes: string[]
  media_urls: string[]
  status: 'pending' | 'active' | 'paused' | 'rejected'
  created_at: string
  updated_at: string
}

export interface Quote {
  id: string
  space_id: string
  guest_id: string
  host_id: string
  event_type: string
  event_date: string
  guests_count: number
  duration_hours: number
  message: string | null
  host_response: string | null
  proposed_price: number | null
  status: 'pending' | 'viewed' | 'responded' | 'accepted' | 'rejected' | 'closed'
  created_at: string
  updated_at: string
  responded_at: string | null
  spaces?: Space
}

export const CATEGORIES = [
  { name: 'Chácara', icon: '🌿', bg: '#fff8e1' },
  { name: 'Salão de Eventos', icon: '🏛', bg: '#f0fdf4' },
  { name: 'Restaurante', icon: '🍽', bg: '#fff0f0' },
  { name: 'Pousada', icon: '🏡', bg: '#f0f8ff' },
  { name: 'Espaço Corporativo', icon: '🏢', bg: '#f5f0ff' }
]

export const EVENT_TYPES = [
  'Casamento', 'Corporativo', 'Aniversário', 'Formatura',
  'Debutante', 'Show', 'Festa Infantil', 'Confraternização'
]

export const ATTRIBUTES = [
  'Estacionamento', 'Wi-Fi', 'Buffet/Catering', 'Área externa',
  'Palco', 'Piscina', 'Acessibilidade', 'Ar-condicionado',
  'Som profissional', 'Cozinha equipada', 'Pet friendly'
]

export const QUOTE_STATUS_LABELS: Record<string, { label: string; bg: string; color: string }> = {
  pending: { label: 'Aguardando', bg: '#fff7ed', color: '#c05621' },
  viewed: { label: 'Visualizado', bg: '#eff6ff', color: '#1e40af' },
  responded: { label: 'Respondido', bg: '#f0fdf4', color: '#166534' },
  accepted: { label: 'Aceito', bg: '#d1fae5', color: '#065f46' },
  rejected: { label: 'Recusado', bg: '#fef2f2', color: '#991b1b' },
  closed: { label: 'Fechado', bg: '#f3f4f6', color: '#4b5563' }
}
