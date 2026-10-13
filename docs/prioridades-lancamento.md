# Análise de otimização e prioridades para o lançamento

Levantamento feito sobre o estado atual do código em produção (commit `96f8dfd`).
Cada item tem um veredito honesto e um nível de esforço. A lista de prioridades no final
ordena o que fazer, do que trava o lançamento ao que é melhoria incremental.

---

## O que a análise encontrou

### 🔴 Crítico — atrapalha o lançamento agora

**1. Meta tags desatualizadas (SEO e compartilhamento)**
O `index.html` ainda descreve o produto antigo:
- `<title>`: "Ewind - Marketplace de Espaços para Eventos"
- `<meta description>`: fala em "comparar opções e solicitar orçamentos"

Isso contradiz todo o reposicionamento para ferramenta de gestão gratuita. Quem achar o
site no Google, ou compartilhar o link, vê a mensagem errada. É a primeira impressão pública
e está desalinhada. **Esforço: baixo (10 min).**

**2. Sem Open Graph (preview ao compartilhar)**
Não há nenhuma tag `og:` no HTML. Quando você compartilha ewind.com.br no WhatsApp, LinkedIn
ou Instagram, não aparece card com título, descrição e imagem, aparece um link cru e feio.
Para uma série de posts no LinkedIn divulgando o site, isso custa cliques diretamente.
**Esforço: baixo (30 min, precisa de uma imagem 1200x630).**

### 🟡 Médio — vale resolver antes de escalar divulgação

**3. Código morto no repositório**
`HomePage.tsx` não é usado em lugar nenhum (o app usa `HomePageNew.tsx`). Existem outras
páginas do marketplace antigo que podem estar órfãs. Não quebra nada, mas polui o projeto,
confunde manutenção e infla o repositório. **Esforço: baixo, mas exige conferir cada arquivo
antes de apagar.**

**4. Sem robots.txt nem sitemap.xml**
O Google indexa mesmo sem, mas com eles a indexação é mais rápida e controlada, importante
quando você está começando a buscar visibilidade orgânica. **Esforço: baixo.**

**5. Bundle principal de 108KB gzip**
Aceitável, não é alarmante, mas dá pra melhorar. O `index.js` carrega tudo que não é lazy.
Vale investigar se algo grande (ex.: libs) pode virar carregamento sob demanda. Não é
urgente. **Esforço: médio, ganho incremental.**

### 🟢 Menor — quando sobrar tempo

**6. Nome do repositório**
Ainda é `ewind-marketplace`, resquício da fase antiga. Renomear alinha com o posicionamento,
mas quebra URLs e configs, não vale o risco agora. **Esforço: baixo, risco médio, adiar.**

---

## O que está bem (não precisa mexer)

- **Segurança:** RLS por `owner_id` em todas as tabelas. Cada usuário só vê os próprios dados.
- **Tratamento de erro:** o polimento recente cobriu as operações de escrita com feedback.
- **Anexos privados:** contratos em bucket privado com URLs assinadas, não públicas.
- **Sem console.logs vazando** em produção.
- **Build limpo**, sem erros.
- **Lazy loading** já aplicado nas páginas principais.

---

## Lista de prioridades para o lançamento

Ordenada por retorno sobre esforço. Os primeiros itens travam ou prejudicam o lançamento
diretamente; os últimos são melhoria e crescimento.

### Fase 1 — Antes de divulgar de verdade (dias)

1. **Corrigir title e meta description** para a mensagem atual (gestão gratuita de eventos).
   *Impacto alto, esforço mínimo. É o primeiro texto que o mundo lê sobre o Ewind.*

2. **Adicionar Open Graph** (título, descrição, imagem 1200x630) para o link ter preview
   decente ao ser compartilhado. *Direto ligado à sua série de posts no LinkedIn.*

3. **Terminar a configuração de email profissional** (SMTP + DNS no Registro.br).
   *Já em andamento. Sem isso, cadastro e recuperação de senha não chegam a usuários reais.*

4. **Adicionar robots.txt e sitemap.xml** para indexação. *Rápido, ajuda o orgânico desde o início.*

### Fase 2 — Preparar para receber usuários (semana)

5. **Testar o fluxo completo como um estranho:** criar conta do zero (com email novo),
   criar evento, adicionar contrato, importar convidados, em desktop e celular. Anotar cada
   ponto de travamento. *Isto vale mais que qualquer feature nova agora.*

6. **Limpar código morto** (`HomePage.tsx` e páginas órfãs do marketplace antigo), conferindo
   antes de apagar. *Higiene do projeto.*

7. **Revisar estados vazios e onboarding:** o que um usuário novo vê ao entrar sem nenhum
   evento? Há um caminho claro do "criei conta" ao "primeiro evento organizado"? *É o que
   determina se um estranho consegue usar sem você do lado.*

### Fase 3 — Crescimento (contínuo, pós-lançamento)

8. **Colocar na frente de 3 a 5 organizadores reais** e coletar feedback estruturado.
   *O gargalo do Ewind hoje não é feature, é validação de uso real.*

9. **Otimizar bundle** se a análise mostrar algo grande carregando à toa. *Incremental.*

10. **Reativar a extração de contrato por IA** quando houver tração que justifique o custo.

11. **Iniciar a Fase 2 (marketplace)** apenas quando a base de organizadores estiver ativa
    e engajada, não antes.

---

## Recomendação final honesta

Os itens 1 a 4 são rápidos e destravam o lançamento e a divulgação, faça-os primeiro. Mas o
item 5 (testar como um estranho) e o 8 (usuários reais) são os que de fato importam agora. O
produto já tem funcionalidade de sobra para a Fase 1; o risco não está no que falta construir,
está em descobrir se as pessoas usam. Priorize validar sobre adicionar.
