import { useLang } from './index'

// Os valores guardados no banco (categorias, tipos de evento, atributos) ficam em português.
// Aqui só se traduz o que aparece na tela; filtros e gravação continuam usando o valor original.
export const LABELS_EN: Record<string, string> = {
  // categorias de espaço
  'Chácara': 'Farm / Country venue', 'Salão de Eventos': 'Event hall', 'Restaurante': 'Restaurant', 'Pousada': 'Inn',
  'Espaço Corporativo': 'Corporate space', 'Hotel': 'Hotel', 'Buffet Infantil': "Kids' party venue",
  // tipos de evento
  'Casamento': 'Wedding', 'Corporativo': 'Corporate', 'Aniversário': 'Birthday', 'Formatura': 'Graduation',
  'Debutante': 'Sweet fifteen', 'Show': 'Concert', 'Festa Infantil': "Kids' party", 'Confraternização': 'Get-together',
  // atributos de espaço
  'Estacionamento': 'Parking', 'Wi-Fi': 'Wi-Fi', 'Ar-condicionado': 'Air conditioning', 'Gerador de energia': 'Backup generator',
  'Tomadas 220V': '220V outlets', 'Iluminação profissional': 'Professional lighting', 'Área externa': 'Outdoor area', 'Piscina': 'Pool',
  'Lago / Lagoa': 'Lake / Pond', 'Churrasqueira': 'Barbecue area', 'Pista de dança': 'Dance floor', 'Palco': 'Stage', 'Área VIP': 'VIP area',
  'Salão de jogos': 'Game room', 'Campo de futebol': 'Soccer field', 'Quadra poliesportiva': 'Multi-sport court', 'Buffet/Catering': 'Catering',
  'Cozinha industrial': 'Industrial kitchen', 'Cozinha equipada': 'Equipped kitchen', 'Som profissional': 'Professional sound system',
  'Tenda inclusa': 'Tent included', 'Quarto para noivos': 'Bridal suite', 'Camarim': 'Dressing room', 'Vestiários': 'Locker rooms',
  'Banheiro acessível': 'Accessible restroom', 'Pet friendly': 'Pet friendly', 'Acessibilidade': 'Accessibility',
  // categorias de fornecedor
  'Fotografia': 'Photography', 'Filmagem / Video Maker': 'Videography', 'Cerimonialista': 'Event planner / MC', 'Maquiagem': 'Makeup', 'Cabelo': 'Hair',
  'Bar & Coquetéis': 'Bar & Cocktails', 'Buffet / Catering': 'Catering', 'Decoração': 'Decoration', 'Música / DJ': 'Music / DJ', 'Iluminação': 'Lighting',
  'Bolo & Confeitaria': 'Cakes & Pastry', 'Segurança': 'Security', 'Convites & Papelaria': 'Invitations & Stationery', 'Lembranças & Bem-casados': 'Favors & Keepsakes',
  'Entretenimento': 'Entertainment',
  // atributos de fornecedor
  'Viaja para outros estados': 'Travels to other states', 'Atende fins de semana': 'Works weekends', 'Atende feriados': 'Works holidays', 'Aceita pacotes': 'Accepts packages',
  'Trabalha com assistente': 'Works with an assistant', 'Entrega álbum físico': 'Delivers a printed album', 'Emite nota fiscal': 'Issues invoices',
  'Possui equipamento backup': 'Has backup equipment', 'Faz degustação': 'Offers tastings', 'Atende eventos corporativos': 'Serves corporate events', 'Bilíngue (inglês)': 'Bilingual (English)',
}

/** Rótulo de um valor do banco no idioma atual; valores desconhecidos (texto livre) ficam como estão. */
export function useLabel(): (value: string) => string {
  const { lang } = useLang()
  return (value: string) => (lang === 'en' ? LABELS_EN[value] ?? value : value)
}
