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
    { icon: '🔍', title: 'Busque e filtre', desc: 'Pesquise por cidade, tipo de evento, capacidade e faixa de preço. Use os filtros para encontrar o espaço certo para o seu momento.' },
    { icon: '📊', title: 'Compare lado a lado', desc: 'Selecione até 3 espaços e compare preços, capacidade, metragem e atributos em uma tabela clara e objetiva.' },
    { icon: '📝', title: 'Solicite orçamentos gratuitos', desc: 'Envie sua solicitação com data, número de convidados e tipo de evento. É grátis, rápido e sem compromisso.' },
    { icon: '💬', title: 'Receba propostas personalizadas', desc: 'O anunciante responde com proposta e preço final em até 24h. Você decide com quem quer fechar.' },
    { icon: '🎉', title: 'Realize o evento que você imaginou', desc: 'Negocie diretamente com o anunciante escolhido. Sem taxas adicionais, sem intermediação no pagamento.' },
  ]

  const hostSteps = [
    { icon: '✍️', title: 'Cadastre seu espaço gratuitamente', desc: 'Crie sua conta como anunciante e cadastre seu espaço em poucos minutos. Adicione fotos, vídeos, atributos, metragem e preços orientativos.' },
    { icon: '🌐', title: 'Apareça para quem busca', desc: 'Seu espaço entra na vitrine do Ewind e é encontrado por pessoas que já estão prontas para organizar um evento.' },
    { icon: '📨', title: 'Receba solicitações qualificadas', desc: 'As solicitações chegam com data, número de convidados e tipo de evento já informados. Sem perda de tempo com leads frios.' },
    { icon: '💰', title: 'Responda com sua proposta', desc: 'Envie um orçamento personalizado com texto e valor. Você controla cada negociação do início ao fim.' },
    { icon: '📈', title: 'Gerencie tudo pelo painel', desc: 'Edite informações, atualize fotos, pause o anúncio quando precisar e reative quando quiser. Controle total nas suas mãos.' },
  ]

  const supplierSteps = [
    { icon: '✍️', title: 'Crie seu perfil profissional', desc: 'Cadastre-se na área exclusiva de fornecedores. Selecione sua especialidade — fotografia, DJ, buffet, decoração, cerimonialista e muito mais.' },
    { icon: '📋', title: 'Monte seu portfólio', desc: 'Adicione fotos e vídeos do seu trabalho, descreva seus serviços, informe cidades de atendimento, faixa de preço e seus diferenciais.' },
    { icon: '🌐', title: 'Seja encontrado por quem organiza eventos', desc: 'Seu perfil aparece na listagem de fornecedores filtrada por categoria, cidade e tipo de evento. Visibilidade qualificada.' },
    { icon: '💬', title: 'Receba contatos diretos', desc: 'Clientes entram em contato pelo seu WhatsApp, Instagram ou email diretamente no seu perfil. Sem intermediários, sem comissão.' },
    { icon: '📈', title: 'Gerencie seu perfil a qualquer momento', desc: 'Atualize fotos, preços e informações sempre que quiser. Pause quando precisar e reative quando estiver disponível.' },
  ]

  const faqs = [
    { q: 'O Ewind é gratuito para quem busca um espaço?', a: 'Sim, 100% gratuito. Você pesquisa, compara e solicita quantos orçamentos quiser sem pagar nada. O Ewind não cobra taxas sobre orçamentos ou negociações.' },
    { q: 'Como funciona o pagamento pelo espaço?', a: 'O Ewind não intermedia pagamentos. Você negocia e paga diretamente com o anunciante escolhido, combinando forma de pagamento, sinal e condições entre vocês.' },
    { q: 'Posso solicitar orçamentos em vários espaços ao mesmo tempo?', a: 'Sim! Você pode solicitar quantos orçamentos quiser, em espaços diferentes, ao mesmo tempo. Compare as propostas e escolha a que faz mais sentido para o seu evento.' },
    { q: 'Quanto tempo leva para receber um orçamento?', a: 'Depende de cada anunciante, mas a maioria responde em até 24 horas. Você acompanha o status de cada solicitação no seu painel em tempo real.' },
    { q: 'As informações do meu evento ficam protegidas?', a: 'Seus dados são compartilhados apenas com o anunciante do espaço que você solicitou o orçamento. Não vendemos dados e não compartilhamos informações com terceiros.' },
    { q: 'Sou dono de um espaço. Como começo a anunciar?', a: 'Crie sua conta como "Tenho um espaço para locar", cadastre seu espaço com fotos, atributos e preços, e seu anúncio entra na vitrine imediatamente. Gratuito para começar.' },
    { q: 'Posso pausar meu anúncio quando estiver sem disponibilidade?', a: 'Sim. No painel do anunciante você pode pausar o espaço a qualquer momento — ele sai da listagem pública mas mantém todos os dados. Reative quando quiser.' },
    { q: 'Sou fotógrafo, DJ ou outro fornecedor de serviços. O Ewind é para mim também?', a: 'Sim! O Ewind tem uma área exclusiva para fornecedores de serviços para eventos. Crie seu perfil, exiba seu portfólio e seja encontrado por quem organiza eventos na sua cidade.' },
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
            { key: 'guest', icon: '🎉', label: 'Quero um espaço para meu evento' },
            { key: 'host', icon: '🏢', label: 'Tenho um espaço para anunciar' },
            { key: 'supplier', icon: '🛠️', label: 'Ofereço serviços para eventos' },
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
              {audience === 'guest' && '🎉 Para quem busca um espaço'}
              {audience === 'host' && '🏢 Para quem anuncia espaços'}
              {audience === 'supplier' && '🛠️ Para fornecedores de serviços'}
            </h3>
            <p style={{ fontSize: 14, color: '#6b7280' }}>
              {audience === 'guest' && 'Do primeiro clique até o evento realizado'}
              {audience === 'host' && 'Do cadastro ao fechamento do negócio'}
              {audience === 'supplier' && 'Do perfil à contratação direta'}
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
              <button className="btn-primary" style={{ fontSize: 15, padding: '14px 32px' }} onClick={() => goToPage('listing')}>
                🔍 Buscar espaços agora
              </button>
            )}
            {audience === 'host' && (
              <button className="btn-primary" style={{ fontSize: 15, padding: '14px 32px' }} onClick={() => goToPage('signup')}>
                🏢 Anunciar meu espaço gratuitamente
              </button>
            )}
            {audience === 'supplier' && (
              <button className="btn-primary" style={{ fontSize: 15, padding: '14px 32px' }} onClick={() => goToPage('supplier-signup')}>
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
          <p style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 40 }}>Uma plataforma pensada para ser justa para todos os lados</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {[
              { icon: '💸', title: 'Sem taxas escondidas', desc: 'Quem busca usa de graça. Quem anuncia não paga comissão. O que você negocia é o que você paga.' },
              { icon: '⚡', title: 'Orçamentos em até 24h', desc: 'Anunciantes recebem notificação imediata e respondem com proposta personalizada rapidamente.' },
              { icon: '🔒', title: 'Dados protegidos', desc: 'Suas informações são compartilhadas apenas com os anunciantes dos espaços que você selecionou.' },
              { icon: '🎯', title: 'Comunicação direta', desc: 'Fale diretamente com o dono do espaço ou fornecedor. Sem call centers, sem robôs, sem intermediários.' },
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
            <button style={{ fontSize: 15, padding: '14px 28px', background: 'transparent', border: '2px solid rgba(255,255,255,0.2)', borderRadius: 8, color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => goToPage('supplier-signup')}>
              🛠️ Sou fornecedor
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
