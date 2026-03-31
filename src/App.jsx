import { useEffect, useState } from 'react'
import ClienteForm from './components/ClienteForm.jsx'
import ClienteList from './components/ClienteList.jsx'
import Filtros from './components/Filtros.jsx'
import Login from './components/Login.jsx'
import Cadastro from './components/Cadastro.jsx'
import { supabase } from './lib/supabase.js'

const CHAVE_CLIENTES = 'gerenciador-cobrancas:clientes'

function formatarVencimento(data) {
  if (!data) {
    return ''
  }

  if (data.includes('/')) {
    return data
  }

  const dataSemHorario = data.split('T')[0]

  if (!dataSemHorario.includes('-')) {
    return data
  }

  const [ano, mes, dia] = dataSemHorario.split('-')

  return `${dia}/${mes}/${ano}`
}

function formatarVencimentoParaBanco(data) {
  if (!data) {
    return null
  }

  if (data.includes('/')) {
    const [dia, mes, ano] = data.split('/')

    return `${ano}-${mes}-${dia}`
  }

  return data
}

function normalizarClienteDoBanco(cliente) {
  return {
    ...cliente,
    status: cliente.status ?? 'pendente',
    vencimento: formatarVencimento(cliente.vencimento),
  }
}

function lerClientesLocais() {
  const clientesSalvos = localStorage.getItem(CHAVE_CLIENTES)

  if (!clientesSalvos) {
    return []
  }

  try {
    const clientesConvertidos = JSON.parse(clientesSalvos)

    return Array.isArray(clientesConvertidos) ? clientesConvertidos : []
  } catch {
    return []
  }
}

