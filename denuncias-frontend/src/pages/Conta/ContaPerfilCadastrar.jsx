import React, { useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaTrash } from "react-icons/fa";
import { FaUserShield } from "react-icons/fa";


export default function ContaPerfilListar() {
  const [data, setData] = useState([]);
  const [abertos, setAbertos] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const toggle = (pessoaId) => {
    const nova = new Set(abertos);
    nova.has(pessoaId) ? nova.delete(pessoaId) : nova.add(pessoaId);
    setAbertos(nova);
  };

  const handleDelete = (item) => {
    if (!window.confirm(`Deseja remover o perfil "${item.designacaoPerfil}" do usuário "${item.nomeCompleto}"?`)) return;
    console.log("Excluir:", item);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await fetch("http://localhost:9090/api/seguranca/conta_perfil_listar");
        const json = await resp.json();
        setData(json || []);
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

  // ➤ Agrupar por nomeCompleto
  const pessoasMap = {};
  data.forEach(item => {
    if (!pessoasMap[item.nomeCompleto]) {
      pessoasMap[item.nomeCompleto] = { pessoa: item, perfis: [] };
    }
    pessoasMap[item.nomeCompleto].perfis.push(item.designacaoPerfil);
  });

  return (
    <div className="container mt-4">
      <h3 className="mb-4 text-primary">
        <FaUserShield className="me-2" /> Perfis por Utilizador
      </h3>
      <ul className="list-group">
        {Object.entries(pessoasMap).map(([nome, bloco]) => {
          const aberto = abertos.has(nome);
          return (
            <li key={nome} className="list-group-item">
              <div className="d-flex justify-content-between align-items-center">
                <strong>{nome}</strong>

                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => toggle(nome)}
                >
                  {aberto ? "−" : "+"}
                </button>
              </div>

              {aberto && (
                <ul className="list-group mt-2 ms-4">
                  {bloco.perfis.map((perfil, idx) => (
                    <li
                      key={idx}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <span>{perfil}</span>
                      <FaTrash
                        style={{ cursor: "pointer", color: "red" }}
                        onClick={() => handleDelete({ nomeCompleto: nome, designacaoPerfil: perfil })}
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
