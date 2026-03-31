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

  if (mensagem.includes('Invalid login credentials')) {
    return 'E-mail ou senha inválidos.'
  }

  if (mensagem.includes('Email not confirmed')) {
    return 'Confirme seu e-mail antes de entrar.'
  }

  if (mensagem.includes('User already registered')) {
    return 'Já existe uma conta cadastrada com este e-mail.'
  }

  if (mensagem.includes('Password should be at least')) {
    return 'A senha deve ter pelo menos 6 caracteres.'
  }

  return 'Não foi possível concluir a operação. Tente novamente.'
}

export default function Login({ onAbrirCadastro }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mensagem, setMensagem] = useState(mensagemInicial)
  const [carregandoAcao, setCarregandoAcao] = useState(false)

  function validarCampos() {
    if (!email.trim() || !senha) {
      setMensagem({
        tipo: 'erro',
        texto: 'Informe e-mail e senha para continuar.',
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
    setMensagem(mensagemInicial)

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    })

    if (error) {
      setMensagem({
        tipo: 'erro',
        texto: traduzirMensagemErro(error.message),
      })
    }

    setCarregandoAcao(false)
  }

  return (
    <div className="login-shell">
      <div className="login-layout">
        <section className="login-brand-panel">
          <span className="app-kicker">Acesso ao sistema</span>
          <h1>Gestão de Clientes e Cobranças</h1>
          <p>
            Organize sua carteira, acompanhe recebimentos e acelere cobranças
            com um painel simples e profissional.
          </p>

          <div className="login-highlights">
            <article className="login-highlight">
              <strong>Operação centralizada</strong>
              <span>Clientes, vencimentos e ações rápidas em um só lugar.</span>
            </article>

            <article className="login-highlight">
              <strong>Controle financeiro</strong>
              <span>Visualize recebidos, pendências e totais com clareza.</span>
            </article>

            <article className="login-highlight">
              <strong>Contato ágil</strong>
              <span>Abra conversas no WhatsApp com mensagem pronta.</span>
            </article>
          </div>
        </section>

        <form className="login-card" onSubmit={handleSubmit} noValidate>
          <div className="login-card-header">
            <span className="section-tag">Login</span>
            <h2>Entrar no painel</h2>
            <p>Informe seus dados para acessar o sistema.</p>
          </div>

          <div className="field">
            <label htmlFor="login-email">E-mail</label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                setMensagem(mensagemInicial)
              }}
              placeholder="seuemail@empresa.com"
            />
          </div>

          <div className="field">
            <label htmlFor="login-senha">Senha</label>
            <input
              id="login-senha"
              type="password"
              required
              value={senha}
              onChange={(event) => {
                setSenha(event.target.value)
                setMensagem(mensagemInicial)
              }}
              placeholder="Digite sua senha"
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
            {carregandoAcao ? 'Processando...' : 'Entrar'}
          </button>

          <div className="login-links">
            <button type="button" className="login-link">
              Esqueci minha senha
            </button>
            <button
              type="button"
              className="login-link login-link-strong"
              onClick={onAbrirCadastro}
              disabled={carregandoAcao}
            >
              Criar conta
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
