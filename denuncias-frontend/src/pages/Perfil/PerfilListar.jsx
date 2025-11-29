import { useEffect, useState } from "react";

export default function PerfilListar() {
  const [perfis, setPerfis] = useState([]);

  // Carregar lista
  const carregarPerfis = async () => {
    try {
      const response = await fetch("http://localhost:9090/api/seguranca/perfil_listar");
      const data = await response.json();
      setPerfis(data);
    } catch (error) {
      console.error("Erro ao carregar perfis:", error);
    }
  };

  useEffect(() => {
    carregarPerfis();
  }, []);

  // Excluir
  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir?")) return;
    try {
      await fetch(`http://localhost:9090/api/seguranca/perfil_excluir/${id}`, {
        method: "DELETE",
      });
      carregarPerfis();
    } catch (error) {
      console.error("Erro ao excluir:", error);
    }
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-4"> Lista de Perfis</h3>
      <table className="table table-bordered table-striped">
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>Nome</th>
            <th>Detalhes</th>
            <th>URL</th>
            <th>Perfil Pai</th>
            <th>Criado em</th>
            <th>Atualizado em</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {perfis.map((perfil, i) => (
            <tr key={perfil.pkPerfil}>
              <td>{i + 1}</td>
              <td>{perfil.designacao}</td>
              <td>{perfil.descricao}</td>
              <td>{perfil.url}</td>
              <td>
                {perfil.fkPerfil
                  ? perfis.find((p) => p.pkPerfil === perfil.fkPerfil)?.nome
                  : "Nenhum"}
              </td>
              <td>{new Date(perfil.createdAt).toLocaleString()}</td>
              <td>{perfil.updatedAt ? new Date(perfil.updatedAt).toLocaleString() : "-"}</td>
              <td>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(perfil.pkPerfil)}
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
          {perfis.length === 0 && (
            <tr>
              <td colSpan={8} className="text-center">
                Nenhum Perfil cadastrado
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
