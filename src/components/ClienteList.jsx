import ClienteCard from './ClienteCard.jsx'

const prioridadeStatus = {
  atrasado: 0,
  pendente: 1,
  pago: 2,
}

const destaqueAtrasadoStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  height: '100%',
  padding: '12px',
  border: '1px solid rgba(203, 85, 64, 0.32)',
  borderRadius: '28px',
  background: 'rgba(255, 247, 245, 0.8)',
  boxShadow: '0 16px 32px rgba(203, 85, 64, 0.08)',
}

const seloAtrasadoStyle = {
  alignSelf: 'flex-end',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '6px 10px',
  borderRadius: '999px',
  border: '1px solid rgba(203, 85, 64, 0.18)',
  background: 'rgba(203, 85, 64, 0.12)',
  color: '#9f2f1d',
  fontSize: '0.74rem',
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
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
    <section className="section-block section-block-list">
      <div className="section-heading section-heading-inline">
        <div>
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
              <div key={cliente.id} style={destaqueAtrasadoStyle}>
                <span style={seloAtrasadoStyle}>Em atraso</span>
                <ClienteCard {...cardProps} />
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
