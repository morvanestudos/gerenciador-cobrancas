import { useState } from 'react'

const formularioInicial = {
  nome: '',
  telefone: '',
  valor: '',
  vencimento: '',
}

function formatarTelefone(valor) {
  const numeros = valor.replace(/\D/g, '').slice(0, 11)

  if (numeros.length === 0) {
    return ''
  }

  if (numeros.length <= 2) {
    return `(${numeros}`
  }

  if (numeros.length <= 6) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`
  }

  if (numeros.length <= 10) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`
  }

  return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`
}

function formatarValorMoeda(valor) {
  const numeros = valor.replace(/\D/g, '')

  if (numeros.length === 0) {
    return ''
  }

  const valorConvertido = Number(numeros) / 100

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
    .format(valorConvertido)
    .replace(/\u00A0/g, ' ')
}

function formatarVencimentoParaInput(data) {
  if (!data) {
    return ''
  }

  if (data.includes('-')) {
    return data
  }

  const [dia, mes, ano] = data.split('/')

  return `${ano}-${mes}-${dia}`
}

function criarFormularioInicial(clienteEmEdicao) {
  if (!clienteEmEdicao) {
    return formularioInicial
  }

  return {
    nome: clienteEmEdicao.nome ?? '',
    telefone: formatarTelefone(clienteEmEdicao.telefone ?? ''),
    valor: formatarValorMoeda(clienteEmEdicao.valor ?? ''),
    vencimento: formatarVencimentoParaInput(clienteEmEdicao.vencimento),
  }
}

export default function ClienteForm({
  onCancelarEdicao,
  onSalvarCliente,
  clienteEmEdicao,
  salvandoCliente,
}) {
  const [formData, setFormData] = useState(() =>
    criarFormularioInicial(clienteEmEdicao),
  )
  const emEdicao = Boolean(clienteEmEdicao)
  const nomeClienteEmEdicao = clienteEmEdicao?.nome ?? ''

  function handleChange(event) {
    const { name, value } = event.target
    let valorFormatado = value

    if (name === 'telefone') {
      valorFormatado = formatarTelefone(value)
    }

    if (name === 'valor') {
      valorFormatado = formatarValorMoeda(value)
    }

    setFormData((dadosAtuais) => ({
      ...dadosAtuais,
      [name]: valorFormatado,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const salvouCliente = await onSalvarCliente({
      nome: formData.nome.trim(),
      telefone: formData.telefone.trim(),
      valor: formData.valor.trim(),
      vencimento: formData.vencimento,
    })

    if (salvouCliente) {
      setFormData(criarFormularioInicial(null))
    }
  }

  function handleCancelarEdicao() {
    setFormData(criarFormularioInicial(null))
    onCancelarEdicao()
  }

  return (
    <section
      className={`section-block section-block-form ${
        emEdicao ? 'section-block-editing' : ''
      }`}
    >
      <div className="section-heading">
        <h2>{emEdicao ? 'Atualizar cliente' : 'Novo cliente'}</h2>
        <p>
          {emEdicao
            ? 'Revise os dados e confirme a atualização.'
            : 'Cadastre um cliente e registre a cobrança inicial.'}
        </p>
      </div>

      <form
        className={`panel form-panel ${emEdicao ? 'panel-editing' : ''}`}
        onSubmit={handleSubmit}
      >
        {emEdicao && (
          <div className="edit-mode-banner">
            <span className="edit-mode-tag">Edição em andamento</span>
            <strong>Editando: {nomeClienteEmEdicao}</strong>
            <p>As alterações serão aplicadas ao salvar.</p>
          </div>
        )}

        <div className="form-grid">
          <div className="field">
            <label htmlFor="nome">Nome</label>
            <input
              id="nome"
              name="nome"
              type="text"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Nome do cliente"
              disabled={salvandoCliente}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="telefone">Telefone</label>
            <input
              id="telefone"
              name="telefone"
              type="text"
              inputMode="numeric"
              value={formData.telefone}
              onChange={handleChange}
              placeholder="(11) 99999-9999"
              disabled={salvandoCliente}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="valor">Valor da cobrança</label>
            <input
              id="valor"
              name="valor"
              type="text"
              inputMode="numeric"
              value={formData.valor}
              onChange={handleChange}
              placeholder="R$ 0,00"
              disabled={salvandoCliente}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="vencimento">Vencimento</label>
            <input
              id="vencimento"
              name="vencimento"
              type="date"
              value={formData.vencimento}
              onChange={handleChange}
              disabled={salvandoCliente}
              required
            />
          </div>
        </div>

        <div className="form-actions">
          {emEdicao && (
            <button
              type="button"
              className="button button-ghost"
              onClick={handleCancelarEdicao}
              disabled={salvandoCliente}
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            className="button button-primary"
            disabled={salvandoCliente}
          >
            {salvandoCliente
              ? emEdicao
                ? 'Salvando alterações...'
                : 'Salvando cliente...'
              : emEdicao
                ? 'Salvar alterações'
                : 'Salvar cliente'}
          </button>
        </div>
      </form>
    </section>
  )
}
