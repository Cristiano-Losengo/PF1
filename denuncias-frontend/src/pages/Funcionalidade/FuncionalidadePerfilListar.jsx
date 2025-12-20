import React, { useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaTrash, FaTasks, FaChevronDown, FaChevronRight, FaSyncAlt, FaExclamationTriangle } from "react-icons/fa";

export default function FuncionalidadePerfilTree() {
  const [data, setData] = useState([]);
  const [abertos, setAbertos] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const toggle = (perfilId) => {
    const nova = new Set(abertos);
    nova.has(perfilId) ? nova.delete(perfilId) : nova.add(perfilId);
    setAbertos(nova);
  };

  const handleDelete = async (funcionalidade) => {
    if (!window.confirm(`Deseja remover "${funcionalidade.nomeFuncionalidade}" do perfil "${funcionalidade.nomePerfil}"?`)) return;
    
    try {
      const response = await fetch("http://localhost:9090/api/seguranca/funcionalidade_perfil_excluir", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fkPerfil: funcionalidade.fkPerfil,
          fkFuncionalidade: funcionalidade.fkFuncionalidade
        })
      });

      if (!response.ok) {
        throw new Error(`Erro ao remover: ${response.status}`);
      }

      const result = await response.json();
      if (result.sucesso) {
        alert("Funcionalidade removida com sucesso!");
        // Recarregar os dados para refletir a remoção
        loadData();
      } else {
        alert(result.mensagem || "Erro ao remover funcionalidade");
      }
    } catch (e) {
      console.error("Erro ao remover:", e);
      alert("Não foi possível remover a funcionalidade. Tente novamente.");
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const resp = await fetch("http://localhost:9090/api/seguranca/funcionalidade_perfil_listar");
      if (!resp.ok) {
        throw new Error(`Erro ao carregar dados: ${resp.status}`);
      }
      const json = await resp.json();
      setData(json || []);
    } catch (e) {
      console.error("Erro ao carregar:", e);
      setError("Não foi possível carregar os dados. Tente novamente.");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Agrupar por perfil
  const perfisMap = {};
  data.forEach(item => {
    if (!perfisMap[item.fkPerfil]) {
      perfisMap[item.fkPerfil] = { 
        nome: item.nomePerfil, 
        estado: item.estadoPerfil || "ATIVO", // Pega o estado do perfil
        funcionalidades: [] 
      };
    }
    perfisMap[item.fkPerfil].funcionalidades.push(item);
  });

  if (loading) {
    return (
      <div className="container mt-4 d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <div className="text-center">
          <div className="spinner-grow text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="text-dark fs-5">A carregar dados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger d-flex align-items-center" role="alert">
          <FaTasks className="me-3 flex-shrink-0" size={24} />
          <div>
            <h5 className="alert-heading mb-2">Erro ao carregar dados</h5>
            <p className="mb-0">{error}</p>
            <button 
              className="btn btn-outline-danger btn-sm mt-2"
              onClick={loadData}
            >
              <FaSyncAlt className="me-1" /> Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Header com contraste melhorado */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0 text-dark" style={{ fontWeight: '600' }}>
          <FaTasks className="me-2 text-primary" style={{ verticalAlign: 'middle' }} />
          Funcionalidades por Perfil
        </h2>
        <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-2">
          {Object.keys(perfisMap).length} perfis
        </span>
      </div>

      {data.length === 0 ? (
        <div className="alert alert-info d-flex align-items-center" role="alert">
          <FaTasks className="me-3 flex-shrink-0" size={20} />
          <div>
            <h5 className="alert-heading mb-1">Nenhuma associação encontrada</h5>
            <p className="mb-0">Não há funcionalidades atribuídas a perfis no momento.</p>
          </div>
        </div>
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">
            <div className="list-group list-group-flush">
              {Object.entries(perfisMap).map(([perfilId, perfil]) => {
                const aberto = abertos.has(perfilId);
                const isInativo = perfil.estado === "INATIVO";
                
                return (
                  <div 
                    key={perfilId} 
                    className="list-group-item border-bottom bg-white"
                    style={{
                      transition: 'all 0.2s ease',
                      borderLeft: aberto 
                        ? (isInativo ? '4px solid #dc3545' : '4px solid #0d6efd') 
                        : '4px solid transparent'
                    }}
                  >
                    {/* Perfil header com melhor contraste */}
                    <div 
                      className="d-flex justify-content-between align-items-center py-3 px-3"
                      style={{ 
                        cursor: 'pointer',
                        backgroundColor: aberto 
                          ? (isInativo ? 'rgba(220, 53, 69, 0.05)' : 'rgba(13, 110, 253, 0.05)')
                          : 'transparent',
                        borderRadius: '8px'
                      }}
                      onClick={() => toggle(perfilId)}
                    >
                      <div className="d-flex align-items-center">
                        <div className="me-3">
                          {aberto ? (
                            <FaChevronDown className={isInativo ? "text-danger" : "text-primary"} />
                          ) : (
                            <FaChevronRight className={isInativo ? "text-danger" : "text-secondary"} />
                          )}
                        </div>
                        <div>
                          <h5 className="mb-0 text-dark" style={{ fontWeight: '600' }}>
                            {perfil.nome}
                            {isInativo && (
                              <span className="badge bg-danger ms-2">
                                <FaExclamationTriangle className="me-1" /> INATIVO
                              </span>
                            )}
                          </h5>
                          <small className={isInativo ? "text-danger" : "text-muted"}>
                            {perfil.funcionalidades.length} funcionalidade{perfil.funcionalidades.length !== 1 ? 's' : ''}
                            {isInativo && " (Perfil inativo)"}
                          </small>
                        </div>
                      </div>
                      <div className="d-flex align-items-center">
                        {isInativo && (
                          <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 me-2">
                            Perfil Inativo
                          </span>
                        )}
                        <button
                          className="btn btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggle(perfilId);
                          }}
                          aria-label={aberto ? "Recolher" : "Expandir"}
                          style={{ 
                            minWidth: '80px',
                            borderWidth: '2px',
                            backgroundColor: isInativo ? 'rgba(220, 53, 69, 0.1)' : 'transparent',
                            borderColor: isInativo ? '#dc3545' : '#0d6efd',
                            color: isInativo ? '#dc3545' : '#0d6efd'
                          }}
                        >
                          {aberto ? "Recolher" : "Expandir"}
                        </button>
                      </div>
                    </div>

                    {/* Lista de funcionalidades com melhor contraste */}
                    {aberto && (
                      <div className="mt-3 ms-4 me-3">
                        <ul className="list-group list-group-flush">
                          {perfil.funcionalidades.map((func, index) => (
                            <li 
                              key={`${func.fkFuncionalidade}-${index}`} 
                              className="list-group-item d-flex justify-content-between align-items-center py-3 px-3"
                              style={{
                                backgroundColor: index % 2 === 0 ? '#f8f9fa' : '#ffffff',
                                borderRadius: '6px',
                                border: '1px solid #e9ecef',
                                marginBottom: '8px',
                                opacity: isInativo ? 0.8 : 1
                              }}
                            >
                              <div className="d-flex align-items-center">
                                <div 
                                  className="me-3 rounded-circle d-flex align-items-center justify-content-center"
                                  style={{
                                    width: '36px',
                                    height: '36px',
                                    backgroundColor: isInativo 
                                      ? 'rgba(220, 53, 69, 0.1)' 
                                      : 'rgba(13, 110, 253, 0.1)'
                                  }}
                                >
                                  <span 
                                    className={isInativo ? "text-danger" : "text-primary"} 
                                    style={{ fontSize: '0.9rem', fontWeight: '600' }}
                                  >
                                    {index + 1}
                                  </span>
                                </div>
                                <div>
                                  <span 
                                    className="text-dark"
                                    style={{ 
                                      fontWeight: '500',
                                      fontSize: '1rem'
                                    }}
                                  >
                                    {func.nomeFuncionalidade}
                                  </span>
                                  {isInativo && (
                                    <div className="text-danger small mt-1">
                                      <FaExclamationTriangle className="me-1" />
                                      Esta funcionalidade está associada a um perfil inativo
                                    </div>
                                  )}
                                </div>
                              </div>
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleDelete(func)}
                                aria-label={`Remover ${func.nomeFuncionalidade}`}
                                style={{
                                  borderWidth: '2px',
                                  padding: '0.25rem 0.75rem'
                                }}
                                disabled={isInativo}
                                title={isInativo ? "Não é possível remover funcionalidades de perfis inativos" : ""}
                              >
                                <FaTrash className="me-1" />
                                Remover
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Estatísticas no rodapé */}
      {data.length > 0 && (
        <div className="mt-4 pt-3 border-top">
          <div className="row">
            <div className="col-md-6">
              <div className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 rounded p-2 me-3">
                  <FaTasks className="text-primary" />
                </div>
                <div>
                  <p className="mb-0 text-muted small">Total de associações</p>
                  <h4 className="mb-0 text-dark">{data.length}</h4>
                </div>
              </div>
              <div className="d-flex align-items-center mt-3">
                <div className="bg-danger bg-opacity-10 rounded p-2 me-3">
                  <FaExclamationTriangle className="text-danger" />
                </div>
                <div>
                  <p className="mb-0 text-muted small">Perfis inativos</p>
                  <h4 className="mb-0 text-dark">
                    {Object.values(perfisMap).filter(p => p.estado === "INATIVO").length}
                  </h4>
                </div>
              </div>
            </div>
            <div className="col-md-6 text-md-end">
              <p className="text-muted small mb-0">
                Última atualização: {new Date().toLocaleDateString('pt-PT')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}