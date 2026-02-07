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

  // Formata o estado
  const formatarEstado = (estado) => {
    if (estado === 1 || estado === "1") return <span className="badge bg-success">ATIVO</span>;
    if (estado === 0 || estado === "0") return <span className="badge bg-danger">INATIVO</span>;
    return <span className="badge bg-secondary">DESCONHECIDO</span>;
  };

  // Carregar perfis da API
  const carregarPerfis = async () => {
    try {
      setCarregandoPerfis(true);
      setMensagem(null);
      const response = await fetch(`${BASE_URL}/perfil_listar`);
      if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
      const data = await response.json();
      // Caso venha null, transforma em array vazio
      setPerfis(data.map(p => ({ ...p, funcionalidades: p.funcionalidades || [] })));
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

  // Exclusão
  const handleDelete = async (id, designacao) => {
    if (!window.confirm(`Tem certeza que deseja excluir o perfil "${designacao}"?`)) return;
    setExcluindo(id);
    setMensagem(null);

    try {
      const response = await fetch(`${BASE_URL}/perfil_excluir/${id}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({ sucesso: false }));
      
      if (response.ok && data.sucesso) {
        setPerfis(prev => prev.filter(p => p.pkPerfil !== id));
        setMensagem({ tipo: "success", texto: `✅ ${data.mensagem || `Perfil "${designacao}" excluído!`}` });
        setTimeout(() => setMensagem(null), 5000);
      } else {
        setMensagem({ tipo: "danger", texto: data.mensagem || "❌ Erro ao excluir perfil" });
      }
    } catch (error) {
      console.error("Erro ao excluir perfil:", error);
      setMensagem({ tipo: "danger", texto: "❌ Erro de comunicação com o servidor" });
    } finally {
      setExcluindo(null);
    }
  };

  // Editar
  const handleEdit = (perfil) => {
    navigate('/seguranca/perfis/cadastrar', { state: { modoEdicao: true, perfil } });
  };

  // Histórico
  const handleHistory = async (perfil) => {
    setPerfilHistorico(perfil);
    setCarregandoHistorico(true);
    setMostrarHistorico(true);

    try {
      const response = await fetch(`${BASE_URL}/perfil_historico/${perfil.pkPerfil}`);
      if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
      const data = await response.json();
      setHistoricoData(data);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
      setHistoricoData([]);
    } finally {
      setCarregandoHistorico(false);
    }
  };

  const fecharHistorico = () => {
    setMostrarHistorico(false);
    setPerfilHistorico(null);
    setHistoricoData([]);
  };

  const formatarData = (dataString) => {
    if (!dataString) return "-";
    const data = new Date(dataString);
    return data.toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getBotaoExcluirEstilo = (perfilId) => (excluindo === perfilId ? { cursor: 'not-allowed', opacity: 0.7 } : {});

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0 text-primary"><FaUsers className="me-2" /> Lista de Perfis</h3>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/seguranca/perfis/cadastrar')} disabled={carregandoPerfis}>
          <FaUserPlus className="me-1" /> Novo Perfil
        </button>
      </div>

      {mensagem && (
        <div className={`alert alert-${mensagem.tipo} alert-dismissible fade show mb-4`} role="alert">
          {mensagem.texto}
          <button type="button" className="btn-close" onClick={() => setMensagem(null)}></button>
        </div>
      )}

      {carregandoPerfis ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
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
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {perfis.length > 0 ? perfis.map((perfil, i) => (
                <tr key={perfil.pkPerfil}>
                  <td>{i + 1}</td>
                  <td><strong>{perfil.designacao}</strong></td>
                  <td>{perfil.descricao || <span className="text-muted">-</span>}</td>
                  <td>{formatarEstado(perfil.estado)}</td>
                  <td>{formatarData(perfil.createdAt)}</td>
                  <td>{formatarData(perfil.updatedAt)}</td>
                  <td>
                    <div className="btn-group btn-group-sm" role="group">
                      <button className="btn btn-warning me-1" onClick={() => handleEdit(perfil)} disabled={excluindo === perfil.pkPerfil}><FaEdit /></button>
                      <button className="btn btn-info me-1" onClick={() => handleHistory(perfil)} disabled={excluindo === perfil.pkPerfil}><FaHistory /></button>
                      <button className="btn btn-danger" onClick={() => handleDelete(perfil.pkPerfil, perfil.designacao)} disabled={excluindo === perfil.pkPerfil} style={getBotaoExcluirEstilo(perfil.pkPerfil)}>
                        {excluindo === perfil.pkPerfil ? <FaSpinner className="fa-spin" /> : <FaTrash />}
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="text-center py-4">
                    <div className="text-muted"><FaUsers className="display-4 mb-3" /><p>Nenhum perfil cadastrado</p></div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