async function buscarClientesDoSupabase(userId) {
  const { data, error } = await supabase
    .from('clientes')
    .select('id, user_id, nome, telefone, valor, vencimento, status, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []).map(normalizarClienteDoBanco)
}

async function migrarClientesLocais(userId) {
  const clientesLocais = lerClientesLocais()

  if (clientesLocais.length === 0) {
    return false
  }

  const clientesParaInserir = clientesLocais.map((cliente) => ({
    user_id: userId,
    nome: cliente.nome,
    telefone: cliente.telefone,
    valor: cliente.valor,
    vencimento: formatarVencimentoParaBanco(cliente.vencimento),
    status: cliente.status ?? 'pendente',
  }))

  const { error } = await supabase.from('clientes').insert(clientesParaInserir)

  if (error) {
    throw error
  }

  localStorage.removeItem(CHAVE_CLIENTES)
  return true
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
  const [sessao, setSessao] = useState(null)
  const [authCarregando, setAuthCarregando] = useState(true)
  const [telaAuth, setTelaAuth] = useState('login')
  const [clientes, setClientes] = useState([])
  const [clientesCarregando, setClientesCarregando] = useState(false)
  const [clientesErro, setClientesErro] = useState('')
  const [busca, setBusca] = useState('')
  const [status, setStatus] = useState('todos')
  const [clienteEmEdicao, setClienteEmEdicao] = useState(null)

  useEffect(() => {
    let ativo = true

    async function carregarSessao() {
      try {
        const { data } = await supabase.auth.getSession()

        if (!ativo) {
          return
        }

        setSessao(data.session ?? null)
      } finally {
        if (ativo) {
          setAuthCarregando(false)
        }
      }
    }

    carregarSessao()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, novaSessao) => {
      if (!ativo) {
        return
      }

      setSessao(novaSessao ?? null)
      setAuthCarregando(false)
    })

    return () => {
      ativo = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!sessao?.user?.id) {
      setClientes([])
      setClientesErro('')
      setClientesCarregando(false)
      return
    }

    async function carregarClientesDoUsuario() {
      setClientesCarregando(true)
      setClientesErro('')

      try {
        let clientesCarregados = await buscarClientesDoSupabase(sessao.user.id)

        if (clientesCarregados.length === 0) {
          const houveMigracao = await migrarClientesLocais(sessao.user.id)

          if (houveMigracao) {
            clientesCarregados = await buscarClientesDoSupabase(sessao.user.id)
          }
        }

        setClientes(clientesCarregados)
      } catch {
        setClientes([])
        setClientesErro('Não foi possível carregar seus clientes no momento.')
      } finally {
        setClientesCarregando(false)
      }
    }

    carregarClientesDoUsuario()
  }, [sessao?.user?.id])

  async function salvarCliente(dadosCliente) {
    if (!sessao?.user?.id) {
      return
    }

    setClientesErro('')

    if (clienteEmEdicao) {
      const { data, error } = await supabase
        .from('clientes')
        .update({
          nome: dadosCliente.nome,
          telefone: dadosCliente.telefone,
          valor: dadosCliente.valor,
          vencimento: formatarVencimentoParaBanco(dadosCliente.vencimento),
        })
        .eq('id', clienteEmEdicao.id)
        .eq('user_id', sessao.user.id)
        .select()
        .single()

      if (error) {
        setClientesErro('Não foi possível atualizar o cliente.')
        return
      }

      const clienteAtualizado = normalizarClienteDoBanco(data)

      setClientes((clientesAtuais) =>
        clientesAtuais.map((cliente) =>
          cliente.id === clienteAtualizado.id ? clienteAtualizado : cliente,
        ),
      )

      setClienteEmEdicao(null)
      setBusca('')
      setStatus('todos')
      return
    }

    const { data, error } = await supabase
      .from('clientes')
      .insert({
        user_id: sessao.user.id,
        nome: dadosCliente.nome,
        telefone: dadosCliente.telefone,
        valor: dadosCliente.valor,
        vencimento: formatarVencimentoParaBanco(dadosCliente.vencimento),
        status: 'pendente',
      })
      .select()
      .single()

    if (error) {
      setClientesErro('Não foi possível salvar o cliente.')
      return
    }

    const novoCliente = normalizarClienteDoBanco(data)

    setClientes((clientesAtuais) => [novoCliente, ...clientesAtuais])
    setBusca('')
    setStatus('todos')
  }

  async function toggleStatusCliente(idCliente) {
    if (!sessao?.user?.id) {
      return
    }

    const clienteAtual = clientes.find((cliente) => cliente.id === idCliente)

    if (!clienteAtual) {
      return
    }

    const novoStatus =
      clienteAtual.status === 'pago' ? 'pendente' : 'pago'

    setClientesErro('')

    const { data, error } = await supabase
      .from('clientes')
      .update({ status: novoStatus })
      .eq('id', idCliente)
      .eq('user_id', sessao.user.id)
      .select()
      .single()

    if (error) {
      setClientesErro('Não foi possível atualizar o status do cliente.')
      return
    }

    const clienteAtualizado = normalizarClienteDoBanco(data)

    setClientes((clientesAtuais) =>
      clientesAtuais.map((cliente) =>
        cliente.id === clienteAtualizado.id ? clienteAtualizado : cliente,
      ),
    )
  }

  function iniciarEdicaoCliente(cliente) {
    setClienteEmEdicao(cliente)
  }

  function cancelarEdicaoCliente() {
    setClienteEmEdicao(null)
  }

  async function deleteCliente(idCliente) {
    if (!sessao?.user?.id) {
      return
    }

    setClientesErro('')

    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', idCliente)
      .eq('user_id', sessao.user.id)

    if (error) {
      setClientesErro('Não foi possível excluir o cliente.')
      return
    }

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

  async function sairDoSistema() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      return
    }

    setTelaAuth('login')
    setClientes([])
    setClientesErro('')
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

  if (authCarregando) {
    return (
      <div className="auth-loading-shell">
        <div className="auth-loading-card">
          <span className="app-kicker">Autenticação</span>
          <strong>Conectando ao sistema</strong>
          <p>Verificando sua sessão para liberar o painel.</p>
        </div>
      </div>
    )
  }

  if (!sessao) {
    if (telaAuth === 'cadastro') {
      return <Cadastro onVoltarLogin={() => setTelaAuth('login')} />
    }

    return <Login onAbrirCadastro={() => setTelaAuth('cadastro')} />
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
        {clientesErro && <div className="panel">{clientesErro}</div>}

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

        {clientesCarregando ? (
          <section className="section-block section-block-list">
            <div className="section-heading">
              <span className="section-tag">Carteira</span>
              <h2>Clientes cadastrados</h2>
              <p>Sincronizando clientes com sua conta.</p>
            </div>

            <div className="panel">Carregando clientes...</div>
          </section>
        ) : (
          <ClienteList
            clientes={clientesFiltrados}
            onDeleteCliente={deleteCliente}
            onEditCliente={iniciarEdicaoCliente}
            onOpenWhatsApp={abrirWhatsAppCliente}
            onToggleStatus={toggleStatusCliente}
          />
        )}
      </main>
    </div>
  )
}

export default App
