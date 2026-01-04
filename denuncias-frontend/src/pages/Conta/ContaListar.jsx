import React, { useEffect, useState } from "react";
import { FaUsers } from "react-icons/fa";


export default function ContaListar() {
  const [contas, setContas] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregarContas = async () => {
    try {
      const response = await fetch("hhttp://localhost:9090/api/conta_perfis/listar_conta_perfil");
      const data = await response.json();
      setContas(data || []);
    } catch (error) {
      console.error("Erro ao carregar contas:", error);
      setContas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarContas();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta conta?")) return;
    try {
      await fetch(`http://localhost:9090/api/seguranca/conta_excluir/${id}`, { method: "DELETE" });
      carregarContas();
    } catch (error) {
      console.error("Erro ao excluir conta:", error);
    }
  };

  if (loading) return <div className="p-3">A carregar...</div>;

  return (
    <div className="container mt-4">
      <h3 className="mb-4 text-primary">
        <FaUsers className="me-2" /> Lista de Contas
      </h3>
      <table className="table table-bordered table-striped">
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>Tipo</th>
            <th>Nome Completo</th>
            <th>Email</th>
            <th>Criado em</th>
            <th>Atualizado em</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {contas.length > 0 ? (
            contas.map((conta, i) => (
              <tr key={conta.pkConta}>
                <td>{i + 1}</td>
                <td>{conta.tipoConta}</td>
                <td>{conta.nomeCompleto}</td>
                <td>{conta.email}</td>
                <td>{new Date(conta.createdAt).toLocaleString()}</td>
                <td>{conta.updatedAt ? new Date(conta.updatedAt).toLocaleString() : "-"}</td>
                <td>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(conta.pkConta)}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="text-center">
                Nenhuma conta cadastrada
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
