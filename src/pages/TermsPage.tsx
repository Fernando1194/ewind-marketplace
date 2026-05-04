import { useState } from 'react'
import type { Page } from '../App'

interface Props {
  goToPage: (page: Page) => void
}

export default function TermsPage({ goToPage }: Props) {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>('terms')

  return (
    <div style={{ background: '#f9fafb', minHeight: 'calc(100vh - 64px)' }}>

      {/* HEADER */}
      <div style={{ background: '#1a1a1a', padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#a3e635', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          DOCUMENTOS LEGAIS
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 12 }}>
          Termos e Privacidade
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', maxWidth: 500, margin: '0 auto' }}>
          Documentos que regem o uso da plataforma Ewind. Leia com atenção antes de utilizar nossos serviços.
        </p>
        <div style={{ marginTop: 16, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
          Última atualização: Maio de 2025
        </div>
      </div>

      {/* TABS */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e8e8e8', padding: '0 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', gap: 0 }}>
          {[
            { key: 'terms', label: '📋 Termos de Uso' },
            { key: 'privacy', label: '🔒 Política de Privacidade' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as 'terms' | 'privacy')}
              style={{
                padding: '16px 24px', fontSize: 14, fontWeight: 600, border: 'none', background: 'none',
                borderBottom: activeTab === tab.key ? '3px solid #a3e635' : '3px solid transparent',
                color: activeTab === tab.key ? '#2d2d2d' : '#9ca3af', cursor: 'pointer', fontFamily: 'inherit'
              }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8e8e8', padding: '40px 48px' }}>

          {/* ===== TERMOS DE USO ===== */}
          {activeTab === 'terms' && (
            <div style={{ lineHeight: 1.8 }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Termos de Uso</h2>
              <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 32 }}>Vigência: a partir de Maio de 2025</p>

              <Section title="1. Aceitação dos Termos">
                Ao acessar ou utilizar a plataforma Ewind ("Plataforma"), você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não poderá utilizar nossos serviços. O uso continuado da Plataforma após alterações constitui aceitação das modificações.
              </Section>

              <Section title="2. Descrição dos Serviços">
                A Ewind é uma plataforma digital que conecta pessoas que buscam espaços para eventos com anunciantes de espaços e fornecedores de serviços para eventos. A Ewind atua exclusivamente como intermediadora, não sendo parte das negociações, contratos ou transações realizadas entre usuários.
              </Section>

              <Section title="3. Cadastro e Conta">
                Para utilizar determinadas funcionalidades da Plataforma, é necessário criar uma conta. Você se compromete a:
                <ul style={{ marginLeft: 20, marginTop: 8 }}>
                  <li>Fornecer informações verdadeiras, precisas e completas;</li>
                  <li>Manter seus dados de acesso em sigilo;</li>
                  <li>Notificar imediatamente a Ewind sobre qualquer uso não autorizado da sua conta;</li>
                  <li>Ser responsável por todas as atividades realizadas em sua conta.</li>
                </ul>
              </Section>

              <Section title="4. Anúncios e Conteúdo">
                Anunciantes (hosts e fornecedores) são inteiramente responsáveis pelo conteúdo publicado, incluindo fotos, descrições, preços e disponibilidade. A Ewind não garante a veracidade das informações e não se responsabiliza por eventuais inconsistências. A Ewind reserva-se o direito de remover anúncios que violem estes termos.
              </Section>

              <Section title="5. Orçamentos e Negociações">
                O sistema de orçamentos é uma ferramenta de comunicação entre usuários. A Ewind não participa das negociações, não intermedia pagamentos e não é responsável por acordos firmados entre as partes. Contratos, pagamentos e condições são definidos diretamente entre o cliente e o anunciante.
              </Section>

              <Section title="6. Uso Adequado">
                É proibido utilizar a Plataforma para:
                <ul style={{ marginLeft: 20, marginTop: 8 }}>
                  <li>Publicar informações falsas ou enganosas;</li>
                  <li>Praticar qualquer forma de fraude ou estelionato;</li>
                  <li>Assediar, ameaçar ou prejudicar outros usuários;</li>
                  <li>Violar direitos de propriedade intelectual de terceiros;</li>
                  <li>Realizar atividades ilegais ou contrárias à ordem pública.</li>
                </ul>
              </Section>

              <Section title="7. Isenção de Responsabilidade">
                A Ewind não se responsabiliza por:
                <ul style={{ marginLeft: 20, marginTop: 8 }}>
                  <li>Danos decorrentes de negociações entre usuários;</li>
                  <li>Qualidade, segurança ou legalidade dos espaços e serviços anunciados;</li>
                  <li>Falhas de comunicação entre as partes;</li>
                  <li>Perdas financeiras decorrentes de cancelamentos ou inadimplências;</li>
                  <li>Interrupções temporárias no funcionamento da Plataforma.</li>
                </ul>
              </Section>

              <Section title="8. Propriedade Intelectual">
                Todo o conteúdo da Plataforma — incluindo marca, logotipo, design, textos e funcionalidades — é propriedade da Ewind e protegido por lei. É vedada a reprodução, distribuição ou modificação sem autorização expressa.
              </Section>

              <Section title="9. Encerramento de Conta">
                A Ewind pode suspender ou encerrar sua conta a qualquer momento em caso de violação destes termos. Você também pode solicitar o encerramento da sua conta a qualquer momento via e-mail para contato@ewind.com.br.
              </Section>

              <Section title="10. Alterações nos Termos">
                A Ewind poderá alterar estes Termos a qualquer momento. Usuários serão notificados sobre mudanças significativas. O uso continuado da Plataforma após as alterações constitui aceitação dos novos termos.
              </Section>

              <Section title="11. Legislação Aplicável">
                Estes Termos são regidos pelas leis brasileiras. Fica eleito o foro da Comarca de Curitiba - PR para dirimir eventuais conflitos.
              </Section>

              <Section title="12. Contato">
                Para dúvidas sobre estes Termos, entre em contato: <strong>contato@ewind.com.br</strong>
              </Section>
            </div>
          )}

          {/* ===== POLÍTICA DE PRIVACIDADE ===== */}
          {activeTab === 'privacy' && (
            <div style={{ lineHeight: 1.8 }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Política de Privacidade</h2>
              <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 32 }}>Em conformidade com a LGPD (Lei 13.709/2018)</p>

              <Section title="1. Informações que Coletamos">
                <strong>Dados fornecidos por você:</strong>
                <ul style={{ marginLeft: 20, marginTop: 8, marginBottom: 12 }}>
                  <li>Nome completo e email (cadastro)</li>
                  <li>Informações do anúncio (espaço ou serviço)</li>
                  <li>Mensagens enviadas via sistema de orçamentos</li>
                  <li>Contatos de redes sociais (WhatsApp, Instagram, etc.)</li>
                </ul>
                <strong>Dados coletados automaticamente:</strong>
                <ul style={{ marginLeft: 20, marginTop: 8 }}>
                  <li>Endereço IP e tipo de dispositivo</li>
                  <li>Páginas acessadas e tempo de navegação</li>
                  <li>Dados de uso da plataforma (cliques, buscas)</li>
                </ul>
              </Section>

              <Section title="2. Como Usamos seus Dados">
                Utilizamos seus dados para:
                <ul style={{ marginLeft: 20, marginTop: 8 }}>
                  <li>Criar e gerenciar sua conta;</li>
                  <li>Facilitar a comunicação entre usuários;</li>
                  <li>Melhorar a experiência e os serviços da Plataforma;</li>
                  <li>Enviar comunicações relacionadas à sua conta (quando autorizado);</li>
                  <li>Cumprir obrigações legais e regulatórias;</li>
                  <li>Prevenir fraudes e garantir a segurança da Plataforma.</li>
                </ul>
              </Section>

              <Section title="3. Compartilhamento de Dados">
                <strong>Compartilhamos seus dados somente:</strong>
                <ul style={{ marginLeft: 20, marginTop: 8 }}>
                  <li>Com o anunciante do espaço quando você solicita um orçamento (nome, email e mensagem);</li>
                  <li>Com provedores de serviços técnicos (ex: Supabase para banco de dados);</li>
                  <li>Quando exigido por lei ou autoridade competente.</li>
                </ul>
                <br />
                <strong>Nunca vendemos ou compartilhamos seus dados com fins publicitários.</strong>
              </Section>

              <Section title="4. Segurança dos Dados">
                Adotamos medidas técnicas e organizacionais para proteger seus dados contra acesso não autorizado, alteração, divulgação ou destruição. Utilizamos criptografia SSL, autenticação segura e controle de acesso por funções (RLS).
              </Section>

              <Section title="5. Retenção de Dados">
                Mantemos seus dados enquanto sua conta estiver ativa. Após o encerramento, dados podem ser retidos por até 5 anos para cumprimento de obrigações legais, conforme exigido pela legislação brasileira.
              </Section>

              <Section title="6. Seus Direitos (LGPD)">
                Conforme a Lei Geral de Proteção de Dados, você tem direito a:
                <ul style={{ marginLeft: 20, marginTop: 8 }}>
                  <li><strong>Acesso:</strong> Saber quais dados temos sobre você;</li>
                  <li><strong>Correção:</strong> Atualizar dados incorretos ou desatualizados;</li>
                  <li><strong>Exclusão:</strong> Solicitar a remoção dos seus dados;</li>
                  <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado;</li>
                  <li><strong>Revogação:</strong> Retirar o consentimento a qualquer momento;</li>
                  <li><strong>Oposição:</strong> Opor-se ao tratamento de dados.</li>
                </ul>
                <br />
                Para exercer seus direitos, entre em contato: <strong>privacidade@ewind.com.br</strong>
              </Section>

              <Section title="7. Cookies">
                Utilizamos cookies essenciais para o funcionamento da Plataforma (autenticação e preferências). Não utilizamos cookies para rastreamento publicitário. Você pode configurar seu navegador para recusar cookies, o que pode afetar algumas funcionalidades.
              </Section>

              <Section title="8. Dados de Menores">
                Nossa Plataforma não é destinada a menores de 18 anos. Não coletamos intencionalmente dados de menores. Se identificarmos tal situação, os dados serão imediatamente excluídos.
              </Section>

              <Section title="9. Encarregado de Dados (DPO)">
                Responsável pela proteção de dados: <strong>Fernando Vieira</strong><br />
                Contato: <strong>privacidade@ewind.com.br</strong>
              </Section>

              <Section title="10. Alterações nesta Política">
                Esta Política pode ser atualizada periodicamente. Notificaremos usuários sobre mudanças significativas por email ou aviso na Plataforma. A data de última atualização sempre estará visível no topo deste documento.
              </Section>
            </div>
          )}
        </div>

        {/* VOLTAR */}
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <button onClick={() => goToPage('home')}
            style={{ fontSize: 14, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            ← Voltar para a home
          </button>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#2d2d2d', marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid #f3f4f6' }}>
        {title}
      </h3>
      <div style={{ fontSize: 14, color: '#4b5563' }}>{children}</div>
    </div>
  )
}
