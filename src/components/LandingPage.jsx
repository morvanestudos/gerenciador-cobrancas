const numeroWhatsAppComercial = '5521979033256'
const mensagemWhatsAppComercial =
  'Olá, quero conhecer o sistema de gestão de clientes e cobranças.'

const dores = [
  {
    titulo: 'Cobranças espalhadas',
    texto:
      'Mensagens soltas, anotações em papel e planilhas acabam tirando o controle da operação.',
  },
  {
    titulo: 'Pagamentos difíceis de acompanhar',
    texto:
      'Sem uma visão clara do que entrou e do que falta receber, as cobranças ficam atrasadas.',
  },
  {
    titulo: 'Muito tempo perdido no manual',
    texto:
      'Cobrar um cliente por vez, montando mensagem na mão, trava a rotina e reduz produtividade.',
  },
]

const beneficios = [
  {
    titulo: 'Cadastro de clientes',
    texto: 'Organize sua carteira em um só lugar, com dados sempre acessíveis.',
  },
  {
    titulo: 'Controle de pagamentos',
    texto: 'Acompanhe quem pagou, quem está pendente e o que ainda precisa cobrar.',
  },
  {
    titulo: 'Cobrança rápida por WhatsApp',
    texto: 'Abra a conversa já com mensagem pronta e acelere o contato com o cliente.',
  },
  {
    titulo: 'Visão clara do financeiro',
    texto: 'Tenha um resumo simples e visual do que foi recebido e do que ainda entra.',
  },
]

function abrirWhatsAppComercial() {
  const link = `https://wa.me/${numeroWhatsAppComercial}?text=${encodeURIComponent(mensagemWhatsAppComercial)}`

  window.open(link, '_blank')
}

