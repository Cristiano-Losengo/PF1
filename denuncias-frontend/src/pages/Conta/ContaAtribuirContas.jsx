import { useState, useEffect } from "react";

export default function ContaAtribuirContas() {
  const [contas, setContas] = useState([]);
  const [utilizadores, setUtilizadores] = useState([]);

  const [formData, setFormData] = useState({
    pkUtilizador: null,
    fkPessoa: null,
    fkConta: null,
    nomePessoa: "",
    nomeConta: "",
    username: "",
  });
  const [editando, setEditando] = useState(false);
  // Carregar lista de utilizadores
  const carregarContas = async () => {

    try {
      const response = await fetch(
        "http://localhost:9090/api/seguranca/conta_listar"
      );
      const data = await response.json();
      setContas(data);
    } catch (error) {
      console.error("Erro ao carregar contas:", error);
    }
  };

  const carregarUtilizadores = async () => {
    try {
      const response = await fetch(
        "http://localhost:9090/api/utilizador/listar_utilizadores"
      );
      const data = await response.json();
      setUtilizadores(data);

      console.log(data)
    } catch (error) {
      console.error("Erro ao carregar contas:", error);
    }
  };

  useEffect(() => {

    carregarContas();
    carregarUtilizadores();

  }, []);

  // Handle input
const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData((prev) => ({
    ...prev,
    [name]: name.startsWith("fk") || name.startsWith("pk") ? Number(value) : value,
  }));
};


  // Salvar (Create / Update)
  const handleSubmit = async (e) => {

    e.preventDefault();

    try {
      await fetch("http://localhost:9090/api/conta_perfis/cadastrar_conta_utilizador", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fkConta: formData.fkConta,
          pkUtilizador: formData.pkUtilizador,
        }),
      });

      carregarContas();
      resetForm();
    } catch (error) {
      console.error("Erro ao salvar conta:", error);
    }
  };


  // Editar
  const handleEdit = (conta) => {
    setFormData(conta);
    setEditando(true);
  };

  // Excluir
  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta conta?")) return;
    try {
      await fetch(
        `http://localhost:9090/api/seguranca/conta_excluir/${id}`,
        { method: "DELETE" }
      );
      carregarContas();
    } catch (error) {
      console.error("Erro ao excluir conta:", error);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      pkUtilizador: null,
      fkPessoa: null,
      fkConta: null,
      nomePessoa: "",
      nomeConta: "",
      username: "",
    });
    setEditando(false);
  };

  return (
    <div className="container mt-4">
      {/* Card */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card info-card sales-card">
            <div className="card-body d-flex justify-content-between">
              <div>
                <h3 className="mb-2">Gestão de Contas</h3>
                <p className="text-secondary">
                  Gerir Atribuição de Contas aos Utilizadores
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <div className="mb-4">
        <form onSubmit={handleSubmit}>
          <div className="mb-3 row">
            <label
              htmlFor="nome"
              className="col-sm-2 col-form-label"
            >
              Contas
            </label>
            <div className="col-sm-4">
              <select
                className="form-select"
                id="fkConta"
                name="fkConta"
                value={formData.fkConta || ""}
                onChange={handleChange}
                required
              >
                <option value="">Selecione uma Conta</option>
                {contas.map((conta) => (
                  <option key={conta.pkConta} value={conta.pkConta}>
                    {conta.nome}
                  </option>
                ))}
              </select>
            </div>

            <label
              htmlFor="detalhes"
              className="col-sm-2 col-form-label"
            >
              Utilizadores
            </label>
            <div className="col-sm-4">
              <select
                className="form-select"
                id="pkUtilizador"
                name="pkUtilizador"
                value={formData.pkUtilizador || ""}
                onChange={handleChange}
                required
              >
                <option value="">Selecione um Utilizador</option>
                {utilizadores.map((utilizador) => (
                  <option key={utilizador.pkUtilizador} value={utilizador.pkUtilizador}>
                    {utilizador.username}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <button type="submit" className="btn btn-primary me-2">
              {editando ? "Salvar Alterações" : "Cadastrar"}
            </button>
            {editando && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={resetForm}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Tabela */}
      <table className="table table-bordered table-striped">
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>Conta</th>
            <th>Utilizador</th>
            <th>Descrição</th>
            <th>Criado em</th>
            <th>Atualizado em</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {utilizadores.map((utilizadorModel, i) => (
            <tr key={utilizadorModel.pkUtilizador}>
              <td>{i + 1}</td>
              <td>{utilizadorModel.nomeConta}</td>
              <td>{utilizadorModel.username} / {utilizadorModel.nomePessoa} </td>
              <td>{utilizadorModel.detalhes || "-"}</td>
              <td>{new Date(utilizadorModel.createdAt).toLocaleString()}</td>
              <td>{utilizadorModel.updatedAt ? new Date(utilizadorModel.updatedAt).toLocaleString() : "-"}</td>
              <td>
                <button
                  className="btn btn-sm btn-warning me-2"
                  onClick={() => handleEdit(utilizadorModel)}
                >
                  Editar
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(utilizadorModel.pkConta)}
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
          {contas.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center">
                Nenhum Utilizador cadastrado
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}