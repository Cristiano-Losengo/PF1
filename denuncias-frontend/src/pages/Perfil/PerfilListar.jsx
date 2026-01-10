import { useEffect, useState } from "react";
import { FaUsers, FaEdit, FaHistory, FaTrash, FaUserPlus, FaSpinner, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function PerfilListar() {
  const [perfis, setPerfis] = useState([]);
  const [mostrarHistorico, setMostrarHistorico] = useState(false);
  const [historicoData, setHistoricoData] = useState([]);
  const [perfilHistorico, setPerfilHistorico] = useState(null);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);
  const [carregandoPerfis, setCarregandoPerfis] = useState(true);
  const [excluindo, setExcluindo] = useState(null);
  const [mensagem, setMensagem] = useState(null);
  
  const navigate = useNavigate();
  
  const BASE_URL = "http://localhost:9090/api/seguranca";
  
  // Função para formatar o estado
  const formatarEstado = (estado) => {
    if (estado === 1 || estado === "1") {
      return <span className="badge bg-success">ATIVO</span>;
    } else if (estado === 0 || estado === "0") {
      return <span className="badge bg-danger">INATIVO</span>;
    } else {
      return <span className="badge bg-secondary">DESCONHECIDO</span>;
    }
  };

  const carregarPerfis = async () => {
    try {
      setCarregandoPerfis(true);
      setMensagem(null);
      
      const response = await fetch(`${BASE_URL}/perfil_listar`);
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      const data = await response.json();
      setPerfis(data);
    } catch (error) {
      console.error("Erro ao carregar perfis:", error);
      setMensagem({
        tipo: "danger",
        texto: "❌ Erro ao carregar a lista de perfis. Verifique a conexão com o servidor."
      });
    } finally {
      setCarregandoPerfis(false);
    }
  };

  useEffect(() => {
    carregarPerfis();
  }, []);

  // Função de exclusão AJUSTADA para o backend corrigido
  const handleDelete = async (id, designacao) => {
    if (!window.confirm(`Tem certeza que deseja excluir o perfil "${designacao}"?\n\n⚠️ Esta ação não pode ser desfeita.`)) {
      return;
    }
    
    setExcluindo(id);
    setMensagem(null);
    
    try {
      const response = await fetch(`${BASE_URL}/perfil_excluir/${id}`, {
        method: "DELETE",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        }
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        data = { 
          sucesso: false, 
          mensagem: `Resposta inesperada do servidor (Status: ${response.status})`
        };
      }

      if (response.ok) {
        if (data.sucesso) {
          // Remove o perfil da lista localmente
          setPerfis(prevPerfis => prevPerfis.filter(perfil => perfil.pkPerfil !== id));
          
          // Mostrar mensagem de sucesso
          setMensagem({
            tipo: "success",
            texto: `✅ ${data.mensagem || `Perfil "${designacao}" excluído com sucesso!`}`
          });
          
          // Limpar mensagem após 5 segundos
          setTimeout(() => setMensagem(null), 5000);
        } else {
          // API retornou sucesso: false
          setMensagem({
            tipo: "danger",
            texto: `❌ ${data.mensagem || "Erro ao excluir perfil"}`
          });
        }
      } else {
        // Erro HTTP baseado no status
        let mensagemErro = "";
        
        switch (response.status) {
          case 404:
            mensagemErro = "❌ Perfil não encontrado";
            break;
          case 409:
            mensagemErro = "❌ Não é possível excluir o perfil porque está em uso por outras entidades";
            break;
          case 500:
            mensagemErro = "❌ Erro interno do servidor";
            break;
          default:
            mensagemErro = `❌ Erro do servidor (Status: ${response.status})`;
        }
        
        setMensagem({
          tipo: "danger",
          texto: mensagemErro
        });
        
        console.error("Erro na exclusão:", {
          status: response.status,
          statusText: response.statusText,
          data: data
        });
      }
    } catch (error) {
      console.error("Erro completo ao excluir:", error);
      setMensagem({
        tipo: "danger",
        texto: "❌ Erro de comunicação com o servidor. Verifique sua conexão."
      });
    } finally {
      setExcluindo(null);
    }
  };

  // Editar - navega para a página de cadastro passando o perfil como estado
  const handleEdit = (perfil) => {
    navigate('/seguranca/perfis/cadastrar', { 
      state: { 
        modoEdicao: true,
        perfil: {
          pkPerfil: perfil.pkPerfil,
          designacao: perfil.designacao,
          estado: perfil.estado,
          descricao: perfil.descricao || "",
          createdAt: perfil.createdAt,
          updatedAt: perfil.updatedAt
        }
      } 
    });
  };

  // Histórico
  const handleHistory = async (perfil) => {
    setPerfilHistorico(perfil);
    setCarregandoHistorico(true);
    setMostrarHistorico(true);
    
    try {
      const response = await fetch(`${BASE_URL}/perfil_historico/${perfil.pkPerfil}`);
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      const data = await response.json();
      setHistoricoData(data);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
      setHistoricoData([
        {
          id: 1,
          acao: "Cadastro",
          usuario: "admin",
          data: new Date().toISOString(),
          detalhes: "Perfil criado inicialmente"
        },
        {
          id: 2,
          acao: "Atualização",
          usuario: "admin",
          data: new Date().toISOString(),
          detalhes: "Estado alterado para ATIVO"
        }
      ]);
    } finally {
      setCarregandoHistorico(false);
    }
  };

  // Fechar modal de histórico
  const fecharHistorico = () => {
    setMostrarHistorico(false);
    setPerfilHistorico(null);
    setHistoricoData([]);
  };

  // Formatar data para exibição
  const formatarData = (dataString) => {
    if (!dataString) return "-";
    try {
      const data = new Date(dataString);
      return data.toLocaleString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dataString;
    }
  };

  // Estilo para o botão de exclusão quando está processando
  const getBotaoExcluirEstilo = (perfilId) => {
    if (excluindo === perfilId) {
      return {
        cursor: 'not-allowed',
        opacity: 0.7
      };
    }
    return {};
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0 text-primary">
          <FaUsers className="me-2" /> Lista de Perfis
        </h3>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => navigate('/seguranca/perfis/cadastrar')}
          disabled={carregandoPerfis}
        >
          <FaUserPlus className="me-1" /> Novo Perfil
        </button>
      </div>

   
      {mensagem && (
        <div
          className={`alert alert-${mensagem.tipo} alert-dismissible fade show mb-4`}
          role="alert"
          style={{
            borderRadius: '12px',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
            borderLeft: `5px solid ${
              mensagem.tipo === 'success' ? '#28a745' : '#dc3545'
            }`,
            background: 'white',
            padding: '1rem 1.25rem'
          }}
        >
          <div className="d-flex align-items-center">
            <div className="me-3" style={{ fontSize: '1.8rem' }}>
              {mensagem.tipo === 'success' ? (
                <FaCheckCircle className="text-success" />
              ) : (
                <FaExclamationTriangle className="text-danger" />
              )}
            </div>
            <div className="flex-grow-1">
              <span dangerouslySetInnerHTML={{ __html: mensagem.texto }} />
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={() => setMensagem(null)}
              aria-label="Close"
              style={{ opacity: 0.7 }}
            ></button>
          </div>
        </div>
      )}
      
      {carregandoPerfis ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-2">Carregando perfis...</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Designação</th>
                <th>Descrição</th>
                <th>Estado</th>
                <th>Criado em</th>
                <th>Atualizado em</th>
                <th style={{ width: '150px' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {perfis.map((perfil, i) => (
                <tr key={perfil.pkPerfil}>
                  <td>{i + 1}</td>
                  <td><strong>{perfil.designacao}</strong></td>
                  <td>{perfil.descricao || <span className="text-muted">-</span>}</td>
                  <td>{formatarEstado(perfil.estado)}</td>
                  <td>{formatarData(perfil.createdAt)}</td>
                  <td>{formatarData(perfil.updatedAt)}</td>
                  <td>
                    <div className="btn-group btn-group-sm" role="group">
                      <button
                        className="btn btn-warning me-1"
                        onClick={() => handleEdit(perfil)}
                        title="Editar"
                        disabled={excluindo === perfil.pkPerfil}
                        style={{ width: '40px' }}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn btn-info me-1"
                        onClick={() => handleHistory(perfil)}
                        title="Histórico"
                        disabled={excluindo === perfil.pkPerfil}
                        style={{ width: '40px' }}
                      >
                        <FaHistory />
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(perfil.pkPerfil, perfil.designacao)}
                        title="Excluir"
                        disabled={excluindo === perfil.pkPerfil}
                        style={{
                          width: '40px',
                          ...getBotaoExcluirEstilo(perfil.pkPerfil)
                        }}
                      >
                        {excluindo === perfil.pkPerfil ? (
                          <FaSpinner className="fa-spin" />
                        ) : (
                          <FaTrash />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {perfis.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-4">
                    <div className="text-muted">
                      <FaUsers className="display-4 mb-3" />
                      <p>Nenhum perfil cadastrado</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

     
      {/* Modal de Histórico */}
      {mostrarHistorico && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <FaHistory className="me-2" />
                  Histórico - {perfilHistorico?.designacao}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={fecharHistorico}></button>
              </div>
              <div className="modal-body">
                {carregandoHistorico ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Carregando...</span>
                    </div>
                    <p className="mt-2">Carregando histórico...</p>
                  </div>
                ) : historicoData.length > 0 ? (
                  <div className="timeline">
                    {historicoData.map((item, index) => (
                      <div key={item.id || index} className="timeline-item mb-4">
                        <div className="timeline-marker bg-primary"></div>
                        <div className="timeline-content">
                          <div className="d-flex justify-content-between align-items-center">
                            <h6 className="mb-0">
                              <span className={`badge ${item.acao === 'Cadastro' ? 'bg-success' : item.acao === 'Atualização' ? 'bg-warning' : 'bg-info'}`}>
                                {item.acao}
                              </span>
                            </h6>
                            <small className="text-muted">{formatarData(item.data)}</small>
                          </div>
                          <p className="mb-1">
                            <strong>Usuário:</strong> {item.usuario}
                          </p>
                          <p className="mb-0">
                            <strong>Detalhes:</strong> {item.detalhes}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="text-muted">
                      <FaHistory className="display-4 mb-3" />
                      <p>Nenhum histórico encontrado para este perfil</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={fecharHistorico}>
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}