import type { Page } from '../App'

interface Props {
  goToPage: (page: Page) => void
}

export default function AboutPage({ goToPage }: Props) {
  const values = [
    { icon: '🤝', title: 'Conexão direta', desc: 'Acreditamos que os melhores negócios acontecem quando as pessoas falam diretamente umas com as outras. Por isso eliminamos intermediários e deixamos anunciantes e clientes se comunicarem livremente.' },
    { icon: '🔒', title: 'Transparência total', desc: 'Cada orçamento enviado, cada proposta recebida e cada negociação acontece de forma clara e rastreável. Você sempre sabe com quem está falando e o que está contratando.' },
    { icon: '💚', title: 'Acesso para todos', desc: 'Um casamento, um aniversário, uma formatura ou um evento corporativo — o Ewind serve todos com a mesma qualidade. Sem taxas de acesso e sem tratamento diferenciado.' },
    { icon: '🚀', title: 'Simplicidade que resolve', desc: 'Tecnologia existe para facilitar, não para complicar. Nossa plataforma foi construída para que qualquer pessoa consiga usar, sem manuais ou tutoriais.' },
  ]

  const stats = [
    { number: '7', label: 'categorias de espaços' },
    { number: '15', label: 'categorias de fornecedores' },
    { number: '100%', label: 'gratuito para quem busca' },
    { number: '0', label: 'taxas sobre negociações' },
  ]

  return (
    <div style={{ background: '#fff' }}>

      {/* HERO */}
      <section style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#a3e635', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.12em' }}>QUEM SOMOS</div>
          <h1 style={{ fontSize: 42, fontWeight: 900, color: '#fff', lineHeight: 1.15, marginBottom: 20 }}>
            Tornando a organização de eventos{' '}
            <span style={{ color: '#a3e635' }}>menos estressante</span>{' '}
            e mais acessível para todos
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, maxWidth: 580, margin: '0 auto 32px' }}>
            O Ewind nasceu de uma crença simples: organizar um evento especial não precisa ser sinônimo de ansiedade, pesquisa interminável e orçamentos que nunca chegam.
          </p>
          <button className="btn-primary" style={{ fontSize: 15, padding: '14px 32px' }} onClick={() => goToPage('listing')}>
            Conhecer os espaços →
          </button>
        </div>
      </section>

      {/* MISSÃO */}
      <section style={{ padding: '72px 24px', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#5aa800', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>NOSSA MISSÃO</div>
            <h2 style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.25, marginBottom: 20, color: '#2d2d2d' }}>
              Conectar quem organiza eventos com quem faz eles acontecerem
            </h2>
            <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.8, marginBottom: 16 }}>
              Eventos marcam a vida das pessoas. Um casamento, uma formatura, um aniversário ou uma confraternização — cada um carrega emoção, expectativa e muito trabalho por trás.
            </p>
            <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.8, marginBottom: 16 }}>
              O que percebemos é que encontrar o espaço certo ou o fornecedor ideal ainda é difícil. São horas de pesquisa no Google, ligações sem retorno e orçamentos que chegam dias depois — quando chegam.
            </p>
            <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.8 }}>
              O Ewind resolve isso. Reunimos num só lugar espaços para eventos, fornecedores de serviços e quem precisa deles — de forma rápida, gratuita e transparente.
            </p>
          </div>

          <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfccb 100%)', borderRadius: 20, padding: 40, border: '1px solid #d9f99d' }}>
            <div style={{ fontSize: 48, marginBottom: 20 }}>🎯</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 14, color: '#1a2e05' }}>Nosso propósito</h3>
            <p style={{ fontSize: 15, color: '#365314', lineHeight: 1.7, fontStyle: 'italic' }}>
              "Fazer com que o momento de planejar um evento seja tão especial quanto o evento em si — conectando pessoas, espaços e serviços com simplicidade, segurança e sem custo."
            </p>
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#5aa800' }}>Fernando Vieira</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Fundador, Ewind · Curitiba, PR</div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEMA */}
      <section style={{ background: '#f9fafb', padding: '72px 24px', borderTop: '1px solid #e8e8e8' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#5aa800', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>POR QUE O EWIND EXISTE</div>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16, color: '#2d2d2d' }}>
            Organizar eventos no Brasil era mais difícil do que precisava ser
          </h2>
          <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.8, maxWidth: 680, margin: '0 auto 48px' }}>
            Antes do Ewind, encontrar um espaço para eventos significava horas de busca dispersa, ligações sem retorno, orçamentos que demoravam dias e a impossibilidade de comparar opções com clareza.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, textAlign: 'left' }}>
            <div style={{ background: '#fff', padding: 28, borderRadius: 14, border: '1px solid #e8e8e8' }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>😓</div>
              <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Antes do Ewind</h4>
              <ul style={{ fontSize: 13, color: '#6b7280', lineHeight: 2, paddingLeft: 18 }}>
                <li>Horas pesquisando em sites diferentes</li>
                <li>Ligações sem retorno e emails ignorados</li>
                <li>Orçamentos chegando dias depois</li>
                <li>Impossível comparar opções com clareza</li>
                <li>Estresse tomando conta do planejamento</li>
              </ul>
            </div>
            <div style={{ background: '#f0fdf4', padding: 28, borderRadius: 14, border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>🎉</div>
              <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, color: '#1a2e05' }}>Com o Ewind</h4>
              <ul style={{ fontSize: 13, color: '#166534', lineHeight: 2, paddingLeft: 18 }}>
                <li>Tudo em um lugar: espaços e fornecedores</li>
                <li>Orçamentos enviados em minutos</li>
                <li>Respostas em até 24 horas</li>
                <li>Comparação lado a lado, clara e objetiva</li>
                <li>Foco no que importa: o evento</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* NÚMEROS */}
      <section style={{ padding: '72px 24px', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#5aa800', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>EWIND EM NÚMEROS</div>
        <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 40, color: '#2d2d2d' }}>Uma plataforma completa para o universo de eventos</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
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
            <div style={{ fontSize: 12, fontWeight: 800, color: '#5aa800', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>NOSSOS VALORES</div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#2d2d2d' }}>O que guia cada decisão que tomamos</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            {values.map((v, i) => (
              <div key={i} style={{ background: '#fff', padding: 28, borderRadius: 14, border: '1px solid #e8e8e8' }}>
                <div style={{ fontSize: 36, marginBottom: 14 }}>{v.icon}</div>
                <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>{v.title}</h4>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FUNDADOR */}
      <section style={{ padding: '72px 24px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#5aa800', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>QUEM ESTÁ POR TRÁS</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#2d2d2d' }}>Nosso time</h2>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ background: '#fff', border: '1.5px solid #e8e8e8', borderRadius: 16, padding: 36, maxWidth: 440, textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #a3e635, #5aa800)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 16px' }}>👨‍💼</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Fernando Vieira</h3>
            <div style={{ fontSize: 13, color: '#5aa800', fontWeight: 600, marginBottom: 4 }}>Fundador & CEO</div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16 }}>📍 Curitiba, PR</div>
            <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7 }}>
              Empreendedor com paixão por tecnologia e eventos. Criou o Ewind após perceber como era difícil e estressante encontrar e contratar espaços para eventos no Brasil — e decidiu que dava para ser diferente.
            </p>
          </div>
        </div>
      </section>

      {/* PARA TODOS */}
      <section style={{ background: '#f9fafb', padding: '72px 24px', borderTop: '1px solid #e8e8e8' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#5aa800', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>PARA TODOS</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 16, color: '#2d2d2d' }}>Um ecossistema completo de eventos</h2>
          <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.8, maxWidth: 640, margin: '0 auto 48px' }}>
            O Ewind foi pensado para atender todos os envolvidos no universo de eventos: quem busca, quem oferece espaços e toda a cadeia de fornecedores que torna cada celebração possível.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { icon: '🎉', title: 'Quem busca espaços', desc: 'Encontre, compare e solicite orçamentos para casamentos, aniversários, formaturas, confraternizações e qualquer tipo de evento.', btn: 'Buscar espaços →', action: 'listing' as Page },
              { icon: '🏢', title: 'Quem anuncia espaços', desc: 'Cadastre seu espaço, receba orçamentos qualificados, responda propostas e gerencie tudo pelo painel. Gratuito para começar.', btn: 'Anunciar meu espaço →', action: 'signup' as Page },
              { icon: '🛠️', title: 'Fornecedores de serviços', desc: 'Fotografia, DJ, buffet, decoração, cerimonialista e muito mais. Crie seu perfil e seja encontrado por quem organiza eventos.', btn: 'Criar perfil de fornecedor →', action: 'supplier-signup' as Page },
            ].map((card, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 14, padding: 28, border: '1px solid #e8e8e8', textAlign: 'left' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{card.icon}</div>
                <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{card.title}</h4>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6, marginBottom: 16 }}>{card.desc}</p>
                <button onClick={() => goToPage(card.action)} style={{ fontSize: 12, fontWeight: 700, color: '#5aa800', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
                  {card.btn}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ padding: '72px 24px', background: '#1a1a1a' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🎊</div>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#a3e635', marginBottom: 16, lineHeight: 1.3 }}>
            Vamos tornar seu próximo evento inesquecível?
          </h2>
          <p style={{ fontSize: 15, color: '#9ca3af', marginBottom: 32, lineHeight: 1.7 }}>
            O momento especial começa muito antes da festa. Comece agora, é grátis.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary" style={{ fontSize: 15, padding: '14px 28px' }} onClick={() => goToPage('listing')}>
              🔍 Encontrar meu espaço
            </button>
            <button style={{ fontSize: 15, padding: '14px 28px', background: 'transparent', border: '2px solid #a3e635', borderRadius: 8, color: '#a3e635', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => goToPage('how-it-works')}>
              📖 Como funciona
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
