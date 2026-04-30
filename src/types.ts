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
  whatsapp: string | null
  instagram: string | null
  facebook: string | null
  website: string | null
  cardapio_url: string | null
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
  { name: 'Espaço Corporativo', icon: '🏢', bg: '#f5f0ff' },
  { name: 'Hotel', icon: '🏨', bg: '#fdf4ff' },
  { name: 'Buffet Infantil', icon: '🎈', bg: '#fff1f9' }
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

export interface Supplier {
  id: string
  owner_id: string
  name: string
  description: string | null
  category: string
  subcategory: string | null
  cities: string[]
  state: string
  whatsapp: string | null
  instagram: string | null
  email: string | null
  website: string | null
  price_info: string | null
  media_urls: string[]
  attributes: string[]
  event_types: string[]
  facebook: string | null
  youtube: string | null
  tiktok: string | null
  portfolio_url: string | null
  status: 'active' | 'paused' | 'pending'
  created_at: string
  updated_at: string
}

export const SUPPLIER_CATEGORIES = [
  { name: 'Fotografia', icon: '📸', bg: '#fff8e1' },
  { name: 'Filmagem / Video Maker', icon: '🎬', bg: '#f0f8ff' },
  { name: 'Cerimonialista', icon: '💍', bg: '#fdf4ff' },
  { name: 'Maquiagem', icon: '💄', bg: '#fff1f9' },
  { name: 'Cabelo', icon: '💇', bg: '#f0fdf4' },
  { name: 'Bar & Coquetéis', icon: '🍹', bg: '#fff7ed' },
  { name: 'Buffet / Catering', icon: '🍽', bg: '#fff0f0' },
  { name: 'Decoração', icon: '🌸', bg: '#fdf4ff' },
  { name: 'Música / DJ', icon: '🎵', bg: '#f0fdf4' },
  { name: 'Iluminação', icon: '💡', bg: '#fffbeb' },
  { name: 'Bolo & Confeitaria', icon: '🎂', bg: '#fff1f9' },
  { name: 'Segurança', icon: '🔒', bg: '#f1f5f9' },
  { name: 'Convites & Papelaria', icon: '📋', bg: '#fef9c3' },
  { name: 'Lembranças & Bem-casados', icon: '🎁', bg: '#f0fdf4' },
  { name: 'Entretenimento', icon: '🎪', bg: '#fdf4ff' }
]

export const SUPPLIER_ATTRIBUTES = [
  'Viaja para outros estados',
  'Atende fins de semana',
  'Atende feriados',
  'Aceita pacotes',
  'Trabalha com assistente',
  'Entrega álbum físico',
  'Emite nota fiscal',
  'Possui equipamento backup',
  'Faz degustação',
  'Atende eventos corporativos',
  'Bilíngue (inglês)',
  'Acessibilidade'
]
