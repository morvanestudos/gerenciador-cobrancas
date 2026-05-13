import { useEffect, useState } from 'react'
import ClienteForm from './components/ClienteForm.jsx'
import ClienteList from './components/ClienteList.jsx'
import Filtros from './components/Filtros.jsx'
import Login from './components/Login.jsx'
import Cadastro from './components/Cadastro.jsx'
import RecuperarSenha from './components/RecuperarSenha.jsx'
import NovaSenha from './components/NovaSenha.jsx'
import Planos from './components/Planos.jsx'
import LandingPage from './components/LandingPage.jsx'
import { supabase } from './lib/supabase.js'

const CHAVE_CLIENTES = 'gerenciador-cobrancas:clientes'
const LIMITE_CLIENTES_PLANO_GRATIS = 7

const mensagemInicialSistema = {
  tipo: '',
  texto: '',
}

function normalizarPlano(plano) {
  return String(plano ?? '').toLowerCase() === 'pro' ? 'pro' : 'gratis'
}

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

function normalizarDataParaComparacao(data) {
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

  const dataSemHorario = data.split('T')[0]

  if (!dataSemHorario.includes('-')) {
    return ''
  }

  const [ano, mes, dia] = dataSemHorario.split('-')

  if (!ano || !mes || !dia) {
    return ''
  }

  return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`
}

function obterDataAtualParaComparacao() {
  const hoje = new Date()
  const ano = hoje.getFullYear()
  const mes = String(hoje.getMonth() + 1).padStart(2, '0')
  const dia = String(hoje.getDate()).padStart(2, '0')

  return `${ano}-${mes}-${dia}`
}

function obterQuantidadeDiasNoMes(ano, mes) {
  return new Date(Date.UTC(ano, mes, 0)).getUTCDate()
}

function formatarDataComparacao(ano, mes, dia) {
  const diaAjustado = String(dia).padStart(2, '0')
  const mesAjustado = String(mes).padStart(2, '0')

  return `${ano}-${mesAjustado}-${diaAjustado}`
}

function calcularProximoVencimentoRecorrente(
  diaVencimento,
  dataAtualComparacao = obterDataAtualParaComparacao(),
) {
  const diaConvertido = Number(diaVencimento)

  if (
    !Number.isInteger(diaConvertido) ||
    diaConvertido < 1 ||
    diaConvertido > 31
  ) {
    return null
  }

  const [anoAtual, mesAtual] = dataAtualComparacao.split('-').map(Number)

  if (!anoAtual || !mesAtual) {
    return null
  }

  const ultimoDiaMesAtual = obterQuantidadeDiasNoMes(anoAtual, mesAtual)
  const diaNoMesAtual = Math.min(diaConvertido, ultimoDiaMesAtual)
  const vencimentoMesAtual = formatarDataComparacao(
    anoAtual,
    mesAtual,
    diaNoMesAtual,
  )

  if (vencimentoMesAtual >= dataAtualComparacao) {
    return vencimentoMesAtual
  }

  const proximoMes = mesAtual === 12 ? 1 : mesAtual + 1
  const proximoAno = mesAtual === 12 ? anoAtual + 1 : anoAtual
  const ultimoDiaProximoMes = obterQuantidadeDiasNoMes(proximoAno, proximoMes)
  const diaNoProximoMes = Math.min(diaConvertido, ultimoDiaProximoMes)

  return formatarDataComparacao(proximoAno, proximoMes, diaNoProximoMes)
}

function prepararAtualizacaoRecorrenciaCliente(
  cliente,
  dataAtualComparacao = obterDataAtualParaComparacao(),
) {
  const vencimentoAtual = normalizarDataParaComparacao(cliente?.vencimento)

  if (
    !cliente?.recorrente ||
    !vencimentoAtual ||
    vencimentoAtual >= dataAtualComparacao
  ) {
    return {
      atualizado: false,
      cliente,
    }
  }

  const proximoVencimento = calcularProximoVencimentoRecorrente(
    cliente.dia_vencimento,
    dataAtualComparacao,
  )

  if (!proximoVencimento || proximoVencimento === vencimentoAtual) {
    return {
      atualizado: false,
      cliente,
    }
  }

  return {
    atualizado: true,
    cliente: {
      ...cliente,
      vencimento: proximoVencimento,
      status: obterStatusRealCliente({
        vencimento: proximoVencimento,
      }),
    },
  }
}

function obterStatusRealCliente(cliente) {
  if (cliente?.status === 'pago') {
    return 'pago'
  }

  const vencimento = normalizarDataParaComparacao(cliente?.vencimento)

  if (!vencimento) {
    return 'pendente'
  }

  return vencimento < obterDataAtualParaComparacao()
    ? 'atrasado'
    : 'pendente'
}

function clienteVenceHoje(
  cliente,
  dataAtualComparacao = obterDataAtualParaComparacao(),
) {
  if (cliente?.status === 'pago') {
    return false
  }

  return normalizarDataParaComparacao(cliente?.vencimento) === dataAtualComparacao
}

function clienteEstaAtrasado(cliente) {
  if (cliente?.status === 'pago') {
    return false
  }

  return obterStatusRealCliente(cliente) === 'atrasado'
}

function normalizarClienteDoBanco(cliente) {
  const { cliente: clienteAtualizado } =
    prepararAtualizacaoRecorrenciaCliente(cliente)
  const vencimentoFormatado = formatarVencimento(clienteAtualizado.vencimento)

  return {
    ...clienteAtualizado,
    recorrente: Boolean(clienteAtualizado.recorrente),
    periodicidade: clienteAtualizado.periodicidade ?? null,
    dia_vencimento: clienteAtualizado.dia_vencimento ?? null,
    status: obterStatusRealCliente({
      ...clienteAtualizado,
      vencimento: vencimentoFormatado,
    }),
    vencimento: vencimentoFormatado,
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
    .select(
      'id, user_id, nome, telefone, valor, vencimento, status, recorrente, periodicidade, dia_vencimento, created_at',
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  const dataAtualComparacao = obterDataAtualParaComparacao()
  const clientesSincronizados = await Promise.all(
    (data ?? []).map(async (cliente) => {
      const { atualizado, cliente: clienteAtualizado } =
        prepararAtualizacaoRecorrenciaCliente(cliente, dataAtualComparacao)

      if (!atualizado) {
        return cliente
      }

      const { data: clientePersistido, error: errorAtualizacao } =
        await supabase
          .from('clientes')
          .update({
            vencimento: formatarVencimentoParaBanco(clienteAtualizado.vencimento),
            status: clienteAtualizado.status,
          })
          .eq('id', cliente.id)
          .eq('user_id', userId)
          .select()
          .single()

      if (errorAtualizacao) {
        return clienteAtualizado
      }

      return clientePersistido
    }),
  )

  return clientesSincronizados.map((cliente) =>
    normalizarClienteDoBanco(cliente),
  )
}

async function buscarPerfilDoSupabase(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, nome_completo, telefone, plano')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
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
    status: obterStatusRealCliente(cliente),
    recorrente: Boolean(cliente.recorrente),
    periodicidade: cliente.periodicidade ?? null,
    dia_vencimento: cliente.dia_vencimento ?? null,
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

function formatarDataCurta(data) {
  const dataFormatada = formatarVencimento(data)

  if (!dataFormatada.includes('/')) {
    return dataFormatada
  }

  const [dia, mes] = dataFormatada.split('/')

  return `${dia}/${mes}`
}

function compararClientesPorVencimento(clienteA, clienteB) {
  const vencimentoA = normalizarDataParaComparacao(clienteA?.vencimento)
  const vencimentoB = normalizarDataParaComparacao(clienteB?.vencimento)

  if (vencimentoA !== vencimentoB) {
    return vencimentoA.localeCompare(vencimentoB)
  }

  return String(clienteA?.nome ?? '').localeCompare(String(clienteB?.nome ?? ''))
}

function obterNomeExibicaoUsuario(sessao, perfilUsuario) {
  const nomeCompleto =
    perfilUsuario?.nome_completo?.trim() ??
    sessao?.user?.user_metadata?.nome_completo?.trim() ??
    ''

  if (nomeCompleto) {
    const [primeiroNome] = nomeCompleto.split(/\s+/)

    return primeiroNome
  }

  const emailUsuario = sessao?.user?.email?.trim() ?? ''

  if (!emailUsuario) {
    return 'Cliente'
  }

  const identificador = emailUsuario.split('@')[0].replace(/[._-]+/g, ' ')

  return identificador.charAt(0).toUpperCase() + identificador.slice(1)
}

function urlIndicaRecuperacaoSenha() {
  if (typeof window === 'undefined') {
    return false
  }

  const hashAtual = window.location.hash.toLowerCase()
  const buscaAtual = window.location.search.toLowerCase()

  return (
    hashAtual.includes('type=recovery') ||
    buscaAtual.includes('type=recovery')
  )
}

function limparUrlAutenticacao() {
  if (typeof window === 'undefined') {
    return
  }

  window.history.replaceState({}, document.title, window.location.pathname)
}

function App() {
  const [sessao, setSessao] = useState(null)
  const [authCarregando, setAuthCarregando] = useState(true)
  const [telaAuth, setTelaAuth] = useState('landing')
  const [telaApp, setTelaApp] = useState('painel')
  const [recuperacaoSenhaAtiva, setRecuperacaoSenhaAtiva] = useState(false)
  const [perfilUsuario, setPerfilUsuario] = useState(null)
  const [clientes, setClientes] = useState([])
  const [clientesCarregando, setClientesCarregando] = useState(false)
  const [mensagemSistema, setMensagemSistema] = useState(mensagemInicialSistema)
  const [salvandoCliente, setSalvandoCliente] = useState(false)
  const [clienteExcluindoId, setClienteExcluindoId] = useState(null)
  const [clienteAtualizandoStatusId, setClienteAtualizandoStatusId] = useState(null)
  const [busca, setBusca] = useState('')
  const [status, setStatus] = useState('todos')
  const [clienteEmEdicao, setClienteEmEdicao] = useState(null)

  function mostrarMensagem(tipo, texto) {
    setMensagemSistema({ tipo, texto })
  }

  useEffect(() => {
    let ativo = true

    async function carregarSessao() {
      try {
        const { data } = await supabase.auth.getSession()

        if (!ativo) {
          return
        }

        const sessaoAtual = data.session ?? null
        const estaEmRecuperacao = Boolean(sessaoAtual) && urlIndicaRecuperacaoSenha()

        setSessao(sessaoAtual)
        setRecuperacaoSenhaAtiva(estaEmRecuperacao)

        if (estaEmRecuperacao) {
          limparUrlAutenticacao()
        }
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

      if (_event === 'PASSWORD_RECOVERY') {
        setRecuperacaoSenhaAtiva(true)
        limparUrlAutenticacao()
      }

      if (_event === 'SIGNED_OUT') {
        setRecuperacaoSenhaAtiva(false)
      }

      setAuthCarregando(false)
    })

    return () => {
      ativo = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!sessao?.user?.id) {
      setTelaApp('painel')
      setPerfilUsuario(null)
      setClientes([])
      setMensagemSistema(mensagemInicialSistema)
      setClientesCarregando(false)
      return
    }

    async function carregarClientesDoUsuario() {
      setClientesCarregando(true)
      setMensagemSistema(mensagemInicialSistema)

      try {
        const [perfilResultado, clientesResultado] = await Promise.allSettled([
          buscarPerfilDoSupabase(sessao.user.id),
          buscarClientesDoSupabase(sessao.user.id),
        ])

        setPerfilUsuario(
          perfilResultado.status === 'fulfilled' ? perfilResultado.value : null,
        )

        if (clientesResultado.status !== 'fulfilled') {
          throw clientesResultado.reason
        }

        let clientesCarregados = clientesResultado.value

        if (clientesCarregados.length === 0) {
          const houveMigracao = await migrarClientesLocais(sessao.user.id)

          if (houveMigracao) {
            clientesCarregados = await buscarClientesDoSupabase(sessao.user.id)
            setMensagemSistema({
              tipo: 'sucesso',
              texto:
                'Seus clientes anteriores foram importados com sucesso para sua conta.',
            })
          }
        }

        setClientes(clientesCarregados)
      } catch {
        setClientes([])
        setMensagemSistema({
          tipo: 'erro',
          texto: 'Não foi possível carregar seus clientes no momento.',
        })
      } finally {
        setClientesCarregando(false)
      }
    }

    carregarClientesDoUsuario()
  }, [sessao?.user?.id])

  async function salvarCliente(dadosCliente) {
    if (!sessao?.user?.id || salvandoCliente) {
      return false
    }

    if (
      planoUsuario === 'gratis' &&
      !clienteEmEdicao &&
      clientes.length >= LIMITE_CLIENTES_PLANO_GRATIS
    ) {
      setTelaApp('planos')
      return false
    }

    setSalvandoCliente(true)
    setMensagemSistema(mensagemInicialSistema)

    try {
      if (clienteEmEdicao) {
        const statusAtualizado = obterStatusRealCliente({
          status: clienteEmEdicao.status,
          vencimento: dadosCliente.vencimento,
        })

        const { data, error } = await supabase
          .from('clientes')
          .update({
            nome: dadosCliente.nome,
            telefone: dadosCliente.telefone,
            valor: dadosCliente.valor,
            vencimento: formatarVencimentoParaBanco(dadosCliente.vencimento),
            status: statusAtualizado,
            recorrente: dadosCliente.recorrente,
            periodicidade: dadosCliente.periodicidade,
            dia_vencimento: dadosCliente.dia_vencimento,
          })
          .eq('id', clienteEmEdicao.id)
          .eq('user_id', sessao.user.id)
          .select()
          .single()

        if (error) {
          mostrarMensagem('erro', 'Não foi possível atualizar o cliente.')
          return false
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
        mostrarMensagem('sucesso', 'Cliente atualizado com sucesso.')
        return true
      }

      const { data, error } = await supabase
        .from('clientes')
        .insert({
          user_id: sessao.user.id,
          nome: dadosCliente.nome,
          telefone: dadosCliente.telefone,
          valor: dadosCliente.valor,
          vencimento: formatarVencimentoParaBanco(dadosCliente.vencimento),
          status: obterStatusRealCliente({
            vencimento: dadosCliente.vencimento,
          }),
          recorrente: dadosCliente.recorrente,
          periodicidade: dadosCliente.periodicidade,
          dia_vencimento: dadosCliente.dia_vencimento,
        })
        .select()
        .single()

      if (error) {
        mostrarMensagem('erro', 'Não foi possível salvar o cliente.')
        return false
      }

      const novoCliente = normalizarClienteDoBanco(data)

      setClientes((clientesAtuais) => [novoCliente, ...clientesAtuais])
      setBusca('')
      setStatus('todos')
      mostrarMensagem('sucesso', 'Cliente salvo com sucesso.')
      return true
    } finally {
      setSalvandoCliente(false)
    }
  }

  async function toggleStatusCliente(idCliente) {
    if (!sessao?.user?.id || clienteAtualizandoStatusId === idCliente) {
      return
    }

    const clienteAtual = clientes.find((cliente) => cliente.id === idCliente)

    if (!clienteAtual) {
      return
    }

    const novoStatus =
      clienteAtual.status === 'pago'
        ? obterStatusRealCliente({ vencimento: clienteAtual.vencimento })
        : 'pago'

    setClienteAtualizandoStatusId(idCliente)
    setMensagemSistema(mensagemInicialSistema)

    try {
      const { data, error } = await supabase
        .from('clientes')
        .update({ status: novoStatus })
        .eq('id', idCliente)
        .eq('user_id', sessao.user.id)
        .select()
        .single()

      if (error) {
        mostrarMensagem(
          'erro',
          'Não foi possível atualizar o status do cliente.',
        )
        return
      }

      const clienteAtualizado = normalizarClienteDoBanco(data)

      setClientes((clientesAtuais) =>
        clientesAtuais.map((cliente) =>
          cliente.id === clienteAtualizado.id ? clienteAtualizado : cliente,
        ),
      )
      mostrarMensagem('sucesso', 'Status do cliente atualizado com sucesso.')
    } finally {
      setClienteAtualizandoStatusId(null)
    }
  }

  function iniciarEdicaoCliente(cliente) {
    setClienteEmEdicao(cliente)
  }

  function cancelarEdicaoCliente() {
    setClienteEmEdicao(null)
  }

  async function deleteCliente(idCliente) {
    if (!sessao?.user?.id || clienteExcluindoId === idCliente) {
      return
    }

    const confirmouExclusao = window.confirm(
      'Deseja realmente excluir este cliente? Esta ação não pode ser desfeita.',
    )

    if (!confirmouExclusao) {
      return
    }

    setClienteExcluindoId(idCliente)
    setMensagemSistema(mensagemInicialSistema)

    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', idCliente)
        .eq('user_id', sessao.user.id)

      if (error) {
        mostrarMensagem('erro', 'Não foi possível excluir o cliente.')
        return
      }

      setClientes((clientesAtuais) =>
        clientesAtuais.filter((cliente) => cliente.id !== idCliente),
      )

      if (clienteEmEdicao?.id === idCliente) {
        setClienteEmEdicao(null)
      }

      mostrarMensagem('sucesso', 'Cliente excluído com sucesso.')
    } finally {
      setClienteExcluindoId(null)
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
    setTelaApp('painel')
    setRecuperacaoSenhaAtiva(false)
    setClientes([])
    setMensagemSistema(mensagemInicialSistema)
    setClienteEmEdicao(null)
    setBusca('')
    setStatus('todos')
  }

  async function finalizarRecuperacaoSenha() {
    limparUrlAutenticacao()
    setRecuperacaoSenhaAtiva(false)
    setTelaAuth('login')
    setTelaApp('painel')

    const { error } = await supabase.auth.signOut()

    if (error) {
      setSessao(null)
    }
  }

  const termoBusca = busca.trim().toLowerCase()
  const planoUsuario = normalizarPlano(perfilUsuario?.plano)
  const clientesUsados = clientes.length
  const percentualUsoPlano =
    planoUsuario === 'pro'
      ? 0
      : Math.min((clientesUsados / LIMITE_CLIENTES_PLANO_GRATIS) * 100, 100)
  const atingiuLimitePlano =
    planoUsuario === 'gratis' &&
    clientesUsados >= LIMITE_CLIENTES_PLANO_GRATIS
  const estaProximoDoLimite =
    planoUsuario === 'gratis' &&
    !atingiuLimitePlano &&
    percentualUsoPlano >= 70
  const nomeUsuarioExibicao = obterNomeExibicaoUsuario(sessao, perfilUsuario)
  const resumoPlanoTopo =
    planoUsuario === 'pro'
      ? 'Plano Pro • R$ 14,99/mês • Clientes ilimitados'
      : `Plano grátis • ${clientesUsados} / ${LIMITE_CLIENTES_PLANO_GRATIS} clientes`
  const tituloUsoPlano = atingiuLimitePlano
    ? 'Seu plano grátis chegou ao limite'
    : estaProximoDoLimite
      ? 'Você está perto do limite grátis'
      : ''
  const mensagemUsoPlano = atingiuLimitePlano
    ? `Você atingiu o limite de ${LIMITE_CLIENTES_PLANO_GRATIS} clientes do plano grátis. Assine o Pro por R$ 14,99/mês para continuar cadastrando clientes sem limite.`
    : estaProximoDoLimite
      ? `Você já está perto do limite de ${LIMITE_CLIENTES_PLANO_GRATIS} clientes do plano grátis. Assine o Pro por R$ 14,99/mês para seguir crescendo sem travar novos cadastros.`
      : ''
  const textoBotaoPlano =
    planoUsuario === 'pro'
      ? 'Ver detalhes do plano'
      : 'Assinar Pro por R$ 14,99/mês'
  const dataAtualComparacao = obterDataAtualParaComparacao()
  const clientesVencendoHoje = clientes.filter((cliente) =>
    clienteVenceHoje(cliente, dataAtualComparacao),
  )
  const clientesAtrasados = clientes.filter((cliente) =>
    clienteEstaAtrasado(cliente),
  )
  const clientesPendentes = clientes.filter((cliente) => cliente.status === 'pendente')
  const clientesPagos = clientes.filter((cliente) => cliente.status === 'pago')
  const clientesRecorrentes = clientes.filter((cliente) => cliente.recorrente)
  const clientesComCobrancaAtiva = clientes.filter(
    (cliente) => cliente.status !== 'pago',
  )
  const alertasPainel = [
    clientesVencendoHoje.length > 0
      ? {
          chave: 'vencem-hoje',
          tipo: 'hoje',
          titulo: 'Vencimentos de hoje',
          texto:
            clientesVencendoHoje.length === 1
              ? '1 cliente vence hoje'
              : `${clientesVencendoHoje.length} clientes vencem hoje`,
        }
      : null,
    clientesAtrasados.length > 0
      ? {
          chave: 'atrasados',
          tipo: 'atrasado',
          titulo: 'Cobranças em atraso',
          texto:
            clientesAtrasados.length === 1
              ? '1 cliente está atrasado'
              : `${clientesAtrasados.length} clientes estão atrasados`,
        }
      : null,
  ].filter(Boolean)

  const totalAReceber = clientes.reduce((total, cliente) => {
    return cliente.status !== 'pago'
      ? total + converterValorParaNumero(cliente.valor)
      : total
  }, 0)

  const totalRecebido = clientes.reduce((total, cliente) => {
    return cliente.status === 'pago'
      ? total + converterValorParaNumero(cliente.valor)
      : total
  }, 0)
  const totalEmAtraso = clientesAtrasados.reduce((total, cliente) => {
    return total + converterValorParaNumero(cliente.valor)
  }, 0)
  const cobrancasPrioritarias = clientesAtrasados.length + clientesVencendoHoje.length
  const proximosVencimentos = [...clientesComCobrancaAtiva]
    .filter(
      (cliente) =>
        normalizarDataParaComparacao(cliente.vencimento) >= dataAtualComparacao,
    )
    .sort(compararClientesPorVencimento)
    .slice(0, 4)
  const atividadeRecente = [...clientes]
    .sort((clienteA, clienteB) => {
      const dataA = String(clienteA?.created_at ?? '')
      const dataB = String(clienteB?.created_at ?? '')

      if (dataA && dataB && dataA !== dataB) {
        return dataB.localeCompare(dataA)
      }

      return compararClientesPorVencimento(clienteA, clienteB)
    })
    .slice(0, 4)
  const metricasDashboard = [
    {
      chave: 'receber',
      classe: 'receber',
      icone: 'R$',
      titulo: 'Total a receber',
      valor: formatarMoeda(totalAReceber),
      contexto:
        clientesComCobrancaAtiva.length === 1
          ? '1 cobrança ativa no painel'
          : `${clientesComCobrancaAtiva.length} cobranças ativas no painel`,
    },
    {
      chave: 'recebido',
      classe: 'recebido',
      icone: 'OK',
      titulo: 'Total recebido',
      valor: formatarMoeda(totalRecebido),
      contexto:
        clientesPagos.length === 1
          ? '1 pagamento confirmado'
          : `${clientesPagos.length} pagamentos confirmados`,
    },
    {
      chave: 'atrasados',
      classe: 'atrasados',
      icone: 'AT',
      titulo: 'Clientes atrasados',
      valor: String(clientesAtrasados.length),
      contexto:
        totalEmAtraso > 0
          ? `${formatarMoeda(totalEmAtraso)} em valores vencidos`
          : 'Nenhum valor em atraso',
    },
    {
      chave: 'whatsapp',
      classe: 'whatsapp',
      icone: 'WA',
      titulo: 'Cobranças no WhatsApp',
      valor: String(cobrancasPrioritarias),
      contexto:
        cobrancasPrioritarias === 0
          ? 'Sem cobranças prioritárias hoje'
          : 'Clientes prontos para contato rápido',
    },
  ]

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
          <strong>Conectando ao sistema</strong>
          <p>Verificando sua sessão para liberar o painel.</p>
        </div>
      </div>
    )
  }

  if (recuperacaoSenhaAtiva && sessao) {
    return <NovaSenha onSenhaAtualizada={finalizarRecuperacaoSenha} />
  }

  if (!sessao) {
    if (telaAuth === 'landing') {
      return (
        <LandingPage
          onComecarGratis={() => setTelaAuth('cadastro')}
          onAbrirLogin={() => setTelaAuth('login')}
        />
      )
    }

    if (telaAuth === 'cadastro') {
      return <Cadastro onVoltarLogin={() => setTelaAuth('login')} />
    }

    if (telaAuth === 'recuperar-senha') {
      return (
        <RecuperarSenha onVoltarLogin={() => setTelaAuth('login')} />
      )
    }

    return (
      <Login
        onAbrirCadastro={() => setTelaAuth('cadastro')}
        onAbrirRecuperacao={() => setTelaAuth('recuperar-senha')}
      />
    )
  }

  if (telaApp === 'planos') {
    return (
      <Planos
        planoUsuario={planoUsuario}
        clientesUsados={clientesUsados}
        limiteClientes={LIMITE_CLIENTES_PLANO_GRATIS}
        percentualUsoPlano={percentualUsoPlano}
        nomeUsuario={nomeUsuarioExibicao}
        estaProximoDoLimite={estaProximoDoLimite}
        atingiuLimitePlano={atingiuLimitePlano}
        userId={sessao?.user?.id ?? ''}
        email={sessao?.user?.email ?? ''}
        onVoltarPainel={() => setTelaApp('painel')}
      />
    )
  }

  return (
    <div className="app-shell">
      <header className="app-header app-header-dashboard">
        <div className="header-brand">
          <div className="header-brand-mark" aria-hidden="true">
            GC
          </div>

          <div className="header-brand-copy">
            <span className="header-brand-kicker">Workspace financeiro</span>
            <h1>Gestão de Clientes e Cobranças</h1>
            <p>
              Seu centro de controle para recebimentos, clientes e cobranças
              rápidas em um fluxo mais claro e profissional.
            </p>
          </div>
        </div>

        <nav className="header-nav" aria-label="Navegação interna">
          <button
            type="button"
            className="header-nav-link header-nav-link-active"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: 'smooth',
              })
            }
          >
            Dashboard
          </button>
          <a href="#clientes-section" className="header-nav-link">
            Clientes
          </a>
          <button
            type="button"
            className="header-nav-link"
            onClick={() => setTelaApp('planos')}
          >
            Planos
          </button>
        </nav>

        <div className="header-side header-side-dashboard">
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
            <span className="plan-usage-value">{resumoPlanoTopo}</span>
            {planoUsuario === 'gratis' && (
              <div className="plan-usage-progress" aria-hidden="true">
                <span
                  className="plan-usage-progress-bar"
                  style={{ width: `${percentualUsoPlano}%` }}
                />
              </div>
            )}
          </div>

          <div className="header-user-card">
            <span className="header-user-label">Conta conectada</span>
            <strong>{nomeUsuarioExibicao}</strong>
            <span>{sessao?.user?.email ?? 'Conta autenticada'}</span>
          </div>

          <div className="header-actions">
            <button
              type="button"
              className="button button-primary header-upgrade"
              onClick={() => setTelaApp('planos')}
            >
              {textoBotaoPlano}
            </button>

            <button
              type="button"
              className="button button-ghost header-logout"
              onClick={sairDoSistema}
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="app-content">
        {mensagemUsoPlano && (
          <div
            className={`plan-alert ${
              atingiuLimitePlano
                ? 'plan-alert-critical'
                : 'plan-alert-warning'
            }`}
          >
            <strong>{tituloUsoPlano}</strong>
            <span>{mensagemUsoPlano}</span>
            <div className="plan-alert-actions">
              <button
                type="button"
                className="button button-primary plan-alert-button"
                onClick={() => setTelaApp('planos')}
              >
                Assinar Pro por R$ 14,99/mês
              </button>
            </div>
          </div>
        )}

        {mensagemSistema.texto && (
          <div className={`system-message system-message-${mensagemSistema.tipo}`}>
            {mensagemSistema.texto}
          </div>
        )}

        {alertasPainel.length > 0 && (
          <section className="smart-alerts" aria-label="Alertas do painel">
            {alertasPainel.map((alerta) => (
              <article
                key={alerta.chave}
                className={`smart-alert smart-alert-${alerta.tipo}`}
              >
                <span className="smart-alert-label">{alerta.titulo}</span>
                <strong>{alerta.texto}</strong>
              </article>
            ))}
          </section>
        )}

        <section className="dashboard-grid dashboard-metrics-grid">
          {metricasDashboard.map((metrica) => (
            <article
              key={metrica.chave}
              className={`dashboard-card dashboard-card-${metrica.classe}`}
            >
              <div className="dashboard-card-top">
                <span className="dashboard-label">{metrica.titulo}</span>
                <span className="dashboard-icon" aria-hidden="true">
                  {metrica.icone}
                </span>
              </div>
              <strong>{metrica.valor}</strong>
              <p>{metrica.contexto}</p>
            </article>
          ))}
        </section>

        <section className="dashboard-focus-grid">
          <div className="dashboard-focus-main">
            <article className="section-block dashboard-stream-card">
              <div className="section-heading section-heading-inline">
                <div>
                  <h2>Clientes em atraso</h2>
                  <p>Quem precisa de ação imediata para recuperar receita.</p>
                </div>
                <span className="list-count">
                  {clientesAtrasados.length}{' '}
                  {clientesAtrasados.length === 1 ? 'cliente' : 'clientes'}
                </span>
              </div>

              {clientesAtrasados.length === 0 ? (
                <div className="dashboard-empty-state">
                  Nenhum cliente em atraso no momento.
                </div>
              ) : (
                <div className="dashboard-mini-list">
                  {clientesAtrasados
                    .sort(compararClientesPorVencimento)
                    .slice(0, 4)
                    .map((cliente) => (
                      <article
                        key={cliente.id}
                        className="dashboard-mini-card dashboard-mini-card-danger"
                      >
                        <div className="dashboard-mini-header">
                          <div>
                            <strong>{cliente.nome}</strong>
                            <span>{cliente.telefone}</span>
                          </div>
                          <span className="status-badge status-atrasado">
                            Atrasado
                          </span>
                        </div>
                        <div className="dashboard-mini-body">
                          <div>
                            <span>Valor</span>
                            <strong>{cliente.valor}</strong>
                          </div>
                          <div>
                            <span>Venceu em</span>
                            <strong>{cliente.vencimento}</strong>
                          </div>
                        </div>
                        <div className="dashboard-mini-actions">
                          <button
                            type="button"
                            className="button button-whatsapp"
                            onClick={() => abrirWhatsAppCliente(cliente)}
                          >
                            Cobrar no WhatsApp
                          </button>
                          <button
                            type="button"
                            className="button button-light"
                            onClick={() => iniciarEdicaoCliente(cliente)}
                          >
                            Revisar cadastro
                          </button>
                        </div>
                      </article>
                    ))}
                </div>
              )}
            </article>

            <article className="section-block dashboard-stream-card">
              <div className="section-heading section-heading-inline">
                <div>
                  <h2>Clientes vencendo hoje</h2>
                  <p>Contatos do dia para manter o fluxo de caixa em ordem.</p>
                </div>
                <span className="list-count">
                  {clientesVencendoHoje.length}{' '}
                  {clientesVencendoHoje.length === 1 ? 'cliente' : 'clientes'}
                </span>
              </div>

              {clientesVencendoHoje.length === 0 ? (
                <div className="dashboard-empty-state">
                  Nenhum vencimento programado para hoje.
                </div>
              ) : (
                <div className="dashboard-mini-list">
                  {clientesVencendoHoje
                    .sort(compararClientesPorVencimento)
                    .slice(0, 4)
                    .map((cliente) => (
                      <article
                        key={cliente.id}
                        className="dashboard-mini-card dashboard-mini-card-warning"
                      >
                        <div className="dashboard-mini-header">
                          <div>
                            <strong>{cliente.nome}</strong>
                            <span>{cliente.telefone}</span>
                          </div>
                          <span className="status-badge status-pendente">
                            Hoje
                          </span>
                        </div>
                        <div className="dashboard-mini-body">
                          <div>
                            <span>Valor</span>
                            <strong>{cliente.valor}</strong>
                          </div>
                          <div>
                            <span>Vencimento</span>
                            <strong>{cliente.vencimento}</strong>
                          </div>
                        </div>
                        <div className="dashboard-mini-actions">
                          <button
                            type="button"
                            className="button button-whatsapp"
                            onClick={() => abrirWhatsAppCliente(cliente)}
                          >
                            Abrir cobrança
                          </button>
                          <button
                            type="button"
                            className="button button-light"
                            onClick={() => iniciarEdicaoCliente(cliente)}
                          >
                            Ver detalhes
                          </button>
                        </div>
                      </article>
                    ))}
                </div>
              )}
            </article>
          </div>

          <aside className="dashboard-focus-side">
            <article className="section-block dashboard-insight-card">
              <div className="section-heading">
                <h2>Resumo rápido</h2>
                <p>Visão enxuta da carteira para decidir rápido.</p>
              </div>

              <div className="dashboard-insight-metrics">
                <div className="dashboard-insight-item">
                  <span>Pendentes</span>
                  <strong>{clientesPendentes.length}</strong>
                </div>
                <div className="dashboard-insight-item">
                  <span>Pagos</span>
                  <strong>{clientesPagos.length}</strong>
                </div>
                <div className="dashboard-insight-item">
                  <span>Recorrentes</span>
                  <strong>{clientesRecorrentes.length}</strong>
                </div>
                <div className="dashboard-insight-item">
                  <span>Carteira</span>
                  <strong>{clientes.length}</strong>
                </div>
              </div>
            </article>

            <article className="section-block dashboard-insight-card">
              <div className="section-heading">
                <h2>Próximos vencimentos</h2>
                <p>O que entra na agenda dos próximos dias.</p>
              </div>

              {proximosVencimentos.length === 0 ? (
                <div className="dashboard-empty-state">
                  Nenhum vencimento futuro disponível.
                </div>
              ) : (
                <div className="dashboard-compact-list">
                  {proximosVencimentos.map((cliente) => (
                    <article key={cliente.id} className="dashboard-compact-item">
                      <div>
                        <strong>{cliente.nome}</strong>
                        <span>{cliente.valor}</span>
                      </div>
                      <span>{formatarDataCurta(cliente.vencimento)}</span>
                    </article>
                  ))}
                </div>
              )}
            </article>

            <article className="section-block dashboard-insight-card">
              <div className="section-heading">
                <h2>Atividade recente</h2>
                <p>Últimos clientes cadastrados ou atualizados na carteira.</p>
              </div>

              {atividadeRecente.length === 0 ? (
                <div className="dashboard-empty-state">
                  Sua atividade recente aparecerá aqui.
                </div>
              ) : (
                <div className="dashboard-compact-list">
                  {atividadeRecente.map((cliente) => (
                    <article key={cliente.id} className="dashboard-compact-item">
                      <div>
                        <strong>{cliente.nome}</strong>
                        <span>
                          {cliente.recorrente
                            ? 'Cobrança recorrente ativa'
                            : 'Cadastro padrão'}
                        </span>
                      </div>
                      <span>
                        {cliente.created_at
                          ? formatarDataCurta(cliente.created_at)
                          : formatarDataCurta(cliente.vencimento)}
                      </span>
                    </article>
                  ))}
                </div>
              )}
            </article>
          </aside>
        </section>

        <div className="top-grid dashboard-workspace-grid">
          <ClienteForm
            key={clienteEmEdicao ? clienteEmEdicao.id : 'novo-cliente'}
            onCancelarEdicao={cancelarEdicaoCliente}
            onSalvarCliente={salvarCliente}
            clienteEmEdicao={clienteEmEdicao}
            salvandoCliente={salvandoCliente}
          />
          <Filtros
            busca={busca}
            onBuscaChange={setBusca}
            status={status}
            onStatusChange={setStatus}
          />
        </div>

        {clientesCarregando ? (
          <section
            id="clientes-section"
            className="section-block section-block-list"
          >
            <div className="section-heading">
              <h2>Clientes cadastrados</h2>
              <p>Sincronizando clientes com sua conta.</p>
            </div>

            <div className="panel">Carregando clientes...</div>
          </section>
        ) : (
          <ClienteList
            sectionId="clientes-section"
            clientes={clientesFiltrados}
            clienteExcluindoId={clienteExcluindoId}
            clienteAtualizandoStatusId={clienteAtualizandoStatusId}
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
