import { useEffect, useState } from "react";
import { FaUsers, FaEdit, FaHistory, FaTrash, FaUserPlus, FaSpinner, FaExclamationTriangle, FaCheckCircle, FaArrowLeft, FaSearch, FaDatabase, FaClock } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
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
  const [searchTerm, setSearchTerm] = useState("");
  
  const navigate = useNavigate();
  const BASE_URL = "http://localhost:9090/api/seguranca";

  const formatarEstado = (estado) => {
    if (estado === 1 || estado === "1") return <span style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>ATIVO</span>;
    if (estado === 0 || estado === "0") return <span style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>INATIVO</span>;
    return <span style={{ background: '#6c757d', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>DESCONHECIDO</span>;
  };

  const carregarPerfis = async () => {
    try {
      setCarregandoPerfis(true);
      setMensagem(null);
      const response = await fetch(`${BASE_URL}/perfil_listar`);
      if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
      const data = await response.json();
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

  const handleEdit = (perfil) => {
    navigate('/seguranca/perfis/cadastrar', { state: { modoEdicao: true, perfil } });
  };

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

  // Filtrar perfis
  const perfisFiltrados = perfis.filter(perfil =>
    perfil.designacao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    perfil.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: "'Inter', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {/* Modal de Histórico */}
      <AnimatePresence>
        {mostrarHistorico && (
          <div style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.7)', 
            backdropFilter: 'blur(4px)',
            zIndex: 1050, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center'
          }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{ 
                backgroundColor: 'white', 
                borderRadius: '24px', 
                maxWidth: '800px', 
                width: '90%', 
                maxHeight: '85vh', 
                overflow: 'hidden', 
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
              }}
            >
              <div style={{ 
                background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)', 
                color: '#D4AF37', 
                padding: '20px 24px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FaHistory style={{ fontSize: '20px' }} />
                  <div>
                    <h5 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Histórico do Perfil</h5>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', opacity: 0.8 }}>{perfilHistorico?.designacao}</p>
                  </div>
                </div>
                <button onClick={fecharHistorico} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#D4AF37', fontSize: '20px', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '8px' }}>×</button>
              </div>
              
              <div style={{ padding: '24px', maxHeight: '60vh', overflowY: 'auto' }}>
                {carregandoHistorico ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <FaSpinner style={{ fontSize: '32px', color: '#D4AF37', animation: 'spin 1s linear infinite' }} />
                    <p style={{ marginTop: '16px', color: '#666' }}>Carregando histórico...</p>
                  </div>
                ) : historicoData.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <FaClock style={{ fontSize: '48px', color: '#ccc' }} />
                    <p style={{ marginTop: '16px', color: '#666' }}>Nenhuma alteração registrada</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {historicoData.map((item, idx) => (
                      <div key={idx} style={{ padding: '16px', background: '#f8f9fa', borderRadius: '12px', borderLeft: `3px solid ${item.alteracao === 'DELETE' ? '#ef4444' : '#D4AF37'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                          <span style={{ fontWeight: '600', color: '#333' }}>
                            {item.alteracao === 'INSERT' && '➕ Criado'}
                            {item.alteracao === 'UPDATE' && '✏️ Atualizado'}
                            {item.alteracao === 'DELETE' && '🗑️ Excluído'}
                          </span>
                          <span style={{ fontSize: '12px', color: '#999' }}>{formatarData(item.data)}</span>
                        </div>
                        <div style={{ fontSize: '13px', color: '#666' }}>
                          {item.descricao && <div><strong>Descrição:</strong> {item.descricao}</div>}
                          {item.estado !== undefined && <div><strong>Estado:</strong> {item.estado === 1 ? 'ATIVO' : 'INATIVO'}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div style={{ padding: '16px 24px', borderTop: '1px solid #e8e8e8', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={fecharHistorico} style={{ padding: '8px 24px', borderRadius: '50px', border: '2px solid #D4AF37', background: 'transparent', color: '#D4AF37', fontWeight: '600', cursor: 'pointer' }}>Fechar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <div style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)', padding: '3rem 2rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', background: 'rgba(212,175,55,0.15)', marginBottom: '1rem' }}>
          <FaUsers style={{ fontSize: '2rem', color: '#D4AF37' }} />
        </div>
        <h1 style={{ color: '#D4AF37', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>Gestão de Perfis</h1>
        <p style={{ color: '#aaa', marginTop: '0.5rem' }}>Gerencie os perfis de acesso do sistema</p>
      </div>

      {/* Conteúdo Principal */}
      <div style={{ maxWidth: '1400px', margin: '-40px auto 0', padding: '2rem' }}>
        
        {/* Barra de Pesquisa e Ações */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: '250px' }}>
            <div style={{
              background: 'white',
              borderRadius: '50px',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }}>
              <div style={{ padding: '0 16px' }}>
                <FaSearch style={{ color: '#D4AF37' }} />
              </div>
              <input
                type="text"
                placeholder="Pesquisar por nome ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  border: 'none',
                  outline: 'none',
                  fontSize: '14px',
                  background: 'transparent'
                }}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} style={{ padding: '8px 16px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#999' }}>✕</button>
              )}
            </div>
          </div>
          
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '8px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }}>
              <div style={{ textAlign: 'center' }}>
                <FaDatabase style={{ color: '#D4AF37', fontSize: '18px', marginBottom: '4px' }} />
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>{perfis.length}</div>
                <small style={{ color: '#666' }}>Total</small>
              </div>
              <div style={{ width: '1px', height: '30px', background: '#e0e0e0' }} />
              <div style={{ textAlign: 'center' }}>
                <FaCheckCircle style={{ color: '#10b981', fontSize: '18px', marginBottom: '4px' }} />
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>{perfis.filter(p => p.estado === 1).length}</div>
                <small style={{ color: '#666' }}>Ativos</small>
              </div>
              <div style={{ width: '1px', height: '30px', background: '#e0e0e0' }} />
              <div style={{ textAlign: 'center' }}>
                <FaExclamationTriangle style={{ color: '#ef4444', fontSize: '18px', marginBottom: '4px' }} />
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>{perfis.filter(p => p.estado === 0).length}</div>
                <small style={{ color: '#666' }}>Inativos</small>
              </div>
            </div>
          </div>
        </div>

        {/* Mensagem de Feedback */}
        <AnimatePresence>
          {mensagem && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ marginBottom: '1.5rem' }}>
              <div style={{
                background: mensagem.tipo === 'success' ? '#10b981' : '#ef4444',
                color: 'white',
                padding: '12px 20px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {mensagem.tipo === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
                  <span>{mensagem.texto}</span>
                </div>
                <button onClick={() => setMensagem(null)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '18px', cursor: 'pointer' }}>×</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card Principal da Tabela */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            padding: '16px 24px',
            borderBottom: '1px solid #e8e8e8',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <button
                onClick={() => window.history.back()}
                style={{
                  padding: '8px 20px',
                  background: 'transparent',
                  border: '2px solid #D4AF37',
                  borderRadius: '50px',
                  color: '#D4AF37',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FaArrowLeft /> Voltar
              </button>
            </div>
            <div>
              <button
                onClick={carregarPerfis}
                style={{
                  padding: '8px 20px',
                  background: 'transparent',
                  border: '2px solid #D4AF37',
                  borderRadius: '50px',
                  color: '#D4AF37',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginRight: '12px'
                }}
              >
                <FaSpinner style={carregandoPerfis ? { animation: 'spin 1s linear infinite' } : {}} /> Atualizar
              </button>
              <button
                onClick={() => navigate('/seguranca/perfis/cadastrar')}
                style={{
                  padding: '8px 20px',
                  background: 'linear-gradient(135deg, #D4AF37, #FFE55C)',
                  border: 'none',
                  borderRadius: '50px',
                  color: '#000',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FaUserPlus /> Novo Perfil
              </button>
            </div>
          </div>

          {carregandoPerfis ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <FaSpinner style={{ fontSize: '48px', color: '#D4AF37', animation: 'spin 1s linear infinite' }} />
              <p style={{ marginTop: '16px', color: '#666' }}>Carregando perfis...</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)', color: '#D4AF37' }}>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>#</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>Designação</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>Descrição</th>
                    <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600' }}>Estado</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>Criado em</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>Atualizado em</th>
                    <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {perfisFiltrados.length > 0 ? perfisFiltrados.map((perfil, i) => (
                    <motion.tr 
                      key={perfil.pkPerfil}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      style={{ borderBottom: '1px solid #e8e8e8', transition: 'all 0.3s ease' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#fafafa'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                    >
                      <td style={{ padding: '16px', color: '#666' }}>{i + 1}</td>
                      <td style={{ padding: '16px' }}><strong style={{ color: '#D4AF37' }}>{perfil.designacao}</strong></td>
                      <td style={{ padding: '16px', color: '#666' }}>{perfil.descricao || <span style={{ color: '#999' }}>-</span>}</td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>{formatarEstado(perfil.estado)}</td>
                      <td style={{ padding: '16px', color: '#666', fontSize: '13px' }}>{formatarData(perfil.createdAt)}</td>
                      <td style={{ padding: '16px', color: '#666', fontSize: '13px' }}>{formatarData(perfil.updatedAt)}</td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleEdit(perfil)}
                            disabled={excluindo === perfil.pkPerfil}
                            style={{
                              padding: '8px',
                              background: 'linear-gradient(135deg, #D4AF37, #FFE55C)',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              color: '#000'
                            }}
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleHistory(perfil)}
                            disabled={excluindo === perfil.pkPerfil}
                            style={{
                              padding: '8px',
                              background: '#0a0a0a',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              color: '#D4AF37'
                            }}
                          >
                            <FaHistory />
                          </button>
                          <button
                            onClick={() => handleDelete(perfil.pkPerfil, perfil.designacao)}
                            disabled={excluindo === perfil.pkPerfil}
                            style={{
                              padding: '8px',
                              background: '#ef4444',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: excluindo === perfil.pkPerfil ? 'not-allowed' : 'pointer',
                              color: 'white',
                              opacity: excluindo === perfil.pkPerfil ? 0.7 : 1
                            }}
                          >
                            {excluindo === perfil.pkPerfil ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : <FaTrash />}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )) : (
                    <tr>
                      <td colSpan={7} style={{ padding: '60px', textAlign: 'center' }}>
                        <div>
                          <FaUsers style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }} />
                          <p style={{ color: '#666' }}>Nenhum perfil encontrado</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Rodapé */}
          {perfis.length > 0 && (
            <div style={{ padding: '16px 24px', borderTop: '1px solid #e8e8e8', background: '#fafafa' }}>
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#666' }}>
                  <div style={{ width: '8px', height: '8px', background: '#D4AF37', borderRadius: '50%' }} />
                  Mostrando {perfisFiltrados.length} de {perfis.length} perfis
                </span>
                {searchTerm && perfisFiltrados.length !== perfis.length && (
                  <span style={{ fontSize: '12px', color: '#D4AF37' }}>
                    Filtrado por: "{searchTerm}"
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}