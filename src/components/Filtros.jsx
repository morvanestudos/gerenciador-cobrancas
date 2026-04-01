export default function Filtros({ busca, onBuscaChange, status, onStatusChange }) {
  return (
    <section className="section-block section-block-filters">
      <div className="section-heading">
        <h2>Localizar clientes</h2>
        <p>Pesquise e refine a carteira em tempo real.</p>
      </div>

      <div className="panel filters-panel">
        <div className="field">
          <label htmlFor="busca">Busca</label>
          <input
            id="busca"
            type="search"
            value={busca}
            onChange={(event) => onBuscaChange(event.target.value)}
            placeholder="Nome, telefone ou valor"
          />
        </div>

        <div className="field">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={status}
            onChange={(event) => onStatusChange(event.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="pendente">Pendente</option>
            <option value="pago">Pago</option>
            <option value="atrasado">Atrasado</option>
          </select>
        </div>

        <div className="filter-note">
          <strong>Atualização imediata</strong>
          <span>A lista responde aos filtros conforme você digita.</span>
        </div>
      </div>
    </section>
  )
}
