import { useState, useEffect } from "react";
import { FaUserPlus } from "react-icons/fa";


export default function ContaCadastrar() {
  const [contas, setContas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState(null);

  const [formData, setFormData] = useState({
    pkConta: null,
    tipoConta: "",
    nomeCompleto: "",
    email: "",
    senha: "",
    fkPerfil: "",
    createdAt: "",
    updatedAt: ""
  });

  const [editando, setEditando] = useState(false);

  // Carregar Contas
  const carregarContas = async () => {
    try {
      const response = await fetch("http://localhost:9090/api/seguranca/conta_listar");
      const data = await response.json();
      setContas(data);
    } catch (error) {
      console.error("Erro ao carregar contas:", error);
    }
  };

  useEffect(() => {
    carregarContas();
  }, []);

  // Handle Input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit (Create/Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensagem(null);

    try {
      const method = editando ? "PUT" : "POST";
      const url = editando
        ? `http://localhost:9090/api/seguranca/conta_editar/${formData.pkConta}`
        : "http://localhost:9090/api/seguranca/conta_cadastrar";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMensagem({ tipo: "success", texto: "Conta salva com sucesso!" });
        carregarContas();
        resetForm();
      } else {
        setMensagem({ tipo: "danger", texto: "Erro ao salvar conta." });
      }
    } catch (error) {
      setMensagem({ tipo: "danger", texto: "Erro de comunicação com o servidor." });
      console.error("Erro ao salvar:", error);
    } finally {
      setLoading(false);
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
      await fetch(`http://localhost:9090/api/seguranca/conta_excluir/${id}`, {
        method: "DELETE",
      });
      carregarContas();
    } catch (error) {
      console.error("Erro ao excluir conta:", error);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      pkConta: null,
      tipoConta: "",
      nomeCompleto: "",
      email: "",
      senha: "",
      fkPerfil: "",
      createdAt: "",
      updatedAt: ""
    });
    setEditando(false);
  };

  return (
    <div className="container mt-5 d-flex justify-content-center">
      <div className="card p-4 shadow w-50">

        <h3 className="mb-4 text-primary">
          <FaUserPlus className="me-2" /> Cadastrar Conta
        </h3>

        {/* Mensagem */}
        {mensagem && (
          <div className={`alert alert-${mensagem.tipo} text-center`} role="alert">
            {mensagem.texto}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-3">

          {/* tipoConta */}
          <div className="mb-3">
            <label className="form-label fw-bold">Tipo de Conta</label>
            <select
              className="form-select text-center"
              name="tipoConta"
              value={formData.tipoConta}
              onChange={handleChange}
              required
            >

              <option value="">Selecione...</option>
              <option value="ADMIN">ADMIN</option>
              <option value="GESTOR_PROVINCIAL">GESTOR PROVINCIAL</option>
              <option value="CIDADAO">CIDADO</option>
            </select>
          </div>

          {/* Nome Completo */}
          <div className="mb-3">
            <label className="form-label fw-bold">Nome Completo</label>
            <input
              type="text"
              className="form-control text-center"
              name="nomeCompleto"
              value={formData.nomeCompleto}
              onChange={handleChange}
              placeholder="Digite o nome completo"
              required
            />
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="form-label fw-bold">E-mail</label>
            <input
              type="email"
              className="form-control text-center"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Digite o e-mail"
              required
            />
          </div>

          {/* Senha */}
          <div className="mb-3">
            <label className="form-label fw-bold">Senha</label>
            <input
              type="password"
              className="form-control text-center"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              placeholder="Digite a senha"
              required={!editando}
            />
          </div>

          {/* Botões */}
        <div className="text-center mt-4">
  <button
    type="submit"
    className="btn me-2 px-4"
    style={{ backgroundColor: "#007bff", borderColor: "#007bff", color: "#fff" }}
    disabled={loading}
  >
    {loading ? (
      <>
        <span
          className="spinner-border spinner-border-sm me-2"
          role="status"
        ></span>
        Salvando...
      </>
    ) : editando ? (
      "Salvar Alterações"
    ) : (
      "Cadastrar"
    )}
  </button>

  <button
    type="button"
    className="btn btn-secondary px-4"
    onClick={resetForm}
    disabled={loading}
  >
    Limpar
  </button>
</div>

        </form>

      </div>
    </div>
  );
}
