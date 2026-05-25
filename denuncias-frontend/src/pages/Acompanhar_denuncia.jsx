import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaSearch, FaClock, FaCheckCircle, FaExclamationTriangle, 
  FaFileAlt, FaLightbulb, FaSpinner, FaTimesCircle,
  FaMapMarkerAlt, FaCalendarAlt, FaFolderOpen, FaArrowRight,
  FaHistory, FaShieldAlt, FaUserCheck, FaTools, FaThumbsUp,
  FaEye, FaChartLine, FaBell, FaShieldVirus, FaBullhorn,
  FaEnvelope, FaLock, FaKey, FaQrcode, FaArrowLeft
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const statusConfig = {
  'Pendente': { 
    label: "Recebida", 
    icon: FaFileAlt,
    gradient: "linear-gradient(135deg, #3B82F6, #2563EB)",
    lightColor: "#EFF6FF",
    borderColor: "#BFDBFE",
    textColor: "#1E40AF",
    step: 1,
    description: "Sua denúncia foi recebida e está aguardando análise preliminar"
  },
  'Em Analise': { 
    label: "Em Análise", 
    icon: FaSearch,
    gradient: "linear-gradient(135deg, #8B5CF6, #7C3AED)",
    lightColor: "#F5F3FF",
    borderColor: "#DDD6FE",
    textColor: "#5B21B6",
    step: 2,
    description: "Especialistas estão analisando os detalhes da sua denúncia"
  },
  'Em Curso': { 
    label: "Em Resolução", 
    icon: FaTools,
    gradient: "linear-gradient(135deg, #F59E0B, #D97706)",
    lightColor: "#FFFBEB",
    borderColor: "#FDE68A",
    textColor: "#92400E",
    step: 3,
    description: "Medidas concretas estão sendo implementadas para resolver o caso"
  },
  'Resolvido': { 
    label: "Resolvida", 
    icon: FaThumbsUp,
    gradient: "linear-gradient(135deg, #10B981, #059669)",
    lightColor: "#ECFDF5",
    borderColor: "#A7F3D0",
    textColor: "#065F46",
    step: 4,
    description: "Sua denúncia foi resolvida com sucesso. Agradecemos sua colaboração!"
  },
};

