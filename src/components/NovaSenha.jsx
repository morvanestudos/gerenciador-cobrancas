import { useState } from 'react'
import { supabase } from '../lib/supabase.js'

const mensagemInicial = {
  tipo: '',
  texto: '',
}

function traduzirMensagemErro(mensagem) {
  if (!mensagem) {
    return 'Não foi possível atualizar sua senha. Tente novamente.'
  }

  if (mensagem.includes('Password should be at least')) {
    return 'A senha deve ter pelo menos 6 caracteres.'
  }

  return mensagem
}

export default function NovaSenha({ onSenhaAtualizada }) {
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [mensagem, setMensagem] = useState(mensagemInicial)
  const [carregandoAcao, setCarregandoAcao] = useState(false)

  function limparMensagem() {
    setMensagem(mensagemInicial)
  }

  function validarCampos() {
    if (!novaSenha || !confirmarSenha) {
      setMensagem({
        tipo: 'erro',
        texto: 'Informe a nova senha e a confirmação para continuar.',
      })

      return false
    }

    if (novaSenha.length < 6) {
      setMensagem({
        tipo: 'erro',
        texto: 'A senha deve ter pelo menos 6 caracteres.',
      })

      return false
    }

    if (novaSenha !== confirmarSenha) {
      setMensagem({
        tipo: 'erro',
        texto: 'A confirmação de senha precisa ser igual à nova senha.',
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

    const { error } = await supabase.auth.updateUser({
      password: novaSenha,
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
      texto: 'Senha atualizada com sucesso. Redirecionando para o login.',
    })

    window.setTimeout(() => {
      onSenhaAtualizada()
    }, 1500)
  }

  return (
    <div className="login-shell">
      <div className="login-layout">
        <section className="login-brand-panel">
          <span className="app-kicker">Nova senha</span>
          <h1>Defina uma nova senha para sua conta</h1>
          <p>
            Atualize seu acesso com uma nova senha e volte ao painel com
            segurança.
          </p>

          <div className="login-highlights">
            <article className="login-highlight">
              <strong>Redefinição segura</strong>
              <span>Conclua a atualização diretamente pelo link enviado ao seu e-mail.</span>
            </article>

            <article className="login-highlight">
              <strong>Acesso renovado</strong>
              <span>Escolha uma nova senha para retomar o uso do sistema.</span>
            </article>

            <article className="login-highlight">
              <strong>Retorno ao login</strong>
              <span>Após salvar, você será direcionado novamente para entrar.</span>
            </article>
          </div>
        </section>

        <form className="login-card" onSubmit={handleSubmit} noValidate>
          <div className="login-card-header">
            <span className="section-tag">Segurança</span>
            <h2>Criar nova senha</h2>
            <p>Informe e confirme sua nova senha para finalizar a recuperação.</p>
          </div>

          <div className="field">
            <label htmlFor="nova-senha">Nova senha</label>
            <input
              id="nova-senha"
              type="password"
              autoComplete="new-password"
              required
              value={novaSenha}
              onChange={(event) => {
                setNovaSenha(event.target.value)
                limparMensagem()
              }}
              placeholder="Digite sua nova senha"
              disabled={carregandoAcao}
            />
          </div>

          <div className="field">
            <label htmlFor="confirmar-senha">Confirmar senha</label>
            <input
              id="confirmar-senha"
              type="password"
              autoComplete="new-password"
              required
              value={confirmarSenha}
              onChange={(event) => {
                setConfirmarSenha(event.target.value)
                limparMensagem()
              }}
              placeholder="Confirme a nova senha"
              disabled={carregandoAcao}
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
            {carregandoAcao ? 'Salvando nova senha...' : 'Salvar nova senha'}
          </button>
        </form>
      </div>
    </div>
  )
}
