# CLAUDE.md — Ewind Marketplace

Guia de contexto e regras para desenvolvimento do projeto Ewind com assistência de IA.

---

## 🏗️ Visão Geral do Projeto

**Ewind** é um marketplace brasileiro de espaços para eventos (chácaras, salões, restaurantes, pousadas, espaços corporativos). Conecta quem busca espaços (guests) com quem os oferece (hosts) e futuramente fornecedores de serviços.

### URLs de Produção
- **Site**: https://ewind-marketplace.vercel.app/
- **Repositório**: https://github.com/Fernando1194/ewind-marketplace
- **Supabase**: https://fvkaseflkmzzyxdmswkr.supabase.co

### Owner
- **Nome**: Fernando Vieira
- **GitHub**: Fernando1194
- **Localização**: Curitiba, PR

---

## 🛠️ Stack Técnica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + TypeScript + Vite 5 |
| Backend | Supabase (PostgreSQL + Auth + Storage) |
| Hospedagem | Vercel (auto-deploy via GitHub main) |
| Estilo | CSS puro com variáveis CSS |
| Roteamento | State machine via `useState<Page>` (sem react-router) |
| Lazy loading | `React.lazy` + `Suspense` por página |

### Dependências principais
```json
{
  "react": "^18",
  "react-dom": "^18",
  "@supabase/supabase-js": "latest",
  "vite": "^5",
  "typescript": "latest"
}
```

> ⚠️ **NÃO instalar** react-router, redux, zustand, tailwind, shadcn, MUI ou qualquer lib de UI. O projeto usa CSS puro intencional.

---

## 📁 Estrutura de Arquivos

```
ewind/
├── src/
│   ├── App.tsx              ← Roteamento, auth, estado global de comparação
│   ├── App.css              ← TODOS os estilos (CSS puro, variáveis CSS)
│   ├── main.tsx             ← Entry point
│   ├── index.css            ← Reset global
│   ├── supabase.ts          ← Client Supabase
│   ├── types.ts             ← Interfaces + constantes
│   └── pages/
│       ├── HomePage.tsx         ← Hero, categorias, espaços em destaque
│       ├── ListingPage.tsx      ← Listagem com filtros + botão comparar
│       ├── DetailPage.tsx       ← Detalhe + formulário de orçamento
│       ├── LoginPage.tsx        ← Auth login
│       ├── SignupPage.tsx       ← Auth cadastro (guest ou host)
│       ├── HostDashboard.tsx    ← Painel do host (stats + cards)
│       ├── SpaceFormPage.tsx    ← Formulário multi-step (criar e editar)
│       ├── MyQuotesPage.tsx     ← Orçamentos enviados (guest)
│       ├── HostQuotesPage.tsx   ← Orçamentos recebidos (host)
│       ├── HowItWorksPage.tsx   ← Página explicativa com tabs + FAQ
│       ├── ComparisonPage.tsx
│       └── AboutPage.tsx       ← Quem somos + missão   ← Comparação de espaços lado a lado
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tsconfig.node.json
```

---

## 🗄️ Banco de Dados (Supabase)

### Tabela `public.profiles`
```sql
id        UUID PK (referencia auth.users)
full_name TEXT
email     TEXT
role      TEXT ('guest' | 'host')
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```
Criada automaticamente via trigger `handle_new_user` ao cadastrar.

### Tabela `public.spaces`
```sql
id             UUID PK
host_id        UUID FK auth.users
name           TEXT NOT NULL
description    TEXT
category       TEXT ('Chácara' | 'Salão de Eventos' | 'Restaurante' | 'Pousada' | 'Espaço Corporativo')
event_types    TEXT[]
city           TEXT NOT NULL
state          TEXT DEFAULT 'PR'
address        TEXT
capacity       INTEGER NOT NULL
min_hours      INTEGER DEFAULT 3
price_per_hour DECIMAL(10,2)
price_per_day  DECIMAL(10,2)
attributes     TEXT[]
media_urls     TEXT[]
status         TEXT ('pending' | 'active' | 'paused' | 'rejected') DEFAULT 'active'
created_at     TIMESTAMPTZ
updated_at     TIMESTAMPTZ
```

### Tabela `public.quotes`
```sql
id             UUID PK
space_id       UUID FK spaces
guest_id       UUID FK auth.users
host_id        UUID FK auth.users
event_type     TEXT NOT NULL
event_date     DATE NOT NULL
guests_count   INTEGER NOT NULL
duration_hours INTEGER DEFAULT 4
message        TEXT
host_response  TEXT
proposed_price DECIMAL(10,2)
status         TEXT ('pending'|'viewed'|'responded'|'accepted'|'rejected'|'closed')
created_at     TIMESTAMPTZ
updated_at     TIMESTAMPTZ
responded_at   TIMESTAMPTZ
```

