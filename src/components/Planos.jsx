const mensagemUpgrade =
  'Olá, quero assinar o plano Pro mensal de R$ 14,99 do sistema de gestão de clientes e cobranças.'
const numeroWhatsAppUpgrade = '5521979033256'
const precoPlanoPro = 'R$ 14,99/mês'

function abrirWhatsAppUpgrade() {
  const link = `https://wa.me/${numeroWhatsAppUpgrade}?text=${encodeURIComponent(mensagemUpgrade)}`

  window.open(link, '_blank')
}

export default function Planos({
  planoUsuario,
  clientesUsados,
  limiteClientes,
  percentualUsoPlano,
  nomeUsuario,
  estaProximoDoLimite,
  atingiuLimitePlano,
  onVoltarPainel,
}) {
  const usuarioPro = planoUsuario === 'pro'
  const mensagemUsoPlano = atingiuLimitePlano
    ? `Seu plano grátis chegou ao limite de ${limiteClientes} clientes. Assine o Pro por ${precoPlanoPro} para continuar usando o sistema sem bloqueios.`
    : estaProximoDoLimite
      ? `Sua operação já está perto do limite de ${limiteClientes} clientes do plano grátis. Garanta mais espaço com o Pro por ${precoPlanoPro}.`
      : ''
  const resumoPlanoAtual = usuarioPro
    ? `Plano Pro • ${precoPlanoPro} • Clientes ilimitados`
    : `Plano grátis • ${clientesUsados} / ${limiteClientes} clientes`

  return (
    <div className="app-shell planos-shell">
      <header className="planos-header">
        <div className="planos-header-content">
          <span className="app-user-greeting">Olá, {nomeUsuario} 👋</span>
          <h1>Escolha o plano ideal para sua operação</h1>
          <p>
            Comece com o plano grátis para testar o sistema e evolua para o
            Pro mensal quando quiser operar com clientes ilimitados e acesso
            às melhorias futuras.
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
            <span className="summary-label">Plano atual</span>
            <span className="plan-usage-value">{resumoPlanoAtual}</span>
            {!usuarioPro && (
              <div className="plan-usage-progress" aria-hidden="true">
                <span
                  className="plan-usage-progress-bar"
                  style={{ width: `${percentualUsoPlano}%` }}
                />
              </div>
            )}
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
            <h2>Comece com o essencial</h2>
            <p className="plano-description">
              Ideal para testar o sistema, organizar os primeiros clientes e
              validar sua operação com uma rotina simples e profissional.
            </p>

            <div className="plano-highlight">
              <strong>Até {limiteClientes} clientes</strong>
              <span>Perfeito para testar o sistema antes de escalar.</span>
            </div>

            <ul className="plano-list">
              <li>Até {limiteClientes} clientes</li>
              <li>Dashboard básico</li>
              <li>Cobrança por WhatsApp</li>
              <li>Ideal para testar o sistema</li>
            </ul>

            <button
              type="button"
              className="button button-secondary plano-button-current"
              disabled
            >
              {usuarioPro ? 'Plano disponível' : 'Plano atual'}
            </button>
          </article>

          <article className="plano-card plano-card-pro">
            <div className="plano-header-row">
              <span className="plano-badge-popular">Mais escolhido</span>
            </div>
            <h2>Escale sua gestão com mais liberdade</h2>
            <p className="plano-description">
              Um plano mensal pensado para quem quer crescer com consistência,
              evitar bloqueios no cadastro e acompanhar a evolução do produto.
            </p>

            <div className="plano-highlight plano-highlight-pro">
              <strong>{precoPlanoPro}</strong>
              <span>
                Assinatura mensal com clientes ilimitados e acesso às melhorias
                futuras.
              </span>
            </div>

            <ul className="plano-list">
              <li>{precoPlanoPro}</li>
              <li>Assinatura mensal</li>
              <li>Clientes ilimitados</li>
              <li>Gestão sem limite para acompanhar seu crescimento</li>
              <li>Acesso às melhorias futuras</li>
            </ul>

            {usuarioPro ? (
              <button
                type="button"
                className="button button-primary plano-button-current"
                disabled
              >
                Plano atual
              </button>
            ) : (
              <button
                type="button"
                className="button button-primary"
                onClick={abrirWhatsAppUpgrade}
              >
                Assinar Pro por {precoPlanoPro}
              </button>
            )}
          </article>
        </section>
      </main>
    </div>
  )
}
