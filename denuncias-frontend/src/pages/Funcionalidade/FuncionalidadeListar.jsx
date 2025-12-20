import React, { useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
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
  FaExclamationTriangle
} from "react-icons/fa";

export default function FuncionalidadesTree() {
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
            const resp = await fetch("http://localhost:9090/api/seguranca/funcionalidade_listar");
            
            if (!resp.ok) {
                throw new Error(`Erro ao carregar: ${resp.status} ${resp.statusText}`);
            }
            
            const json = await resp.json();
            
            // Verificar se a resposta tem a estrutura esperada
            if (json.sucesso && json.dados) {
                console.log("Dados recebidos:", json.dados);
                setData(json.dados);
                
                // Calcular estatísticas
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
                // Fallback: se for diretamente um array
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

    // Estruturar dados em árvore
    const construirArvore = () => {
        const map = {};
        const raiz = [];
        
        // Primeiro passagem: criar mapa
        data.forEach(item => {
            map[item.pkFuncionalidade] = { 
                ...item, 
                filhos: [],
                temFilhos: false,
                nivel: 0
            };
        });
        
        // Segunda passagem: construir hierarquia
        data.forEach(item => {
            if (item.fkFuncionalidade !== null && item.fkFuncionalidade !== undefined) {
                const pai = map[item.fkFuncionalidade];
                if (pai) {
                    pai.filhos.push(map[item.pkFuncionalidade]);
                    pai.temFilhos = true;
                    map[item.pkFuncionalidade].nivel = (pai.nivel || 0) + 1;
                } else {
                    // Se não encontrar pai, adiciona à raiz
                    raiz.push(map[item.pkFuncionalidade]);
                }
            } else {
                raiz.push(map[item.pkFuncionalidade]);
            }
        });
        
        // Ordenar filhos por ID
        Object.values(map).forEach(node => {
            if (node.filhos.length > 0) {
                node.filhos.sort((a, b) => a.pkFuncionalidade - b.pkFuncionalidade);
            }
        });
        
        // Ordenar raiz por ID
        raiz.sort((a, b) => a.pkFuncionalidade - b.pkFuncionalidade);
        
        return raiz;
    };

    const raiz = construirArvore();

    // Função para filtrar funcionalidades (busca em profundidade)
    const filterNodes = (nodes, term) => {
        if (!term) return nodes;
        
        const resultados = [];
        
        const buscarRecursivamente = (node) => {
            const matches = 
                (node.designacao && node.designacao.toLowerCase().includes(term.toLowerCase())) ||
                (node.descricao && node.descricao.toLowerCase().includes(term.toLowerCase())) ||
                (node.pkFuncionalidade && node.pkFuncionalidade.toString().includes(term));
            
            if (matches) {
                return true;
            }
            
            // Verificar filhos recursivamente
            if (node.filhos && node.filhos.length > 0) {
                const filhosComMatch = node.filhos.filter(buscarRecursivamente);
                if (filhosComMatch.length > 0) {
                    // Adicionar pai mesmo sem match direto, mas com filhos que dão match
                    return true;
                }
            }
            
            return false;
        };
        
        nodes.forEach(node => {
            if (buscarRecursivamente(node)) {
                resultados.push(node);
            }
        });
        
        return resultados;
    };

    const filteredRoot = searchTerm ? filterNodes(raiz, searchTerm) : raiz;

    const renderNode = (node, depth = 0) => {
        const temFilhos = node.filhos && node.filhos.length > 0;
        const aberto = abertos.has(node.pkFuncionalidade);
        const hasDescription = node.descricao && node.descricao.trim() !== "";
        const tipo = node.designacaoTipoFuncionalidade || "Sem tipo";

        return (
            <div 
                key={node.pkFuncionalidade} 
                className="mb-2"
                style={{ 
                    marginLeft: `${depth * 24}px`,
                    transition: 'all 0.3s ease'
                }}
            >
                <div 
                    className="card border-0 shadow-sm rounded-3 mb-2 hover-shadow"
                    style={{
                        backgroundColor: aberto ? 'rgba(13, 110, 253, 0.03)' : '#ffffff',
                        borderLeft: `4px solid ${aberto ? '#0d6efd' : '#6c757d'}`,
                        cursor: temFilhos ? 'pointer' : 'default',
                        transition: 'all 0.2s ease'
                    }}
                    onClick={temFilhos ? () => toggle(node.pkFuncionalidade) : undefined}
                >
                    <div className="card-body py-3 px-4">
                        <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center flex-grow-1">
                                {/* Ícone de pasta/expansão */}
                                <div className="me-3">
                                    {temFilhos ? (
                                        <div className="d-flex align-items-center">
                                            {aberto ? (
                                                <FaChevronDown className="text-primary me-2" size={16} />
                                            ) : (
                                                <FaChevronRight className="text-secondary me-2" size={16} />
                                            )}
                                            <FaFolderOpen className="text-warning" size={20} />
                                        </div>
                                    ) : (
                                        <FaFolder className="text-muted" size={20} />
                                    )}
                                </div>

                                {/* Conteúdo da funcionalidade */}
                                <div className="flex-grow-1">
                                    <div className="d-flex align-items-center mb-1 flex-wrap">
                                        <h5 
                                            className="mb-0 text-dark fw-semibold me-2"
                                            style={{ fontSize: '1.1rem' }}
                                        >
                                            {node.designacao}
                                        </h5>
                                        
                                        {/* Badge do tipo */}
                                        <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 ms-2 px-2 py-1">
                                            {tipo}
                                        </span>
                                        
                                        {temFilhos && (
                                            <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 ms-2 px-2 py-1">
                                                {node.filhos.length} {node.filhos.length === 1 ? 'subitem' : 'subitens'}
                                            </span>
                                        )}
                                        
                                        {/* Badge de grupo se existir */}
                                        {node.grupo !== undefined && node.grupo !== null && node.grupo !== 0 && (
                                            <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 ms-2 px-2 py-1">
                                                Grupo: {node.grupo}
                                            </span>
                                        )}
                                    </div>
                                    
                                    {hasDescription && (
                                        <div className="d-flex align-items-start mt-2">
                                            <FaInfoCircle className="text-info me-2 mt-1" size={14} />
                                            <p 
                                                className="mb-0 text-muted"
                                                style={{ 
                                                    fontSize: '0.9rem',
                                                    lineHeight: '1.4'
                                                }}
                                            >
                                                {node.descricao}
                                            </p>
                                        </div>
                                    )}
                                    
                                    {/* URL se existir */}
                                    {node.url && (
                                        <div className="mt-2">
                                            <small className="text-primary">
                                                <i className="bi bi-link me-1"></i>
                                                {node.url}
                                            </small>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ID da funcionalidade */}
                            <div className="ms-3">
                                <span 
                                    className="badge bg-dark bg-opacity-10 text-dark border border-dark border-opacity-25 px-3 py-2"
                                    style={{ fontSize: '0.8rem', fontWeight: '600' }}
                                >
                                    ID: {node.pkFuncionalidade}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Renderizar filhos se aberto */}
                {temFilhos && aberto && (
                    <div className="mt-2">
                        {node.filhos.map(child => renderNode(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="container mt-4 d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <div className="text-center">
                    <div className="spinner-grow text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
                        <span className="visually-hidden">Carregando...</span>
                    </div>
                    <h5 className="text-dark mb-2">A carregar funcionalidades...</h5>
                    <p className="text-muted">Por favor, aguarde um momento.</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger d-flex align-items-center" role="alert">
                    <FaExclamationTriangle className="me-3 flex-shrink-0" size={24} />
                    <div className="flex-grow-1">
                        <h5 className="alert-heading mb-2">Erro ao carregar</h5>
                        <p className="mb-0">{error}</p>
                    </div>
                    <button 
                        className="btn btn-outline-danger btn-sm"
                        onClick={loadData}
                    >
                        <FaSyncAlt className="me-1" /> Tentar novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            {/* Header com estatísticas */}
            <div className="row mb-4">
                <div className="col-md-8">
                    <div className="d-flex align-items-center mb-3">
                        <div className="bg-primary bg-opacity-10 rounded-3 p-3 me-3">
                            <FaList className="text-primary" size={28} />
                        </div>
                        <div>
                            <h1 className="text-dark mb-1" style={{ fontWeight: '600' }}>
                                Estrutura de Funcionalidades
                            </h1>
                            <p className="text-muted mb-0">
                                Visualize hierarquicamente todas as funcionalidades do sistema
                            </p>
                        </div>
                    </div>
                </div>
                             
            </div>
        
        
            {/* Lista de funcionalidades */}
            <div className="card border-0 shadow-lg rounded-3 overflow-hidden">
                
                
                <div className="card-body p-4">
                    {data.length === 0 ? (
                        <div className="text-center py-5">
                            <div className="bg-light rounded-3 p-5 mb-4">
                                <FaList className="text-muted mb-3" size={48} />
                                <h4 className="text-dark mb-2">Nenhuma funcionalidade encontrada</h4>
                                <p className="text-muted">Não há funcionalidades cadastradas no sistema.</p>
                                <button 
                                    className="btn btn-primary mt-2"
                                    onClick={loadData}
                                >
                                    <FaSyncAlt className="me-1" /> Tentar novamente
                                </button>
                            </div>
                        </div>
                    ) : filteredRoot.length === 0 ? (
                        <div className="text-center py-5">
                            <div className="bg-light rounded-3 p-5 mb-4">
                                <FaSearch className="text-muted mb-3" size={48} />
                                <h4 className="text-dark mb-2">Nenhum resultado encontrado</h4>
                                <p className="text-muted">
                                    Não foram encontradas funcionalidades correspondentes a "{searchTerm}"
                                </p>
                                <button 
                                    className="btn btn-outline-secondary mt-2"
                                    onClick={() => setSearchTerm("")}
                                >
                                    Limpar pesquisa
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="position-relative">
                            {filteredRoot.map(node => renderNode(node))}
                        </div>
                    )}
                </div>

                {/* Rodapé com estatísticas */}
                {data.length > 0 && (
                    <div className="card-footer bg-white border-0 border-top py-3">
                        <div className="row align-items-center">
                            <div className="col-md-6">
                                <div className="text-muted small">
                                    <span className="d-inline-flex align-items-center me-3">
                                        <div className="bg-primary rounded-circle me-2" style={{ width: '8px', height: '8px' }}></div>
                                        <span>Itens expandidos: {abertos.size}</span>
                                    </span>
                                    <span className="d-inline-flex align-items-center me-3">
                                        <div className="bg-success rounded-circle me-2" style={{ width: '8px', height: '8px' }}></div>
                                        <span>Total de itens: {stats.total}</span>
                                    </span>
                                    <span className="d-inline-flex align-items-center">
                                        <div className="bg-info rounded-circle me-2" style={{ width: '8px', height: '8px' }}></div>
                                        <span>Tipos: {stats.tipos.size}</span>
                                    </span>
                                </div>
                            </div>
                           
                        </div>
                    </div>
                )}
            </div>

            {/* CSS Styles */}
            <style jsx>{`
                .hover-shadow:hover {
                    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
                }
                .badge {
                    font-size: 0.75em;
                }
                .card {
                    transition: all 0.3s ease;
                }
                .spinner-border {
                    width: 1rem;
                    height: 1rem;
                }
            `}</style>
        </div>
    );
}