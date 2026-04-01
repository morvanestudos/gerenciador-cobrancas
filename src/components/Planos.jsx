const mensagemUpgrade =
  'Olá, quero fazer upgrade para o plano Pro do sistema de gestão de clientes e cobranças.'

function abrirWhatsAppUpgrade() {
  const link = `https://wa.me/?text=${encodeURIComponent(mensagemUpgrade)}`

  window.open(link, '_blank')
}

export default function Planos({
  clientesUsados,
  limiteClientes,
  percentualUsoPlano,
  nomeUsuario,
  estaProximoDoLimite,
  atingiuLimitePlano,
  onVoltarPainel,
}) {
  const mensagemUsoPlano = atingiuLimitePlano
    ? 'Seu plano grátis chegou ao limite. Ative o Pro para liberar clientes ilimitados e continuar ampliando sua carteira sem bloqueios.'
    : estaProximoDoLimite
      ? 'Sua operação já está perto do limite atual. Garanta espaço para continuar crescendo com clientes ilimitados.'
      : ''

  return (
    <div className="app-shell planos-shell">
      <header className="planos-header">
        <div className="planos-header-content">
          <span className="app-user-greeting">Olá, {nomeUsuario} 👋</span>
          <span className="app-kicker">Planos</span>
          <h1>Escolha o plano ideal para sua operação</h1>
          <p>
            Continue no plano grátis para operações iniciais ou desbloqueie
            mais capacidade para crescer com liberdade e consistência.
          </p>
        </div>

        <div className="planos-header-side">
          <div
            className={`plan-usage-card ${
              atingiuLimitePlano
                ? 'plan-usage-card-critical'
                : estaProximoDoLimite
                  ? 'plan-usage-card-warning'
                  : ''
            }`}
          >
            <span className="summary-label">Uso do plano</span>
            <span className="plan-usage-value">
              Plano grátis • {clientesUsados} / {limiteClientes} clientes
            </span>
            <div className="plan-usage-progress" aria-hidden="true">
              <span
                className="plan-usage-progress-bar"
                style={{ width: `${percentualUsoPlano}%` }}
              />
            </div>
          </div>

          {mensagemUsoPlano && (
            <div
              className={`planos-usage-note ${
                atingiuLimitePlano
                  ? 'planos-usage-note-critical'
                  : 'planos-usage-note-warning'
              }`}
            >
              {mensagemUsoPlano}
            </div>
          )}

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
            <div className="plano-header-row">
              <span className="section-tag">Plano grátis</span>
            </div>
            <h2>Comece com o essencial</h2>
            <p className="plano-description">
              Ideal para organizar a operação inicial e acompanhar cobranças com
              agilidade, mantendo visibilidade da carteira e do fluxo de
              recebimentos.
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
            <div className="plano-header-row">
              <span className="section-tag">Plano Pro</span>
              <span className="plano-badge-popular">Mais escolhido</span>
            </div>
            <h2>Escale sua gestão com mais liberdade</h2>
            <p className="plano-description">
              Ideal para operações em crescimento que precisam ampliar a
              carteira, evitar bloqueios e manter o time focado no avanço do
              negócio.
            </p>

            <div className="plano-highlight plano-highlight-pro">
              <strong>Clientes ilimitados</strong>
              <span>Mais liberdade para crescer sem travar sua operação.</span>
            </div>

            <ul className="plano-list">
              <li>Clientes ilimitados</li>
              <li>Gestão sem limite para acompanhar seu crescimento</li>
              <li>Acesso prioritário a novos recursos</li>
              <li>Mais liberdade para expandir sua carteira</li>
              <li>Experiência mais completa para operar com confiança</li>
            </ul>

            <button
              type="button"
              className="button button-primary"
              onClick={abrirWhatsAppUpgrade}
            >
              Desbloquear clientes ilimitados
            </button>
          </article>
        </section>
      </main>
    </div>
  )
}
