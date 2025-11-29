import { useState } from "react";

export default function FuncionalidadeCadastrar() {
  const [file, setFile] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);
  const [erros, setErros] = useState([]);
  const [sucesso, setSucesso] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMensagem("");
    setErros([]);
    setSucesso(false);
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setMensagem("Por favor selecione um ficheiro!");
      return;
    }

    setLoading(true);
    setMensagem("");
    setErros([]);
    setSucesso(false);

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

      const resultado = await response.json();

      if (response.ok) {
        if (resultado.sucesso) {
          setMensagem("✅ " + resultado.mensagem);
          setSucesso(true);
          setFile(null);
        } else {
          setErros(resultado.erros || [resultado.erro]);
          setMensagem("❌ Erros encontrados na importação");
        }
      } else {
        if (resultado.erros) {
          setErros(resultado.erros);
        } else {
          setErros([resultado.erro || "❌ Erro ao importar ficheiro!"]);
        }
        setMensagem("❌ Erro na importação");
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      setMensagem("❌ Erro de conexão com o servidor.");
      setErros(["Não foi possível conectar ao servidor"]);
    }

    setLoading(false);
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-4">Cadastrar Funcionalidade</h3>

      {mensagem && (
        <div 
          className={`alert py-2 ${
            sucesso ? 'alert-success' : 'alert-danger'
          }`}
        >
          {mensagem}
        </div>
      )}

      {erros.length > 0 && (
        <div className="alert alert-danger">
          <h6>Erros encontrados:</h6>
          <ul className="mb-0">
            {erros.map((erro, index) => (
              <li key={index}>{erro}</li>
            ))}
          </ul>
        </div>
      )}

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
            <div className="form-text">
              Formato esperado: Excel com duas folhas (funcionalidades e tipos de funcionalidade)
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !file}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
               enviar...
              </>
            ) : (
              " Enviar"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}