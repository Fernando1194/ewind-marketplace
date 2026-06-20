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
    { icon: '🗓️', title: 'Crie seu evento', desc: 'Casamento, aniversário, formatura ou corporativo. Defina a data, o orçamento estimado e o número de convidados. Leva menos de um minuto.' },
    { icon: '📄', title: 'Cadastre contratos e fornecedores', desc: 'Para cada fornecedor, registre o valor, anexe o contrato em PDF e destaque as cláusulas de risco — multa, cancelamento e condições especiais.' },
    { icon: '💰', title: 'Controle pagamentos e prazos', desc: 'Lance as parcelas de cada contrato e marque o que já foi pago. O painel mostra o total contratado, o que falta pagar e os próximos vencimentos.' },
    { icon: '👥', title: 'Gerencie convidados e checklist', desc: 'Importe a lista de convidados do Excel, controle confirmações, e acompanhe um checklist com prazos calculados a partir da data do evento.' },
    { icon: '🎉', title: 'Chegue ao grande dia sem surpresas', desc: 'Com tudo centralizado — contratos, pagamentos, prazos e convidados — você organiza o evento inteiro sem planilhas espalhadas. E é grátis.' },
  ]

  const hostSteps = [
    { icon: '✍️', title: 'Cadastre seu espaço gratuitamente', desc: 'Crie sua conta como anunciante e cadastre seu espaço com fotos, atributos e preços orientativos. O marketplace está em construção — cadastre-se para ter prioridade no lançamento.' },
    { icon: '🌐', title: 'Apareça para quem busca', desc: 'Seu espaço entra na vitrine do Ewind e é encontrado por pessoas que já estão prontas para organizar um evento.' },
    { icon: '📨', title: 'Receba solicitações qualificadas', desc: 'As solicitações chegam com data, número de convidados e tipo de evento já informados. Sem perda de tempo com leads frios.' },
    { icon: '💰', title: 'Responda com sua proposta', desc: 'Envie um orçamento personalizado com texto e valor. Você controla cada negociação do início ao fim.' },
    { icon: '📈', title: 'Gerencie seus contratos na plataforma', desc: 'Além de anunciar, você usa as mesmas ferramentas de gestão do Ewind para controlar seus próprios contratos, pagamentos e prazos com clientes.' },
  ]

  const supplierSteps = [
    { icon: '✍️', title: 'Crie seu perfil profissional', desc: 'Cadastre-se na área exclusiva de fornecedores. Selecione sua especialidade — fotografia, DJ, buffet, decoração, cerimonialista e muito mais.' },
    { icon: '📋', title: 'Monte seu portfólio', desc: 'Adicione fotos e vídeos do seu trabalho, descreva seus serviços, informe cidades de atendimento, faixa de preço e seus diferenciais.' },
    { icon: '🌐', title: 'Seja encontrado por quem organiza eventos', desc: 'Seu perfil aparece na listagem de fornecedores filtrada por categoria, cidade e tipo de evento. Visibilidade qualificada.' },
    { icon: '💬', title: 'Receba contatos diretos', desc: 'Clientes entram em contato pelo seu WhatsApp, Instagram ou email diretamente no seu perfil. Sem intermediários, sem comissão.' },
    { icon: '📈', title: 'Gerencie contratos e agenda', desc: 'Use o Ewind para organizar seus próprios contratos, pagamentos e datas de cada trabalho — a mesma ferramenta que os organizadores usam, do seu lado.' },
  ]

  const faqs = [
    { q: 'O que é o Ewind?', a: 'O Ewind é uma ferramenta gratuita para organizar eventos. Você centraliza contratos, pagamentos, prazos, lista de convidados e checklist em um só lugar — sem precisar de planilhas. Em breve, também terá um marketplace para encontrar espaços e fornecedores.' },
    { q: 'A ferramenta de gestão é mesmo gratuita?', a: 'Sim. Criar eventos, cadastrar contratos, controlar pagamentos, gerenciar convidados e usar o checklist é totalmente gratuito para quem organiza eventos.' },
    { q: 'Preciso anexar meus contratos? É seguro?', a: 'Anexar o PDF do contrato é opcional, mas ajuda a manter tudo num lugar só. Os arquivos ficam privados e acessíveis apenas por você, através de links temporários e seguros.' },
    { q: 'Posso importar minha lista de convidados de uma planilha?', a: 'Sim. Na aba de convidados você baixa um modelo de planilha, preenche com seus convidados e importa de uma vez. Depois gerencia confirmações, categorias e custos dentro do Ewind.' },
    { q: 'O checklist serve para qualquer tipo de evento?', a: 'Sim. Você cria suas próprias tarefas com prazos calculados a partir da data do evento. Para casamentos, há ainda um botão que sugere uma lista de tarefas pronta para começar.' },
    { q: 'Quando o marketplace de espaços e fornecedores estará disponível?', a: 'O marketplace está em construção. Ele permitirá comparar espaços e fornecedores e solicitar orçamentos sem sair do Ewind. Enquanto isso, a ferramenta de gestão já está 100% disponível.' },
    { q: 'Tenho um espaço ou sou fornecedor. Como funciona para mim?', a: 'Você poderá anunciar no marketplace quando ele abrir — e já pode se cadastrar para ter prioridade. Além de anunciar, vai usar as mesmas ferramentas do Ewind para gerenciar seus próprios contratos, pagamentos e datas com clientes.' },
    { q: 'Meus dados ficam protegidos?', a: 'Sim. Seus eventos, contratos e convidados são privados e visíveis apenas para você. Não vendemos dados e não compartilhamos suas informações com terceiros.' },
  ]

  const currentSteps = audience === 'guest' ? guestSteps : audience === 'host' ? hostSteps : supplierSteps

  return (
    <div style={{ background: '#fff' }}>
      {/* HERO */}
      <section style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfccb 100%)', padding: '60px 24px', textAlign: 'center', borderBottom: '1px solid #e8e8e8' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#5aa800', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.1em' }}>COMO FUNCIONA</div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: '#2d2d2d', marginBottom: 16, lineHeight: 1.2 }}>
            Simples para quem busca. <span style={{ color: '#5aa800' }}>Eficiente para quem anuncia.</span>
          </h1>
          <p style={{ fontSize: 16, color: '#6b7280', maxWidth: 600, margin: '0 auto', lineHeight: 1.7 }}>
            O Ewind conecta diretamente quem precisa de um espaço ou serviço para evento com quem oferece — sem burocracia, sem taxas escondidas e sem complicação.
          </p>
        </div>
      </section>

      {/* TABS */}
      <section style={{ padding: '40px 24px 0', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Para quem é o Ewind?</h2>
          <p style={{ fontSize: 14, color: '#6b7280' }}>Escolha seu perfil para entender como funciona para você</p>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
          {[
            { key: 'guest', icon: '🗓️', label: 'Estou organizando um evento' },
            { key: 'host', icon: '🏢', label: 'Tenho um espaço (em breve)' },
            { key: 'supplier', icon: '🛠️', label: 'Sou fornecedor (em breve)' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setAudience(tab.key as Audience)}
              style={{ padding: '14px 24px', border: audience === tab.key ? '2px solid #a3e635' : '1.5px solid #e8e8e8', borderRadius: 12, background: audience === tab.key ? '#f0fdf4' : '#fff', color: audience === tab.key ? '#1a2e05' : '#2d2d2d', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* STEPS */}
      <section style={{ padding: '0 24px 60px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ background: '#f9fafb', borderRadius: 20, padding: 40 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
              {audience === 'guest' && '🗓️ Para quem organiza um evento'}
              {audience === 'host' && '🏢 Para quem anuncia espaços'}
              {audience === 'supplier' && '🛠️ Para fornecedores de serviços'}
            </h3>
            <p style={{ fontSize: 14, color: '#6b7280' }}>
              {audience === 'guest' && 'Da criação do evento ao grande dia, tudo organizado'}
              {audience === 'host' && 'Anuncie e gerencie seus contratos — marketplace em breve'}
              {audience === 'supplier' && 'Cadastre seu serviço e gerencie seus contratos — em breve'}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {currentSteps.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 20, alignItems: 'flex-start', background: '#fff', padding: 20, borderRadius: 14, border: '1px solid #e8e8e8' }}>
                <div style={{ flexShrink: 0, width: 60, height: 60, background: '#f0fdf4', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                  {step.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#5aa800', background: '#f0fdf4', padding: '3px 10px', borderRadius: 100, letterSpacing: '0.05em' }}>
                      PASSO {i + 1}
                    </span>
                  </div>
                  <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 5 }}>{step.title}</h4>
                  <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 32, textAlign: 'center' }}>
            {audience === 'guest' && (
              <button className="btn-primary" style={{ fontSize: 15, padding: '14px 32px' }} onClick={() => goToPage('events')}>
                🗓️ Criar meu evento grátis
              </button>
            )}
            {audience === 'host' && (
              <button className="btn-primary" style={{ fontSize: 15, padding: '14px 32px' }} onClick={() => goToPage('signup')}>
                🏢 Anunciar meu espaço gratuitamente
              </button>
            )}
            {audience === 'supplier' && (
              <button className="btn-primary" style={{ fontSize: 15, padding: '14px 32px' }} onClick={() => goToPage('signup')}>
                🛠️ Criar meu perfil de fornecedor
              </button>
            )}
          </div>
        </div>
      </section>

      {/* DIFERENCIAIS */}
      <section style={{ padding: '60px 24px', background: '#fafafa', borderTop: '1px solid #e8e8e8' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, textAlign: 'center', marginBottom: 12 }}>Por que usar o Ewind?</h2>
          <p style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 40 }}>A ferramenta que organiza seu evento do início ao fim</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {[
              { icon: '💸', title: 'Grátis para organizar', desc: 'Criar eventos, gerenciar contratos, pagamentos, convidados e checklist não custa nada — e continuará assim.' },
              { icon: '🗂️', title: 'Tudo num lugar só', desc: 'Chega de planilhas espalhadas e mensagens perdidas. Contratos, prazos e convidados num painel único.' },
              { icon: '🔒', title: 'Dados protegidos', desc: 'Seus eventos, contratos e convidados são privados e visíveis apenas para você. Não vendemos seus dados.' },
              { icon: '⚠️', title: 'Nada passa batido', desc: 'Cláusulas de risco destacadas, vencimentos à vista e checklist com prazos calculados a partir da data do evento.' },
            ].map((item, i) => (
              <div key={i} style={{ background: '#fff', padding: 24, borderRadius: 14, border: '1px solid #e8e8e8' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{item.icon}</div>
                <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{item.title}</h4>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '60px 24px', maxWidth: 800, margin: '0 auto' }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, textAlign: 'center', marginBottom: 12 }}>Dúvidas frequentes</h2>
        <p style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 32 }}>Tudo que você precisa saber antes de começar</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{ background: '#fff', border: '1.5px solid #e8e8e8', borderRadius: 12, overflow: 'hidden' }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ width: '100%', padding: '18px 20px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: '#2d2d2d', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <span>{faq.q}</span>
                <span style={{ fontSize: 18, color: '#5aa800', flexShrink: 0 }}>{openFaq === i ? '−' : '+'}</span>
              </button>
              {openFaq === i && (
                <div style={{ padding: '0 20px 18px', fontSize: 14, color: '#6b7280', lineHeight: 1.7, borderTop: '1px solid #f3f4f6', paddingTop: 14 }}>
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
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#a3e635', marginBottom: 16 }}>Pronto para começar?</h2>
          <p style={{ fontSize: 15, color: '#aaa', marginBottom: 28, lineHeight: 1.7 }}>
            Seja para encontrar o espaço ideal, anunciar o seu ou divulgar seus serviços — o Ewind tem o seu lugar.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary" style={{ fontSize: 15, padding: '14px 28px' }} onClick={() => goToPage('listing')}>
              🔍 Buscar espaços
            </button>
            <button style={{ fontSize: 15, padding: '14px 28px', background: 'transparent', border: '2px solid #a3e635', borderRadius: 8, color: '#a3e635', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => goToPage('signup')}>
              🏢 Anunciar espaço
            </button>
            <button style={{ fontSize: 15, padding: '14px 28px', background: 'transparent', border: '2px solid rgba(255,255,255,0.2)', borderRadius: 8, color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => goToPage('signup')}>
              🛠️ Sou fornecedor
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
