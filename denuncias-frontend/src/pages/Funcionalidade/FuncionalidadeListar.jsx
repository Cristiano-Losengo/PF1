import React, { useEffect, useState } from "react";
import { 
  FaList, FaChevronRight, FaChevronDown, FaFolder, FaFolderOpen,
  FaInfoCircle, FaSpinner, FaSyncAlt, FaSearch, FaExclamationTriangle,
  FaArrowLeft
} from "react-icons/fa";

export default function FuncionalidadeListar() {
  const [data, setData] = useState([]);
  const [abertos, setAbertos] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({ total: 0, tipos: 0 });

  const toggle = (id) => {
    const nova = new Set(abertos);
    nova.has(id) ? nova.delete(id) : nova.add(id);
    setAbertos(nova);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const resp = await fetch("http://localhost:9090/api/seguranca/funcionalidade_listar");
      if (!resp.ok) throw new Error(`Erro: ${resp.status}`);
      
      const json = await resp.json();
      const dados = json.sucesso ? json.dados : json;
      
      setData(dados);
      const tiposSet = new Set(dados.map(item => item.designacaoTipoFuncionalidade).filter(Boolean));
      setStats({ total: dados.length, tipos: tiposSet.size });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const construirArvore = () => {
    const map = new Map();
    const raiz = [];
    
    data.forEach(item => {
      map.set(item.pkFuncionalidade, { ...item, filhos: [], nivel: 0, temFilhos: false });
    });
    
    data.forEach(item => {
      const node = map.get(item.pkFuncionalidade);
      const paiId = item.fkFuncionalidadePai;
      
      if (paiId && paiId !== 0 && map.has(paiId)) {
        const pai = map.get(paiId);
        pai.filhos.push(node);
        pai.temFilhos = true;
        node.nivel = (pai.nivel || 0) + 1;
      } else {
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
    return raiz;
  };

  const raiz = construirArvore();

  const filterNodes = (nodes, term) => {
    if (!term) return nodes;
    const resultados = [];
    const idsExpandir = new Set();
    
    const buscar = (node, parent = null) => {
      let match = node.designacao?.toLowerCase().includes(term.toLowerCase()) ||
                  node.descricao?.toLowerCase().includes(term.toLowerCase());
      
      let filhosMatch = false;
      if (node.filhos?.length) {
        filhosMatch = node.filhos.some(c => buscar(c, node));
      }
      
      if (match || filhosMatch) {
        if (parent) idsExpandir.add(parent.pkFuncionalidade);
        return true;
      }
      return false;
    };
    
    nodes.forEach(node => { if (buscar(node)) resultados.push(node); });
    
    if (idsExpandir.size) {
      const nova = new Set(abertos);
      idsExpandir.forEach(id => nova.add(id));
      setAbertos(nova);
    }
    return resultados;
  };

  const filteredRoot = searchTerm ? filterNodes(raiz, searchTerm) : raiz;

  const renderNode = (node, depth = 0) => {
    const temFilhos = node.filhos?.length > 0;
    const aberto = abertos.has(node.pkFuncionalidade);
    
    return (
      <div key={node.pkFuncionalidade} style={{ marginLeft: `${depth * 24}px` }} className="mb-2">
        <div 
          onClick={temFilhos ? () => toggle(node.pkFuncionalidade) : undefined}
          style={{
            background: aberto ? 'rgba(212,175,55,0.05)' : 'white',
            borderRadius: '12px',
            padding: '1rem',
            borderLeft: `4px solid ${aberto ? '#D4AF37' : '#6c757d'}`,
            cursor: temFilhos ? 'pointer' : 'default',
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            marginBottom: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              {/* Ícone */}
              <div style={{ marginRight: '12px' }}>
                {temFilhos ? (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {aberto ? <FaChevronDown style={{ color: '#D4AF37', marginRight: '8px' }} size={14} />
                            : <FaChevronRight style={{ color: '#666', marginRight: '8px' }} size={14} />}
                    <FaFolderOpen style={{ color: '#D4AF37' }} size={18} />
                  </div>
                ) : (
                  <FaFolder style={{ color: '#999' }} size={18} />
                )}
              </div>
              
              {/* Conteúdo */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <h5 style={{ margin: 0, fontWeight: 'bold', fontSize: '1rem' }}>{node.designacao}</h5>
                  <span style={{ background: 'rgba(212,175,55,0.1)', color: '#D4AF37', padding: '2px 8px', borderRadius: '20px', fontSize: '0.7rem' }}>
                    {node.designacaoTipoFuncionalidade || "Sem tipo"}
                  </span>
                  {temFilhos && (
                    <span style={{ background: 'rgba(0,0,0,0.05)', padding: '2px 8px', borderRadius: '20px', fontSize: '0.7rem' }}>
                      {node.filhos.length} {node.filhos.length === 1 ? 'subitem' : 'subitens'}
                    </span>
                  )}
                </div>
                {node.descricao && (
                  <div style={{ display: 'flex', alignItems: 'start', marginTop: '8px' }}>
                    <FaInfoCircle style={{ color: '#D4AF37', marginRight: '8px', marginTop: '2px' }} size={12} />
                    <p style={{ margin: 0, color: '#666', fontSize: '0.85rem' }}>{node.descricao}</p>
                  </div>
                )}
                {node.url && (
                  <div style={{ marginTop: '8px' }}>
                    <small style={{ color: '#D4AF37', fontFamily: 'monospace' }}>{node.url}</small>
                  </div>
                )}
                <div style={{ marginTop: '8px', display: 'flex', gap: '12px' }}>
                  <small style={{ color: '#999' }}>ID: {node.pkFuncionalidade}</small>
                  {node.fkFuncionalidadePai && <small style={{ color: '#999' }}>Pai ID: {node.fkFuncionalidadePai}</small>}
                </div>
              </div>
            </div>
            
            <div style={{ marginLeft: '16px' }}>
              <span style={{ background: '#f0f0f0', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                #{node.pkFuncionalidade}
              </span>
            </div>
          </div>
        </div>
        
        {temFilhos && aberto && (
          <div style={{ marginTop: '4px' }}>
            {node.filhos.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <FaSpinner style={{ fontSize: '2rem', color: '#D4AF37', animation: 'spin 1s linear infinite' }} />
          <h4 style={{ marginTop: '1rem' }}>Carregando funcionalidades...</h4>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '2rem' }}>
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
          <FaExclamationTriangle style={{ fontSize: '2rem', marginBottom: '0.5rem' }} />
          <h5>Erro ao carregar</h5>
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
      <div style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)', padding: '3rem 1rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', background: 'rgba(212,175,55,0.15)', marginBottom: '1rem' }}>
          <FaList style={{ fontSize: '2rem', color: '#D4AF37' }} />
        </div>
        <h1 style={{ color: '#D4AF37', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>Estrutura de Funcionalidades</h1>
        <p style={{ color: '#aaa', marginTop: '0.5rem' }}>Visualize hierarquicamente todas as funcionalidades do sistema</p>
      </div>

      <div style={{ maxWidth: '1000px', margin: '-40px auto 0', padding: '2rem' }}>

        {/* Lista de funcionalidades */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
          {data.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <FaList style={{ fontSize: '3rem', color: '#ccc', marginBottom: '1rem' }} />
              <h4>Nenhuma funcionalidade encontrada</h4>
              <button onClick={loadData} style={{ marginTop: '1rem', background: '#D4AF37', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>
                <FaSyncAlt /> Recarregar
              </button>
            </div>
          ) : filteredRoot.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <FaSearch style={{ fontSize: '3rem', color: '#D4AF37', marginBottom: '1rem' }} />
              <h4>Nenhum resultado encontrado</h4>
              <p>Não foram encontradas funcionalidades para "{searchTerm}"</p>
            </div>
          ) : (
            filteredRoot.map(node => renderNode(node))
          )}
        </div>

        {/* Estatísticas */}
        {data.length > 0 && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '1rem', marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '10px', height: '10px', background: '#D4AF37', borderRadius: '50%' }} />
              <span>Itens expandidos: {abertos.size}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '50%' }} />
              <span>Total de Funcionalidades: {stats.total}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '10px', height: '10px', background: '#f59e0b', borderRadius: '50%' }} />
              <span>Tipos: {stats.tipos}</span>
            </div>
          </div>
        )}

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