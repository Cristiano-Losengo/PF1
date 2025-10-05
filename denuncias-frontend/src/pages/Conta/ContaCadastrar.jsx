import { useState, useEffect } from "react";

export default function ContaCadastrar() {
  const [contas, setContas] = useState([]);
  const [formData, setFormData] = useState({
    pkConta: null,
    nome: "",
    detalhes: "",
    createdAt: "",
    updatedAt: ""
  });
  const [editando, setEditando] = useState(false);

  // Carregar lista de contas
  const carregarContas = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/seguranca/conta_listar"
      );
      const data = await response.json();
      setContas(data);
    } catch (error) {
      console.error("Erro ao carregar contas:", error);
    }
  };

  useEffect(() => {
    carregarContas();
  }, []);

  // Handle input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Salvar (Create / Update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const method = editando ? "PUT" : "POST";
      const url = editando
        ? `http://localhost:8080/api/seguranca/conta_editar/${formData.pkConta}`
        : "http://localhost:8080/api/seguranca/conta_cadastrar";

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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
        `http://localhost:8080/api/seguranca/conta_excluir/${id}`,
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
      pkConta: null,
      nome: "",
      detalhes: "",
      createdAt: "",
      updatedAt: ""
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
                  Gerir todas as contas do sistema
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
              Nome da Conta
            </label>
            <div className="col-sm-4">
              <input
                type="text"
                className="form-control"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
              />
            </div>

            <label
              htmlFor="detalhes"
              className="col-sm-2 col-form-label"
            >
              Detalhes
            </label>
            <div className="col-sm-4">
              <input
                type="text"
                className="form-control"
                id="detalhes"
                name="detalhes"
                value={formData.detalhes || ""}
                onChange={handleChange}
              />
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
            <th>Nome</th>
            <th>Detalhes</th>
            <th>Criado em</th>
            <th>Atualizado em</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {contas.map((conta, i) => (
            <tr key={conta.pkConta}>
              <td>{i + 1}</td>
              <td>{conta.nome}</td>
              <td>{conta.detalhes || "-"}</td>
              <td>{new Date(conta.createdAt).toLocaleString()}</td>
              <td>{conta.updatedAt ? new Date(conta.updatedAt).toLocaleString() : "-"}</td>
              <td>
                <button
                  className="btn btn-sm btn-warning me-2"
                  onClick={() => handleEdit(conta)}
                >
                  Editar
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(conta.pkConta)}
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
          {contas.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center">
                Nenhuma conta cadastrada
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}