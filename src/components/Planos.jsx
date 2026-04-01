const mensagemUpgrade =
  'Olá, quero fazer upgrade para o plano Pro do sistema de gestão de clientes e cobranças.'

function abrirWhatsAppUpgrade() {
  const link = `https://wa.me/?text=${encodeURIComponent(mensagemUpgrade)}`

  window.open(link, '_blank')
}

export default function Planos({
  clientesUsados,
  limiteClientes,
  onVoltarPainel,
}) {
  return (
    <div className="app-shell planos-shell">
      <header className="planos-header">
        <div className="planos-header-content">
          <span className="app-kicker">Planos</span>
          <h1>Escolha o plano ideal para sua operação</h1>
          <p>
            Comece com o plano grátis e evolua para mais capacidade, mais
            flexibilidade e uma experiência ainda mais completa.
          </p>
        </div>

        <div className="planos-header-side">
          <div className="plan-usage-card">
            <span className="summary-label">Uso do plano</span>
            <span className="plan-usage-value">
              Plano grátis • {clientesUsados} / {limiteClientes} clientes
            </span>
          </div>

          <button
            type="button"
            className="button button-ghost"
            onClick={onVoltarPainel}
          >
            Voltar ao painel
          </button>
        </div>
      </header>

      <main className="app-content">
        <section className="planos-grid">
          <article className="plano-card">
            <span className="section-tag">Plano grátis</span>
            <h2>Comece com o essencial</h2>
            <p className="plano-description">
              Ideal para organizar a operação inicial e acompanhar cobranças com
              agilidade.
            </p>

            <div className="plano-highlight">
              <strong>Até {limiteClientes} clientes</strong>
              <span>Perfeito para validar o processo e começar a operar.</span>
            </div>

            <ul className="plano-list">
              <li>Até 20 clientes</li>
              <li>Dashboard básico</li>
              <li>Cobrança por WhatsApp</li>
              <li>Ideal para começar</li>
            </ul>

            <button
              type="button"
              className="button button-secondary plano-button-current"
              disabled
            >
              Plano atual
            </button>
          </article>

          <article className="plano-card plano-card-pro">
            <span className="section-tag">Plano Pro</span>
            <h2>Escale sua gestão com mais liberdade</h2>
            <p className="plano-description">
              Ganhe espaço para crescer sem limites e tenha acesso prioritário
              às próximas evoluções do produto.
            </p>

            <div className="plano-highlight plano-highlight-pro">
              <strong>Clientes ilimitados</strong>
              <span>Mais capacidade para expandir sua carteira com confiança.</span>
            </div>

            <ul className="plano-list">
              <li>Clientes ilimitados</li>
              <li>Gestão sem limite</li>
              <li>Acesso prioritário a novos recursos</li>
              <li>Experiência mais completa</li>
            </ul>

            <button
              type="button"
              className="button button-primary"
              onClick={abrirWhatsAppUpgrade}
            >
              Quero fazer upgrade
            </button>
          </article>
        </section>
      </main>
    </div>
  )
}
