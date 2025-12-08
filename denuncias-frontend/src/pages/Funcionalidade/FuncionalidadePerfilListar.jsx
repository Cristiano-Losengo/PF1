import React, { useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaTrash } from "react-icons/fa";

export default function FuncionalidadePerfilTree() {
  const [data, setData] = useState([]);
  const [abertos, setAbertos] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const toggle = (perfilId) => {
    const nova = new Set(abertos);
    nova.has(perfilId) ? nova.delete(perfilId) : nova.add(perfilId);
    setAbertos(nova);
  };

  const handleDelete = (funcionalidade) => {
    if (!window.confirm(`Deseja remover "${funcionalidade.nomeFuncionalidade}" do perfil "${funcionalidade.nomePerfil}"?`)) return;
    console.log("Excluir:", funcionalidade);
    // Aqui você chamaria a API de exclusão
  };

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await fetch("http://localhost:9090/api/seguranca/funcionalidade_perfil_listar");
        const json = await resp.json();
        setData(json || []); // Evita undefined
      } catch (e) {
        console.error("Erro ao carregar:", e);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="p-3">A carregar...</div>;

  // Agrupar por perfil
  const perfisMap = {};
  data.forEach(item => {
    if (!perfisMap[item.fkPerfil]) perfisMap[item.fkPerfil] = { nome: item.nomePerfil, funcionalidades: [] };
    perfisMap[item.fkPerfil].funcionalidades.push(item);
  });

  return (
    <div className="container mt-4">
      <h3 className="mb-4">Funcionalidades por Perfil</h3>
      <ul className="list-group">
        {Object.entries(perfisMap).map(([perfilId, perfil]) => {
          const aberto = abertos.has(perfilId);
          return (
            <li key={perfilId} className="list-group-item">
              <div className="d-flex justify-content-between align-items-center">
                <strong>{perfil.nome}</strong>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => toggle(perfilId)}
                >
                  {aberto ? "−" : "+"}
                </button>
              </div>
              {aberto && (
                <ul className="list-group mt-2 ms-4">
                  {perfil.funcionalidades.map(func => (
                    <li key={func.fkFuncionalidade} className="list-group-item d-flex justify-content-between align-items-center">
                      <span>{func.nomeFuncionalidade}</span>
                      <FaTrash
                        style={{ cursor: "pointer", color: "red" }}
                        onClick={() => handleDelete(func)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
