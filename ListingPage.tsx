import type { Page } from '../App'

interface Props {
  goToPage: (page: Page) => void
}

export default function AboutPage({ goToPage }: Props) {
  const values = [
    {
      icon: '🤝',
      title: 'Conexão real',
      desc: 'Acreditamos que eventos inesquecíveis começam com conexões genuínas. Por isso ligamos diretamente quem precisa a quem oferece, sem intermediários desnecessários.'
    },
    {
      icon: '🔒',
      title: 'Segurança e transparência',
      desc: 'Cada informação publicada, cada orçamento enviado e cada resposta recebida acontece de forma clara e rastreável. Você sempre sabe com quem está falando.'
    },
    {
      icon: '💚',
      title: 'Acessibilidade para todos',
      desc: 'Seja um casamento intimista ou uma grande confraternização corporativa, o Ewind serve a todos — sem taxas escondidas e sem burocracia.'
    },
    {
      icon: '🚀',
      title: 'Simplicidade que transforma',
      desc: 'Processos complexos viram poucos cliques. Nossa tecnologia existe para sumir do caminho e deixar você focar no que realmente importa: o evento.'
    }
  ]

  const stats = [
    { number: '5', label: 'categorias de espaços' },
    { number: '100%', label: 'gratuito para quem busca' },
    { number: '0', label: 'taxas sobre negociações' },
    { number: '∞', label: 'orçamentos simultâneos' }
  ]

  const team = [
    {
      name: 'Fernando Vieira',
      role: 'Fundador & CEO',
      city: 'Curitiba, PR',
      bio: 'Empreendedor com paixão por tecnologia e eventos. Criou o Ewind após perceber como era difícil e estressante encontrar e contratar espaços para eventos no Brasil.',
      emoji: '👨‍💼'
    }
  ]

  return (
    <div style={{ background: '#fff' }}>

      {/* HERO */}
      <section style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        padding: '80px 24px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#a3e635', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            QUEM SOMOS
          </div>
          <h1 style={{ fontSize: 42, fontWeight: 900, color: '#fff', lineHeight: 1.15, marginBottom: 20 }}>
            Tornando cada evento{' '}
            <span style={{ color: '#a3e635' }}>menos estressante</span>{' '}
            e mais inesquecível
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, maxWidth: 580, margin: '0 auto 32px' }}>
            O Ewind nasceu de uma crença simples: organizar um evento especial não deveria ser uma fonte de ansiedade. Deveria ser o começo de uma história bonita.
          </p>
          <button
            className="btn-primary"
            style={{ fontSize: 15, padding: '14px 32px' }}
            onClick={() => goToPage('listing')}
          >
            Conhecer os espaços →
          </button>
        </div>
      </section>

      {/* MISSÃO */}
      <section style={{ padding: '72px 24px', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#5aa800', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
              NOSSA MISSÃO
            </div>
            <h2 style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.25, marginBottom: 20, color: '#2d2d2d' }}>
              Facilitar o encontro entre quem sonha e quem realiza
            </h2>
            <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.8, marginBottom: 16 }}>
              Eventos marcam a vida das pessoas. Um casamento, uma formatura, um aniversário, uma confraternização — cada um desses momentos carrega emoção, expectativa e muito trabalho por trás.
            </p>
            <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.8, marginBottom: 16 }}>
              O que vimos é que a parte mais difícil nem sempre é a decoração ou o buffet: é encontrar o espaço certo, comparar opções, entender preços e ter segurança na escolha.
            </p>
            <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.8 }}>
              O Ewind existe para resolver exatamente isso. Somos o elo entre quem busca um espaço perfeito e quem tem esse espaço para oferecer — de forma rápida, gratuita e transparente.
            </p>
          </div>

          {/* Card visual da missão */}
          <div style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfccb 100%)',
            borderRadius: 20,
            padding: 40,
            border: '1px solid #d9f99d'
          }}>
            <div style={{ fontSize: 48, marginBottom: 20 }}>🎯</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 14, color: '#1a2e05' }}>
              Nosso propósito
            </h3>
            <p style={{ fontSize: 15, color: '#365314', lineHeight: 1.7, fontStyle: 'italic' }}>
              "Fazer com que o momento de organizar um evento seja tão especial quanto o evento em si — conectando pessoas, espaços e serviços com simplicidade, segurança e sem custo."
            </p>
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#5aa800' }}>Fernando Vieira</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Fundador, Ewind</div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEMA QUE RESOLVEMOS */}
      <section style={{ background: '#f9fafb', padding: '72px 24px', borderTop: '1px solid #e8e8e8' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#5aa800', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
            POR QUE O EWIND EXISTE
          </div>
          <h2 style={{ fontSize: 30, fontWeight: 800, marginBottom: 16, color: '#2d2d2d' }}>
            Organizar eventos no Brasil é mais difícil do que deveria ser
          </h2>
          <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.8, maxWidth: 700, margin: '0 auto 48px' }}>
            Antes do Ewind, encontrar um espaço para eventos significava horas de busca no Google, ligações sem retorno, orçamentos que chegavam dias depois e dificuldade de comparar opções lado a lado.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, textAlign: 'left' }}>
            <div style={{ background: '#fff', padding: 24, borderRadius: 14, border: '1px solid #e8e8e8' }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>😓</div>
              <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: '#2d2d2d' }}>Antes</h4>
              <ul style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.8, paddingLeft: 16 }}>
                <li>Horas pesquisando sem comparar</li>
                <li>Orçamentos demoram dias</li>
                <li>Informações inconsistentes</li>
                <li>Sem segurança na escolha</li>
                <li>Processo estressante</li>
              </ul>
            </div>
            <div style={{ background: '#f0fdf4', padding: 24, borderRadius: 14, border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>🎉</div>
              <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: '#1a2e05' }}>Com o Ewind</h4>
              <ul style={{ fontSize: 13, color: '#166534', lineHeight: 1.8, paddingLeft: 16 }}>
                <li>Busca, filtra e compara em minutos</li>
                <li>Orçamentos em até 24 horas</li>
                <li>Informações transparentes</li>
                <li>Comunicação direta e segura</li>
                <li>Foco no que importa: o evento</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* NÚMEROS */}
      <section style={{ padding: '72px 24px', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#5aa800', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
          EWIND EM NÚMEROS
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 48, color: '#2d2d2d' }}>
          Uma plataforma feita para todo tipo de evento
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {stats.map((s, i) => (
            <div key={i} style={{ background: '#f9fafb', borderRadius: 14, padding: 28, border: '1px solid #e8e8e8' }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: '#a3e635', marginBottom: 8 }}>{s.number}</div>
              <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 500, lineHeight: 1.4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* VALORES */}
      <section style={{ background: '#f9fafb', padding: '72px 24px', borderTop: '1px solid #e8e8e8' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#5aa800', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
              NOSSOS VALORES
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#2d2d2d' }}>
              O que guia cada decisão que tomamos
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            {values.map((v, i) => (
              <div key={i} style={{ background: '#fff', padding: 28, borderRadius: 14, border: '1px solid #e8e8e8' }}>
                <div style={{ fontSize: 36, marginBottom: 14 }}>{v.icon}</div>
                <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, color: '#2d2d2d' }}>{v.title}</h4>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FUNDADOR */}
      <section style={{ padding: '72px 24px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#5aa800', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
            QUEM ESTÁ POR TRÁS
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#2d2d2d' }}>Nosso time</h2>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {team.map((t, i) => (
            <div key={i} style={{
              background: '#fff', border: '1.5px solid #e8e8e8', borderRadius: 16,
              padding: 32, maxWidth: 420, textAlign: 'center'
            }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'linear-gradient(135deg, #a3e635, #5aa800)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 36, margin: '0 auto 16px'
              }}>
                {t.emoji}
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>{t.name}</h3>
              <div style={{ fontSize: 13, color: '#5aa800', fontWeight: 600, marginBottom: 4 }}>{t.role}</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 14 }}>📍 {t.city}</div>
              <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7 }}>{t.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PARA TODOS */}
      <section style={{ background: '#f9fafb', padding: '72px 24px', borderTop: '1px solid #e8e8e8' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#5aa800', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
            PARA TODOS
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16, color: '#2d2d2d' }}>
            Um ecossistema completo de eventos
          </h2>
          <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.8, maxWidth: 660, margin: '0 auto 48px' }}>
            O Ewind foi pensado para servir todos os envolvidos no universo de eventos — não apenas quem busca e quem oferece espaços, mas também toda a cadeia de fornecedores que torna cada celebração possível.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <div style={{ background: '#fff', borderRadius: 14, padding: 28, border: '1px solid #e8e8e8' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🎉</div>
              <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Quem busca espaços</h4>
              <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
                Encontre, compare e solicite orçamentos de espaços para qualquer tipo de evento — casamentos, aniversários, formaturas, confraternizações e mais.
              </p>
              <button
                onClick={() => goToPage('listing')}
                style={{ marginTop: 16, fontSize: 12, fontWeight: 700, color: '#5aa800', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Buscar espaços →
              </button>
            </div>
            <div style={{ background: '#fff', borderRadius: 14, padding: 28, border: '1px solid #e8e8e8' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🏢</div>
              <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Quem oferece espaços</h4>
              <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
                Cadastre seu espaço gratuitamente, receba solicitações qualificadas e responda com orçamentos personalizados. Mais visibilidade, mais negócios.
              </p>
              <button
                onClick={() => goToPage('signup')}
                style={{ marginTop: 16, fontSize: 12, fontWeight: 700, color: '#5aa800', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Anunciar espaço →
              </button>
            </div>
            <div style={{ background: '#f9fafb', borderRadius: 14, padding: 28, border: '1px dashed #d1d5db' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🛠️</div>
              <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: '#9ca3af' }}>Fornecedores de serviços</h4>
              <p style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.6 }}>
                Buffet, decoração, fotografia, música, segurança e muito mais. Em breve, fornecedores de serviços também terão seu espaço no Ewind.
              </p>
              <div style={{ marginTop: 16, fontSize: 12, fontWeight: 700, color: '#d1d5db' }}>
                Em breve ✨
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ padding: '72px 24px', background: '#1a1a1a' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🎊</div>
          <h2 style={{ fontSize: 30, fontWeight: 800, color: '#a3e635', marginBottom: 16, lineHeight: 1.3 }}>
            Vamos tornar seu próximo evento inesquecível?
          </h2>
          <p style={{ fontSize: 15, color: '#9ca3af', marginBottom: 32, lineHeight: 1.7 }}>
            Junte-se ao Ewind e descubra como organizar eventos pode ser simples, seguro e até prazeroso. Porque o momento especial começa muito antes da festa.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn-primary"
              style={{ fontSize: 15, padding: '14px 28px' }}
              onClick={() => goToPage('listing')}
            >
              🔍 Encontrar meu espaço
            </button>
            <button
              style={{
                fontSize: 15, padding: '14px 28px',
                background: 'transparent', border: '2px solid #a3e635',
                borderRadius: 8, color: '#a3e635', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit'
              }}
              onClick={() => goToPage('how-it-works')}
            >
              📖 Como funciona
            </button>
          </div>
        </div>
      </section>

    </div>
  )
}
