import { useState, useEffect, useRef } from "react";
import { FaUpload, FaFileExcel, FaTrash, FaSpinner, FaCheckCircle, FaTimes, FaExclamationTriangle, FaInfoCircle, FaArrowLeft } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export default function FuncionalidadeCadastrar() {
  const [file, setFile] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);
  const [erros, setErros] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [sucesso, setSucesso] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorDetails, setErrorDetails] = useState("");
  const [versoes, setVersoes] = useState({
    tipos_funcionalidade: "Nenhuma versão importada",
    funcionalidades: "Nenhuma versão importada"
  });
  const [versaoCarregando, setVersaoCarregando] = useState(false);
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
    if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
  };

  const handleFileSelect = (selectedFile) => {
    const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
    if (!['.xls', '.xlsx', '.csv'].includes(ext)) {
      setMensagem("❌ Formato não suportado. Use .xls, .xlsx ou .csv");
      setErros(["Formato não suportado. Use .xls, .xlsx ou .csv"]);
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

  const handleFileUpload = async () => {
    if (!file) {
      setMensagem("❌ Selecione um ficheiro!");
      setErros(["Selecione um ficheiro!"]);
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
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:9090/api/seguranca/funcionalidade_apenas_importar", {
        method: "POST",
        body: formData,
        headers: { 'Accept': 'application/json' },
      });

      const resultado = await response.json();
      console.log("Resposta completa da API:", resultado);

      if (progressRef.current) {
        progressRef.current.style.width = "100%";
      }

      if (response.ok && resultado.sucesso) {
        setMensagem(resultado.mensagem || "✅ Importação realizada com sucesso!");
        setSucesso(true);
        setUltimaImportacao(new Date().toLocaleString('pt-PT'));
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        await carregarVersoes();
        setTimeout(() => {
          setMensagem("");
          setSucesso(false);
          if (progressRef.current) progressRef.current.style.width = "0%";
        }, 5000);
      } else {
        // TRATAMENTO DE ERROS
        if (resultado.erros && Array.isArray(resultado.erros)) {
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
            // MOSTRA TODOS OS ERROS
            setErros(resultado.erros);
            setMensagem(`❌ Foram encontrados ${resultado.erros.length} erro(s) na importação`);
          }
        } else if (resultado.erro) {
          setErros([resultado.erro]);
        }
        
        if (progressRef.current) {
          progressRef.current.style.width = "0%";
        }
      }
      if (resultado.warnings) setWarnings(resultado.warnings);
    } catch (error) {
      console.error("Erro no upload:", error);
      setMensagem("❌ Erro de conexão com o servidor");
      setErros(["Verifique sua conexão e tente novamente"]);
      if (progressRef.current) progressRef.current.style.width = "0%";
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
    if (progressRef.current) progressRef.current.style.width = "0%";
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatarDetalhesErro = (texto) => {
    if (!texto) return null;
    const linhas = texto.split('\n');
    let emDetalhesErros = false;
    let emProximosPassos = false;
    
    return linhas.map((linha, index) => {
      if (linha.startsWith('# ')) {
        return <h5 key={index} style={{ color: '#333', marginBottom: '16px', fontSize: '18px' }}>{linha.substring(2)}</h5>;
      }
      if (linha.includes('erro(s) de validação encontrado(s)')) {
        return <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}><input type="checkbox" disabled checked style={{ marginRight: '8px' }} /><span style={{ color: '#d32f2f', fontWeight: '500' }}>{linha.trim()}</span></div>;
      }
      if (linha.includes('Código:') || linha.includes('Status:')) {
        return <div key={index} style={{ color: '#666', fontSize: '14px', marginBottom: '8px' }}>{linha}</div>;
      }
      if (linha.includes('Mensagem do servidor:')) {
        return <div key={index} style={{ marginBottom: '12px' }}><div style={{ color: '#1976d2', fontWeight: '500' }}>{linha.replace(/\*\*/g, '')}</div></div>;
      }
      if (linha.includes('Detalhes dos erros encontrados:')) {
        emDetalhesErros = true;
        return <div key={index} style={{ marginTop: '16px', marginBottom: '12px' }}><div style={{ color: '#d32f2f', fontWeight: '500' }}>{linha.replace(/\*\*/g, '')}</div></div>;
      }
      if (linha.startsWith('**Linha') || linha.startsWith('**Motivo do erro:')) {
        return <div key={index} style={{ marginBottom: '8px', color: emDetalhesErros ? '#333' : '#1976d2', fontWeight: linha.startsWith('**') ? '500' : 'normal', marginLeft: linha.startsWith('**Motivo') ? '20px' : '0' }}>{linha.replace(/\*\*/g, '')}</div>;
      }
      if (linha.includes('Próximos passos:')) {
        emDetalhesErros = false;
        emProximosPassos = true;
        return <div key={index} style={{ marginTop: '16px', marginBottom: '12px' }}><div style={{ color: '#388e3c', fontWeight: '500' }}>{linha.replace(/\*\*/g, '')}</div></div>;
      }
      if (linha.startsWith('- ') && emProximosPassos) {
        return <div key={index} style={{ marginLeft: '20px', marginBottom: '8px', display: 'flex', alignItems: 'center' }}><span style={{ marginRight: '8px', color: '#388e3c' }}>•</span><span style={{ color: '#555' }}>{linha.substring(2)}</span></div>;
      }
      if (linha.includes('Requisição realizada com sucesso!')) {
        return <div key={index} style={{ padding: '8px 12px', backgroundColor: '#e8f5e9', borderRadius: '4px', color: '#2e7d32', borderLeft: '4px solid #4caf50', marginBottom: '12px' }}>{linha}</div>;
      }
      if (linha.includes('repetida nas linhas:')) {
        return <div key={index} style={{ padding: '8px 12px', backgroundColor: '#ffebee', borderRadius: '4px', color: '#c62828', borderLeft: '4px solid #f44336', marginLeft: '40px', marginBottom: '12px' }}>{linha}</div>;
      }
      if (linha.trim() === '') return <div key={index} style={{ height: '8px' }}></div>;
      return <div key={index} style={{ color: '#666', marginBottom: '4px' }}>{linha}</div>;
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: "'Inter', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {/* Modal de Erros  */}
      {showErrorModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', maxWidth: '600px', width: '90%', maxHeight: '80vh', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ backgroundColor: '#ef4444', color: 'white', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FaExclamationTriangle />
                </div>
                <div>
                  <h5 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Detalhes do Erro</h5>
                  <small style={{ opacity: 0.9 }}>Verifique os problemas identificados</small>
                </div>
              </div>
              <button onClick={fecharModalLimparMensagens} style={{ background: 'none', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ padding: '24px', maxHeight: '60vh', overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                {formatarDetalhesErro(errorDetails)}
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid #e0e0e0', display: 'flex', gap: '12px', justifyContent: 'flex-end', backgroundColor: 'white' }}>
              <button onClick={fecharModalLimparMensagens} style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}>Fechar</button>
              <button onClick={() => { fecharModalLimparMensagens(); fileInputRef.current?.click(); }} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#D4AF37', color: '#000', cursor: 'pointer', fontWeight: 'bold' }}>Tentar Novamente</button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)', padding: '3rem 1rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', background: 'rgba(212,175,55,0.15)', marginBottom: '1rem' }}>
          <FaFileExcel style={{ fontSize: '2rem', color: '#D4AF37' }} />
        </div>
        <h1 style={{ color: '#D4AF37', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>Importar Funcionalidades</h1>
        <p style={{ color: '#aaa', marginTop: '0.5rem' }}>Importe funcionalidades através de ficheiros Excel</p>
      </div>

      <div style={{ maxWidth: '1200px', margin: '-40px auto 0', padding: '2rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          
          {/* Coluna Esquerda - Upload */}
          <div style={{ flex: 2, minWidth: '300px' }}>
            {/* Mensagens */}
            <div ref={messagesRef}>
              <AnimatePresence>
                {(mensagem || erros.length > 0 || warnings.length > 0) && showMessages && (
                  <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ marginBottom: '1.5rem' }}>
                    {sucesso && (
                      <div style={{ background: '#10b981', color: 'white', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaCheckCircle /> <strong>Sucesso!</strong> {mensagem}</div>
                        <button onClick={() => { setMensagem(""); setSucesso(false); setShowMessages(false); }} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><FaTimes /></button>
                      </div>
                    )}
                    
                    {erros.length > 0 && !sucesso && !showErrorModal && (
                      <div style={{ background: '#ef4444', color: 'white', padding: '1rem', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <strong><FaExclamationTriangle /> Erros encontrados ({erros.length})</strong>
                          <button onClick={() => { setErros([]); setMensagem(""); setShowMessages(false); }} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><FaTimes /></button>
                        </div>
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                          {erros.map((erro, idx) => (
                            <div key={idx} style={{ padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.2)', fontSize: '13px' }}>
                              <FaExclamationTriangle style={{ display: 'inline', marginRight: '8px', fontSize: '11px' }} /> {erro}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {warnings.length > 0 && (
                      <div style={{ background: '#f59e0b', color: 'white', padding: '1rem', borderRadius: '12px', marginTop: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaExclamationTriangle /> Avisos ({warnings.length})</div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Card Principal */}
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
                <FaUpload style={{ fontSize: '3rem', color: file ? '#10b981' : '#D4AF37', marginBottom: '1rem' }} />
                <h3 style={{ marginBottom: '0.5rem' }}>{file ? file.name : "Arraste e solte seu arquivo aqui"}</h3>
                <p style={{ color: '#666' }}>
                  {file ? `${formatFileSize(file.size)} • Clique para alterar` : "ou clique para selecionar o arquivo ( .xlsx .xls .csv )"}
                </p>
                <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} style={{ display: 'none' }} />
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

              {/* Info do Arquivo */}
              {file && !loading && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <FaFileExcel style={{ color: '#10b981', fontSize: '1.5rem' }} />
                    <div><strong>{file.name}</strong><br /><small>{formatFileSize(file.size)}</small></div>
                  </div>
                  <button onClick={() => setFile(null)} style={{ background: '#fee2e2', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', color: '#ef4444' }}><FaTrash /></button>
                </div>
              )}

              {/* Botões */}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => window.history.back()} style={{ padding: '0.75rem 1.5rem', borderRadius: '50px', border: '2px solid #D4AF37', background: 'transparent', color: '#D4AF37', fontWeight: 'bold', cursor: 'pointer' }}><FaArrowLeft /> Voltar</button>
                <button onClick={handleFileUpload} disabled={loading || !file} style={{ flex: 1, padding: '0.75rem', borderRadius: '50px', border: 'none', background: 'linear-gradient(135deg, #D4AF37, #FFE55C)', color: '#000', fontWeight: 'bold', cursor: loading || !file ? 'not-allowed' : 'pointer', opacity: loading || !file ? 0.6 : 1 }}>
                  {loading ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : <><FaUpload /> Iniciar Importação</>}
                </button>
                <button onClick={clearAll} disabled={loading} style={{ padding: '0.75rem 1.5rem', borderRadius: '50px', border: '2px solid #ccc', background: 'white', cursor: 'pointer' }}>Limpar</button>
              </div>
            </div>
          </div>

          {/* Coluna Direita - Info e Status */}
          <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', marginBottom: '1.5rem' }}>
              <h6 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaInfoCircle style={{ color: '#D4AF37' }} /> Última Importação
              </h6>
              
              {ultimaImportacao && (
                <div style={{ background: 'rgba(212,175,55,0.1)', padding: '10px', borderRadius: '8px', marginBottom: '1rem', fontSize: '14px', borderLeft: '3px solid #D4AF37' }}>
                  <strong>🕒 {ultimaImportacao}</strong>
                </div>
              )}
              
             
              
              <hr />
              
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                
                
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FaInfoCircle style={{ color: '#D4AF37', fontSize: '16px' }} />
                  </div>
                  <div>
                    <small style={{ color: '#666' }}>Versão de Funcionalidades</small>
                    <div><strong>{versoes.funcionalidades}</strong> {versaoCarregando && <FaSpinner style={{ animation: 'spin 1s linear infinite', marginLeft: '8px', fontSize: '12px' }} />}</div>
                  </div>
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