const AcompanharDenuncia = () => {
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  // URL da sua API - altere para o endereço correto
  const API_BASE_URL = "http://localhost:9090/api";

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const buscarDenuncia = async (codigo) => {
    try {
      console.log(`http://localhost:9090/api/denuncias/${codigo}`);
      // Primeiro, busca a denúncia pelo código
      const response = await fetch(`http://localhost:9090/api/denuncias/${codigo}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('DENUNCIA_NAO_ENCONTRADA');
        }
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const denuncia = await response.json();
      
      // Busca o histórico de atualizações da denúncia
    /*  const historicoResponse = await fetch(`${API_BASE_URL}/denuncias/${denuncia.pkDenuncia}/historico`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      let historico = [];
      if (historicoResponse.ok) {
        historico = await historicoResponse.json();
      } else {
        // Se não houver endpoint de histórico, cria um histórico básico
        historico = [
          {
            data: denuncia.dataCriacao || new Date().toISOString(),
            status: denuncia.status || 'Pendente',
            desc: `Denúncia registada com o código: ${denuncia.codigo}`,
            responsavel: "Sistema Automático"
          }
        ];
      }
*/
      // Formata os dados para o componente
      const formattedResult = {
        codigo: denuncia.codigo,
        titulo: denuncia.subtipo || `${denuncia.categoriaNome || 'Denúncia'} - ${denuncia.municipio || 'Local não informado'}`,
        categoria: denuncia.categoriaNome || 'Não categorizada',
        municipio: denuncia.municipio || 'Não informado',
        data: denuncia.dataOcorrecia || denuncia.dataCriacao,
        status: denuncia.status || 'Pendente',
        descricao: denuncia.descricaoDetalhada
      /*  historico: historico.map(item => ({
          data: item.data || item.dataHora,
          status: item.status,
          desc: item.descricao || item.desc,
          responsavel: item.responsavel || "Sistema"
        }))
          */
      };

      return formattedResult;
    } catch (error) {
      console.error("Erro ao buscar denúncia:", error);
      throw error;
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    // Validação do código
    if (code.trim().length < 4) {
      setError("Por favor, insira um código válido");
      return;
    }
    
    setSearched(true);
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const data = await buscarDenuncia(code.trim().toUpperCase());
      setResult(data);
    } catch (error) {
      console.error("Erro na busca:", error);
      if (error.message === 'DENUNCIA_NAO_ENCONTRADA') {
        setError("Denúncia não encontrada. Verifique o código informado.");
      } else {
        setError("Erro ao buscar denúncia. Tente novamente mais tarde.");
      }
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const currentStatus = result ? statusConfig[result.status] || statusConfig['Pendente'] : null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Data não disponível';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Data inválida';
      return date.toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (error) {
      return 'Data não disponível';
    }
  };

  const getStatusProgress = () => {
    if (!currentStatus) return 0;
    return (currentStatus.step / 4) * 100;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f5f5',
      fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0d0d0d 100%)',
        paddingTop: '60px',
        paddingBottom: '80px',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(212, 175, 55, 0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}></div>
        
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem', textAlign: 'center', position: 'relative' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              display: 'inline-flex',
              padding: '1.5rem',
              borderRadius: '50%',
              background: 'rgba(212, 175, 55, 0.15)',
              border: '2px solid rgba(212, 175, 55, 0.3)'
            }}>
              <FaQrcode style={{ fontSize: '2rem', color: '#D4AF37' }} />
            </div>
          </div>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 'bold',
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #D4AF37 0%, #FFE55C 50%, #D4AF37 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Acompanhe sua Denúncia
          </h1>
          <p style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto', color: '#FFFFFF' }}>
            Acompanhe em tempo real o andamento da sua denúncia
          </p>
        </div>
      </div>

      <main style={{ maxWidth: '1000px', margin: '-40px auto 0', padding: '0 1rem 2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Card de Busca */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              background: 'white',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb'
            }}
          >
            <form onSubmit={handleSearch}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="code" style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                .
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    ref={inputRef}
                    id="code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Ex: DN-A3K8M2NQ"
                    style={{
                      width: '100%',
                      padding: '1rem 1rem 1rem 3rem',
                      fontSize: '1rem',
                      border: `2px solid ${error ? '#EF4444' : '#E5E7EB'}`,
                      borderRadius: '12px',
                      transition: 'all 0.3s ease',
                      outline: 'none',
                      fontFamily: 'monospace',
                      fontWeight: '600'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#D4AF37';
                      e.target.style.boxShadow = '0 0 0 3px rgba(212, 175, 55, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = error ? '#EF4444' : '#E5E7EB';
                      e.target.style.boxShadow = 'none';
                    }}
                    autoComplete="off"
                  />
                  <FaKey style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: error ? '#EF4444' : '#D4AF37',
                    fontSize: '1.125rem'
                  }} />
                </div>
                {error && !loading && (
                  <p style={{
                    fontSize: '0.75rem',
                    color: '#EF4444',
                    marginTop: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <FaExclamationTriangle size={12} />
                    {error}
                  </p>
                )}
                
              </div>
              
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #D4AF37 0%, #FFE55C 100%)',
                  color: '#000',
                  fontWeight: '700',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  opacity: loading ? 0.7 : 1
                }}
                disabled={loading || code.trim().length < 4}
              >
                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Buscando denúncia...</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <FaSearch />
                    <span>Consultar Denúncia</span>
                    <FaArrowRight />
                  </div>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Loading */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '3rem',
                  textAlign: 'center',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                  border: '1px solid #e5e7eb'
                }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  style={{
                    width: '60px',
                    height: '60px',
                    border: '4px solid #E5E7EB',
                    borderTop: '4px solid #D4AF37',
                    borderRadius: '50%',
                    margin: '0 auto 1rem auto'
                  }}
                />
                <p style={{ color: '#374151', fontWeight: '500' }}>Processando sua solicitação...</p>
                <p style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '0.5rem' }}>Por favor, aguarde</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Resultado da Denúncia */}
          <AnimatePresence>
            {!loading && searched && result && currentStatus && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
              >
                <div style={{
                  background: 'white',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
                    padding: '2rem',
                    color: 'white',
                    borderBottom: '2px solid #D4AF37'
                  }}>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '1rem'
                    }}>
                      <div>
                        <p style={{
                          fontSize: '0.875rem',
                          opacity: 0.7,
                          fontFamily: 'monospace',
                          marginBottom: '0.5rem'
                        }}>
                          Protocolo: {result.codigo}
                        </p>
                        <h2 style={{
                          fontSize: 'clamp(1.25rem, 4vw, 1.75rem)',
                          fontWeight: '700',
                          margin: 0,
                          color: '#FFFFFF'
                        }}>
                          {result.titulo}
                        </h2>
                      </div>
                      <div style={{
                        background: 'rgba(212, 175, 55, 0.2)',
                        borderRadius: '50px',
                        padding: '0.5rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        border: '1px solid rgba(212, 175, 55, 0.3)'
                      }}>
                        {currentStatus.icon && <currentStatus.icon style={{ color: '#D4AF37' }} />}
                        <span style={{ fontWeight: '600', color: '#D4AF37' }}>{currentStatus.label}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '2rem' }}>
                    {/* Informações */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '1rem',
                      marginBottom: '2rem'
                    }}>
                      {[
                        { icon: FaFolderOpen, label: result.categoria },
                        { icon: FaMapMarkerAlt, label: result.municipio },
                        { icon: FaCalendarAlt, label: formatDate(result.data) }
                      ].map((item, idx) => (
                        <div key={idx} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.75rem',
                          background: '#F9FAFB',
                          borderRadius: '12px'
                        }}>
                          <item.icon style={{ color: '#D4AF37', fontSize: '1.125rem' }} />
                          <span style={{ color: '#4B5563', fontWeight: '500' }}>{item.label}</span>
                        </div>
                      ))}
                    </div>

                    {/* Barra de Progresso */}
                    <div style={{ marginBottom: '2rem' }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.5rem',
                        fontSize: '0.875rem',
                        color: '#6B7280'
                      }}>
                        <span>Progresso da denúncia</span>
                        <span style={{ fontWeight: '700', color: '#D4AF37' }}>{currentStatus.step}/4</span>
                      </div>
                      <div style={{
                        background: '#E5E7EB',
                        borderRadius: '10px',
                        height: '8px',
                        overflow: 'hidden'
                      }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${getStatusProgress()}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          style={{
                            height: '100%',
                            background: 'linear-gradient(135deg, #D4AF37 0%, #FFE55C 100%)',
                            borderRadius: '10px'
                          }}
                        />
                      </div>
                    </div>

                    {/* Status Atual */}
                    <div style={{
                      background: currentStatus.lightColor,
                      border: `1px solid ${currentStatus.borderColor}`,
                      borderRadius: '16px',
                      padding: '1rem',
                      marginBottom: '2rem'
                    }}>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        {currentStatus.icon && <currentStatus.icon style={{ color: '#D4AF37', marginTop: '0.125rem' }} />}
                        <div>
                          <p style={{ fontWeight: '700', color: '#111827', marginBottom: '0.25rem' }}>Detathes</p>
                          <p style={{ color: '#4B5563' }}>{result.descricao}</p>
                        </div>
                      </div>
                    </div>

                    {/* Histórico */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <FaHistory style={{ color: '#D4AF37', fontSize: '1.25rem' }} />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827', margin: 0 }}>
                          Histórico de Atualizações
                        </h3>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {result.historico && result.historico.length > 0 ? (
                          result.historico.map((item, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              style={{ position: 'relative', paddingLeft: '2rem' }}
                            >
                              {index < result.historico.length - 1 && (
                                <div style={{
                                  position: 'absolute',
                                  left: '0.75rem',
                                  top: '1.5rem',
                                  bottom: '-1rem',
                                  width: '2px',
                                  background: 'linear-gradient(to bottom, #D4AF37, #E5E7EB)'
                                }} />
                              )}
                              
                              <div style={{
                                position: 'absolute',
                                left: 0,
                                top: '0.25rem',
                                width: '1.5rem',
                                height: '1.5rem',
                                background: 'white',
                                border: `2px solid #D4AF37`,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <div style={{
                                  width: '0.5rem',
                                  height: '0.5rem',
                                  background: '#D4AF37',
                                  borderRadius: '50%'
                                }} />
                              </div>

                              <div style={{
                                background: '#F9FAFB',
                                borderRadius: '12px',
                                padding: '1rem',
                                transition: 'all 0.3s ease'
                              }}>
                                <div style={{
                                  display: 'flex',
                                  flexWrap: 'wrap',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  marginBottom: '0.5rem'
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{
                                      fontSize: '0.875rem',
                                      fontWeight: '700',
                                      color: '#D4AF37'
                                    }}>
                                      {item.status}
                                    </span>
                                    {item.responsavel && (
                                      <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                                        por {item.responsavel}
                                      </span>
                                    )}
                                  </div>
                                  <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                                    {formatDate(item.data)}
                                  </span>
                                </div>
                                <p style={{ color: '#4B5563', margin: 0 }}>{item.desc}</p>
                              </div>
                            </motion.div>
                          ))
                        ) : (
                          <p style={{ color: '#6B7280', textAlign: 'center' }}>Nenhum histórico disponível</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dicas */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              background: '#1a1a1a',
              borderRadius: '20px',
              padding: '1.5rem',
              border: '1px solid rgba(212, 175, 55, 0.2)'
            }}
          >
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{
                background: 'rgba(212, 175, 55, 0.15)',
                borderRadius: '12px',
                padding: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FaLightbulb style={{ color: '#D4AF37', fontSize: '1.25rem' }} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#FFFFFF', marginBottom: '1rem' }}>
                  Dicas importantes
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '0.75rem'
                }}>
                  {[
                    "Guarde o código em local seguro",
                    "Código único e intransferível",
                    "Atualizações em tempo real",
                    "Utilize o mesmo email da denúncia"
                  ].map((tip, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '6px', height: '6px', background: '#D4AF37', borderRadius: '50%' }} />
                      <span style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Voltar */}
          <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
            <Link to="/" style={{
              background: 'transparent',
              color: '#D4AF37',
              fontWeight: '600',
              border: '2px solid #D4AF37',
              borderRadius: '50px',
              padding: '0.75rem 2rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <FaArrowLeft />
              Voltar à Página Inicial
            </Link>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AcompanharDenuncia;