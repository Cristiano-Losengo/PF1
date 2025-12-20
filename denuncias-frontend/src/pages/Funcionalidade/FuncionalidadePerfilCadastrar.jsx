import { useState, useEffect, useCallback } from "react";
import { 
  FaUserCog, 
  FaSave, 
  FaSpinner, 
  FaCheckCircle, 
  FaTimes, 
  FaCogs, 
  FaUsers, 
  FaAlignLeft,
  FaExclamationTriangle,
  FaInfoCircle,
  FaExclamationCircle 
} from "react-icons/fa";

export default function FuncionalidadePerfilCadastrar() {
  const [funcionalidades, setFuncionalidades] = useState([]);
  const [perfis, setPerfis] = useState([]);
  const [associacoesExistentes, setAssociacoesExistentes] = useState([]);
  const [carregandoListas, setCarregandoListas] = useState(true);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fkFuncionalidade: "",
    fkPerfil: "",
    detalhe: "",
  });

  const [mensagem, setMensagem] = useState(null);
  const [erros, setErros] = useState({});
  const [touched, setTouched] = useState({});

  const BASE_URL = "http://localhost:9090/api/seguranca";

  // Carregar listas com tratamento de erro
  const carregarDados = async () => {
    setCarregandoListas(true);
    setMensagem(null);
    
    try {
      // Carregar funcionalidades - CORREÇÃO: A API retorna um objeto com 'dados'
      const resFunc = await fetch(`${BASE_URL}/funcionalidade_listar`);
      if (!resFunc.ok) {
        throw new Error(`Erro ao carregar funcionalidades: ${resFunc.status}`);
      }
      const funcData = await resFunc.json();
      // A API retorna {sucesso: true, dados: [], mensagem: "", total: X}
      if (funcData.sucesso && funcData.dados) {
        setFuncionalidades(funcData.dados);
      } else {
        setFuncionalidades([]);
      }

      // Carregar perfis
      const resPerfis = await fetch(`${BASE_URL}/perfil_listar`);
      if (!resPerfis.ok) {
        throw new Error(`Erro ao carregar perfis: ${resPerfis.status}`);
      }
      const perfisData = await resPerfis.json();
      // A API de perfis retorna array direto
      setPerfis(Array.isArray(perfisData) ? perfisData : []);

      // Carregar associações existentes para validação de duplicidade
      const resAssociacoes = await fetch(`${BASE_URL}/funcionalidade_perfil_listar`);
      if (resAssociacoes.ok) {
        const associacoesData = await resAssociacoes.json();
        setAssociacoesExistentes(Array.isArray(associacoesData) ? associacoesData : []);
      }

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setMensagem({
        tipo: "danger",
        texto: "❌ Erro ao carregar dados. Verifique a conexão com o servidor.",
      });
    } finally {
      setCarregandoListas(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Verificar se associação já existe
  const associacaoJaExiste = (fkFuncionalidade, fkPerfil) => {
    return associacoesExistentes.some(assoc => 
      assoc.fkFuncionalidade === parseInt(fkFuncionalidade) && 
      assoc.fkPerfil === parseInt(fkPerfil)
    );
  };

  // Validação dos campos
  const validarCampo = (nome, valor) => {
    let erro = "";

    switch (nome) {
      case "fkFuncionalidade":
        if (!valor.trim()) {
          erro = "A funcionalidade é obrigatória";
        } else if (formData.fkPerfil && associacaoJaExiste(valor, formData.fkPerfil)) {
          // Verificar duplicidade
          const funcionalidade = funcionalidades.find(f => f.pkFuncionalidade === parseInt(valor));
          const perfil = perfis.find(p => p.pkPerfil === parseInt(formData.fkPerfil));
          erro = `Esta funcionalidade "${funcionalidade?.designacao}" já está atribuída ao perfil "${perfil?.designacao}"`;
        }
        break;

      case "fkPerfil":
        if (!valor.trim()) {
          erro = "O perfil é obrigatório";
        } else {
          // Verificar se o perfil está inativo
          const perfilSelecionado = perfis.find(p => p.pkPerfil === parseInt(valor));
          if (perfilSelecionado && perfilSelecionado.estado !== 1) {
            erro = `O perfil "${perfilSelecionado.designacao}" está inativo. Não é possível atribuir funcionalidades a perfis inativos.`;
          } else if (formData.fkFuncionalidade && associacaoJaExiste(formData.fkFuncionalidade, valor)) {
            // Verificar duplicidade apenas se o perfil estiver ativo
            const funcionalidade = funcionalidades.find(f => f.pkFuncionalidade === parseInt(formData.fkFuncionalidade));
            const perfil = perfis.find(p => p.pkPerfil === parseInt(valor));
            erro = `Esta funcionalidade "${funcionalidade?.designacao}" já está atribuída ao perfil "${perfil?.designacao}"`;
          }
        }
        break;

      case "detalhe":
        if (valor && valor.length > 500) {
          erro = "O detalhe não pode exceder 500 caracteres";
        }
        break;

      default:
        break;
    }

    return erro;
  };

  const validarFormulario = () => {
    const novosErros = {};
    Object.keys(formData).forEach((campo) => {
      const erro = validarCampo(campo, formData[campo]);
      if (erro) {
        novosErros[campo] = erro;
      }
    });
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  // Handle input com validação em tempo real
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validação ao digitar se o campo já foi tocado
    if (touched[name]) {
      const erro = validarCampo(name, value);
      if (erro) {
        setErros((prev) => ({ ...prev, [name]: erro }));
      } else {
        setErros((prev) => {
          const novosErros = { ...prev };
          delete novosErros[name];
          return novosErros;
        });
      }
    }
  };

  // Marcar campo como tocado
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    // Validação ao sair do campo
    const erro = validarCampo(name, formData[name]);
    if (erro) {
      setErros((prev) => ({ ...prev, [name]: erro }));
    } else {
      setErros((prev) => {
        const novosErros = { ...prev };
        delete novosErros[name];
        return novosErros;
      });
    }
  };

  // Limpar formulário
  const resetForm = (autoClear = false) => {
    if (!autoClear && Object.values(formData).some(val => val !== "")) {
      const confirmar = window.confirm("Tem certeza que deseja limpar o formulário? Todos os dados serão perdidos.");
      if (!confirmar) return;
    }
    
    setFormData({
      fkFuncionalidade: "",
      fkPerfil: "",
      detalhe: "",
    });
    setErros({});
    setTouched({});
    if (!autoClear) {
      setMensagem(null);
    }
  };

  // Verificar se pode enviar
  const podeEnviar = () => {
    return (
      formData.fkFuncionalidade.trim() !== "" &&
      formData.fkPerfil.trim() !== "" &&
      Object.keys(erros).length === 0 &&
      !loading &&
      !carregandoListas
    );
  };

  // PREPARAR DADOS PARA ENVIAR - CORREÇÃO: Criar objeto com estrutura que o backend espera
  const prepararDadosParaEnviar = () => {
    const funcionalidade = funcionalidades.find(f => f.pkFuncionalidade === parseInt(formData.fkFuncionalidade));
    const perfil = perfis.find(p => p.pkPerfil === parseInt(formData.fkPerfil));
    
    // Criar objeto no formato que o backend espera
    return {
      fkFuncionalidade: parseInt(formData.fkFuncionalidade),
      fkPerfil: parseInt(formData.fkPerfil),
      detalhe: formData.detalhe || "",
      // Adicionar campos extras que podem ser necessários
      nomePerfil: perfil?.designacao || "",
      nomeFuncionalidade: funcionalidade?.designacao || "",
      tipoFuncionalidade: funcionalidade?.designacaoTipoFuncionalidade || "",
      detalhePerfil: perfil?.descricao || "",
      detalheFuncionalidade: funcionalidade?.descricao || "",
      paiFuncionalidade: perfil?.designacao || ""
    };
  };

  // Submit com validações aprimoradas
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensagem(null);

    // Marcar todos os campos como tocados
    setTouched({
      fkFuncionalidade: true,
      fkPerfil: true,
      detalhe: true,
    });

    // Validar formulário
    const formularioValido = validarFormulario();
    
    if (!formularioValido) {
      const primeiroCampoComErro = Object.keys(erros)[0];
      if (primeiroCampoComErro) {
        const elemento = document.getElementById(primeiroCampoComErro);
        if (elemento) {
          elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
          elemento.focus();
        }
      }
      
      setMensagem({
        tipo: "danger",
        texto: "❌ Corrija os erros no formulário antes de enviar."
      });
      setLoading(false);
      return;
    }

    // Verificar duplicidade antes de enviar
    if (associacaoJaExiste(formData.fkFuncionalidade, formData.fkPerfil)) {
      const funcionalidade = funcionalidades.find(f => f.pkFuncionalidade === parseInt(formData.fkFuncionalidade));
      const perfil = perfis.find(p => p.pkPerfil === parseInt(formData.fkPerfil));
      
      setMensagem({
        tipo: "danger",
        texto: `❌ Erro: A funcionalidade "${funcionalidade?.designacao}" já está atribuída ao perfil "${perfil?.designacao}".`
      });
      
      setLoading(false);
      return;
    }

    // Verificar se o perfil está inativo antes de enviar
    const perfilSelecionado = perfis.find(p => p.pkPerfil === parseInt(formData.fkPerfil));
    if (perfilSelecionado && perfilSelecionado.estado !== 1) {
      setMensagem({
        tipo: "danger",
        texto: `❌ Erro: O perfil "${perfilSelecionado.designacao}" está inativo. Não é possível atribuir funcionalidades a perfis inativos.`
      });
      
      setLoading(false);
      return;
    }

    try {
      // Preparar dados no formato correto
      const dadosParaEnviar = prepararDadosParaEnviar();
      console.log("Enviando dados:", dadosParaEnviar); // Para debug
      
      const response = await fetch(
        `${BASE_URL}/funcionalidade_perfil_cadastrar`,
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(dadosParaEnviar),
        }
      );

      let data;
      try {
        data = await response.json();
        console.log("Resposta do backend:", data); // Para debug
      } catch (e) {
        data = {};
      }

      if (response.ok && data.sucesso) {
        const funcionalidade = funcionalidades.find(f => f.pkFuncionalidade === parseInt(formData.fkFuncionalidade));
        const perfil = perfis.find(p => p.pkPerfil === parseInt(formData.fkPerfil));
        
        setMensagem({
          tipo: "success",
          texto: `✅ ${data.mensagem || `Funcionalidade "${funcionalidade?.designacao}" atribuída ao perfil "${perfil?.designacao}" com sucesso!`}`
        });
        
        // Atualizar lista de associações existentes
        const novaAssociacao = {
          fkFuncionalidade: parseInt(formData.fkFuncionalidade),
          fkPerfil: parseInt(formData.fkPerfil),
          nomeFuncionalidade: funcionalidade?.designacao,
          nomePerfil: perfil?.designacao
        };
        setAssociacoesExistentes(prev => [...prev, novaAssociacao]);
        
        // Limpar formulário após sucesso
        setTimeout(() => {
          resetForm(true);
          setTimeout(() => {
            setMensagem(null);
          }, 3000);
        }, 3000);

      } else {
        // Tratar erros do backend
        let mensagemErro = data.mensagem || data.erro || `Erro ao salvar (Status: ${response.status})`;
        
        // Verificar se é erro de duplicidade
        if (mensagemErro.toLowerCase().includes("duplic") || 
            mensagemErro.toLowerCase().includes("já existe") || 
            mensagemErro.toLowerCase().includes("already exists")) {
          const funcionalidade = funcionalidades.find(f => f.pkFuncionalidade === parseInt(formData.fkFuncionalidade));
          const perfil = perfis.find(p => p.pkPerfil === parseInt(formData.fkPerfil));
          mensagemErro = `❌ Erro: A funcionalidade "${funcionalidade?.designacao}" já está atribuída ao perfil "${perfil?.designacao}".`;
        }
        
        setMensagem({
          tipo: "danger",
          texto: mensagemErro
        });

        // Se o backend retornou erros específicos
        if (data.erros) {
          setErros(data.erros);
        }

        // Rolar para o topo para mostrar mensagem de erro
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

    } catch (error) {
      console.error("Erro completo:", error);
      setMensagem({
        tipo: "danger",
        texto: "❌ Erro de comunicação com o servidor. Verifique sua conexão."
      });
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  // Função para obter status do campo
  const getCampoStatus = (campo) => {
    if (!touched[campo]) return '';
    if (erros[campo]) return 'is-invalid';
    if (formData[campo] && campo !== 'detalhe') return 'is-valid';
    return '';
  };

  // Estilo do campo com base no status
  const getCampoStyle = (campo) => {
    const baseStyle = {
      borderRadius: '10px',
      border: '2px solid #e0e0e0',
      padding: '12px 15px',
      transition: 'all 0.3s ease',
      fontSize: '1rem',
      background: 'white',
      boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)'
    };

    const status = getCampoStatus(campo);
    
    if (status.includes('is-invalid')) {
      baseStyle.borderColor = '#dc3545';
      baseStyle.boxShadow = '0 0 0 3px rgba(220, 53, 69, 0.1), inset 0 2px 4px rgba(0, 0, 0, 0.05)';
    } else if (status.includes('is-valid')) {
      baseStyle.borderColor = '#28a745';
      baseStyle.boxShadow = '0 0 0 3px rgba(40, 167, 69, 0.1), inset 0 2px 4px rgba(0, 0, 0, 0.05)';
    }

    return baseStyle;
  };

  // Corrigir o carregamento das funcionalidades
  if (carregandoListas) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow-xl border-0" style={{ 
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              boxShadow: '0 20px 40px rgba(0, 123, 255, 0.15)'
            }}>
              <div className="card-body text-center py-5">
                <div className="spinner-grow text-primary mb-3" style={{ 
                  width: '3rem', 
                  height: '3rem',
                  boxShadow: '0 0 20px rgba(0, 123, 255, 0.3)'
                }} role="status">
                  <span className="visually-hidden">Carregando...</span>
                </div>
                <h5 className="text-primary mb-2 fw-bold">Carregando dados...</h5>
                <p className="text-muted">Por favor, aguarde um momento.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-10 col-lg-8">
          {/* Card principal */}
          <div className="card shadow-xl border-0" style={{
            borderRadius: '20px',
            overflow: 'hidden',
            border: 'none',
            boxShadow: '0 20px 40px rgba(108, 117, 125, 0.15), 0 5px 15px rgba(0, 0, 0, 0.1)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
          }}>
            
            {/* Header com gradiente */}
            <div className="card-header border-0 py-4 px-5" style={{
              background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
              borderBottom: 'none',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '-50%',
                right: '-50%',
                width: '200%',
                height: '200%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
                transform: 'rotate(30deg)'
              }}></div>
              
              <div className="d-flex align-items-center position-relative">
                <div className="me-3 p-3 rounded-circle shadow-lg" style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  width: '70px',
                  height: '70px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid rgba(255, 255, 255, 0.3)'
                }}>
                  <FaUserCog className="text-white fa-xl" />
                </div>
                <div>
                  <h4 className="mb-1 text-white fw-bold" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                    Atribuir Funcionalidade
                  </h4>
                  <p className="mb-0 text-white opacity-90" style={{ fontSize: '0.9rem' }}>
                    Associe funcionalidades aos perfis do sistema
                  </p>
                </div>
              </div>
            </div>
            
            <div className="card-body p-5" style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)'
            }}>
              
              {/* Mensagem de alerta estilizada */}
              {mensagem && (
                <div
                  className={`alert alert-${mensagem.tipo} alert-dismissible fade show mb-4 border-0`}
                  role="alert"
                  style={{
                    borderRadius: '12px',
                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
                    borderLeft: `5px solid ${mensagem.tipo === 'success' ? '#28a745' : '#dc3545'}`,
                    background: 'white',
                    padding: '1.25rem 1.5rem',
                    marginBottom: '1.5rem'
                  }}
                >
                  <div className="d-flex align-items-center">
                    <div className="me-3" style={{ fontSize: '1.8rem' }}>
                      {mensagem.tipo === 'success' ? (
                        <div className="p-2 rounded-circle" style={{
                          background: 'linear-gradient(135deg, rgba(40, 167, 69, 0.1) 0%, rgba(32, 201, 151, 0.1) 100%)'
                        }}>
                          <FaCheckCircle className="text-success" />
                        </div>
                      ) : (
                        <div className="p-2 rounded-circle" style={{
                          background: 'linear-gradient(135deg, rgba(220, 53, 69, 0.1) 0%, rgba(189, 33, 48, 0.1) 100%)'
                        }}>
                          {mensagem.texto.includes('já está atribuída') ? 
                            <FaExclamationCircle className="text-danger" /> : 
                            <FaExclamationTriangle className="text-danger" />
                          }
                        </div>
                      )}
                    </div>
                    <div className="flex-grow-1">
                      <strong className="d-block mb-1" style={{ fontSize: '1.1rem' }}>
                        {mensagem.tipo === 'success' ? '🎉 Sucesso!' : '❌ Erro!'}
                      </strong>
                      <span dangerouslySetInnerHTML={{ __html: mensagem.texto }} />
                    </div>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setMensagem(null)}
                      aria-label="Close"
                      style={{ opacity: 0.7 }}
                    ></button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                
                {/* Campo Funcionalidade */}
                <div className="mb-4 position-relative">
                  <label htmlFor="fkFuncionalidade" className="form-label fw-bold d-flex align-items-center mb-3">
                    <div className="me-3 p-2 rounded-circle shadow-sm" style={{
                      background: 'linear-gradient(135deg, #6f42c1 0%, #d63384 100%)',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 10px rgba(111, 66, 193, 0.3)'
                    }}>
                      <FaCogs className="text-white" style={{ fontSize: '1rem' }} />
                    </div>
                    <div>
                      <span style={{ fontSize: '1.1rem' }}>Funcionalidade</span>
                      <div className="d-flex align-items-center mt-1">
                        <FaInfoCircle className="text-danger me-1" style={{ fontSize: '0.6rem' }} />
                        <small className="text-muted ms-1">Campo obrigatório</small>
                      </div>
                    </div>
                  </label>
                  <select
                    className={`form-select form-select-lg ${getCampoStatus('fkFuncionalidade')}`}
                    style={getCampoStyle('fkFuncionalidade')}
                    id="fkFuncionalidade"
                    name="fkFuncionalidade"
                    value={formData.fkFuncionalidade}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    disabled={loading || carregandoListas}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#6f42c1';
                      e.target.style.boxShadow = '0 0 0 3px rgba(111, 66, 193, 0.1), inset 0 2px 4px rgba(0, 0, 0, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      const status = getCampoStatus('fkFuncionalidade');
                      e.target.style.borderColor = status.includes('is-invalid') 
                        ? '#dc3545' 
                        : status.includes('is-valid')
                          ? '#28a745'
                          : '#e0e0e0';
                      e.target.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.05)';
                    }}
                  >
                    <option value="">Selecione uma funcionalidade...</option>
                    {funcionalidades.map((f) => (
                      <option key={f.pkFuncionalidade} value={f.pkFuncionalidade}>
                        {f.designacao} {f.descricao ? `- ${f.descricao}` : ''}
                      </option>
                    ))}
                  </select>
                  <small className="text-danger fw-semibold d-block mt-2 d-flex align-items-center">
                    {erros.fkFuncionalidade && (
                      <>
                        {erros.fkFuncionalidade.includes('já está atribuída') ? 
                          <FaExclamationCircle className="me-1" /> : 
                          <FaExclamationTriangle className="me-1" />
                        }
                        {erros.fkFuncionalidade}
                      </>
                    )}
                  </small>
                </div>

                {/* Campo Perfil */}
                <div className="mb-4 position-relative">
                  <label htmlFor="fkPerfil" className="form-label fw-bold d-flex align-items-center mb-3">
                    <div className="me-3 p-2 rounded-circle shadow-sm" style={{
                      background: 'linear-gradient(135deg, #20c997 0%, #0dcaf0 100%)',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 10px rgba(32, 201, 151, 0.3)'
                    }}>
                      <FaUsers className="text-white" style={{ fontSize: '1rem' }} />
                    </div>
                    <div>
                      <span style={{ fontSize: '1.1rem' }}>Perfil</span>
                      <div className="d-flex align-items-center mt-1">
                        <FaInfoCircle className="text-danger me-1" style={{ fontSize: '0.6rem' }} />
                        <small className="text-muted ms-1">Campo obrigatório</small>
                      </div>
                    </div>
                  </label>
                  <select
                    className={`form-select form-select-lg ${getCampoStatus('fkPerfil')}`}
                    style={getCampoStyle('fkPerfil')}
                    id="fkPerfil"
                    name="fkPerfil"
                    value={formData.fkPerfil}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    disabled={loading || carregandoListas}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#20c997';
                      e.target.style.boxShadow = '0 0 0 3px rgba(32, 201, 151, 0.1), inset 0 2px 4px rgba(0, 0, 0, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      const status = getCampoStatus('fkPerfil');
                      e.target.style.borderColor = status.includes('is-invalid') 
                        ? '#dc3545' 
                        : status.includes('is-valid')
                          ? '#28a745'
                          : '#e0e0e0';
                      e.target.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.05)';
                    }}
                  >
                    <option value="">Selecione um perfil...</option>
                    {perfis.map((p) => (
                      <option key={p.pkPerfil} value={p.pkPerfil}>
                        {p.designacao} {p.estado === 1 ? '(ATIVO)' : '(INATIVO)'}
                      </option>
                    ))}
                  </select>
                  <small className="text-danger fw-semibold d-block mt-2 d-flex align-items-center">
                    {erros.fkPerfil && (
                      <>
                        {erros.fkPerfil.includes('já está atribuída') ? 
                          <FaExclamationCircle className="me-1" /> : 
                          <FaExclamationTriangle className="me-1" />
                        }
                        {erros.fkPerfil}
                      </>
                    )}
                  </small>
                </div>

                {/* Campo Detalhe */}
                <div className="mb-4 position-relative">
                  <label htmlFor="detalhe" className="form-label fw-bold d-flex align-items-center mb-3">
                    <div className="me-3 p-2 rounded-circle shadow-sm" style={{
                      background: 'linear-gradient(135deg, #fd7e14 0%, #ffc107 100%)',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 10px rgba(253, 126, 20, 0.3)'
                    }}>
                      <FaAlignLeft className="text-white" style={{ fontSize: '1rem' }} />
                    </div>
                    <div>
                      <span style={{ fontSize: '1.1rem' }}>Detalhe</span>
                      <div className="d-flex align-items-center mt-1">
                        <FaInfoCircle className="text-info me-1" style={{ fontSize: '0.6rem' }} />
                        <small className="text-muted ms-1">Campo opcional</small>
                      </div>
                    </div>
                  </label>
                  <textarea
                    className={`form-control form-control-lg ${getCampoStatus('detalhe')}`}
                    style={{
                      ...getCampoStyle('detalhe'),
                      minHeight: '100px',
                      resize: 'vertical'
                    }}
                    id="detalhe"
                    name="detalhe"
                    value={formData.detalhe}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    rows="4"
                    maxLength="500"
                    placeholder="Descrição adicional sobre esta associação (opcional)..."
                    disabled={loading || carregandoListas}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#fd7e14';
                      e.target.style.boxShadow = '0 0 0 3px rgba(253, 126, 20, 0.1), inset 0 2px 4px rgba(0, 0, 0, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      const status = getCampoStatus('detalhe');
                      e.target.style.borderColor = status.includes('is-invalid') 
                        ? '#dc3545' 
                        : status.includes('is-valid')
                          ? '#28a745'
                          : '#e0e0e0';
                      e.target.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.05)';
                    }}
                  ></textarea>
                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <small className="text-danger fw-semibold d-flex align-items-center">
                      {erros.detalhe && (
                        <>
                          <FaExclamationTriangle className="me-1" />
                          {erros.detalhe}
                        </>
                      )}
                    </small>
                    <small className={`fw-medium ${formData.detalhe.length > 450 ? "text-warning" : "text-muted"}`}>
                      <span className="fw-bold">{formData.detalhe.length}</span>/500 caracteres
                    </small>
                  </div>
                </div>

                {/* Botões com sombras e efeitos */}
                <div className="text-center mt-5 pt-4" style={{
                  borderTop: '1px solid rgba(0, 0, 0, 0.08)'
                }}>
                  <div className="d-flex justify-content-center gap-4 flex-wrap">
                    
                    {/* Botão Principal */}
                    <button
                      type="submit"
                      className="btn btn-lg px-5 py-3"
                      style={{
                        background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
                        border: 'none',
                        color: '#fff',
                        minWidth: '180px',
                        borderRadius: '12px',
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        boxShadow: '0 8px 25px rgba(108, 117, 125, 0.4)',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      disabled={!podeEnviar()}
                      onMouseEnter={(e) => {
                        if (podeEnviar()) {
                          e.target.style.transform = 'translateY(-3px)';
                          e.target.style.boxShadow = '0 12px 30px rgba(108, 117, 125, 0.5)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (podeEnviar()) {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 8px 25px rgba(108, 117, 125, 0.4)';
                        }
                      }}
                    >
                      {loading ? (
                        <>
                          <FaSpinner className="me-2 fa-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <FaSave className="me-2" />
                          Salvar Associação
                        </>
                      )}
                    </button>

                    {/* Botão Limpar */}
                    <button
                      type="button"
                      className="btn btn-lg btn-outline-secondary px-5 py-3"
                      onClick={() => resetForm()}
                      disabled={loading}
                      style={{
                        borderRadius: '12px',
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        borderWidth: '2px',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-3px)';
                        e.target.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
                        e.target.style.borderColor = '#6c757d';
                        e.target.style.color = '#495057';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.08)';
                        e.target.style.borderColor = '#6c757d';
                        e.target.style.color = '#6c757d';
                      }}
                    >
                      <FaTimes className="me-2" />
                      Limpar
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}