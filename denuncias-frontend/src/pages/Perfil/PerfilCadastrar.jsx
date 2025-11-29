import { useState } from "react";

export default function PerfilCadastrar() {
  const BASE_URL = "http://localhost:9090/api/seguranca";

  const [mensagem, setMensagem] = useState(null);

  const [formData, setFormData] = useState({
    designacao: "",
    estado: "1",
    descricao: "",
  });

  // Handle input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Enviar formulário
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:9090/api/seguranca/perfil_cadastrar', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMensagem({ tipo: "success", texto: "Salvo com sucesso!" });
        resetForm();
      } else {
        setMensagem({ tipo: "danger", texto: "Erro ao salvar." });
      }
    } catch (error) {
      setMensagem({ tipo: "danger", texto: "Erro de comunicação com o servidor." });
      console.error("Erro ao salvar:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      designacao: "",
      estado: "activo",
      descricao: "",
    });
  };

  return (
    <div className="container mt-5 d-flex justify-content-center">
      <div className="card p-4 shadow w-50">

        <h3 className="mb-4">Cadastrar Dados do Perfil</h3>

        {mensagem && (
          <div className={`alert alert-${mensagem.tipo} mt-3 text-center`} role="alert">
            {mensagem.texto}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-3">

          {/* designacao */}
          <div className="mb-3">
            <label htmlFor="designacao" className="form-label fw-bold">designacao</label>
            <input
              type="text"
              className="form-control text-center"
              id="designacao"
              name="designacao"
              value={formData.designacao}
              onChange={handleChange}
              placeholder="Digite o designacao"
              required
            />
          </div>

          {/* Estado */}
          <div className="mb-3">
            <label htmlFor="estado" className="form-label fw-bold">Estado</label>
            <select
              className="form-select text-center"
              id="estado"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              required
            >
              <option value="1" >activo</option>
              <option value="0">desactivo</option>
            </select>
          </div>

          {/* Descrição */}
          <div className="mb-3">
            <label htmlFor="descricao" className="form-label fw-bold">Descrição</label>
            <textarea
              className="form-control text-center"
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              placeholder="Descreva aqui"
              rows="2"
            ></textarea>
          </div>

          {/* Botões */}
          <div className="text-center mt-4">
            <button type="submit" className="btn btn-success me-2 px-4">
              Salvar
            </button>
            <button type="button" className="btn btn-secondary px-4" onClick={resetForm}>
              Limpar
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
