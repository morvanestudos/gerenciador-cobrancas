import ClienteCard from './ClienteCard.jsx'

const prioridadeStatus = {
  atrasado: 0,
  pendente: 1,
  pago: 2,
}

function normalizarVencimentoParaComparacao(data) {
  if (!data) {
    return ''
  }

  if (data.includes('/')) {
    const [dia, mes, ano] = data.split('/')

    if (!ano || !mes || !dia) {
      return ''
    }

    return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`
  }

  return data.split('T')[0]
}

export default function ClienteList({
  sectionId,
  clientes,
  clienteExcluindoId,
  clienteAtualizandoStatusId,
  onDeleteCliente,
  onEditCliente,
  onOpenWhatsApp,
  onToggleStatus,
}) {
  const clientesOrdenados = clientes
    .map((cliente, indiceOriginal) => ({
      cliente,
      indiceOriginal,
    }))
    .sort((itemA, itemB) => {
      const prioridadeA = prioridadeStatus[itemA.cliente.status] ?? 99
      const prioridadeB = prioridadeStatus[itemB.cliente.status] ?? 99

      if (prioridadeA !== prioridadeB) {
        return prioridadeA - prioridadeB
      }

      const vencimentoA = normalizarVencimentoParaComparacao(
        itemA.cliente.vencimento,
      )
      const vencimentoB = normalizarVencimentoParaComparacao(
        itemB.cliente.vencimento,
      )

      if (vencimentoA !== vencimentoB) {
        return vencimentoA.localeCompare(vencimentoB)
      }

      return itemA.indiceOriginal - itemB.indiceOriginal
    })
    .map(({ cliente }) => cliente)

  return (
    <section
      id={sectionId}
      className="section-block section-block-list section-block-clients"
    >
      <div className="section-heading section-heading-inline">
        <div>
          <h2>Carteira de clientes</h2>
          <p>Visual premium para acompanhar status, valores e próximas ações.</p>
        </div>

        <span className="list-count">
          {clientes.length} {clientes.length === 1 ? 'cliente' : 'clientes'}
        </span>
      </div>

      {clientes.length === 0 ? (
        <div className="empty-state">Nenhum cliente encontrado para os filtros atuais.</div>
      ) : (
        <div className="cliente-list">
          {clientesOrdenados.map((cliente) => {
            const cardProps = {
              cliente,
              clienteExcluindoId,
              clienteAtualizandoStatusId,
              onDeleteCliente,
              onEditCliente,
              onOpenWhatsApp,
              onToggleStatus,
            }

            if (cliente.status !== 'atrasado') {
              return <ClienteCard key={cliente.id} {...cardProps} />
            }

            return (
              <div
                key={cliente.id}
                className="cliente-list-highlight cliente-list-highlight-atrasado"
              >
                <span className="cliente-list-highlight-badge">Em atraso</span>
                <ClienteCard {...cardProps} />
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
