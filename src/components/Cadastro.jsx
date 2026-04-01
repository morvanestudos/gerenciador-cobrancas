import { useState } from 'react'
import { supabase } from '../lib/supabase.js'

const mensagemInicial = {
  tipo: '',
  texto: '',
}

function traduzirMensagemErro(mensagem) {
  if (!mensagem) {
    return 'Não foi possível concluir a operação. Tente novamente.'
  }

  if (mensagem.includes('User already registered')) {
    return 'Já existe uma conta cadastrada com este e-mail.'
  }

  if (mensagem.includes('Password should be at least')) {
    return 'A senha deve ter pelo menos 6 caracteres.'
  }

  if (mensagem.includes('Unable to validate email address')) {
    return 'Informe um e-mail válido para criar a conta.'
  }

  return mensagem
}

export default function Cadastro({ onVoltarLogin }) {
  const [nomeCompleto, setNomeCompleto] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mensagem, setMensagem] = useState(mensagemInicial)
  const [carregandoAcao, setCarregandoAcao] = useState(false)

  function limparMensagem() {
    setMensagem(mensagemInicial)
  }

  function validarCampos() {
    if (!nomeCompleto.trim() || !telefone.trim() || !email.trim() || !senha) {
      setMensagem({
        tipo: 'erro',
        texto: 'Preencha nome completo, telefone, e-mail e senha.',
      })

      return false
    }

    return true
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!validarCampos()) {
      return
    }

    setCarregandoAcao(true)
    limparMensagem()

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: senha,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          nome_completo: nomeCompleto.trim(),
          telefone: telefone.trim(),
        },
      },
    })

    if (error) {
      setMensagem({
        tipo: 'erro',
        texto: traduzirMensagemErro(error.message),
      })
      setCarregandoAcao(false)
      return
    }

    if (data.session) {
      setMensagem({
        tipo: 'sucesso',
        texto: 'Conta criada com sucesso. Seu acesso já foi liberado.',
      })
      setCarregandoAcao(false)
      return
    }

    setMensagem({
      tipo: 'sucesso',
      texto: 'Conta criada. Verifique seu e-mail para confirmar o acesso.',
    })
    setSenha('')
    setCarregandoAcao(false)
  }

  return (
    <div className="login-shell">
      <div className="login-layout">
        <section className="login-brand-panel">
          <h1>Crie seu acesso ao sistema</h1>
          <p>
            Configure sua conta para acompanhar clientes, cobranças e ações
            rápidas em um painel profissional.
          </p>

          <div className="login-highlights">
            <article className="login-highlight">
              <strong>Cadastro seguro</strong>
              <span>Crie seu acesso com e-mail e senha em poucos segundos.</span>
            </article>

            <article className="login-highlight">
              <strong>Perfil identificado</strong>
              <span>Nome completo e telefone ficam associados à sua conta.</span>
            </article>

            <article className="login-highlight">
              <strong>Pronto para operar</strong>
              <span>Entre no painel e continue usando o sistema normalmente.</span>
            </article>
          </div>
        </section>

        <form className="login-card" onSubmit={handleSubmit} noValidate>
          <div className="login-card-header">
            <h2>Criar nova conta</h2>
            <p>Preencha seus dados para começar a usar o sistema.</p>
          </div>

          <div className="field">
            <label htmlFor="cadastro-nome">Nome completo</label>
            <input
              id="cadastro-nome"
              type="text"
              required
              value={nomeCompleto}
              onChange={(event) => {
                setNomeCompleto(event.target.value)
                limparMensagem()
              }}
              placeholder="Seu nome completo"
            />
          </div>

          <div className="field">
            <label htmlFor="cadastro-telefone">Telefone</label>
            <input
              id="cadastro-telefone"
              type="text"
              inputMode="tel"
              required
              value={telefone}
              onChange={(event) => {
                setTelefone(event.target.value)
                limparMensagem()
              }}
              placeholder="(11) 99999-9999"
            />
          </div>

          <div className="field">
            <label htmlFor="cadastro-email">E-mail</label>
            <input
              id="cadastro-email"
              type="email"
              required
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                limparMensagem()
              }}
              placeholder="seuemail@empresa.com"
            />
          </div>

          <div className="field">
            <label htmlFor="cadastro-senha">Senha</label>
            <input
              id="cadastro-senha"
              type="password"
              required
              value={senha}
              onChange={(event) => {
                setSenha(event.target.value)
                limparMensagem()
              }}
              placeholder="Crie uma senha segura"
            />
          </div>

          {mensagem.texto && (
            <div className={`login-message login-message-${mensagem.tipo}`}>
              {mensagem.texto}
            </div>
          )}

          <button
            type="submit"
            className="button button-primary login-submit"
            disabled={carregandoAcao}
          >
            {carregandoAcao ? 'Criando conta...' : 'Criar conta'}
          </button>

          <div className="login-links">
            <button
              type="button"
              className="login-link"
              onClick={onVoltarLogin}
              disabled={carregandoAcao}
            >
              Voltar para login
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
