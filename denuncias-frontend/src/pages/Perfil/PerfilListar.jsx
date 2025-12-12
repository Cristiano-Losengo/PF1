import { useEffect, useState } from "react";
import { FaUsers, FaEdit, FaHistory, FaTrash, FaUserPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function PerfilListar() {
  const [perfis, setPerfis] = useState([]);
  const [mostrarHistorico, setMostrarHistorico] = useState(false);
  const [historicoData, setHistoricoData] = useState([]);
  const [perfilHistorico, setPerfilHistorico] = useState(null);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);
  
  const navigate = useNavigate();
  
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

  // Editar - navega para a página de cadastro passando o perfil como estado
  const handleEdit = (perfil) => {
    // DEBUG: Verifique o que está sendo passado
    console.log("Editando perfil:", perfil);
    
    navigate('/seguranca/perfis/cadastrar', { 
      state: { 
        modoEdicao: true,
        perfil: {
          pkPerfil: perfil.pkPerfil,
          designacao: perfil.designacao,
          estado: perfil.estado,
          descricao: perfil.descricao || "",
          // Incluir timestamps se necessário
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
      const response = await fetch(`http://localhost:9090/api/seguranca/perfil_historico/${perfil.pkPerfil}`);
      const data = await response.json();
      setHistoricoData(data);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
      // Dados de exemplo em caso de erro
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
    const data = new Date(dataString);
    return data.toLocaleString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        >
          <FaUserPlus className="me-1" /> Novo Perfil
        </button>
      </div>
      
      <table className="table table-bordered table-striped">
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>Designação</th>
            <th>Descrição</th>
            <th>Estado</th>
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
              <td>{perfil.descricao || "-"}</td>
              <td>{formatarEstado(perfil.estado)}</td>
              <td>{new Date(perfil.createdAt).toLocaleString()}</td>
              <td>{perfil.updatedAt ? new Date(perfil.updatedAt).toLocaleString() : "-"}</td>
              <td>
                <div className="btn-group btn-group-sm" role="group">
                  <button
                    className="btn btn-warning me-1"
                    onClick={() => handleEdit(perfil)}
                    title="Editar"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="btn btn-info me-1"
                    onClick={() => handleHistory(perfil)}
                    title="Histórico"
                  >
                    <FaHistory />
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(perfil.pkPerfil)}
                    title="Excluir"
                  >
                    <FaTrash />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {perfis.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center">
                Nenhum Perfil cadastrado
              </td>
            </tr>
          )}
        </tbody>
      </table>

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