export default function LandingPage({ onComecarGratis, onAbrirLogin }) {
  return (
    <div className="landing-shell">
      <div className="landing-container">
        <header className="landing-header">
          <div className="landing-brand">
            <span className="app-kicker">SaaS de cobrança</span>
            <strong>Gestão de Clientes e Cobranças</strong>
          </div>

          <nav className="landing-nav" aria-label="Navegação principal">
            <a className="landing-nav-link" href="#beneficios">
              Benefícios
            </a>
            <a className="landing-nav-link" href="#planos">
              Planos
            </a>
            <button
              type="button"
              className="button button-ghost landing-nav-button"
              onClick={onAbrirLogin}
            >
              Entrar no painel
            </button>
          </nav>
        </header>

        <main className="landing-main">
          <section className="landing-hero">
            <div className="landing-hero-copy">
              <div className="landing-pill-row">
                <span className="landing-pill">Plano grátis com 7 clientes</span>
                <span className="landing-pill landing-pill-accent">
                  Plano Pro por R$ 14,99/mês
                </span>
              </div>

              <h1>Organize clientes, cobranças e mensagens em um só lugar</h1>
              <p>
                Um sistema simples e profissional para acompanhar pagamentos,
                cobrar mais rápido pelo WhatsApp e ter clareza do seu financeiro
                sem depender de planilhas improvisadas.
              </p>

              <div className="landing-hero-actions">
                <button
                  type="button"
                  className="button button-primary landing-cta-main"
                  onClick={onComecarGratis}
                >
                  Começar grátis
                </button>
                <button
                  type="button"
                  className="button button-whatsapp landing-cta-whatsapp"
                  onClick={abrirWhatsAppComercial}
                >
                  Falar no WhatsApp
                </button>
              </div>

              <div className="landing-proof-grid">
                <article className="landing-proof-card">
                  <strong>Até 7 clientes grátis</strong>
                  <span>Perfeito para testar o sistema na prática.</span>
                </article>
                <article className="landing-proof-card">
                  <strong>Cobrança em segundos</strong>
                  <span>Abra o WhatsApp com mensagem pronta para agilizar o contato.</span>
                </article>
                <article className="landing-proof-card">
                  <strong>R$ 14,99/mês no Pro</strong>
                  <span>Clientes ilimitados e acesso às próximas melhorias.</span>
                </article>
              </div>
            </div>

            <aside className="landing-hero-panel">
              <div className="landing-preview-card">
                <span className="landing-preview-kicker">Visão da operação</span>
                <strong>Mais organização para cobrar com confiança</strong>

                <div className="landing-preview-metrics">
                  <article>
                    <span>A receber</span>
                    <strong>Controle visual</strong>
                  </article>
                  <article>
                    <span>Recebido</span>
                    <strong>Fluxo claro</strong>
                  </article>
                  <article>
                    <span>Contato</span>
                    <strong>WhatsApp rápido</strong>
                  </article>
                </div>

                <div className="landing-preview-list">
                  <div className="landing-preview-item">
                    <span className="landing-preview-dot" />
                    <p>Cadastre clientes e acompanhe vencimentos sem planilhas.</p>
                  </div>
                  <div className="landing-preview-item">
                    <span className="landing-preview-dot" />
                    <p>Veja quem pagou e quem ainda precisa de cobrança.</p>
                  </div>
                  <div className="landing-preview-item">
                    <span className="landing-preview-dot" />
                    <p>Ganhe agilidade com mensagens prontas no WhatsApp.</p>
                  </div>
                </div>
              </div>
            </aside>
          </section>

          <section className="landing-section">
            <div className="landing-section-heading">
              <span className="section-tag">Problema</span>
              <h2>Cobrar clientes no manual gera atraso, retrabalho e falta de controle</h2>
              <p>
                Quando a operação depende de memória, papel, caderno ou planilha
                solta, fica mais difícil acompanhar pagamentos e manter a
                cobrança em dia.
              </p>
            </div>

            <div className="landing-card-grid">
              {dores.map((dor) => (
                <article key={dor.titulo} className="landing-info-card">
                  <strong>{dor.titulo}</strong>
                  <p>{dor.texto}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="landing-section landing-solution-section">
            <div className="landing-section-heading">
              <span className="section-tag">Solução</span>
              <h2>O sistema centraliza clientes, cobranças e contato em um fluxo simples</h2>
              <p>
                Em vez de correr atrás das informações, você acompanha tudo em
                um painel organizado e cobra com muito mais rapidez.
              </p>
            </div>

            <div className="landing-solution-grid">
              <article className="landing-solution-card">
                <span className="landing-step-number">1</span>
                <strong>Cadastre seus clientes</strong>
                <p>Guarde nome, telefone, valor e vencimento sem complicação.</p>
              </article>

              <article className="landing-solution-card">
                <span className="landing-step-number">2</span>
                <strong>Acompanhe pagamentos</strong>
                <p>Saiba rapidamente o que está pendente e o que já entrou.</p>
              </article>

              <article className="landing-solution-card">
                <span className="landing-step-number">3</span>
                <strong>Cobre pelo WhatsApp</strong>
                <p>Fale com o cliente com mensagem pronta e sem perder tempo.</p>
              </article>
            </div>
          </section>

          <section className="landing-section" id="beneficios">
            <div className="landing-section-heading">
              <span className="section-tag">Benefícios</span>
              <h2>Mais clareza, mais agilidade e mais controle no dia a dia</h2>
              <p>
                O produto foi desenhado para ajudar quem precisa vender, cobrar
                e acompanhar a carteira de clientes com rapidez.
              </p>
            </div>

            <div className="landing-benefits-grid">
              {beneficios.map((beneficio) => (
                <article key={beneficio.titulo} className="landing-benefit-card">
                  <strong>{beneficio.titulo}</strong>
                  <p>{beneficio.texto}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="landing-section" id="planos">
            <div className="landing-section-heading">
              <span className="section-tag">Planos</span>
              <h2>Comece grátis e evolua para o mensal quando precisar de mais escala</h2>
              <p>
                Você pode testar o sistema com segurança e migrar para o Pro
                assim que quiser operar sem limite de clientes.
              </p>
            </div>

            <div className="landing-plans-grid">
              <article className="landing-plan-card">
                <span className="section-tag">Plano grátis</span>
                <h3>Ideal para testar o sistema</h3>
                <div className="landing-plan-price">
                  <strong>R$ 0</strong>
                  <span>até 7 clientes</span>
                </div>
                <p>
                  Perfeito para validar sua rotina de cobrança e conhecer o
                  sistema antes de escalar.
                </p>
                <ul className="landing-plan-list">
                  <li>Até 7 clientes</li>
                  <li>Cadastro organizado</li>
                  <li>Dashboard básico</li>
                  <li>Cobrança rápida por WhatsApp</li>
                </ul>
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={onComecarGratis}
                >
                  Começar grátis
                </button>
              </article>

              <article className="landing-plan-card landing-plan-card-pro">
                <div className="landing-plan-header">
                  <span className="section-tag">Plano Pro</span>
                  <span className="landing-plan-badge">Mais escolhido</span>
                </div>
                <h3>Mais liberdade para crescer sem travar a operação</h3>
                <div className="landing-plan-price">
                  <strong>R$ 14,99</strong>
                  <span>por mês</span>
                </div>
                <p>
                  Uma assinatura mensal acessível para quem quer clientes
                  ilimitados, continuidade na operação e acesso às melhorias
                  futuras do produto.
                </p>
                <ul className="landing-plan-list">
                  <li>Clientes ilimitados</li>
                  <li>Assinatura mensal</li>
                  <li>Rotina sem bloqueios de crescimento</li>
                  <li>Acesso às melhorias futuras</li>
                </ul>
                <button
                  type="button"
                  className="button button-primary"
                  onClick={abrirWhatsAppComercial}
                >
                  Assinar Pro por R$ 14,99/mês
                </button>
              </article>
            </div>
          </section>

          <section className="landing-final-cta">
            <div className="landing-final-copy">
              <span className="section-tag">Comece agora</span>
              <h2>Teste grátis, organize sua cobrança e evolua para o Pro quando quiser</h2>
              <p>
                Comece com até 7 clientes grátis e, quando sua operação pedir
                mais capacidade, avance para o plano mensal de R$ 14,99.
              </p>
            </div>

            <div className="landing-final-actions">
              <button
                type="button"
                className="button button-primary"
                onClick={onComecarGratis}
              >
                Começar grátis
              </button>
              <button
                type="button"
                className="button button-whatsapp"
                onClick={abrirWhatsAppComercial}
              >
                Falar no WhatsApp
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
