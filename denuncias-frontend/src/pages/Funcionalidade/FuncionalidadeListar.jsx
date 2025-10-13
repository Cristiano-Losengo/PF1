import { useEffect, useState } from "react";
import { FaTrash, FaSyncAlt } from "react-icons/fa";

export default function FuncionalidadeListar() {
  const BASE_URL = "http://localhost:9090/api/seguranca";
  const [funcionalidades, setFuncionalidades] = useState([]);

  const carregarFuncionalidades = async () => {
    try {
      const response = await fetch(`${BASE_URL}/funcionalidade_listar`);
      const data = await response.json();
      setFuncionalidades(data);
    } catch (error) {
      console.error("Erro ao carregar funcionalidades:", error);
    }
  };

  useEffect(() => {
    carregarFuncionalidades();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta funcionalidade?")) return;
    try {
      await fetch(`${BASE_URL}/funcionalidade/${id}`, { method: "DELETE" });
      carregarFuncionalidades();
    } catch (error) {
      console.error("Erro ao excluir:", error);
    }
  };

  return (
    <div className="container mt-4">
      <h3 className="text-primary">Funcionalidades do Sistema</h3>
      <button className="btn btn-outline-primary mb-3" onClick={carregarFuncionalidades}>
        <FaSyncAlt /> Atualizar
      </button>

      <table className="table table-hover table-bordered align-middle">
        <thead className="table-dark text-center">
          <tr>
            <th>#</th>
            <th>Descrição</th>
            <th>Designação</th>
            <th>Módulo</th>
            <th>Tipo</th>
            <th>Nível</th>
            <th>URL</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {funcionalidades.map((f, i) => (
            <tr key={f.pkFuncionalidade}>
              <td>{i + 1}</td>
              <td>{f.descricao}</td>
              <td>{f.designacao}</td>
              <td>{f.modulo}</td>
              <td>{f.tipoFuncionalidade}</td>
              <td>{f.nivelAcesso}</td>
              <td>{f.url}</td>
              <td className="text-center">
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(f.pkFuncionalidade)}
                >
                  <FaTrash /> Excluir
                </button>
              </td>
            </tr>
          ))}
          {funcionalidades.length === 0 && (
            <tr>
              <td colSpan={8} className="text-center text-muted">
                Nenhuma funcionalidade cadastrada
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
