import { useEffect, useState } from 'react'
import ClienteForm from './components/ClienteForm.jsx'
import ClienteList from './components/ClienteList.jsx'
import Filtros from './components/Filtros.jsx'
import Login from './components/Login.jsx'

const CHAVE_CLIENTES = 'gerenciador-cobrancas:clientes'

const clientesExemplo = [
  {
    id: 1,
    nome: 'Mariana Souza',
    empresa: 'Studio Aurora',
    telefone: '(11) 99876-5432',
    email: 'mariana@studioaurora.com',
    valor: 'R$ 320,00',
    vencimento: '05/04/2026',
    status: 'pendente',
  },
  {
    id: 2,
    nome: 'Carlos Lima',
    empresa: 'Lima Reformas',
    telefone: '(21) 98765-1122',
    email: 'contato@limareformas.com',
    valor: 'R$ 780,00',
    vencimento: '12/04/2026',
    status: 'pago',
  },
  {
    id: 3,
    nome: 'Fernanda Alves',
    empresa: 'Atelie Flor de Sal',
    telefone: '(31) 99123-4567',
    email: 'fernanda@flordesal.com',
    valor: 'R$ 150,00',
    vencimento: '28/03/2026',
    status: 'atrasado',
  },
]

function formatarVencimento(data) {
  if (!data || !data.includes('-')) {
    return data
  }

  const [ano, mes, dia] = data.split('-')

  return `${dia}/${mes}/${ano}`
}

function carregarClientesIniciais() {
  const clientesSalvos = localStorage.getItem(CHAVE_CLIENTES)

  if (!clientesSalvos) {
    return clientesExemplo
  }

  try {
    const clientesConvertidos = JSON.parse(clientesSalvos)

    return Array.isArray(clientesConvertidos)
      ? clientesConvertidos
      : clientesExemplo
  } catch {
    return clientesExemplo
  }
}

