import { useState, useEffect } from "react";

export default function PerfilCadastrar() {
  const [perfis, setPerfis] = useState([]);
  const [formData, setFormData] = useState({
    pkPerfil: null,
    nome: "",
    detalhes: "",
    url: "",
    fkPerfil: null
  });

  // Carregar perfis (para popular o select de "Perfil Pai")
  const carregarPerfis = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/seguranca/perfil_listar");
      const data = await response.json();
      setPerfis(data);
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
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

  // Salvar (apenas POST aqui)
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await fetch("http://localhost:8080/api/seguranca/perfil_cadastrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      alert("Perfil cadastrado com sucesso!");
      resetForm();
      carregarPerfis();
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      pkPerfil: null,
      nome: "",
      detalhes: "",
      url: "",
      fkPerfil: null
    });
  };

  return (
    <div className="container mt-4">
      <h3>Cadastrar Perfil</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3 row">
          <label htmlFor="nome" className="col-sm-2 col-form-label">
            Nome
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
          <label htmlFor="detalhes" className="col-sm-2 col-form-label">
            Detalhes
          </label>
          <div className="col-sm-4">
            <input
              type="text"
              className="form-control"
              id="detalhes"
              name="detalhes"
              value={formData.detalhes}
              onChange={handleChange}
            />
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
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary me-2">
          Cadastrar
        </button>
        <button type="button" className="btn btn-secondary" onClick={resetForm}>
          Limpar
        </button>
      </form>
    </div>
  );
}
