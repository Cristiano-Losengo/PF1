import React, { useEffect, useState } from "react";
import { 
  FaUsers, FaPhone, FaIdCard, FaEnvelope, FaMapMarkerAlt, 
  FaRoad, FaUserTag, FaUser, FaHome, FaCity, FaLandmark,
  FaToggleOn, FaToggleOff, FaExclamationTriangle, FaSpinner,
  FaEye, FaEdit, FaTrash, FaArrowLeft
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function ContaListar() {
  const [contas, setContas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState(null);
  const [contaDetalhe, setContaDetalhe] = useState(null);
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false);
  const [alternandoEstado, setAlternandoEstado] = useState(null);

  const navigate = useNavigate();

  const carregarDados = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:9090/api/seguranca/conta_listar");
      if (!response.ok) throw new Error(`Erro: ${response.status}`);
      const data = await response.json();
      setContas(data);
    } catch (error) {
      console.error("❌ Erro:", error);
      setMensagem({ tipo: "danger", texto: "Erro ao carregar dados: " + error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarDados(); }, []);

  const handleAlternarEstado = async (id, nome) => {
    const conta = contas.find(c => c.pkConta === id);
    if (!window.confirm(`Deseja ${conta?.estado === 1 ? "desativar" : "ativar"} a conta de ${nome}?`)) return;

    try {
      setAlternandoEstado(id);
      const response = await fetch(`http://localhost:9090/api/seguranca/conta_alternar_estado/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }
      });
      const result = await response.json();
      if (response.ok && result.sucesso) {
        setMensagem({ tipo: "success", texto: result.mensagem || "Estado alterado com sucesso!" });
        carregarDados();
      } else throw new Error(result.mensagem || "Erro ao alterar estado");
    } catch (error) {
      setMensagem({ tipo: "danger", texto: error.message });
    } finally { setAlternandoEstado(null); }
  };

  const handleEditarConta = (conta) => {
    navigate(`/conta/cadastrar/${conta.pkConta}`);
  };

  const handleDelete = async (id, nome) => {
    if (!window.confirm(`❌ EXCLUSÃO PERMANENTE!\n\nConta: ${nome}\n\nEsta ação é irreversível.\nDeseja realmente EXCLUIR?`)) return;

    try {
      const response = await fetch(`http://localhost:9090/api/seguranca/conta_excluir/${id}`, { method: "DELETE" });
      const result = await response.json();
      if (response.ok && result.sucesso) {
        setMensagem({ tipo: "success", texto: "Conta excluída com sucesso!" });
        carregarDados();
      } else throw new Error(result.mensagem || "Erro ao excluir");
    } catch (error) {
      setMensagem({ tipo: "danger", texto: error.message });
    }
  };

  const formatarDataLocal = (dataString) => {
    if (!dataString) return "-";
    try {
      const data = new Date(dataString);
      return data.toLocaleString('pt-AO', { 
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      });
    } catch { return dataString; }
  };

  const formatarTelefone = (telefone) => {
    if (!telefone) return "-";
    let tel = telefone.replace(/\D/g, '');
    if (tel.length === 9) return `${tel.substring(0, 3)} ${tel.substring(3, 6)} ${tel.substring(6, 9)}`;
    return telefone;
  };

  const mostrarDetalhesConta = (conta) => {
    setContaDetalhe(conta);
    setMostrarDetalhes(true);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <FaSpinner style={{ fontSize: '2rem', color: '#D4AF37', animation: 'spin 1s linear infinite' }} />
          <h4 style={{ marginTop: '1rem' }}>Carregando contas...</h4>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: "'Inter', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {/* Hero Section */}
      <div style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)', padding: '2rem 1rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', background: 'rgba(212,175,55,0.15)', marginBottom: '1rem' }}>
          <FaUsers style={{ fontSize: '2rem', color: '#D4AF37' }} />
        </div>
        <h1 style={{ color: '#D4AF37', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>Lista de Contas</h1>
        <p style={{ color: '#aaa', marginTop: '0.5rem' }}>Gerencie todas as contas do sistema</p>
        <span style={{ background: '#D4AF37', color: '#000', padding: '0.25rem 1rem', borderRadius: '50px', display: 'inline-block', marginTop: '0.5rem' }}>
          Total: {contas.length} contas
        </span>
      </div>

      <div style={{ maxWidth: '1400px', margin: '-40px auto 0', padding: '2rem' }}>
        {/* Mensagens */}
        {mensagem && (
          <div style={{
            background: mensagem.tipo === 'success' ? '#d1fae5' : '#fee2e2',
            color: mensagem.tipo === 'success' ? '#065f46' : '#991b1b',
            padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <span>{mensagem.texto}</span>
            <button onClick={() => setMensagem(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
          </div>
        )}

        {/* Botões */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/conta/cadastrar')} style={{ background: 'linear-gradient(135deg, #D4AF37, #FFE55C)', color: '#000', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer' }}>
            <FaUser /> Nova Conta
          </button>
          <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: '2px solid #D4AF37', color: '#D4AF37', padding: '0.75rem 1.5rem', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer' }}>
            <FaArrowLeft /> Voltar
          </button>
        </div>

        {/* Tabela */}
        <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#1a1a1a', color: '#D4AF37' }}>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>#</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Nome</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Email</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Telefone</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Tipo</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Perfil</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Estado</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {contas.length > 0 ? contas.map((conta, i) => (
                  <tr key={conta.pkConta} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '1rem' }}>{i + 1}</td>
                    <td style={{ padding: '1rem' }}><strong>{conta.nomeCompleto}</strong></td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaEnvelope style={{ color: '#D4AF37' }} size={14} />
                        {conta.email}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaPhone style={{ color: '#D4AF37' }} size={14} />
                        {formatarTelefone(conta.telefone)}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        background: conta.tipoConta === 'ADMIN' ? '#ef4444' : (conta.tipoConta === 'GESTOR_PROVINCIAL' ? '#f59e0b' : '#10b981'),
                        color: 'white', padding: '0.25rem 0.75rem', borderRadius: '50px', fontSize: '0.75rem'
                      }}>{conta.tipoConta}</span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ background: '#D4AF37', color: '#000', padding: '0.25rem 0.75rem', borderRadius: '50px', fontSize: '0.75rem' }}>
                        {conta.designacaoPerfil || 'Sem perfil'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        background: conta.estado === 1 ? '#10b981' : '#ef4444', 
                        color: 'white', padding: '0.25rem 0.75rem', borderRadius: '50px', fontSize: '0.75rem'
                      }}>
                        {conta.estado === 1 ? '✅ ATIVO' : '❌ INATIVO'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button onClick={() => mostrarDetalhesConta(conta)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', width: '36px' }} title="Ver detalhes"><FaEye /></button>
                        <button onClick={() => handleEditarConta(conta)} style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', width: '36px' }} title="Editar"><FaEdit /></button>
                        <button onClick={() => handleAlternarEstado(conta.pkConta, conta.nomeCompleto)} disabled={alternandoEstado === conta.pkConta}
                          style={{ background: conta.estado === 1 ? '#ef4444' : '#10b981', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', width: '36px' }} title={conta.estado === 1 ? "Desativar" : "Ativar"}>
                          {alternandoEstado === conta.pkConta ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : (conta.estado === 1 ? <FaToggleOff /> : <FaToggleOn />)}
                        </button>
                        <button onClick={() => handleDelete(conta.pkConta, conta.nomeCompleto)} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', width: '36px' }} title="Excluir"><FaTrash /></button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '3rem' }}>Nenhuma conta cadastrada</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legenda */}
        <div style={{ marginTop: '2rem', padding: '1rem', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h6 style={{ color: '#D4AF37', marginBottom: '0.5rem' }}><FaExclamationTriangle /> Legenda das Ações</h6>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <span><span style={{ background: '#3b82f6', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '8px', display: 'inline-block', width: '30px', textAlign: 'center' }}><FaEye /></span> Ver detalhes</span>
            <span><span style={{ background: '#f59e0b', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '8px', display: 'inline-block', width: '30px', textAlign: 'center' }}><FaEdit /></span> Editar</span>
            <span><span style={{ background: '#ef4444', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '8px', display: 'inline-block', width: '30px', textAlign: 'center' }}><FaToggleOff /></span> Desativar</span>
            <span><span style={{ background: '#10b981', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '8px', display: 'inline-block', width: '30px', textAlign: 'center' }}><FaToggleOn /></span> Ativar</span>
            <span><span style={{ background: '#dc2626', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '8px', display: 'inline-block', width: '30px', textAlign: 'center' }}><FaTrash /></span> Excluir</span>
          </div>
        </div>
      </div>

      {/* Modal Detalhes */}
      {mostrarDetalhes && contaDetalhe && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '20px', maxWidth: '700px', width: '90%', maxHeight: '80vh', overflow: 'auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '2px solid #D4AF37', paddingBottom: '0.5rem' }}>
              <h3 style={{ color: '#D4AF37', margin: 0 }}><FaUserTag /> {contaDetalhe.nomeCompleto}</h3>
              <button onClick={() => setMostrarDetalhes(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <h4 style={{ color: '#D4AF37', fontSize: '1rem', marginBottom: '0.5rem' }}>Dados Pessoais</h4>
                <p><strong>BI:</strong> {contaDetalhe.identificacao || "-"}</p>
                <p><strong>Telefone:</strong> {formatarTelefone(contaDetalhe.telefone)}</p>
                <p><strong>Data Nascimento:</strong> {contaDetalhe.dataNascimento ? new Date(contaDetalhe.dataNascimento).toLocaleDateString('pt-AO') : "-"}</p>
                <p><strong>Gênero:</strong> {contaDetalhe.fkGeneroNome || "Não informado"}</p>
              </div>
              <div>
                <h4 style={{ color: '#D4AF37', fontSize: '1rem', marginBottom: '0.5rem' }}>Dados da Conta</h4>
                <p><strong>Email:</strong> {contaDetalhe.email}</p>
                <p><strong>Tipo:</strong> <span style={{ background: '#D4AF37', color: '#000', padding: '0.25rem 0.5rem', borderRadius: '8px' }}>{contaDetalhe.tipoConta}</span></p>
                <p><strong>Perfil:</strong> {contaDetalhe.designacaoPerfil || "Sem perfil"}</p>
                <p><strong>Estado:</strong> <span style={{ color: contaDetalhe.estado === 1 ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>{contaDetalhe.estado === 1 ? 'ATIVO' : 'INATIVO'}</span></p>
                <p><strong>Criado em:</strong> {formatarDataLocal(contaDetalhe.createdAt)}</p>
              </div>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <h4 style={{ color: '#D4AF37', fontSize: '1rem', marginBottom: '0.5rem' }}>Endereço</h4>
              <p><strong>Província:</strong> {contaDetalhe.provincia || "-"}</p>
              <p><strong>Município:</strong> {contaDetalhe.municipio || "-"}</p>
              <p><strong>Bairro:</strong> {contaDetalhe.bairro || "-"}</p>
              <p><strong>Rua/Número:</strong> {contaDetalhe.nomeRua || "-"}</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setMostrarDetalhes(false)} style={{ background: '#6c757d', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>Fechar</button>
              <button onClick={() => { setMostrarDetalhes(false); handleEditarConta(contaDetalhe); }} style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>Editar Conta</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}