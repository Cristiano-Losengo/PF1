import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function TipoFuncionalidadeCadastrar() {
  const [file, setFile] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);
  const [erros, setErros] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [sucesso, setSucesso] = useState(false);
  const [versoes, setVersoes] = useState({
    tipos_funcionalidade: "Nenhuma versão importada",
    funcionalidades: "Nenhuma versão importada"
  });
  const [versaoCarregando, setVersaoCarregando] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorDetails, setErrorDetails] = useState("");
  const [ultimaImportacao, setUltimaImportacao] = useState(null);
  
  const fileInputRef = useRef(null);
  const progressRef = useRef(null);
  const messagesRef = useRef(null);

  // Carregar versões atuais
  useEffect(() => {
    carregarVersoes();
    const interval = setInterval(carregarVersoes, 30000);
    return () => clearInterval(interval);
  }, []);

  // Scroll para mensagens 
  useEffect(() => {
    if ((mensagem || erros.length > 0 || warnings.length > 0) && messagesRef.current) {
      messagesRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setShowMessages(true);
    }
  }, [mensagem, erros, warnings]);

  const carregarVersoes = async () => {
    setVersaoCarregando(true);
    try {
      const response = await fetch("http://localhost:9090/api/seguranca/versoes_atuais", {
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
      });
      if (response.ok) {
        const data = await response.json();
        setVersoes({
          tipos_funcionalidade: data.tipos_funcionalidade || "Nenhuma versão importada",
          funcionalidades: data.funcionalidades || "Nenhuma versão importada"
        });
      }
    } catch (error) {
      console.error("Erro ao carregar versões:", error);
    } finally {
      setVersaoCarregando(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile) => {
    const allowedExtensions = ['.xls', '.xlsx', '.csv'];
    const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      setMensagem("❌ Formato de arquivo não suportado. Use .xls, .xlsx ou .csv");
      setErros(["Formato de arquivo não suportado. Use .xls, .xlsx ou .csv"]);
      setSucesso(false);
      return;
    }

    setFile(selectedFile);
    setMensagem("");
    setErros([]);
    setWarnings([]);
    setSucesso(false);
    setShowMessages(false);
    setShowErrorModal(false);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const simulateProgress = () => {
    if (!progressRef.current) return;
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      if (progressRef.current) {
        progressRef.current.style.width = `${progress}%`;
      }
      if (progress >= 95) clearInterval(interval);
    }, 50);
    return interval;
  };

  const formatarErroParaModal = (errosArray) => {
    if (!errosArray) return "";
    if (Array.isArray(errosArray)) {
      if (errosArray.length > 0 && typeof errosArray[0] === 'string') {
        return errosArray.join('\n');
      }
      return errosArray.map(erro => {
        if (typeof erro === 'object') {
          return `Linha: ${erro.linha || erro.tipo_erro || 'N/A'}\n` +
                 `Coluna: ${erro.coluna || 'N/A'}\n` +
                 `Campo: ${erro.campo || 'N/A'}\n` +
                 `Valor: ${erro.valor || 'N/A'}\n` +
                 `Motivo: ${erro.motivo || 'N/A'}\n`;
        }
        return erro;
      }).join('\n\n');
    }
    return errosArray || "";
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMensagem("❌ Por favor selecione um ficheiro!");
      setErros(["Por favor selecione um ficheiro!"]);
      setSucesso(false);
      setShowMessages(true);
      return;
    }

    setLoading(true);
    setMensagem("");
    setErros([]);
    setWarnings([]);
    setSucesso(false);
    setShowMessages(false);
    setShowErrorModal(false);

    const progressInterval = simulateProgress();

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const response = await fetch("http://localhost:9090/api/seguranca/tipo_funcionalidade_importar", {
        method: "POST",
        body: formDataUpload,
        headers: { 'Accept': 'application/json' },
      });

      const resultado = await response.json();
      console.log("Resposta completa da API:", resultado);

      if (progressRef.current) {
        progressRef.current.style.width = "100%";
      }

      if (response.ok) {
        if (resultado.sucesso) {
          setMensagem(resultado.mensagem || "✅ Importação realizada com sucesso!");
          setSucesso(true);
          setUltimaImportacao(new Date().toLocaleString('pt-PT'));
          setFile(null);
          if (fileInputRef.current) fileInputRef.current.value = '';

          await carregarVersoes();

          setTimeout(() => {
            setMensagem("");
            setSucesso(false);
            if (progressRef.current) {
              progressRef.current.style.width = "0%";
            }
          }, 5000);
        } else {
          if (resultado.erros && Array.isArray(resultado.erros)) {
            console.log("Erros recebidos do backend:", resultado.erros);
            
            const primeiroErro = resultado.erros[0] || "";
            
            if (typeof primeiroErro === 'object') {
              if (primeiroErro.campo && 
                  (primeiroErro.campo.includes('data') || 
                   primeiroErro.campo.includes('hora') || 
                   primeiroErro.campo.includes('data_hora'))) {
                
                let mensagemErro = primeiroErro.motivo || "Erro na data/hora do arquivo";
                const linhasMotivo = mensagemErro.split('\n');
                const primeiraLinha = linhasMotivo[0] || "Erro de validação";
                
                setMensagem(`❌ ${primeiraLinha}`);
                setErros([primeiraLinha]);
                
                if (linhasMotivo.length > 1) {
                  setErrorDetails(mensagemErro);
                  setShowErrorModal(true);
                }
              } else {
                setErrorDetails(formatarErroParaModal(resultado.erros));
                setShowErrorModal(true);
                setErros([]);
              }
            } 
            else if (typeof primeiroErro === 'string' && 
                    (primeiroErro.includes("# Detalhes") || 
                     primeiroErro.includes("erro(s) de validação encontrado(s)"))) {
              setErrorDetails(formatarErroParaModal(resultado.erros));
              setShowErrorModal(true);
              setErros([]);
            } else {
              setErros(resultado.erros);
              setMensagem(`❌ Foram encontrados ${resultado.erros.length} erro(s) na importação`);
            }
          } else if (resultado.erro) {
            setErros([resultado.erro]);
          }
          
          setMensagem("❌ Foram encontrados erros na importação");
          if (progressRef.current) {
            progressRef.current.style.width = "0%";
          }
        }
      } else {
        const errosArray = resultado.erros || [resultado.erro || "❌ Erro ao importar ficheiro!"];
        setErros(errosArray);
        setMensagem("❌ Erro na importação");
        if (progressRef.current) {
          progressRef.current.style.width = "0%";
        }
      }

      if (resultado.warnings && Array.isArray(resultado.warnings)) {
        setWarnings(resultado.warnings);
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      setMensagem("❌ Erro de conexão com o servidor.");
      setErros(["Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente."]);
      if (progressRef.current) {
        progressRef.current.style.width = "0%";
      }
    } finally {
      clearInterval(progressInterval);
      setLoading(false);
      setShowMessages(true);
    }
  };

  const fecharModalLimparMensagens = () => {
    setShowErrorModal(false);
    setMensagem("");
    setErros([]);
    setWarnings([]);
    setShowMessages(false);
  };

  const clearAll = () => {
    setFile(null);
    setMensagem("");
    setErros([]);
    setWarnings([]);
    setSucesso(false);
    setShowMessages(false);
    setShowErrorModal(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (progressRef.current) {
      progressRef.current.style.width = "0%";
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Função formatarDetalhesErro 
  const formatarDetalhesErro = (texto) => {
    if (!texto) return null;
    const linhas = texto.split('\n');
    let emDetalhesErros = false;
    let emProximosPassos = false;
    let erroCount = 0;
    
    linhas.forEach(linha => {
      if (linha.includes('Linha:') || linha.includes('Motivo do erro:')) erroCount++;
    });
    
    return (
      <div>
        {erroCount > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            background: 'linear-gradient(135deg, rgba(212,175,55,0.1), rgba(212,175,55,0.05))',
            borderRadius: '12px',
            marginBottom: '20px',
            borderLeft: '4px solid #D4AF37'
          }}>
            <div style={{
              background: '#D4AF37',
              color: '#000',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '14px'
            }}>
              {erroCount}
            </div>
            <span style={{ fontWeight: '600', color: '#333' }}>erro(s) de validação encontrado(s)</span>
          </div>
        )}
        
        {linhas.map((linha, index) => {
          if (linha.startsWith('# ')) {
            return (
              <h5 key={index} style={{ 
                color: '#D4AF37', 
                marginBottom: '20px', 
                fontSize: '18px',
                fontWeight: '700',
                borderLeft: '3px solid #D4AF37',
                paddingLeft: '12px'
              }}>
                {linha.substring(2)}
              </h5>
            );
          }
          
          if (linha.includes('erro(s) de validação encontrado(s)')) {
            return null;
          }
          
          if (linha.includes('Código:') || linha.includes('Status:')) {
            return (
              <div key={index} style={{ 
                color: '#666', 
                fontSize: '13px', 
                marginBottom: '8px',
                fontFamily: 'monospace',
                background: '#f5f5f5',
                padding: '4px 8px',
                borderRadius: '6px',
                display: 'inline-block'
              }}>
                {linha}
              </div>
            );
          }
          
          if (linha.includes('Mensagem do servidor:')) {
            return (
              <div key={index} style={{ 
                marginBottom: '16px',
                padding: '12px 16px',
                background: 'linear-gradient(135deg, #667eea10, #764ba210)',
                borderRadius: '10px',
                borderLeft: '3px solid #667eea'
              }}>
                <div style={{ color: '#667eea', fontWeight: '600', marginBottom: '4px' }}>
                  📡 {linha.replace(/\*\*/g, '')}
                </div>
              </div>
            );
          }
          
          if (linha.includes('Detalhes dos erros encontrados:')) {
            emDetalhesErros = true;
            return (
              <div key={index} style={{ marginTop: '24px', marginBottom: '16px' }}>
                <div style={{ 
                  color: '#D4AF37', 
                  fontWeight: '700', 
                  marginBottom: '12px',
                  fontSize: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '18px' }}>📋</span> {linha.replace(/\*\*/g, '')}
                </div>
              </div>
            );
          }
          
          if (linha.startsWith('**Linha') || linha.startsWith('**Motivo do erro:')) {
            const isMotivo = linha.startsWith('**Motivo');
            return (
              <div key={index} style={{ 
                marginBottom: '8px',
                marginLeft: isMotivo ? '24px' : '0',
                padding: isMotivo ? '8px 12px' : '4px 0',
                background: isMotivo ? '#fff8e1' : 'transparent',
                borderRadius: isMotivo ? '8px' : '0',
                borderLeft: isMotivo ? '3px solid #D4AF37' : 'none',
                fontSize: '13px'
              }}>
                <span style={{ 
                  fontWeight: '600',
                  color: emDetalhesErros ? '#D4AF37' : '#1976d2'
                }}>
                  {linha.replace(/\*\*/g, '').split(':')[0]}:
                </span>
                <span style={{ color: '#555', marginLeft: '8px' }}>
                  {linha.replace(/\*\*/g, '').split(':').slice(1).join(':')}
                </span>
              </div>
            );
          }
          
          if (linha.includes('Próximos passos:')) {
            emDetalhesErros = false;
            emProximosPassos = true;
            return (
              <div key={index} style={{ marginTop: '24px', marginBottom: '16px' }}>
                <div style={{ 
                  color: '#2e7d32', 
                  fontWeight: '700', 
                  marginBottom: '12px',
                  fontSize: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '18px' }}>✅</span> {linha.replace(/\*\*/g, '')}
                </div>
              </div>
            );
          }
          
          if (linha.startsWith('- ') && emProximosPassos) {
            return (
              <div key={index} style={{ 
                marginLeft: '20px', 
                marginBottom: '8px', 
                display: 'flex', 
                alignItems: 'center',
                gap: '10px'
              }}>
                <div style={{ width: '6px', height: '6px', background: '#D4AF37', borderRadius: '50%' }} />
                <span style={{ color: '#555', fontSize: '13px' }}>{linha.substring(2)}</span>
              </div>
            );
          }
          
          if (linha.includes('Requisição realizada com sucesso!')) {
            return (
              <div key={index} style={{ 
                padding: '12px 16px', 
                backgroundColor: '#e8f5e9', 
                borderRadius: '10px',
                color: '#2e7d32',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ fontSize: '18px' }}>✅</span>
                <span style={{ fontWeight: '500' }}>{linha}</span>
              </div>
            );
          }
          
          if (linha.includes('repetida nas linhas:')) {
            return (
              <div key={index} style={{ 
                padding: '10px 14px', 
                backgroundColor: '#ffebee', 
                borderRadius: '10px',
                color: '#c62828',
                marginLeft: '24px',
                marginBottom: '12px',
                fontSize: '13px',
                borderLeft: '3px solid #f44336'
              }}>
                ⚠️ {linha}
              </div>
            );
          }
          
          if (linha.trim() === '') {
            return <div key={index} style={{ height: '8px' }}></div>;
          }
          
          return (
            <div key={index} style={{ 
              color: '#666', 
              marginBottom: '6px',
              fontSize: '13px',
              lineHeight: '1.5'
            }}>
              {linha}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: "'Inter', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" />

      {/* Modal de Erros Detalhados - Design Elegante */}
      {showErrorModal && (
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
          justifyContent: 'center',
          fontFamily: "'Inter', sans-serif"
        }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            style={{ 
              backgroundColor: 'white', 
              borderRadius: '24px', 
              maxWidth: '650px', 
              width: '90%', 
              maxHeight: '85vh', 
              overflow: 'hidden', 
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
            }}
          >
            {/* Header  */}
            <div style={{ 
              background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)', 
              color: '#D4AF37', 
              padding: '24px 28px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(212,175,55,0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ 
                  backgroundColor: 'rgba(212,175,55,0.15)', 
                  borderRadius: '50%', 
                  width: '48px', 
                  height: '48px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  boxShadow: '0 0 20px rgba(212,175,55,0.3)'
                }}>
                  <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '24px', color: '#D4AF37' }}></i>
                </div>
                <div>
                  <h5 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#D4AF37' }}>Detalhes do Erro</h5>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', opacity: 0.7, color: '#aaa' }}>Verifique os problemas identificados</p>
                </div>
              </div>
              <button 
                onClick={fecharModalLimparMensagens} 
                style={{ 
                  background: 'rgba(255,255,255,0.1)', 
                  border: 'none', 
                  color: '#D4AF37', 
                  fontSize: '20px', 
                  cursor: 'pointer',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(212,175,55,0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              >
                ×
              </button>
            </div>
            
            {/* Modal */}
            <div style={{ 
              padding: '28px', 
              maxHeight: '55vh', 
              overflowY: 'auto',
              background: '#f8f9fa'
            }}>
              <div style={{ 
                background: 'white', 
                padding: '24px', 
                borderRadius: '16px', 
                border: '1px solid #e8e8e8',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                {formatarDetalhesErro(errorDetails)}
              </div>
            </div>
            
            {/* Footer c */}
            <div style={{ 
              padding: '20px 28px', 
              borderTop: '1px solid #e8e8e8', 
              display: 'flex', 
              gap: '12px', 
              justifyContent: 'flex-end', 
              background: 'white'
            }}>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={fecharModalLimparMensagens} 
                style={{ 
                  padding: '10px 24px', 
                  borderRadius: '50px', 
                  border: '2px solid #D4AF37', 
                  background: 'transparent', 
                  color: '#D4AF37',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(212,175,55,0.1)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                <i className="bi bi-eye-slash me-2"></i>
                Fechar Detalhes
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { fecharModalLimparMensagens(); fileInputRef.current?.click(); }} 
                style={{ 
                  padding: '10px 24px', 
                  borderRadius: '50px', 
                  border: 'none', 
                  background: 'linear-gradient(135deg, #D4AF37, #FFE55C)',
                  color: '#000',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(212,175,55,0.3)',
                  transition: 'all 0.2s ease'
                }}
              >
                <i className="bi bi-arrow-clockwise me-2"></i>
                Corrigir e Tentar Novamente
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

    
      <div style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)', padding: '3rem 2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
        <h1 style={{ color: '#D4AF37', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>Importar Tipo Funcionalidade</h1>
        <p style={{ color: '#aaa', marginTop: '0.5rem' }}>Importe Tipo funcionalidade através de ficheiros Excel</p>
      </div>

      <div style={{ maxWidth: '1200px', margin: '-40px auto 0', padding: '2rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          
          {/* Coluna Esquerda - Upload */}
          <div style={{ flex: 2, minWidth: '300px' }}>
            <div ref={messagesRef}>
              <AnimatePresence>
                {(mensagem || erros.length > 0 || warnings.length > 0) && showMessages && (
                  <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ marginBottom: '1.5rem' }}>
                    {sucesso && (
                      <div style={{ background: '#10b981', color: 'white', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><i className="bi bi-check-circle-fill"></i> <strong>Sucesso!</strong> {mensagem}</div>
                        <button onClick={() => { setMensagem(""); setSucesso(false); setShowMessages(false); }} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '20px' }}>×</button>
                      </div>
                    )}
                    
                    {erros.length > 0 && !sucesso && !showErrorModal && (
                      <div style={{ background: '#ef4444', color: 'white', padding: '1rem', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <strong><i className="bi bi-exclamation-triangle-fill"></i> Erros encontrados ({erros.length})</strong>
                          <button onClick={() => { setErros([]); setMensagem(""); setShowMessages(false); }} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '20px' }}>×</button>
                        </div>
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                          {erros.map((erro, idx) => (
                            <div key={idx} style={{ padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.2)', fontSize: '13px' }}>
                              <i className="bi bi-x-circle-fill" style={{ marginRight: '8px' }}></i> {erro}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {warnings.length > 0 && (
                      <div style={{ background: '#f59e0b', color: 'white', padding: '1rem', borderRadius: '12px', marginTop: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><i className="bi bi-exclamation-triangle-fill"></i> Avisos ({warnings.length})</div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cardapio Principal */}
            <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
               <div
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                style={{
                  border: `2px dashed ${dragActive ? '#D4AF37' : file ? '#10b981' : '#ccc'}`,
                  borderRadius: '16px',
                  padding: '3rem 2rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  background: dragActive ? 'rgba(212,175,55,0.05)' : file ? 'rgba(16,185,129,0.05)' : '#fafafa',
                  marginBottom: '1.5rem'
                }}
              >
                <i className={`bi ${file ? 'bi-file-earmark-excel' : 'bi-cloud-upload'}`} style={{ fontSize: '3rem', color: file ? '#10b981' : '#D4AF37', marginBottom: '1rem', display: 'block' }}></i>
                <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>{file ? file.name : "Arraste e solte seu arquivo aqui"}</h3>
                <p style={{ color: '#666' }}>{file ? `${formatFileSize(file.size)} • Clique para alterar` : "ou clique para selecionar o arquivo ( .xlsx .xls .csv )"}</p>
                <button style={{ padding: '10px 24px', backgroundColor: '#D4AF37', color: '#000', border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold' }}><i className="bi bi-folder2-open"></i> Selecionar Arquivo</button>
                <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} style={{ display: 'none' }} />
              </div>

              {/* Barra de Progresso */}
              {loading && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <small>Processando arquivo...</small>
                    <small>Aguarde</small>
                  </div>
                  <div style={{ height: '8px', backgroundColor: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div ref={progressRef} style={{ width: '0%', height: '100%', backgroundColor: '#D4AF37', transition: 'width 0.3s ease' }}></div>
                  </div>
                </div>
              )}

              {/* Info do ficheiro */}
              {file && !loading && (
                <div style={{ background: '#f0fdf4', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <i className="bi bi-file-earmark-excel" style={{ color: '#10b981', fontSize: '1.5rem' }}></i>
                    <div><strong>{file.name}</strong><br /><small>{formatFileSize(file.size)}</small></div>
                  </div>
                  <button onClick={() => setFile(null)} style={{ padding: '8px', backgroundColor: '#fee2e2', border: 'none', borderRadius: '8px', cursor: 'pointer' }}><i className="bi bi-trash" style={{ color: '#ef4444' }}></i></button>
                </div>
              )}

              {/* Ações dos Buttons */}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => window.history.back()} style={{ padding: '12px 24px', borderRadius: '50px', border: '2px solid #D4AF37', background: 'transparent', color: '#D4AF37', fontWeight: 'bold', cursor: 'pointer' }}><i className="bi bi-arrow-left"></i> Voltar</button>
                <button onClick={handleFileUpload} disabled={loading || !file} style={{ flex: 1, padding: '12px', borderRadius: '50px', border: 'none', background: 'linear-gradient(135deg, #D4AF37, #FFE55C)', color: '#000', fontWeight: 'bold', cursor: loading || !file ? 'not-allowed' : 'pointer', opacity: loading || !file ? 0.6 : 1 }}>
                  {loading ? <><i className="bi bi-hourglass-split"></i> Processando...</> : <><i className="bi bi-play-circle"></i> Iniciar Importação</>}
                </button>
                <button onClick={clearAll} disabled={loading} style={{ padding: '12px 24px', borderRadius: '50px', border: '2px solid #ccc', background: 'white', cursor: 'pointer' }}><i className="bi bi-x-circle"></i> Limpar</button>
              </div>
            </div>
          </div>

          {/*  Status */}
          <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', marginBottom: '1.5rem' }}>
              <h6 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="bi bi-clock-history" style={{ color: '#D4AF37' }}></i> Última Importação
              </h6>
              
              {ultimaImportacao && (
                <div style={{ background: 'rgba(212,175,55,0.1)', padding: '10px', borderRadius: '8px', marginBottom: '1rem', fontSize: '14px', borderLeft: '3px solid #D4AF37' }}>
                  <i className="bi bi-calendar-event me-2"></i>
                  <strong>{ultimaImportacao}</strong>
                </div>
              )}
              

              
              <hr />
              
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="bi bi-tags" style={{ color: '#D4AF37', fontSize: '18px' }}></i>
                  </div>
                  <div>
                    <small style={{ color: '#666' }}>Versão Tipo de Funcionalidades</small>
                    <div><strong>{versoes.tipos_funcionalidade}</strong> {versaoCarregando && <i className="bi bi-arrow-repeat" style={{ animation: 'spin 1s linear infinite', marginLeft: '8px' }}></i>}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>


                </div>
              </div>
            </div>

          </div>
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