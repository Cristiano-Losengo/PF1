import { useState } from "react";

export default function FuncionalidadeCadastrar() {
  const [file, setFile] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false); // <<< loading

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setMensagem("Por favor selecione um ficheiro!");
      return;
    }

    setLoading(true); // <<< inicia loading

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const response = await fetch(
        "http://localhost:9090/api/seguranca/funcionalidade_importar",
        {
          method: "POST",
          body: formDataUpload,
        }
      );

      if (response.ok) {
        setMensagem("✅ Ficheiro importado com sucesso!");
        setFile(null);
      } else {
        setMensagem("❌ Erro ao importar ficheiro!");
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      setMensagem("❌ Erro de conexão com o servidor.");
    }

    setLoading(false); // <<< termina loading
  };

  return (
    <div className="container mt-4">
      <h3 className="fw-bold text-primary mb-3">Cadastrar Funcionalidade</h3>

      {mensagem && <div className="alert alert-info py-2">{mensagem}</div>}

      <div className="card p-4 mt-4 col-6 offset-3">
        <h5 className="mb-3">Importar Funcionalidade</h5>

        <form onSubmit={handleFileUpload}>
          <div className="mb-3">
            <label className="form-label fw-bold">
              Carregar ficheiro (.xls, .xlsx, .csv)
            </label>

            <input
              type="file"
              className="form-control"
              accept=".csv, .xlsx, .xls"
              onChange={handleFileChange}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading} // <<< desativa quando carregando
          >
            {loading ? "A enviar..." : "Enviar"} {/* <<< botão muda */}
          </button>
        </form>
      </div>
    </div>
  );
}
