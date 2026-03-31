import { useState } from 'react'
import { supabase } from '../lib/supabase.js'

const mensagemInicial = {
  tipo: '',
  texto: '',
}

function traduzirMensagemErro(mensagem) {
  if (!mensagem) {
    return 'Não foi possível enviar o e-mail de recuperação. Tente novamente.'
  }

  if (mensagem.includes('Unable to validate email address')) {
    return 'Informe um e-mail válido para continuar.'
  }

  return mensagem
}

export default function RecuperarSenha({ onVoltarLogin }) {
  const [email, setEmail] = useState('')
  const [mensagem, setMensagem] = useState(mensagemInicial)
  const [carregandoAcao, setCarregandoAcao] = useState(false)

  function limparMensagem() {
    setMensagem(mensagemInicial)
  }

  function validarCampo() {
    if (!email.trim()) {
      setMensagem({
        tipo: 'erro',
        texto: 'Informe seu e-mail para receber o link de recuperação.',
      })

      return false
    }

    return true
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!validarCampo()) {
      return
    }

    setCarregandoAcao(true)
    limparMensagem()

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      emailRedirectTo: window.location.origin,
    })

    if (error) {
      setMensagem({
        tipo: 'erro',
        texto: traduzirMensagemErro(error.message),
      })
      setCarregandoAcao(false)
      return
    }

    setMensagem({
      tipo: 'sucesso',
      texto:
        'Enviamos o e-mail de recuperação. Verifique sua caixa de entrada para continuar.',
    })
    setCarregandoAcao(false)
  }

  return (
    <div className="login-shell">
      <div className="login-layout">
        <section className="login-brand-panel">
          <span className="app-kicker">Recuperação de acesso</span>
          <h1>Recupere sua senha com segurança</h1>
          <p>
            Informe o e-mail da sua conta para receber as instruções de
            redefinição e voltar ao sistema com rapidez.
          </p>

          <div className="login-highlights">
            <article className="login-highlight">
              <strong>Processo simples</strong>
              <span>Solicite a recuperação com seu e-mail em poucos segundos.</span>
            </article>

            <article className="login-highlight">
              <strong>Fluxo seguro</strong>
              <span>O link é enviado diretamente para o endereço informado.</span>
            </article>

            <article className="login-highlight">
              <strong>Acesso restaurado</strong>
              <span>Retorne ao painel assim que concluir a redefinição.</span>
            </article>
          </div>
        </section>

        <form className="login-card" onSubmit={handleSubmit} noValidate>
          <div className="login-card-header">
            <span className="section-tag">Recuperação</span>
            <h2>Redefinir senha</h2>
            <p>Digite seu e-mail para receber o link de recuperação.</p>
          </div>

          <div className="field">
            <label htmlFor="recuperacao-email">E-mail</label>
            <input
              id="recuperacao-email"
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
            {carregandoAcao ? 'Enviando e-mail...' : 'Enviar e-mail de recuperação'}
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
