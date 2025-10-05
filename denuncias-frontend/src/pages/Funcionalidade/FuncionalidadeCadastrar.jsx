import { useState } from "react";

export default function FuncionalidadeCadastrar() {
  const [formData, setFormData] = useState({
    pkFuncionalidade: null,
    descricao: "",
    designacao: "",
    tipoFuncionalidade: "FORM",
    url: ""
  });

  // Handle input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Salvar (POST)
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await fetch("http://localhost:8080/api/seguranca/funcionalidade_cadastrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      alert("Funcionalidade cadastrada com sucesso!");
      resetForm();
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      pkFuncionalidade: null,
      descricao: "",
      designacao: "",
      tipoFuncionalidade: "FORM",
      url: ""
    });
  };

  return (
    <div className="container mt-4">
      <h3>Cadastrar Funcionalidade</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3 row">
          <label htmlFor="descricao" className="col-sm-2 col-form-label">
            Descrição
          </label>
          <div className="col-sm-4">
            <input
              type="text"
              className="form-control"
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              required
            />
          </div>

          <label htmlFor="tipoFuncionalidade" className="col-sm-2 col-form-label">
            Tipo
          </label>
          <div className="col-sm-4">
            <select
              className="form-select"
              id="tipoFuncionalidade"
              name="tipoFuncionalidade"
              value={formData.tipoFuncionalidade}
              onChange={handleChange}
            >
              <option value="MODULO">MÓDULO</option>
              <option value="FORM">FORM</option>
            </select>
          </div>
        </div>

        <div className="mb-3 row">
          <label htmlFor="designacao" className="col-sm-2 col-form-label">
            Designação
          </label>
          <div className="col-sm-4">
            <input
              type="text"
              className="form-control"
              id="designacao"
              name="designacao"
              value={formData.designacao}
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
              value={formData.url}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <button type="submit" className="btn btn-primary me-2">
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
