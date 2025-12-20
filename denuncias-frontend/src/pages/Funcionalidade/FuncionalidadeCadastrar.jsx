import { useState, useEffect, useRef } from "react";

export default function FuncionalidadeCadastrar() {
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
  const fileInputRef = useRef(null);
  const progressRef = useRef(null);
  const messagesRef = useRef(null);

  // Carregar versões atuais
  useEffect(() => {
    carregarVersoes();
    const interval = setInterval(carregarVersoes, 30000);
    return () => clearInterval(interval);
  }, []);

  // Scroll para mensagens quando aparecerem
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
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
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
      if (progress >= 95) {
        clearInterval(interval);
      }
    }, 50);
    
    return interval;
  };

  const formatarErroParaModal = (errosArray) => {
    if (Array.isArray(errosArray)) {
      return errosArray.join('\n');
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

      const response = await fetch("http://localhost:9090/api/seguranca/funcionalidade_importar", {
        method: "POST",
        body: formDataUpload,
        headers: { 'Accept': 'application/json' },
      });

      const resultado = await response.json();
      console.log("Resposta da API:", resultado);

      if (progressRef.current) {
        progressRef.current.style.width = "100%";
      }

      if (response.ok) {
        if (resultado.sucesso) {
          setMensagem(resultado.mensagem || "✅ Importação realizada com sucesso!");
          setSucesso(true);
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
            const primeiroErro = resultado.erros[0] || "";
            
            if (primeiroErro.includes("# Detalhes") || 
                primeiroErro.includes("erro(s) de validação encontrado(s)")) {
              setErrorDetails(formatarErroParaModal(resultado.erros));
              setShowErrorModal(true);
              setErros([]);
            } else {
              setErros(resultado.erros);
            }
          } else {
            setErros([resultado.erro || "❌ Erro na importação"]);
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
      
      // Capturar warnings do backend
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

  // Função para fechar o modal e limpar as mensagens
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

  // Função para formatar os detalhes do erro com base na imagem
  const formatarDetalhesErro = (texto) => {
    if (!texto) return null;
    
    const linhas = texto.split('\n');
    let emDetalhesErros = false;
    let emProximosPassos = false;
    
    return linhas.map((linha, index) => {
      // Título principal
      if (linha.startsWith('# ')) {
        return (
          <h5 key={index} style={{ color: '#333', marginBottom: '16px', fontSize: '18px' }}>
            {linha.substring(2)}
          </h5>
        );
      }
      
      // Checkbox de contagem de erros
      if (linha.includes('erro(s) de validação encontrado(s)')) {
        return (
          <div key={index} className="d-flex align-items-start mb-3">
            <input 
              type="checkbox" 
              disabled 
              className="me-2 mt-1" 
              style={{ transform: 'scale(1.2)' }}
            />
            <span style={{ color: '#d32f2f', fontWeight: '500' }}>{linha.trim()}</span>
          </div>
        );
      }
      
      // Código e Status
      if (linha.includes('Código:') || linha.includes('Status:')) {
        return (
          <div key={index} className="mb-2" style={{ color: '#666', fontSize: '14px' }}>
            {linha}
          </div>
        );
      }
      
      // Seção de mensagem do servidor
      if (linha.includes('Mensagem do servidor:')) {
        return (
          <div key={index} className="mb-3">
            <div style={{ color: '#1976d2', fontWeight: '500', marginBottom: '4px' }}>
              {linha.replace('**', '').replace('**', '')}
            </div>
          </div>
        );
      }
      
      // Seção de detalhes dos erros
      if (linha.includes('Detalhes dos erros encontrados:')) {
        emDetalhesErros = true;
        return (
          <div key={index} className="mb-3 mt-4">
            <div style={{ color: '#d32f2f', fontWeight: '500', marginBottom: '12px' }}>
              {linha.replace('**', '').replace('**', '')}
            </div>
          </div>
        );
      }
      
      // Linhas de erro específicas
      if (linha.startsWith('**Linha') || linha.startsWith('**Motivo do erro:')) {
        return (
          <div key={index} className="mb-2" style={{ 
            color: emDetalhesErros ? '#333' : '#1976d2',
            fontWeight: linha.startsWith('**') ? '500' : 'normal',
            marginLeft: linha.startsWith('**Motivo') ? '20px' : '0'
          }}>
            {linha.replace(/\*\*/g, '')}
          </div>
        );
      }
      
      // Seção de próximos passos
      if (linha.includes('Próximos passos:')) {
        emDetalhesErros = false;
        emProximosPassos = true;
        return (
          <div key={index} className="mb-3 mt-4">
            <div style={{ color: '#388e3c', fontWeight: '500', marginBottom: '12px' }}>
              {linha.replace('**', '').replace('**', '')}
            </div>
          </div>
        );
      }
      
      // Itens de lista nos próximos passos
      if (linha.startsWith('- ') && emProximosPassos) {
        return (
          <div key={index} className="d-flex align-items-start mb-2" style={{ marginLeft: '20px' }}>
            <span style={{ marginRight: '8px', color: '#388e3c' }}>•</span>
            <span style={{ color: '#555' }}>{linha.substring(2)}</span>
          </div>
        );
      }
      
      // Linha de requisição realizada com sucesso
      if (linha.includes('Requisição realizada com sucesso!')) {
        return (
          <div key={index} className="mb-3" style={{ 
            padding: '8px 12px', 
            backgroundColor: '#e8f5e9', 
            borderRadius: '4px',
            color: '#2e7d32',
            borderLeft: '4px solid #4caf50'
          }}>
            {linha}
          </div>
        );
      }
      
      // Descrições de erro específicas
      if (linha.includes('repetida nas linhas:')) {
        return (
          <div key={index} className="mb-3" style={{ 
            padding: '8px 12px', 
            backgroundColor: '#ffebee', 
            borderRadius: '4px',
            color: '#c62828',
            borderLeft: '4px solid #f44336',
            marginLeft: '40px'
          }}>
            {linha}
          </div>
        );
      }
      
      // Linha vazia
      if (linha.trim() === '') {
        return <div key={index} className="mb-2"></div>;
      }
      
      // Linha normal
      return (
        <div key={index} className="mb-1" style={{ color: '#666' }}>
          {linha}
        </div>
      );
    });
  };

  return (
    <div className="container-fluid py-4">
      {/* Modal de Erros Detalhados - DESIGN MELHORADO */}
      {showErrorModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '12px', overflow: 'hidden' }}>
              <div className="modal-header" style={{ 
                backgroundColor: '#f44336', 
                color: 'white',
                borderBottom: 'none',
                padding: '20px 24px'
              }}>
                <div className="d-flex align-items-center w-100">
                  <div style={{ 
                    backgroundColor: 'rgba(255,255,255,0.2)', 
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '12px'
                  }}>
                    <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '20px' }}></i>
                  </div>
                  <div>
                    <h5 className="modal-title mb-0" style={{ fontSize: '18px', fontWeight: '600' }}>
                      Detalhes do Erro
                    </h5>
                    <small style={{ opacity: 0.9 }}>Verifique os problemas identificados</small>
                  </div>
                </div>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={fecharModalLimparMensagens}
                  style={{ opacity: 0.8 }}
                ></button>
              </div>
              
              <div className="modal-body p-0">
                <div className="p-4" style={{ 
                  backgroundColor: '#f8f9fa',
                  maxHeight: '70vh',
                  overflowY: 'auto'
                }}>
                  <div style={{ 
                    backgroundColor: 'white', 
                    padding: '24px', 
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}>
                    <div style={{ 
                      fontFamily: "'Segoe UI', 'Roboto', sans-serif",
                      fontSize: '14px',
                      lineHeight: '1.6',
                      color: '#333'
                    }}>
                      {formatarDetalhesErro(errorDetails)}
                    </div>
                    
                    {/* Resumo do Erro */}
                    <div className="mt-4 pt-3 border-top">
                      <div className="d-flex align-items-center justify-content-between">
                       
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer" style={{ 
                backgroundColor: '#f8f9fa',
                borderTop: '1px solid #e0e0e0',
                padding: '16px 24px'
              }}>
                <button 
                  type="button" 
                  className="btn btn-outline-secondary"
                  onClick={fecharModalLimparMensagens}
                  style={{ padding: '8px 20px' }}
                >
                  <i className="bi bi-eye-slash me-2"></i>
                  Fechar Detalhes
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => {
                    fecharModalLimparMensagens();
                    if (fileInputRef.current) fileInputRef.current.click();
                  }}
                  style={{ padding: '8px 20px' }}
                >
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Corrigir e Tentar Novamente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0 text-primary">📊 Importar Funcionalidades</h1>
          <p className="text-muted mb-0">Importe funcionalidades através de ficheiros Excel</p>
        </div>
      </div>

      {/* Messages Section */}
      {(mensagem || erros.length > 0 || warnings.length > 0) && showMessages && (
        <div className="row mt-4" ref={messagesRef}>
          <div className="col-12">
            {/* Success Message */}
            {mensagem && sucesso && (
              <div className="alert alert-success border-0 shadow-sm fade show d-flex align-items-center justify-content-between animate__animated animate__fadeInDown">
                <div className="d-flex align-items-center">
                  <i className="bi bi-check-circle-fill me-2 fs-5"></i>
                  <div>
                    <strong className="d-block">Importação bem-sucedida!</strong>
                    <small className="text-success">{mensagem}</small>
                  </div>
                </div>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setMensagem("");
                    setSucesso(false);
                    setShowMessages(false);
                  }}
                  aria-label="Close"
                ></button>
              </div>
            )}

            {/* Error Messages (formato antigo) */}
            {erros.length > 0 && !sucesso && !showErrorModal && (
              <div className="alert alert-danger border-0 shadow-sm fade show animate__animated animate__shakeX">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
                    <strong>Erros encontrados ({erros.length})</strong>
                  </div>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white" 
                    onClick={() => {
                      setErros([]);
                      setMensagem("");
                      setShowMessages(false);
                    }}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="mt-2">
                  {erros.slice(0, 10).map((erro, index) => (
                    <div key={index} className="alert alert-light py-2 mb-2 border-0">
                      <small className="text-danger">{erro}</small>
                    </div>
                  ))}
                  {erros.length > 10 && (
                    <div className="alert alert-light py-2 mb-0 border-0">
                      <small className="text-muted">
                        ... e mais {erros.length - 10} erro(s)
                      </small>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Warnings Section */}
            {warnings.length > 0 && (
              <div className="alert alert-warning border-0 shadow-sm fade show animate__animated animate__fadeIn">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
                    <strong>Avisos ({warnings.length})</strong>
                  </div>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setWarnings([])}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="mt-2">
                  {warnings.slice(0, 10).map((warning, index) => (
                    <div key={index} className="alert alert-light py-2 mb-2 border-0">
                      <small className="text-warning">{warning}</small>
                    </div>
                  ))}
                  {warnings.length > 10 && (
                    <div className="alert alert-light py-2 mb-0 border-0">
                      <small className="text-muted">
                        ... e mais {warnings.length - 10} aviso(s)
                      </small>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Generic Message */}
            {mensagem && !sucesso && erros.length === 0 && warnings.length === 0 && !showErrorModal && (
              <div className="alert alert-warning border-0 shadow-sm fade show animate__animated animate__fadeIn">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-info-circle-fill me-2 fs-5"></i>
                    <div>
                      <strong className="d-block">Atenção</strong>
                      <small>{mensagem}</small>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => {
                      setMensagem("");
                      setShowMessages(false);
                    }}
                    aria-label="Close"
                  ></button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grid Layout */}
      <div className="row">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <div 
                className={`drop-zone p-5 text-center border-2 border-dashed rounded-3 mb-4 ${
                  dragActive ? 'drag-active bg-primary bg-opacity-10' : 'bg-light'
                } ${file ? 'border-success' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{ cursor: 'pointer' }}
              >
                <div className="py-4">
                  <i className={`bi ${file ? 'bi-file-earmark-check text-success' : 'bi-cloud-upload'} display-4 mb-3`}></i>
                  <h5 className="mb-2">
                    {file ? file.name : "Arraste e solte seu arquivo aqui"}
                  </h5>
                  <p className="text-muted mb-3">
                    {file 
                      ? `${formatFileSize(file.size)} • Clique para alterar`
                      : "ou clique para selecionar o arquivo, com o seguinte formato:  .xlsx .xls .csv"
                    }
                  </p>
                  
                  <button className="btn btn-primary">
                    <i className="bi bi-folder2-open me-2"></i>
                    Selecionar Arquivo
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="d-none"
                    accept=".csv, .xlsx, .xls"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              {loading && (
                <div className="mb-4">
                  <div className="d-flex justify-content-between mb-1">
                    <small className="text-muted">Processando arquivo...</small>
                    <small className="text-muted">Aguarde</small>
                  </div>
                  <div className="progress" style={{ height: '8px' }}>
                    <div 
                      ref={progressRef}
                      className="progress-bar progress-bar-striped progress-bar-animated" 
                      role="progressbar"
                      style={{ width: '0%', transition: 'width 0.3s ease' }}
                    ></div>
                  </div>
                </div>
              )}

              {/* File Info */}
              {file && !loading && (
                <div className="alert alert-light border mb-4 py-3">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-file-earmark-excel text-success me-3 fs-4"></i>
                      <div>
                        <h6 className="mb-0">{file.name}</h6>
                        <small className="text-muted">
                          {formatFileSize(file.size)} • {file.type || "Arquivo Excel"}
                        </small>
                      </div>
                    </div>
                    <button 
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => setFile(null)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-primary flex-fill"
                  onClick={handleFileUpload}
                  disabled={loading || !file}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Processando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-play-circle me-2"></i>
                      Iniciar Importação
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={clearAll}
                  disabled={loading}
                >
                  <i className="bi bi-x-circle me-1"></i>
                  Limpar Tudo
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Info & Status */}
        <div className="col-lg-4">
          {/* Versions Card */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <h6 className="card-title mb-3 d-flex align-items-center">
                <i className="bi bi-clock-history me-2 text-info"></i>
                Versões Atuais
              </h6>
              
              <div className="d-flex align-items-center mb-3">
                <div className="me-3">
                  <div className="icon-circle bg-info bg-opacity-10 text-info">
                    <i className="bi bi-tags"></i>
                  </div>
                </div>
                <div className="flex-grow-1">
                  <small className="text-muted">Tipos de Funcionalidade</small>
                  <div className="d-flex align-items-center">
                    <span className="fw-semibold">{versoes.tipos_funcionalidade}</span>
                    {versaoCarregando && (
                      <span className="spinner-border spinner-border-sm ms-2 text-info"></span>
                    )}
                  </div>
                </div>
              </div>

              <div className="d-flex align-items-center">
                <div className="me-3">
                  <div className="icon-circle bg-success bg-opacity-10 text-success">
                    <i className="bi bi-list-check"></i>
                  </div>
                </div>
                <div className="flex-grow-1">
                  <small className="text-muted">Funcionalidades</small>
                  <div className="d-flex align-items-center">
                    <span className="fw-semibold">{versoes.funcionalidades}</span>
                    {versaoCarregando && (
                      <span className="spinner-border spinner-border-sm ms-2 text-success"></span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Info Card */}
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              

              <div className="accordion accordion-flush" id="infoAccordion">
                <div className="accordion-item border-0">
                  <div id="validationInfo" className="accordion-collapse collapse">
                    <div className="accordion-body pt-2 px-0">
                      <ul className="small mb-0">
                        <li>Formato da data (yyyy-MM-dd-HH-mm)</li>
                        <li>PKs devem ser numéricos</li>
                        <li>Verificação de duplicados</li>
                        <li>Campos obrigatórios</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Styles */}
      <style jsx>{`
        .drop-zone {
          transition: all 0.3s ease;
          border-color: #dee2e6;
        }
        .drop-zone:hover {
          border-color: #0d6efd;
          background-color: rgba(13, 110, 253, 0.05);
        }
        .drag-active {
          border-color: #0d6efd !important;
          background-color: rgba(13, 110, 253, 0.1) !important;
        }
        .border-dashed {
          border-style: dashed !important;
        }
        .icon-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
        }
        .accordion-button:not(.collapsed) {
          color: #6c757d;
          background-color: transparent;
        }
        .accordion-button:focus {
          box-shadow: none;
        }
        .progress-bar {
          transition: width 0.3s ease;
        }
        .card {
          border-radius: 12px;
        }
        .alert-success {
          background-color: rgba(25, 135, 84, 0.1);
          border: none;
        }
        .alert-danger {
          background-color: rgba(220, 53, 69, 0.1);
          border: none;
        }
        .alert-warning {
          background-color: rgba(255, 193, 7, 0.1);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate__fadeInDown {
          animation: fadeIn 0.5s ease-out;
        }
        .modal-backdrop {
          opacity: 0.5 !important;
        }
      `}</style>
    </div>
  );
}