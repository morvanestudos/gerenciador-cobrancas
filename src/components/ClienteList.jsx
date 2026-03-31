import ClienteCard from './ClienteCard.jsx'

export default function ClienteList({
  clientes,
  clienteExcluindoId,
  clienteAtualizandoStatusId,
  onDeleteCliente,
  onEditCliente,
  onOpenWhatsApp,
  onToggleStatus,
}) {
  return (
    <section className="section-block section-block-list">
      <div className="section-heading section-heading-inline">
        <div>
          <span className="section-tag">Carteira</span>
          <h2>Clientes cadastrados</h2>
          <p>Acompanhe status, cobranças e ações rápidas em um só lugar.</p>
        </div>

        <span className="list-count">
          {clientes.length} {clientes.length === 1 ? 'cliente' : 'clientes'}
        </span>
      </div>

      {clientes.length === 0 ? (
        <div className="empty-state">Nenhum cliente encontrado para os filtros atuais.</div>
      ) : (
        <div className="cliente-list">
          {clientes.map((cliente) => (
            <ClienteCard
              key={cliente.id}
              cliente={cliente}
              clienteExcluindoId={clienteExcluindoId}
              clienteAtualizandoStatusId={clienteAtualizandoStatusId}
              onDeleteCliente={onDeleteCliente}
              onEditCliente={onEditCliente}
              onOpenWhatsApp={onOpenWhatsApp}
              onToggleStatus={onToggleStatus}
            />
          ))}
        </div>
      )}
    </section>
  )
}
