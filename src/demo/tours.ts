import type { Page } from '../types'

// One step of a guided tour. Before the step is shown, the engine (Tour.tsx) runs the
// preparation fields in this order: login, go, click. Then it waits for `target`
// and highlights it; a step without target is shown as a centered card.
export interface TourStep {
  title: string
  body: string
  target?: string        // CSS selector of the element to highlight
  login?: boolean        // sign in with the demo account first
  go?: Page              // navigate to this page first
  click?: string | string[]  // click these elements first, in order (a tab, a card...)
  skipClickIf?: string       // ...skipping the last click if this element is already on screen
}

export interface Tour {
  id: string
  title: string
  description: string
  steps: TourStep[]
}

const T = (name: string) => `[data-tour="${name}"]`
const WEDDING = '[data-tour="event-card"][data-event-name^="Casamento"]'

export const TOURS: Tour[] = [
  {
    id: 'organizer',
    title: 'Organizar um evento',
    description: 'O gestor de eventos, aba por aba: contratos, parcelas, convidados, checklist, orçamentos, mesas e agenda.',
    steps: [
      {
        title: 'Bem-vindo ao gestor de eventos',
        body: 'Você vai ver o painel da Ana, uma organizadora fictícia que está planejando o próprio casamento. Para isso, vou entrar na conta de demonstração. Pode clicar e testar tudo depois: os dados voltam ao original toda noite.',
      },
      {
        login: true, go: 'events', target: `${T('nav-events')}, ${T('nav-menu')}`,
        title: 'Meus eventos',
        body: 'O ponto de partida de quem organiza (no celular, fica no menu ☰). Aqui ficam todos os eventos da conta, cada um com o seu painel.',
      },
      {
        go: 'events', target: T('events-new'),
        title: '+ Novo evento',
        body: 'Cria um evento com nome, tipo (casamento, aniversário, corporativo...), data, número de convidados e orçamento total.',
      },
      {
        go: 'events', target: T('events-agenda'),
        title: 'Agenda',
        body: 'Junta num só calendário as datas de todos os eventos, os serviços contratados, as parcelas a pagar e os lembretes.',
      },
      {
        go: 'events', target: WEDDING,
        title: 'Cartão do evento',
        body: 'Cada evento mostra data, tipo e quantos dias faltam. Vamos abrir o casamento da Ana.',
      },
      {
        click: WEDDING, skipClickIf: T('tab-overview'), target: T('tab-overview'),
        title: 'As abas do evento',
        body: 'Tudo do evento fica em seis abas: visão geral (contratos e dinheiro), convidados, checklist, orçamentos, mesas e agenda.',
      },
      {
        click: T('tab-overview'), target: T('event-summary'),
        title: 'Resumo financeiro',
        body: 'Total contratado, quanto já foi pago, quanto falta pagar e quanto do orçamento já está comprometido. Os números se atualizam a cada parcela marcada como paga.',
      },
      {
        click: T('tab-overview'), target: T('event-overdue'),
        title: 'Alerta de atraso',
        body: 'Parcelas vencidas e não pagas aparecem em vermelho no topo, com o valor total em atraso. Logo abaixo vem o próximo vencimento.',
      },
      {
        click: T('tab-overview'), target: T('contract-add'),
        title: '+ Adicionar contrato',
        body: 'Cadastra um fornecedor com valor, datas, contato e cláusulas. Dá para anexar o PDF do contrato, que fica num armazenamento privado e só abre por link temporário. (A leitura automática do PDF por IA fica desligada nesta demonstração.)',
      },
      {
        click: [T('tab-overview'), T('contract-header')], skipClickIf: T('contract-payments'), target: T('contract-card'),
        title: 'Contrato aberto',
        body: 'Clicar num contrato abre os detalhes: contato, botões de editar e excluir, cláusulas de atenção e a lista de parcelas.',
      },
      {
        click: [T('tab-overview'), T('contract-header')], skipClickIf: T('contract-payments'), target: T('contract-risk'),
        title: 'Cláusulas de atenção',
        body: 'Multa, política de cancelamento e cláusulas especiais ficam destacadas, para não serem esquecidas na hora de mudar de ideia.',
      },
      {
        click: [T('tab-overview'), T('contract-header')], skipClickIf: T('contract-payments'), target: T('contract-payments'),
        title: 'Parcelas',
        body: 'Cada parcela tem valor e vencimento. A caixinha marca como paga (e registra a data), o lápis edita e a lixeira exclui. Logo abaixo, "+ Adicionar parcela".',
      },
      {
        click: T('tab-guests'), target: T('guests-stats'),
        title: 'Convidados',
        body: 'Contadores de total, confirmados, recusados e pendentes, além da divisão entre adultos, crianças e bebês.',
      },
      {
        click: T('tab-guests'), target: T('guests-cost'),
        title: 'Custo por convidado',
        body: 'Informe o valor por pessoa do buffet e o Ewind estima o custo só com os confirmados: meia-entrada conta 50% e isentos não contam.',
      },
      {
        click: T('tab-guests'), target: T('guests-template'),
        title: 'Baixar modelo',
        body: 'Baixa uma planilha .xlsx pronta, com exemplos e uma aba de instruções, para montar a lista no Excel ou no Google Planilhas.',
      },
      {
        click: T('tab-guests'), target: T('guests-import'),
        title: 'Importar Excel',
        body: 'Importa a lista inteira de uma vez. Colunas em branco recebem padrões: bebê vira isento, criança vira meia, status vazio fica pendente.',
      },
      {
        click: T('tab-guests'), target: T('guests-add'),
        title: '+ Adicionar convidado',
        body: 'Para incluir uma pessoa só, com categoria, regra de cobrança, telefone e email.',
      },
      {
        click: T('tab-guests'), target: T('guests-filters'),
        title: 'Filtros',
        body: 'Mostra só confirmados, pendentes ou recusados. Na lista, cada convidado tem botões para mudar o status com um clique.',
      },
      {
        click: T('tab-checklist'), target: T('checklist-add'),
        title: 'Checklist',
        body: '"+ Nova tarefa" cria uma tarefa com responsável e prazo. O prazo pode ser uma data fixa ou "X dias antes do evento", que se ajusta sozinho se a data mudar.',
      },
      {
        click: T('tab-checklist'), target: T('checklist-suggest'),
        title: 'Sugerir tarefas de casamento',
        body: 'Para casamentos, cria de uma vez uma lista de 22 tarefas com prazos típicos, de "definir orçamento" a "montar o kit do dia".',
      },
      {
        click: T('tab-checklist'), target: T('checklist-group'),
        title: 'Tarefas por prazo',
        body: 'As tarefas ficam agrupadas por marco. A caixinha conclui, e tarefas vencidas aparecem em vermelho.',
      },
      {
        click: T('tab-comparison'), target: T('comp-tab'),
        title: 'Comparar orçamentos',
        body: 'Cada comparação reúne as cotações de uma categoria (bolo, filmagem, espaço...). Os botões no topo alternam entre elas, e "+ Nova comparação" cria outra.',
      },
      {
        click: T('tab-comparison'), target: T('comp-table'),
        title: 'Lado a lado',
        body: 'Preço, capacidade, contato e o que cada fornecedor inclui, com o menor preço destacado. "+ Adicionar cotação" inclui mais uma opção.',
      },
      {
        click: T('tab-comparison'), target: T('comp-choose'),
        title: 'Escolher',
        body: 'Marca a opção escolhida, para a decisão ficar registrada junto com as alternativas.',
      },
      {
        click: T('tab-tables'), target: T('tables-unassigned'),
        title: 'Mapa de mesas',
        body: 'Os confirmados ainda sem lugar ficam aqui. No computador, arraste o nome até uma mesa; no celular, toque no convidado e depois na mesa.',
      },
      {
        click: T('tab-tables'), target: T('tables-grid'),
        title: 'Mesas',
        body: 'Cada mesa mostra os lugares ocupados e a capacidade. "+ Nova mesa" cria outra, e o ✕ ao lado de um nome devolve a pessoa para os não alocados.',
      },
      {
        click: T('tab-agenda'), target: T('agenda-title'),
        title: 'Agenda do evento',
        body: 'Um calendário só com os marcos deste evento: a data, os serviços, as parcelas e os lembretes. Clicar num dia permite criar lembrete, marcar parcela como paga ou remarcar um serviço.',
      },
      {
        go: 'guest-dashboard', click: T('guest-tab-orcamentos'), target: T('guest-quotes'),
        title: 'Meus orçamentos',
        body: 'Os pedidos feitos a espaços do marketplace, com a resposta e o valor proposto pelo anunciante. Este painel também tem os dados da conta, feedback, suporte e os direitos da LGPD.',
      },
      {
        title: 'Fim do tour',
        body: 'Agora é com você: crie um evento, importe convidados ou monte as mesas. Para ver o marketplace de espaços e fornecedores, abra o outro tutorial no botão "Tutorial", no topo.',
      },
    ],
  },
  {
    id: 'marketplace',
    title: 'Encontrar espaços e fornecedores',
    description: 'O marketplace: filtros, comparação de espaços, página do espaço e pedido de orçamento.',
    steps: [
      {
        go: 'listing', target: T('nav-listing'),
        title: 'Espaços',
        body: 'Salões, chácaras, restaurantes e espaços corporativos anunciados por quem os administra. (Nesta demonstração, todos são fictícios.)',
      },
      {
        go: 'listing', target: T('listing-filters'),
        title: 'Filtros',
        body: 'Filtra por estado e cidade, tipo de espaço, tipo de evento, capacidade, faixa de preço e estrutura (estacionamento, piscina, pista de dança...).',
      },
      {
        go: 'listing', target: T('space-card'),
        title: 'Cartão do espaço',
        body: 'Foto, localização, tipo, preço por hora ou por dia e capacidade.',
      },
      {
        go: 'listing', target: T('space-compare'),
        title: 'Comparar',
        body: 'Adiciona até 3 espaços a uma comparação. Uma barra aparece no rodapé com o botão "Ver comparação", que mostra preço, capacidade e estrutura lado a lado.',
      },
      {
        click: T('space-open'), skipClickIf: T('detail-title'), target: T('detail-title'),
        title: 'Página do espaço',
        body: 'Galeria de fotos e vídeos, descrição, estrutura, tipos de evento aceitos, avaliações e calendário de disponibilidade.',
      },
      {
        target: T('detail-location'),
        title: 'Localização protegida',
        body: 'O mapa mostra só a região. O endereço exato fica guardado à parte e só aparece para o anunciante e para quem já pediu orçamento.',
      },
      {
        target: T('detail-quote'),
        title: 'Solicitar orçamento',
        body: 'Abre um formulário com tipo de evento, data, horário, número de convidados e mensagem. O anunciante responde pelo painel dele, e a resposta aparece em "Meus orçamentos".',
      },
      {
        go: 'suppliers', target: T('suppliers-filters'),
        title: 'Fornecedores',
        body: 'Fotógrafos, buffets, DJs, decoração, confeitaria... com filtros por cidade, categoria e tipo de evento.',
      },
      {
        go: 'suppliers', target: T('supplier-card'),
        title: 'Cartão do fornecedor',
        body: 'Abre a página do fornecedor, com portfólio, faixa de preço, cidades atendidas, contatos e pedido de orçamento.',
      },
      {
        title: 'Fim do tour',
        body: 'Explore à vontade. Se quiser ver o lado de quem organiza, abra o tutorial "Organizar um evento" no botão "Tutorial", no topo.',
      },
    ],
  },
]
