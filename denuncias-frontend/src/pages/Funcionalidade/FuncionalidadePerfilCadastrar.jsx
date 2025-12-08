import { useEffect, useState } from "react";

export default function FuncionalidadePerfilCadastrar() {
  const [funcionalidades, setFuncionalidades] = useState([]);
  const [perfis, setPerfis] = useState([]);

  const [formData, setFormData] = useState({
    fkFuncionalidade: "",
    fkPerfil: "",
    detalhe: "",
  });

  const [mensagem, setMensagem] = useState(null);
  const [loading, setLoading] = useState(false);

  // Carregar listas
  const carregarFuncionalidades = async () => {
    try {
      const res = await fetch("http://localhost:9090/api/seguranca/funcionalidade_listar");
      setFuncionalidades(await res.json());
    } catch (e) {
      console.error("Erro ao carregar funcionalidades", e);
    }
  };

  const carregarPerfis = async () => {
    try {
      const res = await fetch("http://localhost:9090/api/seguranca/perfil_listar");
      setPerfis(await res.json());
    } catch (e) {
      console.error("Erro ao carregar perfis", e);
    }
  };

  useEffect(() => {
    carregarFuncionalidades();
    carregarPerfis();
  }, []);

  // Handle input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Limpar
  const resetForm = () => {
    setFormData({
      fkFuncionalidade: "",
      fkPerfil: "",
      detalhe: "",
    });
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensagem(null);

    try {
      const response = await fetch(
        "http://localhost:9090/api/seguranca/funcionalidade_perfil_cadastrar",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        setMensagem({ tipo: "success", texto: "Salvo com sucesso!" });
        resetForm();
      } else {
        setMensagem({ tipo: "danger", texto: "Erro ao salvar." });
      }
    } catch (error) {
      setMensagem({ tipo: "danger", texto: "Erro de comunicação com o servidor." });
    }

    setLoading(false);
  };

  return (
    <div className="container mt-5 d-flex justify-content-center">
      <div className="card p-4 shadow w-50">

        <h3 className="mb-4">Atribuir Funcionalidade o Perfil</h3>

        {mensagem && (
          <div className={`alert alert-${mensagem.tipo} text-center`} role="alert">
            {mensagem.texto}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-3">

          {/* Funcionalidade */}
          <div className="mb-3">
            <label htmlFor="fkFuncionalidade" className="form-label fw-bold">
              Funcionalidade
            </label>
            <select
              className="form-select text-center"
              id="fkFuncionalidade"
              name="fkFuncionalidade"
              value={formData.fkFuncionalidade}
              onChange={handleChange}
              required
            >
              <option value="">Selecione...</option>
              {funcionalidades.map((f) => (
                <option key={f.pkFuncionalidade} value={f.pkFuncionalidade}>
                  {f.designacao}
                </option>
              ))}
            </select>
          </div>

          {/* Perfil */}
          <div className="mb-3">
            <label htmlFor="fkPerfil" className="form-label fw-bold">
              Perfil
            </label>
            <select
              className="form-select text-center"
              id="fkPerfil"
              name="fkPerfil"
              value={formData.fkPerfil}
              onChange={handleChange}
              required
            >
              <option value="">Selecione...</option>
              {perfis.map((p) => (
                <option key={p.pkPerfil} value={p.pkPerfil}>
                  {p.designacao}
                </option>
              ))}
            </select>
          </div>

          {/* Detalhe */}
          <div className="mb-3">
            <label htmlFor="detalhe" className="form-label fw-bold">
              Detalhe
            </label>
            <textarea
              className="form-control text-center"
              id="detalhe"
              name="detalhe"
              value={formData.detalhe}
              onChange={handleChange}
              rows="3"
              placeholder="Descrição adicional"
            ></textarea>
          </div>

          {/* Botões */}
          <div className="text-center mt-4">
            <button type="submit" className="btn btn-success me-2 px-4" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
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
