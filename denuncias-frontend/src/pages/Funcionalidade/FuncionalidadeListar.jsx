import { useEffect, useState } from "react";

export default function FuncionalidadeListar() {
  const [funcionalidades, setFuncionalidades] = useState([]);

  // Carregar lista
  const carregarFuncionalidades = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/seguranca/funcionalidade_listar");
      const data = await response.json();
      setFuncionalidades(data);
    } catch (error) {
      console.error("Erro ao carregar funcionalidades:", error);
    }
  };

  useEffect(() => {
    carregarFuncionalidades();
  }, []);

  // Excluir
  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir?")) return;
    try {
      await fetch(`http://localhost:8080/api/seguranca/funcionalidade/${id}`, {
        method: "DELETE",
      });
      carregarFuncionalidades();
    } catch (error) {
      console.error("Erro ao excluir:", error);
    }
  };

  return (
    <div className="container mt-4">
      <h3>Lista de Funcionalidades</h3>
      <table className="table table-bordered table-striped">
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>Descrição</th>
            <th>Designação</th>
            <th>Tipo</th>
            <th>URL</th>
            <th>Criado em</th>
            <th>Atualizado em</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {funcionalidades.map((f, i) => (
            <tr key={f.pkFuncionalidade}>
              <td>{i + 1}</td>
              <td>{f.descricao}</td>
              <td>{f.designacao}</td>
              <td>{f.tipoFuncionalidade}</td>
              <td>{f.url}</td>
              <td>{new Date(f.createdAt).toLocaleString()}</td>
              <td>{new Date(f.updatedAt).toLocaleString()}</td>
              <td>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(f.pkFuncionalidade)}
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
          {funcionalidades.length === 0 && (
            <tr>
              <td colSpan={8} className="text-center">
                Nenhuma funcionalidade cadastrada
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