### Storage
- **Bucket**: `space-media` (público)
- **Estrutura de path**: `{user_id}/{timestamp}-{index}.ext`
- **Tamanho máximo**: 50MB por arquivo
- **Tipos aceitos**: `image/*`

### Variáveis de Ambiente (Vercel)
```
VITE_SUPABASE_URL=https://fvkaseflkmzzyxdmswkr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```
> ⚠️ A URL **não deve** ter barra final nem `/rest/v1/` no final.

---

## 🎨 Design System

### CSS Variables
```css
--green:      #a3e635   /* cor principal */
--green-dark: #5aa800   /* hover, texto sobre verde */
--text:       #2d2d2d   /* texto principal */
--text-muted: #6b7280   /* texto secundário */
--border:     #e8e8e8   /* bordas */
--white:      #ffffff   /* fundo */
```

### Classes CSS principais
```
.btn-primary     botão verde principal
.btn-link        botão sem estilo (ex: Sair)
.card            card de espaço
.tag             chip verde de tipo de evento
.auth-card       card de login/cadastro
.fg              form group (label + input)
.role-btn        botão de seleção de role
.chip-btn        chip selecionável (atributos, eventos)
.badge-count     badge vermelho de contagem
.stat-card       card de estatística no painel
.listing-wrap    grid sidebar + results
.filters-sidebar filtros laterais
.det-layout      grid detalhe: conteúdo + sidebar
.quote-box       caixa de orçamento no detalhe
.auth-error      mensagem de erro (fundo vermelho claro)
.auth-success    mensagem de sucesso (fundo verde claro)
```

---

## 🧭 Sistema de Roteamento

O roteamento é feito via `useState<Page>` no App.tsx. **Não existe react-router.**

### Tipo Page atual
```typescript
export type Page =
  | 'home' | 'listing' | 'detail'
  | 'login' | 'signup'
  | 'host-dashboard' | 'new-space' | 'edit-space'
  | 'my-quotes' | 'host-quotes'
  | 'how-it-works' | 'comparison'
```

### Como navegar
```typescript
goToPage('listing')           // simples
goToPage('detail', space)     // com dados
goToPage('edit-space', space) // com dados para editar
```

### Adicionar nova página (passo a passo)
1. Criar `src/pages/NovaPagina.tsx`
2. Adicionar string em `Page` no App.tsx
3. Adicionar import lazy no topo do App.tsx
4. Adicionar `{page === 'nova-pagina' && <NovaPagina goToPage={goToPage} />}` no Suspense
5. Adicionar link no nav se necessário

---

## ⚡ Regras de Performance (OBRIGATÓRIAS)

Sempre aplicar ao criar ou editar componentes:

### useCallback em funções passadas como props
```typescript
const handleClick = useCallback(() => { ... }, [deps])
```

### useMemo em listas filtradas
```typescript
const filtered = useMemo(() => spaces.filter(...), [spaces, filter])
```

### memo() em componentes de lista repetida
```typescript
const SpaceCard = memo(({ space, onClick }) => ( ... ))
```

### loading="lazy" em imagens
```tsx
<img src={url} loading="lazy" alt={name} />
```

### Cleanup em useEffect com fetch
```typescript
useEffect(() => {
  let cancelled = false
  const load = async () => {
    const { data } = await supabase.from('tabela').select(...)
    if (!cancelled) setData(data)
  }
  load()
  return () => { cancelled = true }
}, [])
```

### Select específico no Supabase
```typescript
// ✅ Correto
.select('id, name, city, price_per_hour, media_urls')

// ❌ Nunca em produção
.select('*')
```

---

## 🔐 Políticas de Segurança (RLS)

### Spaces
- `SELECT`: público vê `status = 'active'` OU `host_id = auth.uid()`
- `INSERT/UPDATE/DELETE`: apenas `host_id = auth.uid()`

### Quotes
- `SELECT`: guest vê seus, host vê os recebidos
- `INSERT`: apenas `guest_id = auth.uid()`
- `UPDATE`: host atualiza os recebidos, guest atualiza os seus

### Storage (space-media)
- `SELECT`: público (sem autenticação)
- `INSERT/UPDATE/DELETE`: autenticado, apenas pasta `{auth.uid()}/`

---

