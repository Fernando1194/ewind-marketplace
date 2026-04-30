import { useState } from 'react'
import type { Page } from '../App'

interface Props {
  goToPage: (page: Page) => void
}

type Audience = 'guest' | 'host' | 'supplier'

export default function HowItWorksPage({ goToPage }: Props) {
  const [audience, setAudience] = useState<Audience>('guest')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const guestSteps = [
    {
      icon: '🔍',
      title: 'Busque o espaço ideal',
      desc: 'Use os filtros para encontrar espaços por cidade, data, capacidade e tipo de evento. Compare opções lado a lado.'
    },
    {
      icon: '👀',
      title: 'Conheça os detalhes',
      desc: 'Veja fotos, descrição, capacidade, preço orientativo e atributos de cada espaço. Tudo de forma transparente.'
    },
    {
      icon: '📝',
      title: 'Solicite orçamentos',
      desc: 'Envie sua solicitação preenchendo data, número de convidados e detalhes do evento. É grátis e sem compromisso.'
    },
    {
      icon: '💬',
      title: 'Receba propostas',
      desc: 'O fornecedor responde com proposta personalizada e preço final. Compare quantas quiser antes de decidir.'
    },
    {
      icon: '🎉',
      title: 'Realize seu evento',
      desc: 'Feche diretamente com o fornecedor escolhido. Sem taxas escondidas, sem intermediação no pagamento.'
    }
  ]

  const hostSteps = [
    {
      icon: '✍️',
      title: 'Cadastre seu espaço',
      desc: 'Crie sua conta como anunciante e cadastre seu espaço em poucos minutos. Adicione fotos, atributos e preços orientativos.'
    },
    {
      icon: '🌐',
      title: 'Apareça nos resultados',
      desc: 'Seu espaço entra na vitrine do Ewind, sendo encontrado por pessoas que buscam exatamente o que você oferece.'
    },
    {
      icon: '📨',
      title: 'Receba solicitações',
      desc: 'Você recebe orçamentos qualificados com data, convidados e tipo de evento já especificados.'
    },
    {
      icon: '💰',
      title: 'Envie propostas',
      desc: 'Responda com proposta personalizada e preço final. Você controla o orçamento de cada solicitação.'
    },
    {
      icon: '📈',
      title: 'Cresça seu negócio',
      desc: 'Gerencie tudo pelo painel: pause espaços, atualize fotos, edite preços. Tenha mais visibilidade e mais clientes.'
    }
  ]

  const supplierSteps = [
    {
      icon: '✍️',
      title: 'Crie sua conta de fornecedor',
      desc: 'Cadastre-se gratuitamente como fornecedor. É rápido e não precisa de cartão de crédito.'
    },
    {
      icon: '📋',
      title: 'Monte seu portfólio',
      desc: 'Adicione fotos do seu trabalho, descreva seus serviços, informe cidades de atendimento e faixa de preço.'
    },
    {
      icon: '🌐',
      title: 'Apareça nos resultados',
      desc: 'Seu perfil fica visível para pessoas que estão organizando eventos e buscam profissionais como você na região.'
    },
    {
      icon: '💬',
      title: 'Receba contatos diretos',
      desc: 'Clientes entram em contato via WhatsApp, Instagram ou email direto no seu perfil — sem intermediários.'
    },
    {
      icon: '📈',
      title: 'Gerencie seu perfil',
      desc: 'Atualize fotos, preços e informações a qualquer momento. Pause quando precisar e reative quando quiser.'
    }
  ]

  const faqs = [
    {
      q: 'O Ewind cobra alguma taxa?',
      a: 'Para quem busca espaço, o serviço é 100% gratuito. Você compara, solicita orçamentos e fecha diretamente com o fornecedor sem nenhuma taxa adicional.'
    },
    {
      q: 'Como funciona o pagamento?',
      a: 'O Ewind não intermedia pagamentos. Você negocia diretamente com o fornecedor escolhido, definindo forma de pagamento, sinal e demais condições.'
    },
    {
      q: 'Posso confiar nos espaços anunciados?',
      a: 'Cada anúncio é cadastrado pelos próprios proprietários. Recomendamos sempre visitar o espaço pessoalmente antes de fechar contrato e verificar a documentação.'
    },
    {
      q: 'Quanto tempo leva para receber resposta?',
      a: 'Depende de cada fornecedor, mas a maioria responde em até 24 horas. Você acompanha o status de cada orçamento no seu painel.'
    },
    {
      q: 'Posso solicitar orçamento para vários espaços?',
      a: 'Sim! Pode solicitar quantos quiser. Cada solicitação é independente e você compara propostas para escolher a melhor.'
    },
    {
      q: 'Sou dono de um espaço, como começo?',
      a: 'Crie sua conta como "Tenho um espaço", cadastre seu espaço com fotos e detalhes, e seu anúncio fica ativo na vitrine. Tudo gratuito para começar.'
    },
    {
      q: 'Posso pausar meu anúncio?',
      a: 'Sim. No seu painel, você pode pausar o anúncio temporariamente (some da vitrine mas mantém os dados) ou reativar quando quiser.'
    },
    {
      q: 'Como atualizo informações do meu espaço?',
      a: 'No painel do anunciante, clique em "Editar" no espaço que deseja atualizar. Você pode mudar fotos, preços, descrição e atributos a qualquer momento.'
    }
  ]

  const currentSteps = audience === 'guest' ? guestSteps : audience === 'host' ? hostSteps : supplierSteps

  return (
    <div style={{ background: '#fff' }}>
      {/* HERO */}
      <section style={{
        background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfccb 100%)',
        padding: '60px 24px',
        textAlign: 'center',
        borderBottom: '1px solid #e8e8e8'
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#5aa800', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            COMO FUNCIONA
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: '#2d2d2d', marginBottom: 16, lineHeight: 1.2 }}>
            O <span style={{ color: '#5aa800' }}>marketplace</span> que conecta pessoas a espaços e serviços para eventos
          </h1>
          <p style={{ fontSize: 16, color: '#6b7280', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
            Encontre o lugar perfeito, compare opções, solicite orçamentos e realize o seu evento — tudo em um só lugar, de forma rápida e gratuita.
          </p>
        </div>
      </section>

      {/* AUDIENCE TABS */}
      <section style={{ padding: '40px 24px 0', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Como podemos te ajudar?</h2>
          <p style={{ fontSize: 14, color: '#6b7280' }}>Escolha o seu perfil para ver como o Ewind funciona para você</p>
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
          <button
            onClick={() => setAudience('guest')}
            style={{
              padding: '14px 24px',
              border: audience === 'guest' ? '2px solid #a3e635' : '1.5px solid #e8e8e8',
              borderRadius: 12,
              background: audience === 'guest' ? '#f0fdf4' : '#fff',
              color: audience === 'guest' ? '#1a2e05' : '#2d2d2d',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s'
            }}
          >
            🎉 Busco um espaço para meu evento
          </button>
          <button
            onClick={() => setAudience('host')}
            style={{
              padding: '14px 24px',
              border: audience === 'host' ? '2px solid #a3e635' : '1.5px solid #e8e8e8',
              borderRadius: 12,
              background: audience === 'host' ? '#f0fdf4' : '#fff',
              color: audience === 'host' ? '#1a2e05' : '#2d2d2d',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s'
            }}
          >
            🏢 Tenho um espaço para anunciar
          </button>
          <button
            onClick={() => setAudience('supplier')}
            style={{
              padding: '14px 24px',
              border: audience === 'supplier' ? '2px solid #a3e635' : '1.5px solid #e8e8e8',
              borderRadius: 12,
              background: audience === 'supplier' ? '#f0fdf4' : '#fff',
              color: audience === 'supplier' ? '#1a2e05' : '#2d2d2d',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s'
            }}
          >
            🛠️ Sou fornecedor de serviços
          </button>
        </div>
      </section>

      {/* STEPS */}
      <section style={{ padding: '0 24px 60px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ background: '#f9fafb', borderRadius: 20, padding: 40 }}>
          <div style={{ marginBottom: 32, textAlign: 'center' }}>
            <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
              {audience === 'guest' && '🎉 Para quem busca um espaço'}
              {audience === 'host' && '🏢 Para anunciantes de espaços'}
              {audience === 'supplier' && '🛠️ Para fornecedores de serviços'}
            </h3>
            <p style={{ fontSize: 14, color: '#6b7280' }}>
              {audience === 'guest' && 'Em poucos passos você encontra e fecha o evento perfeito'}
              {audience === 'host' && 'Anuncie seu espaço e receba mais clientes qualificados'}
              {audience === 'supplier' && 'Crie seu perfil, exiba seu portfólio e seja encontrado por quem organiza eventos'}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {currentSteps.map((step, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: 20,
                  alignItems: 'flex-start',
                  background: '#fff',
                  padding: 20,
                  borderRadius: 14,
                  border: '1px solid #e8e8e8'
                }}
              >
                <div style={{
                  flexShrink: 0,
                  width: 64,
                  height: 64,
                  background: '#f0fdf4',
                  borderRadius: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 32
                }}>
                  {step.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: '#5aa800',
                      background: '#f0fdf4',
                      padding: '3px 10px',
                      borderRadius: 100,
                      letterSpacing: '0.05em'
                    }}>
                      {`PASSO ${i + 1}`}
                    </span>
                  </div>
                  <h4 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>{step.title}</h4>
                  <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA por audiência */}
          <div style={{ marginTop: 32, textAlign: 'center' }}>
            {audience === 'guest' && (
              <button
                className="btn-primary"
                style={{ fontSize: 15, padding: '14px 32px' }}
                onClick={() => goToPage('listing')}
              >
                🔍 Buscar espaços agora
              </button>
            )}
            {audience === 'host' && (
              <button
                className="btn-primary"
                style={{ fontSize: 15, padding: '14px 32px' }}
                onClick={() => goToPage('signup')}
              >
                ✍️ Cadastrar meu espaço
              </button>
            )}
            {audience === 'supplier' && (
              <button
                className="btn-primary"
                style={{ fontSize: 15, padding: '14px 32px' }}
                onClick={() => goToPage('supplier-signup')}
              >
                🛠️ Cadastrar como fornecedor
              </button>
            )}
          </div>
        </div>
      </section>

      {/* DIFERENCIAIS */}
      <section style={{ padding: '60px 24px', background: '#fafafa', borderTop: '1px solid #e8e8e8' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, textAlign: 'center', marginBottom: 12 }}>
            Por que escolher o Ewind?
          </h2>
          <p style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 40 }}>
            Uma plataforma pensada para facilitar a vida de todos
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            <div style={{ background: '#fff', padding: 24, borderRadius: 14, border: '1px solid #e8e8e8' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>💸</div>
              <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>100% gratuito</h4>
              <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
                Sem taxas escondidas. Quem busca espaço usa de graça e quem anuncia também não paga para começar.
              </p>
            </div>
            <div style={{ background: '#fff', padding: 24, borderRadius: 14, border: '1px solid #e8e8e8' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>⚡</div>
              <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Rápido e prático</h4>
              <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
                Encontre, compare e solicite orçamentos em minutos. Receba respostas em até 24 horas.
              </p>
            </div>
            <div style={{ background: '#fff', padding: 24, borderRadius: 14, border: '1px solid #e8e8e8' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
              <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Dados protegidos</h4>
              <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
                Suas informações só são compartilhadas com fornecedores quando você decide solicitar um orçamento.
              </p>
            </div>
            <div style={{ background: '#fff', padding: 24, borderRadius: 14, border: '1px solid #e8e8e8' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🎯</div>
              <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Direto ao ponto</h4>
              <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
                Sem intermediação no pagamento. Você fecha diretamente com o fornecedor escolhido.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '60px 24px', maxWidth: 800, margin: '0 auto' }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, textAlign: 'center', marginBottom: 12 }}>
          Perguntas frequentes
        </h2>
        <p style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 32 }}>
          Tire suas dúvidas sobre como o Ewind funciona
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {faqs.map((faq, i) => (
            <div
              key={i}
              style={{
                background: '#fff',
                border: '1.5px solid #e8e8e8',
                borderRadius: 12,
                overflow: 'hidden'
              }}
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{
                  width: '100%',
                  padding: '18px 20px',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#2d2d2d',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12
                }}
              >
                <span>{faq.q}</span>
                <span style={{ fontSize: 18, color: '#5aa800', flexShrink: 0 }}>
                  {openFaq === i ? '−' : '+'}
                </span>
              </button>
              {openFaq === i && (
                <div style={{
                  padding: '0 20px 18px',
                  fontSize: 14,
                  color: '#6b7280',
                  lineHeight: 1.7,
                  borderTop: '1px solid #f3f4f6',
                  paddingTop: 14
                }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ padding: '60px 24px', background: '#1a1a1a' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#a3e635', marginBottom: 16 }}>
            Pronto para começar?
          </h2>
          <p style={{ fontSize: 16, color: '#aaa', marginBottom: 28, lineHeight: 1.6 }}>
            Junte-se ao Ewind e simplifique a forma como eventos acontecem.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn-primary"
              style={{ fontSize: 15, padding: '14px 28px' }}
              onClick={() => goToPage('listing')}
            >
              🔍 Buscar espaços
            </button>
            <button
              style={{
                fontSize: 15,
                padding: '14px 28px',
                background: 'transparent',
                border: '2px solid #a3e635',
                borderRadius: 8,
                color: '#a3e635',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
              onClick={() => goToPage('signup')}
            >
              ✍️ Anunciar meu espaço
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