function gerarLinkWhatsApp(cliente) {
  const numeroLimpo = cliente.telefone.replace(/\D/g, '')
  const numero = numeroLimpo.startsWith('55')
    ? numeroLimpo
    : `55${numeroLimpo}`
  const mensagem = `Olá ${cliente.nome}, tudo bem? Estou entrando em contato sobre a cobrança no valor de ${cliente.valor} com vencimento em ${cliente.vencimento}.`

  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`
}

function converterValorParaNumero(valor) {
  if (!valor) {
    return 0
  }

  const valorLimpo = valor
    .replace(/\s/g, '')
    .replace('R$', '')
    .replace(/\./g, '')
    .replace(',', '.')

  const valorConvertido = Number(valorLimpo)

  return Number.isNaN(valorConvertido) ? 0 : valorConvertido
}

function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

function App() {
  const [estaLogado, setEstaLogado] = useState(false)
  const [clientes, setClientes] = useState(carregarClientesIniciais)
  const [busca, setBusca] = useState('')
  const [status, setStatus] = useState('todos')
  const [clienteEmEdicao, setClienteEmEdicao] = useState(null)

  useEffect(() => {
    localStorage.setItem(CHAVE_CLIENTES, JSON.stringify(clientes))
  }, [clientes])

  function salvarCliente(dadosCliente) {
    if (clienteEmEdicao) {
      setClientes((clientesAtuais) =>
        clientesAtuais.map((cliente) => {
          if (cliente.id !== clienteEmEdicao.id) {
            return cliente
          }

          return {
            ...cliente,
            nome: dadosCliente.nome,
            telefone: dadosCliente.telefone,
            valor: dadosCliente.valor,
            vencimento: formatarVencimento(dadosCliente.vencimento),
          }
        }),
      )

      setClienteEmEdicao(null)
      setBusca('')
      setStatus('todos')
      return
    }

    const novoCliente = {
      id: Date.now(),
      nome: dadosCliente.nome,
      telefone: dadosCliente.telefone,
      valor: dadosCliente.valor,
      vencimento: formatarVencimento(dadosCliente.vencimento),
      status: 'pendente',
    }

    setClientes((clientesAtuais) => [novoCliente, ...clientesAtuais])
    setBusca('')
    setStatus('todos')
  }

  function toggleStatusCliente(idCliente) {
    setClientes((clientesAtuais) =>
      clientesAtuais.map((cliente) => {
        if (cliente.id !== idCliente) {
          return cliente
        }

        const novoStatus =
          cliente.status === 'pago' ? 'pendente' : 'pago'

        return {
          ...cliente,
          status: novoStatus,
        }
      }),
    )
  }

  function iniciarEdicaoCliente(cliente) {
    setClienteEmEdicao(cliente)
  }

  function cancelarEdicaoCliente() {
    setClienteEmEdicao(null)
  }

  function deleteCliente(idCliente) {
    setClientes((clientesAtuais) =>
      clientesAtuais.filter((cliente) => cliente.id !== idCliente),
    )

    if (clienteEmEdicao?.id === idCliente) {
      setClienteEmEdicao(null)
    }
  }

  function abrirWhatsAppCliente(cliente) {
    const link = gerarLinkWhatsApp(cliente)

    window.open(link, '_blank')
  }

  function entrarNoSistema() {
    setEstaLogado(true)
  }

  function sairDoSistema() {
    setEstaLogado(false)
    setClienteEmEdicao(null)
    setBusca('')
    setStatus('todos')
  }

  const termoBusca = busca.trim().toLowerCase()
  const totalAReceber = clientes.reduce((total, cliente) => {
    return cliente.status === 'pendente'
      ? total + converterValorParaNumero(cliente.valor)
      : total
  }, 0)

  const totalRecebido = clientes.reduce((total, cliente) => {
    return cliente.status === 'pago'
      ? total + converterValorParaNumero(cliente.valor)
      : total
  }, 0)

  const clientesFiltrados = clientes.filter((cliente) => {
    const correspondeBusca =
      termoBusca === '' ||
      [
        cliente.nome,
        cliente.telefone,
        cliente.valor,
        cliente.vencimento,
        cliente.empresa ?? '',
        cliente.email ?? '',
      ].some((campo) =>
        campo.toLowerCase().includes(termoBusca),
      )

    const correspondeStatus =
      status === 'todos' || cliente.status === status

    return correspondeBusca && correspondeStatus
  })

  if (!estaLogado) {
    return <Login onEntrar={entrarNoSistema} />
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-content">
          <span className="app-kicker">Painel operacional</span>
          <h1>Gestão de Clientes e Cobranças</h1>
          <p>
            Centralize clientes, acompanhe recebimentos e acelere cobranças com
            ações rápidas.
          </p>
        </div>

        <div className="header-side">
          <div className="header-summary">
            <span className="summary-label">Base ativa</span>
            <strong>{clientes.length}</strong>
            <span className="summary-text">
              Registros atualizados em tempo real
            </span>
          </div>

          <button
            type="button"
            className="button button-ghost header-logout"
            onClick={sairDoSistema}
          >
            Sair
          </button>
        </div>
      </header>

      <main className="app-content">
        <section className="dashboard-grid">
          <article className="dashboard-card dashboard-card-receber">
            <span className="dashboard-label">A receber</span>
            <strong>{formatarMoeda(totalAReceber)}</strong>
            <p>Cobranças com status pendente.</p>
          </article>

          <article className="dashboard-card dashboard-card-recebido">
            <span className="dashboard-label">Recebido</span>
            <strong>{formatarMoeda(totalRecebido)}</strong>
            <p>Valores confirmados como pagos.</p>
          </article>

          <article className="dashboard-card dashboard-card-clientes">
            <span className="dashboard-label">Clientes</span>
            <strong>{clientes.length}</strong>
            <p>Total de cadastros na carteira.</p>
          </article>
        </section>

        <div className="top-grid">
          <ClienteForm
            key={clienteEmEdicao ? clienteEmEdicao.id : 'novo-cliente'}
            onCancelarEdicao={cancelarEdicaoCliente}
            onSalvarCliente={salvarCliente}
            clienteEmEdicao={clienteEmEdicao}
          />
          <Filtros
            busca={busca}
            onBuscaChange={setBusca}
            status={status}
            onStatusChange={setStatus}
          />
        </div>

        <ClienteList
          clientes={clientesFiltrados}
          onDeleteCliente={deleteCliente}
          onEditCliente={iniciarEdicaoCliente}
          onOpenWhatsApp={abrirWhatsAppCliente}
          onToggleStatus={toggleStatusCliente}
        />
      </main>
    </div>
  )
}

export default App