## 🧩 Tipos e Constantes

Sempre importar de `src/types.ts`:
```typescript
import type { Space, Quote } from '../types'
import { CATEGORIES, EVENT_TYPES, ATTRIBUTES, QUOTE_STATUS_LABELS } from '../types'
```

---

## 📐 Padrões de Código

### Props obrigatórias por tipo de página
```typescript
// Página pública
interface Props {
  goToPage: (page: Page, space?: Space) => void
}

// Página autenticada
interface Props {
  user: User
  goToPage: (page: Page, space?: Space) => void
}
```

### Formulários
- Usar `<div>` + handlers, **nunca `<form>` com `action`**
- Submit via `onSubmit={e => { e.preventDefault(); ... }}`
- Sempre ter estado `loading` e `error`
- Loading no botão: `{loading ? 'Salvando...' : 'Salvar'}`

### Estilos inline vs classes CSS
- Classes CSS para padrões repetidos
- Inline styles para customizações pontuais
- Nunca criar arquivo CSS separado por componente

---

## 🚀 Fluxo de Deploy

```
1. Editar código
2. Testar build: VITE_SUPABASE_URL=https://test.supabase.co VITE_SUPABASE_ANON_KEY=test npm run build
3. Gerar ZIP: rm -rf node_modules dist && zip -r ewind-feature.zip .
4. Upload no GitHub → Add file → Upload files → Commit
5. Vercel build automático (~1-2 min)
6. Testar em aba anônima
```

---

## ⚠️ Armadilhas Conhecidas

| Problema | Causa | Solução |
|----------|-------|---------|
| "column X does not exist" | Schema cache Supabase | `DROP TABLE CASCADE` + recriar |
| Código novo não aparece | Cache da Vercel/browser | Aba anônima OU redeploy sem cache |
| "Invalid path in request URL" | URL com `/rest/v1/` ou barra final | Recriar variável sem sufixo |
| "Database error saving new user" | Trigger `handle_new_user` falhou | Recriar função com `EXCEPTION WHEN OTHERS THEN RETURN NEW` |
| Host não consegue pedir orçamento | RLS bloqueia guest_id = host_id | Criar conta Guest separada (temp-mail.org) |
| Subpasta não sobe no GitHub | Upload parcial | Arrastar pasta inteira no upload |

---

## 🧪 Testar Localmente

```bash
npm install

# Dev com Supabase real
VITE_SUPABASE_URL=https://fvkaseflkmzzyxdmswkr.supabase.co \
VITE_SUPABASE_ANON_KEY=SEU_KEY \
npm run dev

# Build de produção (teste rápido sem Supabase real)
VITE_SUPABASE_URL=https://test.supabase.co \
VITE_SUPABASE_ANON_KEY=test \
npm run build
```

---

## 📋 SQL Templates Úteis

### Verificar estrutura atual das tabelas
```sql
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('spaces', 'profiles', 'quotes')
ORDER BY table_name, ordinal_position;
```

### Ver todos os usuários e roles
```sql
SELECT id, email, raw_user_meta_data->>'role' as role, created_at
FROM auth.users
ORDER BY created_at DESC;
```

### Ver orçamentos com detalhes
```sql
SELECT q.id, q.status, q.event_type, q.event_date,
       s.name as space_name, u.email as guest_email
FROM public.quotes q
JOIN public.spaces s ON s.id = q.space_id
JOIN auth.users u ON u.id = q.guest_id
ORDER BY q.created_at DESC;
```

### Reset completo (CUIDADO: apaga todos os dados)
```sql
DROP TABLE IF EXISTS public.quotes CASCADE;
DROP TABLE IF EXISTS public.spaces CASCADE;
-- Depois recriar com SQL completo do histórico
```

---

## 🔮 Backlog de Funcionalidades

| Feature | Status | Complexidade |
|---------|--------|-------------|
| Comparação de espaços | ✅ Feito | Média |
| Editar/Pausar espaços | ✅ Feito | Baixa |
| Sistema de orçamentos | ✅ Feito | Alta |
| Como Funciona | ✅ Feito | Baixa |
| Filtros avançados (faixa de preço) | 🔜 Pendente | Baixa |
| Favoritos (❤️ nos cards) | 🔜 Pendente | Baixa |
| Notificações por email (Resend) | 🔜 Pendente | Alta |
| Domínio próprio (ewind.com.br) | 🔜 Pendente | Baixa |
| Avaliações e reviews | 🔜 Pendente | Alta |
| Área de fornecedores de serviços | 🔜 Pendente | Alta |
