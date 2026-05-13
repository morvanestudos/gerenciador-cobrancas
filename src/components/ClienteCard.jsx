const statusLabel = {
  pendente: 'Pendente',
  pago: 'Pago',
  atrasado: 'Atrasado',
}

export default function ClienteCard({
  cliente,
  clienteExcluindoId,
  clienteAtualizandoStatusId,
  onDeleteCliente,
  onEditCliente,
  onOpenWhatsApp,
  onToggleStatus,
}) {
  const iniciaisCliente = cliente.nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join('')
    .toUpperCase()
  const textoBotaoStatus =
    cliente.status === 'pago' ? 'Voltar para pendente' : 'Marcar como pago'
  const estaExcluindo = clienteExcluindoId === cliente.id
  const estaAtualizandoStatus = clienteAtualizandoStatusId === cliente.id
  const acoesDesabilitadas = estaExcluindo || estaAtualizandoStatus
  const textoStatusAcao = estaAtualizandoStatus
    ? 'Atualizando...'
    : textoBotaoStatus
  const textoExcluirAcao = estaExcluindo ? 'Excluindo...' : 'Excluir'

  return (
    <article className={`panel cliente-card cliente-card-${cliente.status}`}>
      <div className="card-top">
        <div className="card-identity">
          <div className="cliente-avatar">{iniciaisCliente}</div>

          <div className="card-title-group">
            <h3>{cliente.nome}</h3>
            <p>{cliente.telefone}</p>
          </div>
        </div>

        <div className="card-top-aside">
          <span className={`status-badge status-${cliente.status}`}>
            {statusLabel[cliente.status]}
          </span>
          {cliente.recorrente && (
            <span className="subtle-badge">Recorrente</span>
          )}
        </div>
      </div>

      <div className="card-metrics">
        <div className="detail-row detail-row-featured">
          <span>Valor</span>
          <strong>{cliente.valor}</strong>
        </div>

        <div className="detail-row detail-row-featured">
          <span>Vencimento</span>
          <strong>{cliente.vencimento}</strong>
        </div>

        <div className="detail-row detail-row-compact">
          <span>Telefone</span>
          <strong>{cliente.telefone}</strong>
        </div>
      </div>

      <div className="card-actions">
        <button
          type="button"
          className="button button-light"
          onClick={() => onEditCliente(cliente)}
          disabled={acoesDesabilitadas}
        >
          Editar
        </button>
        <button
          type="button"
          className="button button-status"
          onClick={() => onToggleStatus(cliente.id)}
          disabled={acoesDesabilitadas}
        >
          {textoStatusAcao}
        </button>
        <button
          type="button"
          className="button button-whatsapp"
          onClick={() => onOpenWhatsApp(cliente)}
          disabled={acoesDesabilitadas}
        >
          WhatsApp
        </button>
        <button
          type="button"
          className="button button-danger"
          onClick={() => onDeleteCliente(cliente.id)}
          disabled={acoesDesabilitadas}
        >
          {textoExcluirAcao}
        </button>
      </div>
    </article>
  )
}
