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
