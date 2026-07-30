# Ewind

Ferramenta gratuita para organizar eventos do início ao fim: contratos, pagamentos, prazos, convidados, mapa de mesas e comparação de orçamentos, tudo em um só lugar.

**Produção:** [ewind.com.br](https://ewind.com.br)

---

## Visão do produto

O Ewind é dividido em duas fases:

- **Fase 1 (atual):** SaaS gratuito de gestão de eventos para organizadores (B2C). É o foco de hoje e o que já está no ar.
- **Fase 2 (em construção):** marketplace de espaços e fornecedores (B2B), onde anunciantes poderão divulgar seus serviços e gerenciar os próprios contratos na mesma plataforma.

A estratégia entra pela demanda (organizadores usando a ferramenta grátis) para depois ativar a oferta (marketplace), evitando o problema de cold-start de um marketplace vazio.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + TypeScript + Vite 5 |
| Estilo | CSS puro (sem framework de UI) |
| Roteamento | `useState` + History API (sem react-router, para manter o bundle enxuto) |
| Backend | Supabase (PostgreSQL + Auth + Storage) |
| Funções serverless | Vercel Functions (`/api`) |
| IA | API Anthropic (extração de contrato, em standby) |
| Hospedagem | Vercel (deploy automático no push da branch `main`) |
| Idioma | PT-BR |

---

## Funcionalidades (Fase 1, em produção)

O núcleo é o **gestor de eventos**, com um painel de seis abas por evento:

- **Visão geral** — resumo financeiro, contratos por fornecedor com cláusulas de risco destacadas, parcelas de pagamento com controle de pago/pendente/atrasado.
- **Linha do tempo** — visualização horizontal cronológica dos marcos (pagamentos, datas de serviço, dia do evento).
- **Convidados** — categorias (adulto/criança/bebê), regra de cobrança (inteira/meia/isento), importação de Excel com template, contadores e estimativa de custo.
- **Checklist** — tarefas com prazos regressivos calculados a partir da data do evento; template de casamento sugerido.
- **Orçamentos** — comparador lado a lado de cotações (espaços, fornecedores) com destaque do menor preço.
- **Mapa de mesas** — criação de mesas com capacidade variável e alocação de convidados confirmados via drag-and-drop (desktop) ou toque (mobile).

Recursos transversais: contratos com anexo de PDF (bucket privado, URLs assinadas), extração de dados de contrato por IA (em standby por decisão de custo), e feedback centralizado de erros com confirmação por modal.

---

## Estrutura do projeto

```
src/
  pages/         Páginas (rotas), incluindo o gestor de eventos e as páginas públicas
  components/    Componentes reutilizáveis e as abas do painel de evento
  lib/           Utilitários (ex.: extração de texto de PDF)
  App.tsx        Roteamento e navegação
api/
  extract-contract.ts   Função serverless de extração de contrato por IA
```

Tabelas principais no Supabase: `events`, `event_contracts`, `contract_payments`, `event_guests`, `event_tasks`, `event_comparisons`, `comparison_options`, `event_tables`. Todas com Row Level Security por `owner_id` (cada usuário só acessa os próprios dados).

---

## Rodando localmente

Requisitos: Node.js 18+ e uma conta Supabase.

```bash
npm install

# variáveis de ambiente necessárias
# VITE_SUPABASE_URL
# VITE_SUPABASE_ANON_KEY

npm run dev      # ambiente de desenvolvimento
npm run build    # build de produção
npm run preview  # preview do build
```

A função de extração por IA requer `ANTHROPIC_API_KEY` configurada no ambiente da Vercel.

---

## Deploy

O deploy é automático: cada push na branch `main` dispara um build na Vercel. As migrações de banco (SQL) são aplicadas manualmente no SQL Editor do Supabase.

---

## Status

Plataforma no ar e em ajuste contínuo. A Fase 1 (gestão de eventos) está funcional; a Fase 2 (marketplace) está em construção.
