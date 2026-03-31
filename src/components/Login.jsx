import { useState } from 'react'

export default function Login({ onEntrar }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    onEntrar({ email, senha })
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
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="seuemail@empresa.com"
            />
          </div>

          <div className="field">
            <label htmlFor="login-senha">Senha</label>
            <input
              id="login-senha"
              type="password"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              placeholder="Digite sua senha"
            />
          </div>

          <button type="submit" className="button button-primary login-submit">
            Entrar
          </button>

          <div className="login-links">
            <button type="button" className="login-link">
              Esqueci minha senha
            </button>
            <button type="button" className="login-link login-link-strong">
              Criar conta
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
