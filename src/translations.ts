export type Lang = 'pt' | 'en'

const pt = {
  // NAV
  nav_home: 'Início', nav_how: 'Como funciona', nav_spaces: 'Espaços', nav_suppliers: 'Fornecedores',
  nav_pricing: 'Planos', nav_about: 'Quem somos', nav_login: 'Entrar', nav_signup: 'Criar conta',
  nav_logout: 'Sair', nav_hi: 'Olá,', nav_panel: 'Meu painel', nav_admin: 'Admin',
  nav_my_quotes: 'Meus orçamentos',

  // HOME
  hero_badge: 'O marketplace de eventos do Brasil',
  hero_title_1: 'Tudo para o seu evento', hero_title_2: 'em um só lugar',
  hero_sub: 'Espaços, fotógrafos, DJs, decoradores e muito mais. Compare opções, solicite orçamentos e feche direto com o anunciante — de graça e sem complicação.',
  hero_where: 'Onde', hero_where_ph: 'Cidade ou região', hero_date: 'Data do evento',
  hero_guests: 'Convidados', hero_guests_ph: 'Quantidade', hero_search: 'Buscar',
  cat_title: 'Explore por categoria', spaces_title: 'Espaços em destaque',
  suppliers_title: 'Fornecedores em destaque', see_all: 'Ver todos →',
  feat1_title: 'Tudo em um só lugar', feat1_desc: 'Espaços, chácaras, fotógrafos, DJs e decoradores — tudo aqui',
  feat2_title: 'Orçamento em minutos', feat2_desc: 'Preencha os dados do evento e receba propostas diretamente do anunciante',
  feat3_title: 'Grátis para quem busca', feat3_desc: 'Quem está organizando um evento não paga nada. Zero.',
  feat4_title: 'Resposta rápida', feat4_desc: 'Os melhores anunciantes respondem em até 24h — alguns em minutos',
  cta_host_title: 'Você tem um espaço ou oferece serviços para eventos?',
  cta_host_desc: 'Cadastre grátis, apareça para quem está buscando agora e receba orçamentos direto no WhatsApp. Sem mensalidade pelos primeiros 90 dias.',
  cta_host_btn: 'Cadastrar meu espaço gratuitamente',
  no_spaces_yet: 'Seja um dos primeiros a anunciar!', no_suppliers_yet: 'Seja um dos primeiros fornecedores!',

  // LISTING / SPACES
  listing_title: 'Espaços para eventos', listing_found: 'espaço(s) encontrado(s)',
  listing_filters: 'Filtros', listing_clear: 'Limpar filtros', listing_city: 'Cidade',
  listing_state: 'Estado', listing_date: 'Data do evento', listing_category: 'Categoria',
  listing_event_type: 'Tipo de evento', listing_capacity_min: 'Capacidade mínima',
  listing_capacity_max: 'Capacidade máxima', listing_price_min: 'Preço mínimo (R$)',
  listing_price_max: 'Preço máximo (R$)', listing_active_filters: 'filtro(s) ativo(s)',
  listing_no_results: 'Nenhum espaço encontrado', listing_no_results_sub: 'Tente ajustar os filtros ou buscar em outra cidade.',
  listing_page: 'página', listing_of: 'de', listing_announce: '+ Anunciar meu espaço',
  listing_per_hour: '/h', listing_per_day: '/dia', listing_guests_up_to: 'até',

  // SUPPLIERS
  suppliers_title_page: 'Fornecedores de eventos', suppliers_found: 'fornecedor(es) encontrado(s)',
  suppliers_announce: '+ Anunciar serviço',

  // DETAIL PAGE
  detail_back_spaces: '← Voltar aos espaços', detail_capacity: 'pessoas', detail_min_hours: 'h mínimo',
  detail_event_types: 'Tipos de evento', detail_attributes: 'Atributos', detail_links: 'Links',
  detail_quote_title: 'Solicitar orçamento', detail_event_type: 'Tipo de evento *',
  detail_date: 'Data *', detail_time: 'Horário', detail_guests: 'Nº de convidados *',
  detail_duration: 'Duração (horas) *', detail_message: 'Mensagem (opcional)',
  detail_message_ph: 'Conte mais sobre seu evento, dúvidas, necessidades...',
  detail_send: 'Solicitar orçamento', detail_sending: 'Enviando...',
  detail_sent_title: '🎉 Orçamento enviado!', detail_sent_sub: 'O anunciante receberá sua solicitação e retornará em breve.',
  detail_notify_whatsapp: 'Notificar também pelo WhatsApp', detail_whatsapp_speed: 'Acelera a resposta em até 3x',
  detail_see_quotes: 'Ver meus orçamentos →', detail_price_label: 'Preços a partir de',
  detail_price_sub: 'Solicite um orçamento para o valor exato', detail_whatsapp: '💬 Falar no WhatsApp',
  detail_instagram: 'Instagram', detail_login_to_quote: 'Entrar para solicitar orçamento',
  detail_no_contact: 'Nenhum contato disponível', detail_security: '🔒 Contrate com segurança. Verifique referências antes de fechar contrato.',
  detail_compare: 'Comparar', detail_remove_compare: 'Remover da comparação',

  // REVIEWS
  reviews_title: 'Avaliações', reviews_write: '✍️ Deixar avaliação',
  reviews_placeholder: 'Como foi a experiência? O espaço/serviço correspondeu ao anunciado?',
  reviews_min_chars: 'caracteres mínimos', reviews_publish: 'Publicar avaliação',
  reviews_published: '✅ Avaliação publicada!', reviews_none: 'Ainda não há avaliações. Seja o primeiro!',
  reviews_verified: 'Cliente verificado pelo Ewind', reviews_already: 'Você já avaliou este anúncio.',

  // AVAILABILITY
  availability_title: '📅 Disponibilidade',
  availability_select_days: 'Selecione os dias da semana em que você está disponível.',
  availability_note: 'Observação sobre disponibilidade (opcional)',
  availability_none: 'Nenhum dia selecionado — clientes podem solicitar qualquer dia',
  availability_days_selected: 'dia(s) selecionado(s)',
  availability_available: 'Disponível', availability_unavailable: 'Indisponível',
  availability_selected: 'Selecionado', availability_consult: 'Consulte a disponibilidade enviando um orçamento',
  availability_note_label: '📌 Observação:',
  days_monday: 'Segunda', days_tuesday: 'Terça', days_wednesday: 'Quarta',
  days_thursday: 'Quinta', days_friday: 'Sexta', days_saturday: 'Sábado', days_sunday: 'Domingo',
  days_select_all: 'Marcar todos os dias', days_deselect_all: 'Desmarcar todos',

  // QUOTE STATUS
  status_pending: 'Aguardando', status_viewed: 'Visto', status_responded: 'Respondido',
  status_accepted: 'Aceito', status_closed: 'Fechado', status_rejected: 'Recusado',

  // MY QUOTES
  my_quotes_title: 'Meus orçamentos', my_quotes_sub: 'Acompanhe os orçamentos que você solicitou',
  my_quotes_search: '+ Buscar espaços', my_quotes_none: 'Nenhum orçamento ainda',
  my_quotes_none_sub: 'Busque espaços ou fornecedores e solicite orçamentos gratuitos.',
  my_quotes_search_btn: 'Buscar espaços →', my_quotes_supplier_badge: 'Fornecedor',
  my_quotes_proposed: 'Valor proposto', my_quotes_accept: 'Aceitar orçamento',
  my_quotes_close: 'Fechar negócio', my_quotes_review: '✍️ Avaliar', my_quotes_whatsapp: '💬 WhatsApp',

  // HOST QUOTES
  host_quotes_title: 'Orçamentos de espaços', host_quotes_supplier_title: 'Orçamentos de serviços',
  host_quotes_total: 'Total', host_quotes_pending: 'Pendentes', host_quotes_responded: 'Respondidos',
  host_quotes_respond: 'Responder', host_quotes_propose_price: 'Proposta de preço (R$)',
  host_quotes_message: 'Mensagem para o cliente *', host_quotes_reject: 'Recusar',
  host_quotes_accept: 'Aceitar', host_quotes_close: 'Fechar negócio', host_quotes_send: 'Enviar resposta',
  host_quotes_event: 'Evento', host_quotes_guests: 'convidados', host_quotes_duration: 'horas',
  host_quotes_none: 'Nenhum orçamento recebido ainda',
  host_quotes_none_sub: 'Quando clientes solicitarem orçamentos, eles aparecerão aqui.',

  // PRICING
  pricing_monthly: 'Mensal', pricing_annual: 'Anual', pricing_save: 'economize',
  pricing_trial: '90 dias grátis para novos anunciantes', pricing_per_month: '/mês',
  pricing_cta_spaces: 'Começar com Espaços', pricing_cta_pro: 'Começar com Pro',
  pricing_cta_supplier: 'Começar com Fornecedor', pricing_why_pro: 'Por que o Pro vale a pena?',
  pricing_early_title: 'Seja um Early Adopter', pricing_notify_btn: 'Avisar quando abrir →',
  pricing_faq_title: 'Perguntas frequentes',

  // HOW IT WORKS
  how_title: 'Como funciona o Ewind', how_sub: 'Em 3 passos simples, seu evento começa a tomar forma',

  // ABOUT
  about_title_1: 'Mais visibilidade para quem anuncia.', about_title_2: 'Mais facilidade',
  about_title_3: 'para quem organiza eventos',

  // LOGIN
  login_title: 'Entrar na sua conta', login_email: 'Email', login_password: 'Senha',
  login_btn: 'Entrar', login_no_account: 'Não tem conta?', login_forgot: 'Esqueci a senha',
  login_google: 'Entrar com Google', login_supplier: 'É fornecedor?',

  // SIGNUP
  signup_title: 'Criar conta', signup_name: 'Nome completo', signup_email: 'Email',
  signup_password: 'Senha', signup_confirm: 'Confirmar senha', signup_btn: 'Criar conta',
  signup_have_account: 'Já tem conta?', signup_login: 'Entrar', signup_type: 'O que você quer fazer?',
  signup_guest: '🎉 Busco espaços', signup_host: '🏢 Tenho espaços', signup_supplier_opt: '🛠️ Sou fornecedor',
  signup_terms: 'Ao criar uma conta você concorda com nossos', signup_terms_link: 'Termos de Uso',

  // DASHBOARD COMMON
  dash_my_data: 'Meus dados', dash_support: 'Suporte', dash_chat: 'Chat Ewind',
  dash_full_name: 'Nome completo', dash_email: 'Email', dash_whatsapp: 'WhatsApp',
  dash_save: 'Salvar', dash_saving: 'Salvando...', dash_saved: '✓ Dados salvos!',
  dash_sac_title: 'Central de suporte', dash_sac_subject: 'Assunto', dash_sac_message: 'Mensagem',
  dash_sac_send: '📨 Enviar mensagem', dash_sac_sent: 'Mensagem enviada!',
  dash_sac_sent_sub: 'Responderemos em até 24h no email cadastrado.',
  dash_sac_another: 'Enviar outra mensagem', dash_chat_placeholder: 'Escreva sua dúvida...',
  dash_chat_send: 'Enviar',

  // HOST DASHBOARD
  host_dash_spaces: 'Meus espaços', host_dash_quotes: '📋 Ver orçamentos',
  host_dash_new: '+ Novo espaço', host_dash_sub: 'Gerencie seus anúncios de espaços para eventos',
  host_dash_total: 'Total', host_dash_active: 'Ativos', host_dash_pending: 'Em revisão',
  host_dash_paused: 'Pausados', host_dash_edit: 'Editar', host_dash_pause: '⏸ Pausar',
  host_dash_activate: '▶ Ativar', host_dash_delete: '🗑 Excluir', host_dash_confirm_delete: 'Confirmar exclusão?',
  host_dash_none: 'Você ainda não tem espaços cadastrados.',

  // SUPPLIER DASHBOARD
  supp_dash_services: 'Meus serviços', supp_dash_quotes: '📋 Ver orçamentos',
  supp_dash_new: '+ Novo serviço', supp_dash_sub: 'Gerencie seus anúncios de serviços',

  // GENERAL
  back: 'Voltar', save: 'Salvar', cancel: 'Cancelar', send: 'Enviar',
  loading: 'Carregando...', error: 'Erro', success: 'Sucesso', confirm: 'Confirmar',
  yes: 'Sim', no: 'Não', optional: 'opcional', required: 'obrigatório',
  from_price: 'Preços a partir de', consult_price: 'Consulte o valor',
  see_profile: 'Ver perfil →', contact_whatsapp: '💬 WhatsApp',
  select_placeholder: 'Selecione...', city_enter: 'Enter para adicionar',
  photos_label: '📸 Fotos do portfólio', photos_sub: 'Adicione fotos do seu trabalho (até 8).',
  videos_label: 'Fotos e vídeos', videos_sub: 'Mostre seu espaço com fotos e vídeos (até 8).',
  publish: '✓ Publicar', publishing: 'Publicando...', next: 'Próximo →', prev: '← Anterior',
  step: 'Etapa', of: 'de',
}

