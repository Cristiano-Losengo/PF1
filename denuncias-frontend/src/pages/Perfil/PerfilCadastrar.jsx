import { useState, useEffect } from "react";

export default function PerfilCadastrar() {
  const BASE_URL = "http://localhost:9090/api/seguranca";

  const [perfis, setPerfis] = useState([]);
  const [mensagem, setMensagem] = useState(null);

  const [formData, setFormData] = useState({
    pkPerfil: null,
    nome: "",
    detalhes: "",
    nivelAcesso: "Municipal",
    url: "",
    fkPerfil: null
  });

  // Carregar perfis para o select "Perfil Pai"
  const carregarPerfis = async () => {
    try {
      const response = await fetch(`${BASE_URL}/perfil_listar`);
      const data = await response.json();
      setPerfis(data);
    } catch (error) {
      console.error("Erro ao carregar perfis:", error);
    }
  };

  useEffect(() => {
    carregarPerfis();
  }, []);

  // Handle input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Enviar formulário
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${BASE_URL}/perfil_cadastrar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMensagem({ tipo: "success", texto: "Perfil cadastrado com sucesso!" });
        resetForm();
        carregarPerfis();
      } else {
        setMensagem({ tipo: "danger", texto: "Erro ao cadastrar perfil." });
      }
    } catch (error) {
      setMensagem({ tipo: "danger", texto: "Erro de comunicação com o servidor." });
      console.error("Erro ao salvar:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      pkPerfil: null,
      nome: "",
      detalhes: "",
      nivelAcesso: "Municipal",
      url: "",
      fkPerfil: null
    });
  };

  return (
    <div className="container mt-4">
      <h3 className="text-primary">Cadastrar Perfil</h3>
      {mensagem && (
        <div className={`alert alert-${mensagem.tipo} mt-3`} role="alert">
          {mensagem.texto}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-3">
        <div className="mb-3 row">
          <label htmlFor="nome" className="col-sm-2 col-form-label">
            Nome do Perfil
          </label>
          <div className="col-sm-4">
            <input
              type="text"
              className="form-control"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Ex: Administrador Municipal"
              required
            />
          </div>

          <label htmlFor="fkPerfil" className="col-sm-2 col-form-label">
            Perfil Pai
          </label>
          <div className="col-sm-4">
            <select
              className="form-select"
              id="fkPerfil"
              name="fkPerfil"
              value={formData.fkPerfil || ""}
              onChange={handleChange}
            >
              <option value="">Nenhum</option>
              {perfis.map((perfil) => (
                <option key={perfil.pkPerfil} value={perfil.pkPerfil}>
                  {perfil.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-3 row">
          <label htmlFor="nivelAcesso" className="col-sm-2 col-form-label">
            Nível de Acesso
          </label>
          <div className="col-sm-4">
            <select
              className="form-select"
              id="nivelAcesso"
              name="nivelAcesso"
              value={formData.nivelAcesso}
              onChange={handleChange}
            >
              <option value="Municipal">Municipal</option>
              <option value="Provincial">Provincial</option>
              <option value="Central">Central</option>
            </select>
          </div>

          <label htmlFor="url" className="col-sm-2 col-form-label">
            URL
          </label>
          <div className="col-sm-4">
            <input
              type="text"
              className="form-control"
              id="url"
              name="url"
              value={formData.url || ""}
              onChange={handleChange}
              placeholder="/admin/perfis"
            />
          </div>
        </div>

        <div className="mb-3 row">
          <label htmlFor="detalhes" className="col-sm-2 col-form-label">
            Detalhes
          </label>
          <div className="col-sm-10">
            <textarea
              className="form-control"
              id="detalhes"
              name="detalhes"
              value={formData.detalhes}
              onChange={handleChange}
              placeholder="Ex: Permite gerir denúncias e utilizadores no nível municipal."
              rows="2"
            ></textarea>
          </div>
        </div>

        <div className="mt-3">
          <button type="submit" className="btn btn-success me-2">
            Cadastrar
          </button>
          <button type="button" className="btn btn-secondary" onClick={resetForm}>
            Limpar
          </button>
        </div>
      </form>
    </div>
  );
}
