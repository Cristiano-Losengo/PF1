import React, { useEffect, useState } from "react";
import { 
  FaTrash, FaTasks, FaChevronDown, FaChevronRight, FaSyncAlt, 
  FaExclamationTriangle, FaFolder, FaFolderOpen, FaInfoCircle, FaLock,
  FaBan, FaUnlockAlt, FaSpinner, FaCheckCircle, FaArrowLeft
} from "react-icons/fa";

export default function FuncionalidadePerfilListar() {
  const [associacoes, setAssociacoes] = useState([]);
  const [funcionalidades, setFuncionalidades] = useState([]);
  const [perfis, setPerfis] = useState([]);
  const [abertos, setAbertos] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [acoesLoading, setAcoesLoading] = useState({});
  const [mensagem, setMensagem] = useState(null);
  const [funcionalidadesBloqueadas, setFuncionalidadesBloqueadas] = useState({});

  const BASE_URL = "http://localhost:9090/api/seguranca";

  const toggle = (id) => {
    const nova = new Set(abertos);
    nova.has(id) ? nova.delete(id) : nova.add(id);
    setAbertos(nova);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [assocResp, funcResp, perfilResp] = await Promise.all([
        fetch(`${BASE_URL}/funcionalidade_perfil_listar`),
        fetch(`${BASE_URL}/funcionalidade_listar`),
        fetch(`${BASE_URL}/perfil_listar`)
      ]);

      const associacoesData = await assocResp.json();
      const funcData = await funcResp.json();
      const perfilData = await perfilResp.json();

      setAssociacoes(Array.isArray(associacoesData) ? associacoesData : (associacoesData.dados || []));
      setFuncionalidades(funcData.dados || []);
      setPerfis(Array.isArray(perfilData) ? perfilData : (perfilData.dados || []));

      await carregarFuncionalidadesBloqueadas();
    } catch (e) {
      console.error("Erro:", e);
      setError("Não foi possível carregar os dados.");
    } finally {
      setLoading(false);
    }
  };

  const carregarFuncionalidadesBloqueadas = async () => {
    try {
      const response = await fetch(`${BASE_URL}/funcionalidade_bloqueada_listar`);
      if (response.ok) {
        const data = await response.json();
        const bloqueadasMap = {};
        if (Array.isArray(data)) {
          data.forEach(item => {
            bloqueadasMap[`${item.fkFuncionalidade}-${item.fkPerfil}`] = true;
          });
        }
        setFuncionalidadesBloqueadas(bloqueadasMap);
      }
    } catch (error) {
      console.error("Erro:", error);
    }
  };

  const isBloqueada = (funcionalidadeId, perfilId) => {
    return funcionalidadesBloqueadas[`${funcionalidadeId}-${perfilId}`] === true;
  };

  const handleBloquear = async (fkFuncionalidade, fkPerfil, nomeFunc, nomePerfil) => {
    const key = `bloquear-${fkFuncionalidade}-${fkPerfil}`;
    if (!window.confirm(`Bloquear funcionalidade "${nomeFunc}" do perfil "${nomePerfil}"?`)) return;
    
    setAcoesLoading(prev => ({ ...prev, [key]: true }));
    try {
      const response = await fetch(`${BASE_URL}/funcionalidade_perfil_bloquear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fkFuncionalidade, fkPerfil, motivo: "Bloqueio manual" })
      });
      
      if (response.ok) {
        setMensagem({ tipo: "success", texto: `✅ Funcionalidade "${nomeFunc}" BLOQUEADA!` });
        setFuncionalidadesBloqueadas(prev => ({ ...prev, [`${fkFuncionalidade}-${fkPerfil}`]: true }));
        setTimeout(() => setMensagem(null), 3000);
      } else {
        setMensagem({ tipo: "danger", texto: "❌ Erro ao bloquear" });
      }
    } catch (error) {
      setMensagem({ tipo: "danger", texto: "❌ Erro de conexão" });
    } finally {
      setAcoesLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleDesbloquear = async (fkFuncionalidade, fkPerfil, nomeFunc, nomePerfil) => {
    const key = `desbloquear-${fkFuncionalidade}-${fkPerfil}`;
    if (!window.confirm(`Desbloquear funcionalidade "${nomeFunc}" do perfil "${nomePerfil}"?`)) return;
    
    setAcoesLoading(prev => ({ ...prev, [key]: true }));
    try {
      const response = await fetch(`${BASE_URL}/funcionalidade_perfil_desbloquear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fkFuncionalidade, fkPerfil })
      });
      
      if (response.ok) {
        setMensagem({ tipo: "success", texto: `✅ Funcionalidade "${nomeFunc}" DESBLOQUEADA!` });
        const newState = { ...funcionalidadesBloqueadas };
        delete newState[`${fkFuncionalidade}-${fkPerfil}`];
        setFuncionalidadesBloqueadas(newState);
        setTimeout(() => setMensagem(null), 3000);
      } else {
        setMensagem({ tipo: "danger", texto: "❌ Erro ao desbloquear" });
      }
    } catch (error) {
      setMensagem({ tipo: "danger", texto: "❌ Erro de conexão" });
    } finally {
      setAcoesLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleRemover = async (fkFuncionalidade, fkPerfil, nomeFunc, nomePerfil) => {
    const key = `remover-${fkFuncionalidade}-${fkPerfil}`;
    if (!window.confirm(`Remover funcionalidade "${nomeFunc}" do perfil "${nomePerfil}"?`)) return;
    
    setAcoesLoading(prev => ({ ...prev, [key]: true }));
    try {
      const response = await fetch(`${BASE_URL}/funcionalidade_perfil_excluir/${fkFuncionalidade}/${fkPerfil}`, { method: "DELETE" });
      if (response.ok) {
        setMensagem({ tipo: "success", texto: `✅ Funcionalidade "${nomeFunc}" removida!` });
        await loadData();
        setTimeout(() => setMensagem(null), 3000);
      } else {
        setMensagem({ tipo: "danger", texto: "❌ Erro ao remover" });
      }
    } catch (error) {
      setMensagem({ tipo: "danger", texto: "❌ Erro de conexão" });
    } finally {
      setAcoesLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const funcionalidadesPorPerfil = {};
  associacoes.forEach(assoc => {
    if (!funcionalidadesPorPerfil[assoc.fkPerfil]) funcionalidadesPorPerfil[assoc.fkPerfil] = new Set();
    funcionalidadesPorPerfil[assoc.fkPerfil].add(assoc.fkFuncionalidade);
  });

  const isHerdada = (funcionalidadeId, perfilId, funcsAtribuidasSet) => {
    const func = funcionalidades.find(f => f.pkFuncionalidade === funcionalidadeId);
    if (!func || !func.fkFuncionalidadePai || func.fkFuncionalidadePai === 0) return false;
    return !funcsAtribuidasSet.has(func.fkFuncionalidadePai);
  };

  const construirArvorePorPerfil = (perfilId) => {
    const funcsAtribuidas = funcionalidadesPorPerfil[perfilId] || new Set();
    const temRaiz = funcsAtribuidas.has(1);
    
    const map = new Map();
    const raiz = [];
    const funcsParaUsar = temRaiz ? funcionalidades : funcionalidades.filter(f => funcsAtribuidas.has(f.pkFuncionalidade));
    
    funcsParaUsar.forEach(item => {
      const isHerdadaCalc = isHerdada(item.pkFuncionalidade, perfilId, funcsAtribuidas);
      map.set(item.pkFuncionalidade, {
        ...item,
        filhos: [],
        nivel: 0,
        temFilhos: false,
        isHerdada: temRaiz ? !funcsAtribuidas.has(item.pkFuncionalidade) : isHerdadaCalc,
        isAtribuidaDiretamente: !temRaiz && funcsAtribuidas.has(item.pkFuncionalidade) && !isHerdadaCalc,
        estaBloqueada: isBloqueada(item.pkFuncionalidade, perfilId)
      });
    });
    
    funcsParaUsar.forEach(item => {
      const node = map.get(item.pkFuncionalidade);
      const paiId = item.fkFuncionalidadePai;
      if (paiId && paiId !== 0 && map.has(paiId)) {
        const pai = map.get(paiId);
        pai.filhos.push(node);
        pai.temFilhos = true;
        node.nivel = (pai.nivel || 0) + 1;
      } else if (paiId && paiId !== 0 && !map.has(paiId)) {
        raiz.push(node);
      } else if (!paiId || paiId === 0) {
        raiz.push(node);
      }
    });
    
    const ordenar = (node) => {
      if (node.filhos?.length) {
        node.filhos.sort((a, b) => a.pkFuncionalidade - b.pkFuncionalidade);
        node.filhos.forEach(ordenar);
      }
    };
    raiz.sort((a, b) => a.pkFuncionalidade - b.pkFuncionalidade);
    raiz.forEach(ordenar);
    return { arvore: raiz, temRaiz };
  };

  const renderNode = (node, perfilId, perfilNome, depth = 0, temRaiz = false) => {
    const temFilhos = node.filhos?.length > 0;
    const aberto = abertos.has(node.pkFuncionalidade);
    const eRaiz = node.pkFuncionalidade === 1;
    const isHerdadaNode = node.isHerdada;
    const isAtribuidaDiretamente = node.isAtribuidaDiretamente;
    const estaBloqueada = node.estaBloqueada;
    
    const keyRemover = `remover-${node.pkFuncionalidade}-${perfilId}`;
    const keyBloquear = `bloquear-${node.pkFuncionalidade}-${perfilId}`;
    const loadingAcao = acoesLoading[keyRemover] || acoesLoading[keyBloquear];

    let bgColor = '#ffffff';
    if (estaBloqueada) bgColor = '#fee2e2';
    else if (isHerdadaNode) bgColor = '#fffbeb';
    else if (isAtribuidaDiretamente) bgColor = '#ecfdf5';
    
    let borderColor = '#6c757d';
    if (eRaiz) borderColor = '#ef4444';
    else if (temFilhos) borderColor = '#D4AF37';
    else if (estaBloqueada) borderColor = '#ef4444';
    else if (isHerdadaNode) borderColor = '#f59e0b';
    else if (isAtribuidaDiretamente) borderColor = '#10b981';

    return (
      <div key={node.pkFuncionalidade} style={{ marginLeft: `${depth * 24}px`, marginBottom: '8px' }}>
        <div style={{
          background: bgColor,
          borderRadius: '8px',
          padding: '12px',
          borderLeft: `3px solid ${borderColor}`,
          cursor: temFilhos ? 'pointer' : 'default',
          opacity: loadingAcao ? 0.6 : 1,
          transition: 'all 0.2s ease'
        }} onClick={temFilhos ? () => toggle(node.pkFuncionalidade) : undefined}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{ marginRight: '12px' }}>
                {temFilhos ? (
                  aberto ? <FaChevronDown style={{ color: '#D4AF37' }} size={14} /> : <FaChevronRight style={{ color: '#666' }} size={14} />
                ) : (
                  <div style={{ width: '14px' }}></div>
                )}
              </div>
              <div style={{ marginRight: '12px' }}>
                {eRaiz ? <FaLock style={{ color: '#ef4444' }} size={16} />
                  : estaBloqueada ? <FaBan style={{ color: '#ef4444' }} size={16} />
                  : temFilhos ? (aberto ? <FaFolderOpen style={{ color: '#D4AF37' }} size={16} /> : <FaFolder style={{ color: '#D4AF37' }} size={16} />)
                  : <FaFolder style={{ color: '#999' }} size={16} />}
              </div>
              <div>
                <span style={{ fontWeight: 'bold' }}>
                  {node.designacao}
                  {eRaiz && <span style={{ background: '#ef4444', color: 'white', padding: '2px 6px', borderRadius: '12px', fontSize: '9px', marginLeft: '8px' }}>ACESSO TOTAL</span>}
                  {isHerdadaNode && !eRaiz && !estaBloqueada && <span style={{ background: '#f59e0b', color: 'white', padding: '2px 6px', borderRadius: '12px', fontSize: '9px', marginLeft: '8px' }}>HERDADA</span>}
                  {isAtribuidaDiretamente && !eRaiz && !estaBloqueada && <span style={{ background: '#10b981', color: 'white', padding: '2px 6px', borderRadius: '12px', fontSize: '9px', marginLeft: '8px' }}>ATRIBUÍDA</span>}
                  {estaBloqueada && !eRaiz && <span style={{ background: '#ef4444', color: 'white', padding: '2px 6px', borderRadius: '12px', fontSize: '9px', marginLeft: '8px' }}>BLOQUEADA</span>}
                </span>
                {node.descricao && <div style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>{node.descricao.substring(0, 60)}...</div>}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ background: '#e5e7eb', padding: '2px 8px', borderRadius: '12px', fontSize: '11px' }}>ID: {node.pkFuncionalidade}</span>
              <span style={{ background: 'rgba(212,175,55,0.1)', color: '#D4AF37', padding: '2px 8px', borderRadius: '12px', fontSize: '11px' }}>{node.designacaoTipoFuncionalidade || "Tipo"}</span>
              
              {isHerdadaNode && !eRaiz ? (
                estaBloqueada ? (
                  <button onClick={(e) => { e.stopPropagation(); handleDesbloquear(node.pkFuncionalidade, perfilId, node.designacao, perfilNome); }}
                    style={{ background: '#10b981', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', cursor: 'pointer' }}>
                    <FaUnlockAlt size={10} /> Desbloquear
                  </button>
                ) : (
                  <button onClick={(e) => { e.stopPropagation(); handleBloquear(node.pkFuncionalidade, perfilId, node.designacao, perfilNome); }}
                    style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', cursor: 'pointer' }}>
                    <FaBan size={10} /> Bloquear
                  </button>
                )
              ) : (!eRaiz && !estaBloqueada && (
                <button onClick={(e) => { e.stopPropagation(); handleRemover(node.pkFuncionalidade, perfilId, node.designacao, perfilNome); }}
                  style={{ background: '#ef4444', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', cursor: 'pointer' }}>
                  <FaTrash size={10} /> Remover
                </button>
              ))}
            </div>
          </div>
        </div>
        {temFilhos && aberto && (
          <div style={{ marginTop: '4px' }}>
            {node.filhos.map(child => renderNode(child, perfilId, perfilNome, depth + 1, temRaiz))}
          </div>
        )}
      </div>
    );
  };

  useEffect(() => { loadData(); }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <FaSpinner style={{ fontSize: '2rem', color: '#D4AF37', animation: 'spin 1s linear infinite' }} />
          <h4 style={{ marginTop: '1rem' }}>Carregando dados...</h4>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '2rem' }}>
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
          <FaExclamationTriangle style={{ fontSize: '2rem', marginBottom: '0.5rem' }} />
          <p>{error}</p>
          <button onClick={loadData} style={{ background: '#991b1b', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>
            <FaSyncAlt /> Tentar novamente
          </button>
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
          <FaTasks style={{ fontSize: '2rem', color: '#D4AF37' }} />
        </div>
        <h1 style={{ color: '#D4AF37', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>Funcionalidades por Perfil</h1>
        <p style={{ color: '#aaa', marginTop: '0.5rem' }}>Visualize e gerencie as funcionalidades atribuídas a cada perfil</p>
      </div>

      <div style={{ maxWidth: '1200px', margin: '-40px auto 0', padding: '2rem' }}>
        {/* Mensagem */}
        {mensagem && (
          <div style={{
            background: mensagem.tipo === 'success' ? '#d1fae5' : '#fee2e2',
            color: mensagem.tipo === 'success' ? '#065f46' : '#991b1b',
            padding: '12px',
            borderRadius: '12px',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>{mensagem.texto}</span>
            <button onClick={() => setMensagem(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>×</button>
          </div>
        )}

        {/* Legenda */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '16px', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <span><div style={{ display: 'inline-block', width: 12, height: 12, background: '#10b981', borderRadius: 2, marginRight: 6 }}></div> Atribuída</span>
          <span><div style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: 2, marginRight: 6 }}></div> Herdada</span>
          <span><div style={{ display: 'inline-block', width: 12, height: 12, background: '#ef4444', borderRadius: 2, marginRight: 6 }}></div> Bloqueada</span>
          <span><FaTrash color="#ef4444" size={12} /> Remover</span>
          <span><FaBan color="#f59e0b" size={12} /> Bloquear</span>
          <span><FaUnlockAlt color="#10b981" size={12} /> Desbloquear</span>
        </div>

        {/* Botão atualizar */}
        <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
          <button onClick={loadData} style={{ background: 'transparent', border: '2px solid #D4AF37', color: '#D4AF37', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
            <FaSyncAlt /> Atualizar
          </button>
        </div>

        {perfis.length === 0 ? (
          <div style={{ background: '#dbeafe', color: '#1e40af', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
            Nenhum perfil cadastrado.
          </div>
        ) : (
          perfis.map(perfil => {
            const { arvore, temRaiz } = construirArvorePorPerfil(perfil.pkPerfil);
            const totalFuncs = temRaiz ? funcionalidades.length : (funcionalidadesPorPerfil[perfil.pkPerfil]?.size || 0);
            const isInativo = perfil.estado !== 1;
            const aberto = abertos.has(`perfil-${perfil.pkPerfil}`);

            return (
              <div key={perfil.pkPerfil} style={{ background: 'white', borderRadius: '20px', marginBottom: '1.5rem', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <div style={{
                  padding: '16px',
                  cursor: 'pointer',
                  borderLeft: `4px solid ${temRaiz ? '#ef4444' : (isInativo ? '#dc3545' : '#D4AF37')}`,
                  background: aberto ? 'rgba(212,175,55,0.05)' : 'white'
                }} onClick={() => toggle(`perfil-${perfil.pkPerfil}`)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {aberto ? <FaChevronDown style={{ color: '#D4AF37' }} /> : <FaChevronRight style={{ color: '#666' }} />}
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
                        {perfil.designacao}
                        {temRaiz && <span style={{ background: '#ef4444', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', marginLeft: '8px' }}>ACESSO TOTAL</span>}
                        {isInativo && <span style={{ background: '#dc3545', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', marginLeft: '8px' }}>INATIVO</span>}
                      </h3>
                      <small style={{ color: '#666' }}>{temRaiz ? `Acesso TOTAL a todas funcionalidades` : `${totalFuncs} funcionalidade(s)`}</small>
                    </div>
                  </div>
                </div>
                
                {aberto && (
                  <div style={{ padding: '16px', background: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
                    {totalFuncs === 0 ? (
                      <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                        <FaInfoCircle size={32} style={{ marginBottom: '0.5rem' }} />
                        <p>Nenhuma funcionalidade atribuída.</p>
                      </div>
                    ) : arvore.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                        <p>Funcionalidades sem hierarquia definida.</p>
                      </div>
                    ) : (
                      arvore.map(node => renderNode(node, perfil.pkPerfil, perfil.designacao, 0, temRaiz))
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Estatísticas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
          <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
            <h2 style={{ color: '#D4AF37', margin: 0 }}>{perfis.length}</h2>
            <small>Perfis cadastrados</small>
          </div>
          <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
            <h2 style={{ color: '#10b981', margin: 0 }}>{associacoes.length}</h2>
            <small>Associações diretas</small>
          </div>
          <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
            <h2 style={{ color: '#f59e0b', margin: 0 }}>{funcionalidades.length}</h2>
            <small>Funcionalidades</small>
          </div>
          <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
            <h2 style={{ color: '#ef4444', margin: 0 }}>{Object.keys(funcionalidadesBloqueadas).length}</h2>
            <small>Bloqueios ativos</small>
          </div>
        </div>

        {/* Botão voltar */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button onClick={() => window.history.back()} style={{ padding: '0.75rem 2rem', borderRadius: '50px', border: '2px solid #D4AF37', background: 'transparent', color: '#D4AF37', fontWeight: 'bold', cursor: 'pointer' }}>
            <FaArrowLeft /> Voltar
          </button>
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