const en: typeof pt = {
  // NAV
  nav_home: 'Home', nav_how: 'How it works', nav_spaces: 'Venues', nav_suppliers: 'Suppliers',
  nav_pricing: 'Plans', nav_about: 'About', nav_login: 'Sign in', nav_signup: 'Create account',
  nav_logout: 'Sign out', nav_hi: 'Hi,', nav_panel: 'My dashboard', nav_admin: 'Admin',
  nav_my_quotes: 'My quotes',

  // HOME
  hero_badge: "Brazil's event marketplace",
  hero_title_1: 'Everything for your event', hero_title_2: 'in one place',
  hero_sub: 'Venues, photographers, DJs, decorators and more. Compare options, request quotes and close directly with the advertiser — free and hassle-free.',
  hero_where: 'Where', hero_where_ph: 'City or region', hero_date: 'Event date',
  hero_guests: 'Guests', hero_guests_ph: 'Number of guests', hero_search: 'Search',
  cat_title: 'Explore by category', spaces_title: 'Featured venues',
  suppliers_title: 'Featured suppliers', see_all: 'See all →',
  feat1_title: 'All in one place', feat1_desc: 'Venues, ranches, photographers, DJs and decorators — all here',
  feat2_title: 'Quotes in minutes', feat2_desc: 'Fill in your event details and receive proposals directly from the advertiser',
  feat3_title: 'Free for seekers', feat3_desc: 'Those organizing an event pay nothing. Zero.',
  feat4_title: 'Fast response', feat4_desc: 'Top advertisers respond within 24h — some within minutes',
  cta_host_title: 'Do you have a venue or offer event services?',
  cta_host_desc: 'List for free, get found by people searching now and receive quotes via WhatsApp. No fee for the first 90 days.',
  cta_host_btn: 'List my venue for free',
  no_spaces_yet: 'Be one of the first to list!', no_suppliers_yet: 'Be one of the first suppliers!',

  // LISTING
  listing_title: 'Event venues', listing_found: 'venue(s) found',
  listing_filters: 'Filters', listing_clear: 'Clear filters', listing_city: 'City',
  listing_state: 'State', listing_date: 'Event date', listing_category: 'Category',
  listing_event_type: 'Event type', listing_capacity_min: 'Min capacity',
  listing_capacity_max: 'Max capacity', listing_price_min: 'Min price (R$)',
  listing_price_max: 'Max price (R$)', listing_active_filters: 'active filter(s)',
  listing_no_results: 'No venues found', listing_no_results_sub: 'Try adjusting the filters or searching in another city.',
  listing_page: 'page', listing_of: 'of', listing_announce: '+ List my venue',
  listing_per_hour: '/h', listing_per_day: '/day', listing_guests_up_to: 'up to',

  // SUPPLIERS
  suppliers_title_page: 'Event suppliers', suppliers_found: 'supplier(s) found',
  suppliers_announce: '+ List service',

  // DETAIL
  detail_back_spaces: '← Back to venues', detail_capacity: 'people', detail_min_hours: 'h minimum',
  detail_event_types: 'Event types', detail_attributes: 'Attributes', detail_links: 'Links',
  detail_quote_title: 'Request a quote', detail_event_type: 'Event type *',
  detail_date: 'Date *', detail_time: 'Time', detail_guests: 'Number of guests *',
  detail_duration: 'Duration (hours) *', detail_message: 'Message (optional)',
  detail_message_ph: 'Tell us more about your event, questions, needs...',
  detail_send: 'Request quote', detail_sending: 'Sending...',
  detail_sent_title: '🎉 Quote sent!', detail_sent_sub: 'The advertiser will receive your request and get back to you soon.',
  detail_notify_whatsapp: 'Also notify via WhatsApp', detail_whatsapp_speed: 'Speeds up response by up to 3x',
  detail_see_quotes: 'See my quotes →', detail_price_label: 'Prices starting from',
  detail_price_sub: 'Request a quote for the exact price', detail_whatsapp: '💬 Chat on WhatsApp',
  detail_instagram: 'Instagram', detail_login_to_quote: 'Sign in to request a quote',
  detail_no_contact: 'No contact available', detail_security: '🔒 Hire safely. Check references before closing a deal.',
  detail_compare: 'Compare', detail_remove_compare: 'Remove from comparison',

  // REVIEWS
  reviews_title: 'Reviews', reviews_write: '✍️ Write a review',
  reviews_placeholder: 'How was the experience? Did it match the listing?',
  reviews_min_chars: 'minimum characters', reviews_publish: 'Publish review',
  reviews_published: '✅ Review published!', reviews_none: 'No reviews yet. Be the first!',
  reviews_verified: 'Verified Ewind client', reviews_already: 'You already reviewed this listing.',

  // AVAILABILITY
  availability_title: '📅 Availability',
  availability_select_days: 'Select the days of the week you are available.',
  availability_note: 'Availability note (optional)',
  availability_none: 'No days selected — clients can request any day',
  availability_days_selected: 'day(s) selected',
  availability_available: 'Available', availability_unavailable: 'Unavailable',
  availability_selected: 'Selected', availability_consult: 'Ask about availability by sending a quote',
  availability_note_label: '📌 Note:',
  days_monday: 'Monday', days_tuesday: 'Tuesday', days_wednesday: 'Wednesday',
  days_thursday: 'Thursday', days_friday: 'Friday', days_saturday: 'Saturday', days_sunday: 'Sunday',
  days_select_all: 'Select all days', days_deselect_all: 'Deselect all',

  // STATUS
  status_pending: 'Pending', status_viewed: 'Viewed', status_responded: 'Responded',
  status_accepted: 'Accepted', status_closed: 'Closed', status_rejected: 'Rejected',

  // MY QUOTES
  my_quotes_title: 'My quotes', my_quotes_sub: 'Track quotes you have requested',
  my_quotes_search: '+ Find venues', my_quotes_none: 'No quotes yet',
  my_quotes_none_sub: 'Find venues or suppliers and request free quotes.',
  my_quotes_search_btn: 'Find venues →', my_quotes_supplier_badge: 'Supplier',
  my_quotes_proposed: 'Proposed value', my_quotes_accept: 'Accept quote',
  my_quotes_close: 'Close deal', my_quotes_review: '✍️ Review', my_quotes_whatsapp: '💬 WhatsApp',

  // HOST QUOTES
  host_quotes_title: 'Venue quotes', host_quotes_supplier_title: 'Service quotes',
  host_quotes_total: 'Total', host_quotes_pending: 'Pending', host_quotes_responded: 'Responded',
  host_quotes_respond: 'Respond', host_quotes_propose_price: 'Price proposal (R$)',
  host_quotes_message: 'Message to client *', host_quotes_reject: 'Reject',
  host_quotes_accept: 'Accept', host_quotes_close: 'Close deal', host_quotes_send: 'Send response',
  host_quotes_event: 'Event', host_quotes_guests: 'guests', host_quotes_duration: 'hours',
  host_quotes_none: 'No quotes received yet',
  host_quotes_none_sub: 'When clients request quotes, they will appear here.',

  // PRICING
  pricing_monthly: 'Monthly', pricing_annual: 'Annual', pricing_save: 'save',
  pricing_trial: '90 days free for new advertisers', pricing_per_month: '/mo',
  pricing_cta_spaces: 'Get started with Venues', pricing_cta_pro: 'Get started with Pro',
  pricing_cta_supplier: 'Get started with Supplier', pricing_why_pro: 'Why Pro is worth it',
  pricing_early_title: 'Be an Early Adopter', pricing_notify_btn: 'Notify me when it opens →',
  pricing_faq_title: 'Frequently asked questions',

  // HOW IT WORKS
  how_title: 'How Ewind works', how_sub: 'In 3 simple steps, your event starts to come together',

  // ABOUT
  about_title_1: 'More visibility for advertisers.', about_title_2: 'More convenience',
  about_title_3: 'for event organizers',

  // LOGIN
  login_title: 'Sign in to your account', login_email: 'Email', login_password: 'Password',
  login_btn: 'Sign in', login_no_account: "Don't have an account?", login_forgot: 'Forgot password',
  login_google: 'Sign in with Google', login_supplier: 'Are you a supplier?',

  // SIGNUP
  signup_title: 'Create account', signup_name: 'Full name', signup_email: 'Email',
  signup_password: 'Password', signup_confirm: 'Confirm password', signup_btn: 'Create account',
  signup_have_account: 'Already have an account?', signup_login: 'Sign in', signup_type: 'What do you want to do?',
  signup_guest: '🎉 Looking for venues', signup_host: '🏢 I have a venue', signup_supplier_opt: '🛠️ I am a supplier',
  signup_terms: 'By creating an account you agree to our', signup_terms_link: 'Terms of Use',

  // DASHBOARD
  dash_my_data: 'My profile', dash_support: 'Support', dash_chat: 'Ewind Chat',
  dash_full_name: 'Full name', dash_email: 'Email', dash_whatsapp: 'WhatsApp',
  dash_save: 'Save', dash_saving: 'Saving...', dash_saved: '✓ Saved!',
  dash_sac_title: 'Support center', dash_sac_subject: 'Subject', dash_sac_message: 'Message',
  dash_sac_send: '📨 Send message', dash_sac_sent: 'Message sent!',
  dash_sac_sent_sub: 'We will respond within 24h to your registered email.',
  dash_sac_another: 'Send another message', dash_chat_placeholder: 'Write your question...',
  dash_chat_send: 'Send',
  host_dash_spaces: 'My venues', host_dash_quotes: '📋 View quotes',
  host_dash_new: '+ New venue', host_dash_sub: 'Manage your event venue listings',
  host_dash_total: 'Total', host_dash_active: 'Active', host_dash_pending: 'Under review',
  host_dash_paused: 'Paused', host_dash_edit: 'Edit', host_dash_pause: '⏸ Pause',
  host_dash_activate: '▶ Activate', host_dash_delete: '🗑 Delete', host_dash_confirm_delete: 'Confirm deletion?',
  host_dash_none: 'You have no venues listed yet.',
  supp_dash_services: 'My services', supp_dash_quotes: '📋 View quotes',
  supp_dash_new: '+ New service', supp_dash_sub: 'Manage your service listings',

  // GENERAL
  back: 'Back', save: 'Save', cancel: 'Cancel', send: 'Send',
  loading: 'Loading...', error: 'Error', success: 'Success', confirm: 'Confirm',
  yes: 'Yes', no: 'No', optional: 'optional', required: 'required',
  from_price: 'Prices starting from', consult_price: 'Consult price',
  see_profile: 'View profile →', contact_whatsapp: '💬 WhatsApp',
  select_placeholder: 'Select...', city_enter: 'Press Enter to add',
  photos_label: '📸 Portfolio photos', photos_sub: 'Add photos of your work (up to 8).',
  videos_label: 'Photos and videos', videos_sub: 'Show your venue with photos and videos (up to 8).',
  publish: '✓ Publish', publishing: 'Publishing...', next: 'Next →', prev: '← Back',
  step: 'Step', of: 'of',
}

export const t: Record<Lang, typeof pt> = { pt, en }
export type TKey = keyof typeof pt
