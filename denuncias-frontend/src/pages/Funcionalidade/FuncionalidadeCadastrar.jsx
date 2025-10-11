import { useState } from "react";

export default function FuncionalidadeCadastrar() {
  const [formData, setFormData] = useState({
    descricao: "",
    designacao: "",
    tipoFuncionalidade: "FORM",
    categoria: "",
    url: "",
    ativo: true
  });

  const [mensagem, setMensagem] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.descricao || !formData.designacao || !formData.categoria) {
      setMensagem("⚠️ Preencha todos os campos obrigatórios!");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/seguranca/funcionalidade_cadastrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setMensagem("✅ Funcionalidade cadastrada com sucesso!");
        resetForm();
      } else {
        setMensagem("❌ Erro ao salvar. Verifique os dados.");
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      setMensagem("❌ Erro de conexão com o servidor.");
    }
  };

  const resetForm = () => {
    setFormData({
      descricao: "",
      designacao: "",
      tipoFuncionalidade: "FORM",
      categoria: "",
      url: "",
      ativo: true
    });
  };

  return (
    <div className="container mt-4">
      <h3 className="fw-bold text-primary mb-3">Cadastrar Funcionalidade</h3>

      {mensagem && (
        <div className="alert alert-info py-2">{mensagem}</div>
      )}

      <form onSubmit={handleSubmit} className="border p-4 rounded bg-light shadow-sm">
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">Descrição *</label>
            <input
              type="text"
              className="form-control"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Designação *</label>
            <input
              type="text"
              className="form-control"
              name="designacao"
              value={formData.designacao}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4">
            <label className="form-label">Tipo de Funcionalidade</label>
            <select
              className="form-select"
              name="tipoFuncionalidade"
              value={formData.tipoFuncionalidade}
              onChange={handleChange}
            >
              <option value="MODULO">Módulo</option>
              <option value="FORM">Formulário</option>
              <option value="API">API</option>
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">Categoria *</label>
            <select
              className="form-select"
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              required
            >
              <option value="">Selecione...</option>
              <option value="DENUNCIA">Denúncia</option>
              <option value="SEGURANCA">Segurança</option>
              <option value="RELATORIO">Relatório</option>
              <option value="CONFIGURACAO">Configuração</option>
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">URL</label>
            <input
              type="text"
              className="form-control"
              name="url"
              value={formData.url}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-check mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            id="ativo"
            name="ativo"
            checked={formData.ativo}
            onChange={handleChange}
          />
          <label className="form-check-label" htmlFor="ativo">
            Ativo
          </label>
        </div>

        <button type="submit" className="btn btn-primary me-2">
          Salvar
        </button>
        <button type="button" className="btn btn-secondary" onClick={resetForm}>
          Limpar
        </button>
      </form>
    </div>
  );
}
