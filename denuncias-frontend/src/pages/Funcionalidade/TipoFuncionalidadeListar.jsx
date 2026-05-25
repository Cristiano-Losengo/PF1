import React, { useEffect, useState } from "react";
import { 
  FaList, 
  FaChevronRight, 
  FaChevronDown, 
  FaFolder,
  FaFolderOpen,
  FaInfoCircle,
  FaSpinner,
  FaSyncAlt,
  FaSearch,
  FaExclamationTriangle,
  FaArrowLeft,
  FaDatabase,
  FaTags,
  FaLayerGroup
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export default function FuncionalidadeListar() {
    const [data, setData] = useState([]);
    const [abertos, setAbertos] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [stats, setStats] = useState({
        total: 0,
        tipos: new Set()
    });

    const toggle = (id) => {
        const nova = new Set(abertos);
        nova.has(id) ? nova.delete(id) : nova.add(id);
        setAbertos(nova);
    };

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            const resp = await fetch("http://localhost:9090/api/seguranca/tipos_funcionalidade_listar");            
            if (!resp.ok) {
                throw new Error(`Erro ao carregar: ${resp.status} ${resp.statusText}`);
            }
            
            const json = await resp.json();
            
            if (json.sucesso && json.dados) {
                console.log("Dados recebidos:", json.dados);
                setData(json.dados);
                
                const tiposSet = new Set();
                json.dados.forEach(item => {
                    if (item.designacaoTipoFuncionalidade) {
                        tiposSet.add(item.designacaoTipoFuncionalidade);
                    }
                });
                
                setStats({
                    total: json.total || json.dados.length,
                    tipos: tiposSet
                });
            } else if (Array.isArray(json)) {
                console.log("Dados recebidos (array direto):", json);
                setData(json);
                
                const tiposSet = new Set();
                json.forEach(item => {
                    if (item.designacaoTipoFuncionalidade) {
                        tiposSet.add(item.designacaoTipoFuncionalidade);
                    }
                });
                
                setStats({
                    total: json.length,
                    tipos: tiposSet
                });
            } else {
                throw new Error("Formato de resposta inesperado da API");
            }
        } catch (e) {
            console.error("Erro detalhado ao carregar:", e);
            setError(`Não foi possível carregar as funcionalidades: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (data.length > 0) {
            console.log("Primeiro item dos dados:", data[0]);
            console.log("Campos disponíveis:", Object.keys(data[0]));
        }
    }, [data]);

    const construirArvore = () => {
        const map = new Map();
        const raiz = [];
        
        data.forEach(item => {
            map.set(item.pkFuncionalidade, {
                ...item,
                filhos: [],
                nivel: 0,
                temFilhos: false
            });
        });
        
        data.forEach(item => {
            const node = map.get(item.pkFuncionalidade);
            const paiId = item.fkFuncionalidadePai !== null && item.fkFuncionalidadePai !== undefined 
                ? item.fkFuncionalidadePai 
                : item.fkFuncionalidade;
            
            if (paiId !== null && paiId !== undefined && paiId !== 0) {
                const pai = map.get(paiId);
                if (pai) {
                    pai.filhos.push(node);
                    pai.temFilhos = true;
                    node.nivel = (pai.nivel || 0) + 1;
                } else {
                    raiz.push(node);
                }
            } else {
                raiz.push(node);
            }
        });
        
        const ordenarFilhos = (node) => {
            if (node.filhos && node.filhos.length > 0) {
                node.filhos.sort((a, b) => a.pkFuncionalidade - b.pkFuncionalidade);
                node.filhos.forEach(ordenarFilhos);
            }
        };
        
        raiz.sort((a, b) => a.pkFuncionalidade - b.pkFuncionalidade);
        raiz.forEach(ordenarFilhos);
        
        return raiz;
    };

    const raiz = construirArvore();

    const filterNodes = (nodes, term) => {
        if (!term) return nodes;
        
        const resultados = [];
        const idsParaExpandir = new Set();
        
        const buscarRecursivamente = (node, parent = null) => {
            let matches = false;
            
            if (node.designacao && node.designacao.toLowerCase().includes(term.toLowerCase())) {
                matches = true;
            } else if (node.descricao && node.descricao.toLowerCase().includes(term.toLowerCase())) {
                matches = true;
            } else if (node.pkFuncionalidade && node.pkFuncionalidade.toString().includes(term)) {
                matches = true;
            }
            
            let filhosComMatch = false;
            if (node.filhos && node.filhos.length > 0) {
                const filhosResultados = node.filhos.map(child => buscarRecursivamente(child, node));
                filhosComMatch = filhosResultados.some(result => result);
            }
            
            const result = matches || filhosComMatch;
            
            if (result && parent) {
                idsParaExpandir.add(parent.pkFuncionalidade);
            }
            
            return result;
        };
        
        nodes.forEach(node => {
            if (buscarRecursivamente(node)) {
                resultados.push(node);
            }
        });
        
        if (idsParaExpandir.size > 0) {
            const nova = new Set(abertos);
            idsParaExpandir.forEach(id => nova.add(id));
            setAbertos(nova);
        }
        
        return resultados;
    };

    const filteredRoot = searchTerm ? filterNodes(raiz, searchTerm) : raiz;

    const renderNode = (node, depth = 0) => {
        const temFilhos = node.filhos && node.filhos.length > 0;
        const aberto = abertos.has(node.pkFuncionalidade);
        const hasDescription = node.descricao && node.descricao.trim() !== "";
        const tipo = node.designacaoTipoFuncionalidade || "Sem tipo";
        const grupo = node.grupo || 0;

        return (
            <motion.div 
                key={node.pkFuncionalidade} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                style={{ marginLeft: `${depth * 24}px`, marginBottom: '12px' }}
            >
                <div 
                    style={{
                        background: aberto ? 'linear-gradient(135deg, rgba(212,175,55,0.05), rgba(212,175,55,0.02))' : 'white',
                        borderRadius: '12px',
                        borderLeft: `3px solid ${aberto ? '#D4AF37' : '#333'}`,
                        cursor: temFilhos ? 'pointer' : 'default',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
                    }}
                    onClick={temFilhos ? () => toggle(node.pkFuncionalidade) : undefined}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                        e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.04)';
                        e.currentTarget.style.transform = 'translateX(0)';
                    }}
                >
                    <div style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
                                {/* Ícone de expansão */}
                                <div style={{ marginRight: '16px', marginTop: '2px' }}>
                                    {temFilhos ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {aberto ? (
                                                <FaChevronDown style={{ color: '#D4AF37', fontSize: '14px' }} />
                                            ) : (
                                                <FaChevronRight style={{ color: '#999', fontSize: '14px' }} />
                                            )}
                                            {aberto ? (
                                                <FaFolderOpen style={{ color: '#D4AF37', fontSize: '18px' }} />
                                            ) : (
                                                <FaFolder style={{ color: '#D4AF37', fontSize: '18px' }} />
                                            )}
                                        </div>
                                    ) : (
                                        <FaFolder style={{ color: '#666', fontSize: '18px', marginLeft: '22px' }} />
                                    )}
                                </div>

                                {/* Conteúdo */}
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
                                        <h5 style={{ 
                                            margin: 0, 
                                            fontSize: '1rem', 
                                            fontWeight: '600',
                                            color: '#1a1a1a'
                                        }}>
                                            {node.designacao}
                                        </h5>
                                        
                                        <span style={{
                                            background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))',
                                            color: '#D4AF37',
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            border: '1px solid rgba(212,175,55,0.3)'
                                        }}>
                                            {tipo}
                                        </span>
                                        
                                        {temFilhos && (
                                            <span style={{
                                                background: 'rgba(0,0,0,0.05)',
                                                color: '#666',
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                fontSize: '11px',
                                                fontWeight: '600'
                                            }}>
                                                {node.filhos.length} {node.filhos.length === 1 ? 'subitem' : 'subitens'}
                                            </span>
                                        )}
                                        
                                        {grupo !== 0 && (
                                            <span style={{
                                                background: 'rgba(0,0,0,0.05)',
                                                color: '#666',
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                fontSize: '11px'
                                            }}>
                                                Grupo: {grupo}
                                            </span>
                                        )}
                                    </div>
                                    
                                    {hasDescription && (
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '8px' }}>
                                            <FaInfoCircle style={{ color: '#D4AF37', fontSize: '12px', marginTop: '2px' }} />
                                            <p style={{ margin: 0, color: '#666', fontSize: '13px', lineHeight: '1.5' }}>
                                                {node.descricao}
                                            </p>
                                        </div>
                                    )}
                                    
                                    {node.url && (
                                        <div style={{ marginTop: '8px' }}>
                                            <small style={{ color: '#D4AF37' }}>
                                                🔗 {node.url}
                                            </small>
                                        </div>
                                    )}
                                    
                                    <div style={{ marginTop: '8px', display: 'flex', gap: '16px' }}>
                                        <small style={{ color: '#999', fontSize: '11px' }}>
                                            ID: {node.pkFuncionalidade}
                                        </small>
                                        {node.fkFuncionalidadePai && node.fkFuncionalidadePai !== 0 && (
                                            <small style={{ color: '#999', fontSize: '11px' }}>
                                                Pai ID: {node.fkFuncionalidadePai}
                                            </small>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginLeft: '16px' }}>
                                <span style={{
                                    background: 'linear-gradient(135deg, #0a0a0a, #1a1a1a)',
                                    color: '#D4AF37',
                                    padding: '6px 12px',
                                    borderRadius: '20px',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    fontFamily: 'monospace'
                                }}>
                                    #{node.pkFuncionalidade}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {temFilhos && aberto && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ marginTop: '8px' }}
                    >
                        {node.filhos.map(child => renderNode(child, depth + 1))}
                    </motion.div>
                )}
            </motion.div>
        );
    };

    const renderArvore = () => {
        if (filteredRoot.length === 0) {
            return (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div style={{ 
                        background: 'linear-gradient(135deg, rgba(212,175,55,0.05), rgba(212,175,55,0.02))',
                        borderRadius: '20px',
                        padding: '48px',
                        maxWidth: '500px',
                        margin: '0 auto'
                    }}>
                        <FaSearch style={{ color: '#D4AF37', fontSize: '48px', marginBottom: '20px' }} />
                        <h4 style={{ color: '#333', marginBottom: '10px' }}>Nenhum resultado encontrado</h4>
                        <p style={{ color: '#666', marginBottom: '20px' }}>
                            Não foram encontradas funcionalidades correspondentes a "{searchTerm}"
                        </p>
                        <button 
                            onClick={() => setSearchTerm("")}
                            style={{
                                padding: '10px 24px',
                                background: 'linear-gradient(135deg, #D4AF37, #FFE55C)',
                                border: 'none',
                                borderRadius: '50px',
                                color: '#000',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            Limpar pesquisa
                        </button>
                    </div>
                </div>
            );
        }

        return <div>{filteredRoot.map(node => renderNode(node))}</div>;
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <FaSpinner style={{ fontSize: '48px', color: '#D4AF37', animation: 'spin 1s linear infinite', marginBottom: '20px' }} />
                    <h5 style={{ color: '#333' }}>A carregar funcionalidades...</h5>
                    <p style={{ color: '#666' }}>Por favor, aguarde um momento.</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '40px' }}>
                <div style={{ 
                    maxWidth: '600px', 
                    margin: '0 auto', 
                    background: 'white', 
                    borderRadius: '16px', 
                    padding: '32px',
                    textAlign: 'center',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                }}>
                    <FaExclamationTriangle style={{ fontSize: '48px', color: '#ef4444', marginBottom: '20px' }} />
                    <h5 style={{ color: '#333', marginBottom: '10px' }}>Erro ao carregar</h5>
                    <p style={{ color: '#666', marginBottom: '24px' }}>{error}</p>
                    <button 
                        onClick={loadData}
                        style={{
                            padding: '10px 24px',
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
            <div style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)', padding: '3rem 2rem', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', background: 'rgba(212,175,55,0.15)', marginBottom: '1rem' }}>
                    <FaList style={{ fontSize: '2rem', color: '#D4AF37' }} />
                </div>
                <h1 style={{ color: '#D4AF37', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>Estrutura de Tipo Funcionalidade</h1>
                <p style={{ color: '#aaa', marginTop: '0.5rem' }}>Visualize hierarquicamente o tipo funcionalidade do sistema</p>
            </div>

            {/* Conteúdo Principal */}
            <div style={{ maxWidth: '1200px', margin: '-40px auto 0', padding: '2rem' }}>
                


                {/* Card Principal da Lista */}
                <div style={{
                    background: 'white',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                }}>
                    <div style={{
                        padding: '20px 24px',
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
                                onClick={loadData}
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
                                <FaSyncAlt /> Atualizar
                            </button>
                        </div>
                    </div>

                    <div style={{ padding: '24px' }}>
                        {data.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                                <div style={{
                                    background: 'linear-gradient(135deg, rgba(212,175,55,0.05), rgba(212,175,55,0.02))',
                                    borderRadius: '20px',
                                    padding: '48px',
                                    maxWidth: '500px',
                                    margin: '0 auto'
                                }}>
                                    <FaList style={{ color: '#D4AF37', fontSize: '48px', marginBottom: '20px' }} />
                                    <h4 style={{ color: '#333', marginBottom: '10px' }}>Nenhuma funcionalidade encontrada</h4>
                                    <p style={{ color: '#666', marginBottom: '20px' }}>Não há funcionalidades cadastradas no sistema.</p>
                                    <button 
                                        onClick={loadData}
                                        style={{
                                            padding: '10px 24px',
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
                                        <FaSyncAlt /> Tentar novamente
                                    </button>
                                </div>
                            </div>
                        ) : (
                            renderArvore()
                        )}
                    </div>

                    {/* Rodapé */}
                    {data.length > 0 && (
                        <div style={{
                            padding: '16px 24px',
                            borderTop: '1px solid #e8e8e8',
                            background: '#fafafa'
                        }}>
                            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#666' }}>
                                    <div style={{ width: '8px', height: '8px', background: '#D4AF37', borderRadius: '50%' }} />
                                    Itens expandidos: {abertos.size}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#666' }}>
                                    <div style={{ width: '8px', height: '8px', background: '#D4AF37', borderRadius: '50%' }} />
                                    Total de Funcionalidades: {stats.total}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#666' }}>
                                    <div style={{ width: '8px', height: '8px', background: '#D4AF37', borderRadius: '50%' }} />
                                    Tipos: {stats.tipos.size}
                                </span>
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