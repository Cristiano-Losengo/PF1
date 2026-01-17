import { useState, useEffect, useCallback } from "react";
import { 
  FaUserPlus, 
  FaSave, 
  FaSpinner, 
  FaCheckCircle, 
  FaEdit, 
  FaArrowLeft,
  FaTag,
  FaToggleOn,
  FaToggleOff,
  FaAlignLeft,
  FaTimes,
  FaCircle,
  FaRegCircle,
  FaInfoCircle
} from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

export default function PerfilCadastrar() {
  const BASE_URL = "http://localhost:9090/api/seguranca";
  
  const location = useLocation();
  const navigate = useNavigate();

  const [mensagem, setMensagem] = useState(null);
  const [erros, setErros] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [salvoComSucesso, setSalvoComSucesso] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [perfilId, setPerfilId] = useState(null);
  const [carregando, setCarregando] = useState(false);

  const [formData, setFormData] = useState({
    designacao: "",
    estado: "1",
    descricao: "",
  });

  // Configurações dos campos para validação
  const CONFIG_CAMPOS = {
    designacao: { max: 50, min: 3, obrigatorio: true },
    descricao: { max: 200, min: 0, obrigatorio: false },
    estado: { obrigatorio: true }
  };

  const regexDesignacao = /^[a-zA-ZÀ-ÿ\s\-']+$/;
  const regexDescricao = /^[a-zA-ZÀ-ÿ0-9\s\-',.!?]*$/;

  // Função para verificar se há alterações não salvas
  const haAlteracoesNaoSalvas = useCallback(() => {
    if (!modoEdicao) {
      return formData.designacao.trim() !== "" || 
             formData.descricao.trim() !== "" ||
             formData.estado !== "1";
    }
    
    const perfilOriginal = location.state?.perfil;
    if (!perfilOriginal) return false;
    
    return formData.designacao !== perfilOriginal.designacao ||
           formData.estado !== (perfilOriginal.estado?.toString() || "1") ||
           formData.descricao !== (perfilOriginal.descricao || "");
  }, [modoEdicao, formData, location.state]);

  // Verificar se estamos em modo de edição e carregar dados
  useEffect(() => {
    const carregarPerfilEdicao = async () => {
      if (location.state?.modoEdicao) {
        setCarregando(true);
        setModoEdicao(true);
        
        try {
          if (location.state?.perfil) {
            const perfil = location.state.perfil;
            setPerfilId(perfil.pkPerfil);
            
            setFormData({
              designacao: perfil.designacao || "",
              estado: perfil.estado ? perfil.estado.toString() : "1",
              descricao: perfil.descricao || "",
            });
          } else if (location.state?.perfilId) {
            const response = await fetch(`${BASE_URL}/perfil_obter/${location.state.perfilId}`);
            const data = await response.json();
            
            if (data.sucesso && data.perfil) {
              setPerfilId(data.perfil.pkPerfil);
              setFormData({
                designacao: data.perfil.designacao || "",
                estado: data.perfil.estado?.toString() || "1",
                descricao: data.perfil.descricao || "",
              });
            }
          }
        } catch (error) {
          console.error("Erro ao carregar perfil:", error);
          setMensagem({
            tipo: "danger",
            texto: "❌ Erro ao carregar dados do perfil. Tente novamente."
          });
        } finally {
          setCarregando(false);
        }
      }
    };
    
    carregarPerfilEdicao();
  }, [location.state]);

  const validarCampo = (nome, valor) => {
    let erro = "";
    const config = CONFIG_CAMPOS[nome];

    switch (nome) {
      case "designacao":
        if (!valor.trim()) {
          erro = "A designação é obrigatória";
        } else if (valor.trim().length < config.min) {
          erro = `A designação deve ter no mínimo ${config.min} caracteres`;
        } else if (valor.trim().length > config.max) {
          erro = `A designação não pode exceder ${config.max} caracteres`;
        } else if (!regexDesignacao.test(valor)) {
          erro = "A designação não pode conter números ou caracteres especiais";
        }
        break;

      case "estado":
        if (!valor) {
          erro = "O estado é obrigatório";
        } else if (valor !== "1" && valor !== "0") {
          erro = "Estado inválido. Selecione ATIVO ou INATIVO";
        }
        break;

      case "descricao":
        if (valor && valor.length > config.max) {
          erro = `A descrição não pode exceder ${config.max} caracteres`;
        } else if (valor && !regexDescricao.test(valor)) {
          erro = "A descrição contém caracteres inválidos";
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

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    let valorFinal = value;
    
    const config = CONFIG_CAMPOS[name];
    if (config && config.max && value.length > config.max) {
      valorFinal = value.slice(0, config.max);
    }

    setFormData((prev) => ({ ...prev, [name]: valorFinal }));

    // Validação imediata ao digitar
    const erro = validarCampo(name, valorFinal);
    if (erro) {
      setErros((prev) => ({ ...prev, [name]: erro }));
    } else {
      setErros((prev) => {
        const newErros = { ...prev };
        delete newErros[name];
        return newErros;
      });
    }
  }, []);

  // Nova função combinada que une validação e estilização
  const handleBlurComEstilo = useCallback((e) => {
    const { name } = e.target;
    
    // 1. Marcar como tocado
    setTouched((prev) => ({ ...prev, [name]: true }));

    // 2. Validação
    const erro = validarCampo(name, formData[name]);
    if (erro) {
      setErros((prev) => ({ ...prev, [name]: erro }));
    } else {
      setErros((prev) => {
        const newErros = { ...prev };
        delete newErros[name];
        return newErros;
      });
    }

    // 3. Estilização - aplica as cores corretas após a validação
    const status = getCampoStatus(name);
    e.target.style.borderColor = status.includes('is-invalid') 
      ? '#dc3545' 
      : status.includes('is-valid')
        ? '#28a745'
        : '#e0e0e0';
    e.target.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.05)';
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSalvoComSucesso(false);

    // Marcar todos os campos como tocados
    setTouched({
      designacao: true,
      estado: true,
      descricao: true,
    });

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
      
      setIsSubmitting(false);
      return;
    }

    try {
      const dadosParaEnvio = {
        designacao: formData.designacao.trim(),
        estado: parseInt(formData.estado, 10),
        descricao: formData.descricao ? formData.descricao.trim() : "",
      };

      let url, method;
      
      if (modoEdicao && perfilId) {
        url = `${BASE_URL}/perfil_editar/${perfilId}`;
        method = "PUT";
      } else {
        url = `${BASE_URL}/perfil_cadastrar`;
        method = "POST";
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(dadosParaEnvio),
      });

      const data = await response.json();

      if (response.ok && data.sucesso) {
        const msgSucesso = modoEdicao 
          ? `✅ Perfil "${formData.designacao.trim()}" atualizado com sucesso!`
          : `✅ Perfil salvo com sucesso!`;
        
        setMensagem({
          tipo: "success",
          texto: msgSucesso
        });
        
        setSalvoComSucesso(true);
        
        setTimeout(() => {
          setMensagem(null);
          if (modoEdicao) {
            navigate('/seguranca/perfis/listar');
          } else {
            // Limpa o formulário sem confirmação após salvar
            setFormData({
              designacao: "",
              estado: "1",
              descricao: "",
            });
            setErros({});
            setTouched({});
            setSalvoComSucesso(false);
          }
        }, 3000);

      } else {
        if (data.erros) {
          // Mapear erros do backend
          const errosBackend = {};
          Object.keys(data.erros).forEach(campo => {
            errosBackend[campo] = Array.isArray(data.erros[campo]) 
              ? data.erros[campo].join(', ') 
              : data.erros[campo];
          });
          setErros(errosBackend);
          
          let detalhesErros = "";
          Object.entries(errosBackend).forEach(([campo, erro]) => {
            let nomeCampo = "";
            switch (campo) {
              case "designacao": nomeCampo = "Designação"; break;
              case "estado": nomeCampo = "Estado"; break;
              case "descricao": nomeCampo = "Descrição"; break;
              default: nomeCampo = campo;
            }
            detalhesErros += `${nomeCampo}: ${erro}. `;
          });

          setMensagem({
            tipo: "danger",
            texto: `❌ ${data.mensagem || "Erros de validação: " + detalhesErros}`,
          });
          
          // Rolar para o primeiro erro do backend
          const primeiroErro = Object.keys(errosBackend)[0];
          if (primeiroErro) {
            setTimeout(() => {
              const elemento = document.getElementById(primeiroErro);
              if (elemento) {
                elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
                elemento.focus();
              }
            }, 100);
          }
        } else {
          setMensagem({
            tipo: "danger",
            texto: `❌ ${data.mensagem || `Erro ao ${modoEdicao ? 'atualizar' : 'salvar'}. Status: ${response.status}`}`
          });
        }
      }
    } catch (error) {
      console.error("Erro completo:", error);
      setMensagem({
        tipo: "danger",
        texto: "❌ Erro de comunicação com o servidor. Verifique sua conexão."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    if (modoEdicao) {
      const confirmar = window.confirm(
        "Tem certeza que deseja descartar as alterações? Os dados serão restaurados para os valores originais."
      );
      if (!confirmar) return;

      const perfilOriginal = location.state?.perfil;
      if (perfilOriginal) {
        setFormData({
          designacao: perfilOriginal.designacao || "",
          estado: perfilOriginal.estado ? perfilOriginal.estado.toString() : "1",
          descricao: perfilOriginal.descricao || "",
        });
      }
    } else {
      // NOVO: Limpa automaticamente sem confirmação
      setFormData({
        designacao: "",
        estado: "1",
        descricao: "",
      });
    }
    
    setErros({});
    setTouched({});
    setMensagem(null);
    setSalvoComSucesso(false);
  };

  // Função para voltar com confirmação se houver alterações
  const voltarParaLista = () => {
    if (haAlteracoesNaoSalvas()) {
      const confirmar = window.confirm(
        "Você tem alterações não salvas. Deseja realmente voltar? As alterações serão perdidas."
      );
      if (!confirmar) return;
    }
    navigate('/seguranca/perfis/listar');
  };

  const [contadores, setContadores] = useState({
    designacao: 0,
    descricao: 0,
  });

  useEffect(() => {
    setContadores({
      designacao: formData.designacao.length,
      descricao: formData.descricao.length,
    });
  }, [formData]);

  const podeEnviar = () => {
    if (isSubmitting || salvoComSucesso) return false;
    
    const designacaoValida =
      formData.designacao.trim().length >= CONFIG_CAMPOS.designacao.min &&
      formData.designacao.trim().length <= CONFIG_CAMPOS.designacao.max &&
      regexDesignacao.test(formData.designacao);

    const estadoValido = formData.estado === "1" || formData.estado === "0";

    const descricaoValida =
      !formData.descricao ||
      (formData.descricao.length <= CONFIG_CAMPOS.descricao.max && regexDescricao.test(formData.descricao));

    const semErros = Object.keys(erros).length === 0;

    return designacaoValida && estadoValido && descricaoValida && semErros;
  };

  // Função para obter status do campo
  const getCampoStatus = (campo) => {
    if (!touched[campo]) return '';
    if (erros[campo]) return 'is-invalid';
    if (formData[campo]) return 'is-valid';
    return '';
  };

  // Limpar campo específico
  const limparCampo = (campo) => {
    setFormData(prev => ({ ...prev, [campo]: "" }));
    setErros(prev => {
      const novosErros = { ...prev };
      delete novosErros[campo];
      return novosErros;
    });
  };

  if (carregando) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow-lg border-0" style={{ 
              borderRadius: '15px',
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
            }}>
              <div className="card-body text-center py-5">
                <div className="spinner-grow text-primary mb-3" style={{ 
                  width: '3rem', 
                  height: '3rem',
                  boxShadow: '0 0 20px rgba(0, 123, 255, 0.3)'
                }} role="status">
                  <span className="visually-hidden">Carregando...</span>
                </div>
                <h5 className="text-primary mb-2 fw-bold">Carregando dados do perfil...</h5>
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
        <div className="col-md-8 col-lg-6">
          {/* Card principal com sombras intensas e efeitos */}
          <div className="card shadow-xl border-0" style={{
            borderRadius: '20px',
            overflow: 'hidden',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            border: 'none',
            boxShadow: modoEdicao 
              ? '0 20px 40px rgba(40, 167, 69, 0.15), 0 5px 15px rgba(0, 0, 0, 0.1)'
              : '0 20px 40px rgba(0, 123, 255, 0.15), 0 5px 15px rgba(0, 0, 0, 0.1)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
          }}>
            {/* Header com gradiente e sombra */}
            <div className="card-header border-0 py-4 px-5" style={{
              background: modoEdicao 
                ? 'linear-gradient(135deg, #28a745 0%, #20c997 100%)' 
                : 'linear-gradient(135deg, #007bff 0%, #6610f2 100%)',
              borderBottom: 'none',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Efeito de brilho no header */}
              <div style={{
                position: 'absolute',
                top: '-50%',
                right: '-50%',
                width: '200%',
                height: '200%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
                transform: 'rotate(30deg)'
              }}></div>
              
              <div className="d-flex justify-content-between align-items-center position-relative">
                <div className="d-flex align-items-center">
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
                    {modoEdicao ? (
                      <FaEdit className="text-white fa-xl" />
                    ) : (
                      <FaUserPlus className="text-white fa-xl" />
                    )}
                  </div>
                  <div>
                    <h4 className="mb-1 text-white fw-bold" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                      {modoEdicao ? "Editar Perfil" : "Cadastrar Perfil"}
                    </h4>
                    <p className="mb-0 text-white opacity-90" style={{ fontSize: '0.9rem' }}>
                      {modoEdicao 
                        ? "Modifique as informações deste perfil" 
                        : "Crie um novo perfil para o sistema"}
                    </p>
                  </div>
                </div>
                
                {/* Botão Cancelar - APENAS no modo edição */}
                {modoEdicao && (
                  <button
                    type="button"
                    className="btn btn-light btn-sm px-4 py-2"
                    onClick={voltarParaLista}
                    disabled={isSubmitting}
                    style={{
                      borderRadius: '30px',
                      transition: 'all 0.3s ease',
                      fontWeight: '600',
                      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
                      border: 'none',
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(10px)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSubmitting) {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 15px rgba(0, 0, 0, 0.2)';
                        e.target.style.background = 'rgba(255, 255, 255, 1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSubmitting) {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.15)';
                        e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                      }
                    }}
                  >
                    <FaArrowLeft className="me-2" />
                    Cancelar
                  </button>
                )}
              </div>
            </div>
            
            <div className="card-body p-5" style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)'
            }}>
              {/* Mensagem de alerta estilizada com sombra */}
              {mensagem && (
                <div
                  className={`alert alert-${mensagem.tipo} alert-dismissible fade show mb-4 border-0`}
                  role="alert"
                  style={{
                    borderRadius: '12px',
                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
                    borderLeft: `5px solid ${
                      mensagem.tipo === 'success' ? '#28a745' :
                      mensagem.tipo === 'warning' ? '#ffc107' : '#dc3545'
                    }`,
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
                      ) : mensagem.tipo === 'warning' ? (
                        <div className="p-2 rounded-circle" style={{
                          background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(253, 126, 20, 0.1) 100%)'
                        }}>
                          <FaInfoCircle className="text-warning" />
                        </div>
                      ) : (
                        <div className="p-2 rounded-circle" style={{
                          background: 'linear-gradient(135deg, rgba(220, 53, 69, 0.1) 0%, rgba(189, 33, 48, 0.1) 100%)'
                        }}>
                          <FaTimes className="text-danger" />
                        </div>
                      )}
                    </div>
                    <div className="flex-grow-1">
                      <strong className="d-block mb-1" style={{ fontSize: '1.1rem' }}>
                        {mensagem.tipo === 'success' ? '🎉 Sucesso!' : 
                         mensagem.tipo === 'warning' ? '⚠️ Atenção!' : '❌ Erro!'}
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
                {/* Campo Designação */}
                <div className="mb-4 position-relative">
                  <label htmlFor="designacao" className="form-label fw-bold d-flex align-items-center mb-3">
                    <div className="me-3 p-2 rounded-circle shadow-sm" style={{
                      background: 'linear-gradient(135deg, #6f42c1 0%, #d63384 100%)',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 10px rgba(111, 66, 193, 0.3)'
                    }}>
                      <FaTag className="text-white" style={{ fontSize: '1rem' }} />
                    </div>
                    <div>
                      <span style={{ fontSize: '1.1rem' }}>Designação do Perfil</span>
                      <div className="d-flex align-items-center mt-1">
                        <FaCircle className="text-danger me-1" style={{ fontSize: '0.5rem' }} />
                        <small className="text-muted ms-1">Campo obrigatório</small>
                      </div>
                    </div>
                  </label>
                  <div className="position-relative">
                    <input
                      type="text"
                      className={`form-control form-control-lg ${getCampoStatus('designacao')}`}
                      style={{
                        borderRadius: '12px',
                        border: '2px solid #e0e0e0',
                        padding: '14px 50px 14px 20px',
                        transition: 'all 0.3s ease',
                        fontSize: '1rem',
                        background: 'white',
                        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)'
                      }}
                      id="designacao"
                      name="designacao"
                      value={formData.designacao}
                      onChange={handleChange}
                      onBlur={handleBlurComEstilo}
                      placeholder="Ex: Administrador, Usuário, Gestor..."
                      required
                      maxLength="50"
                      disabled={isSubmitting || salvoComSucesso}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#6f42c1';
                        e.target.style.boxShadow = '0 0 0 3px rgba(111, 66, 193, 0.1), inset 0 2px 4px rgba(0, 0, 0, 0.05)';
                      }}
                    />
                    {formData.designacao && (
                      <button
                        type="button"
                        className="btn position-absolute"
                        style={{
                          right: '15px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          padding: '0',
                          background: 'transparent',
                          border: 'none',
                          color: '#888',
                          fontSize: '1.3rem',
                          width: '30px',
                          height: '30px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '50%',
                          transition: 'all 0.2s ease'
                        }}
                        onClick={() => limparCampo('designacao')}
                        title="Limpar campo"
                        disabled={isSubmitting}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#f0f0f0';
                          e.target.style.color = '#dc3545';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'transparent';
                          e.target.style.color = '#888';
                        }}
                      >
                        <FaTimes />
                      </button>
                    )}
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <small className="text-danger fw-semibold d-flex align-items-center">
                      {erros.designacao && (
                        <>
                          <FaInfoCircle className="me-1" />
                          {erros.designacao}
                        </>
                      )}
                    </small>
                    <small className={`fw-medium ${contadores.designacao > 45 ? "text-warning" : "text-muted"}`}>
                      <span className="fw-bold">{contadores.designacao}</span>/50 caracteres
                    </small>
                  </div>
                </div>

                {/* Campo Estado */}
                <div className="mb-4">
                  <label htmlFor="estado" className="form-label fw-bold d-flex align-items-center mb-3">
                    <div className="me-3 p-2 rounded-circle shadow-sm" style={{
                      background: 'linear-gradient(135deg, #20c997 0%, #0dcaf0 100%)',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 10px rgba(32, 201, 151, 0.3)'
                    }}>
                      {formData.estado === "1" ? (
                        <FaToggleOn className="text-white" style={{ fontSize: '1.4rem' }} />
                      ) : (
                        <FaToggleOff className="text-white" style={{ fontSize: '1.4rem' }} />
                      )}
                    </div>
                    <div>
                      <span style={{ fontSize: '1.1rem' }}>Estado do Perfil</span>
                      <div className="d-flex align-items-center mt-1">
                        <FaCircle className="text-danger me-1" style={{ fontSize: '0.5rem' }} />
                        <small className="text-muted ms-1">Campo obrigatório</small>
                      </div>
                    </div>
                  </label>
                  <select
                    className={`form-select form-select-lg ${getCampoStatus('estado')}`}
                    style={{
                      borderRadius: '12px',
                      border: '2px solid #e0e0e0',
                      padding: '14px 50px 14px 20px',
                      transition: 'all 0.3s ease',
                      fontSize: '1rem',
                      background: 'white',
                      boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)',
                      cursor: 'pointer',
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 20px center',
                      backgroundSize: '16px 12px',
                      appearance: 'none'
                    }}
                    id="estado"
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    onBlur={handleBlurComEstilo}
                    required
                    disabled={isSubmitting || salvoComSucesso}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#20c997';
                      e.target.style.boxShadow = '0 0 0 3px rgba(32, 201, 151, 0.1), inset 0 2px 4px rgba(0, 0, 0, 0.05)';
                    }}
                  >
                    <option value="" className="text-muted">Selecione o estado do perfil</option>
                    <option value="1" className="text-success fw-medium">
                      <span className="d-inline-block me-2" style={{ width: '10px', height: '10px', background: '#28a745', borderRadius: '50%' }}></span>
                      ✅ ATIVO - Perfil disponível para uso
                    </option>
                    <option value="0" className="text-danger fw-medium">
                      <span className="d-inline-block me-2" style={{ width: '10px', height: '10px', background: '#dc3545', borderRadius: '50%' }}></span>
                      ❌ INATIVO - Perfil desativado 
                    </option>
                  </select>
                  <small className="text-danger fw-semibold d-block mt-2 d-flex align-items-center">
                    {erros.estado && (
                      <>
                        <FaInfoCircle className="me-1" />
                        {erros.estado}
                      </>
                    )}
                  </small>
                </div>

                {/* Campo Descrição */}
                <div className="mb-4 position-relative">
                  <label htmlFor="descricao" className="form-label fw-bold d-flex align-items-center mb-3">
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
                      <span style={{ fontSize: '1.1rem' }}>Descrição</span>
                      <div className="d-flex align-items-center mt-1">
                        <FaRegCircle className="text-info me-1" style={{ fontSize: '0.5rem' }} />
                        <small className="text-muted ms-1">Campo opcional</small>
                      </div>
                    </div>
                  </label>
                  <div className="position-relative">
                    <textarea
                      className={`form-control form-control-lg ${getCampoStatus('descricao')}`}
                      style={{
                        borderRadius: '12px',
                        border: '2px solid #e0e0e0',
                        padding: '14px 50px 14px 20px',
                        transition: 'all 0.3s ease',
                        fontSize: '1rem',
                        minHeight: '120px',
                        resize: 'vertical',
                        background: 'white',
                        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)'
                      }}
                      id="descricao"
                      name="descricao"
                      value={formData.descricao}
                      onChange={handleChange}
                      onBlur={handleBlurComEstilo}
                      placeholder="Descreva as funcionalidades, permissões ou características deste perfil..."
                      rows="4"
                      maxLength="200"
                      disabled={isSubmitting || salvoComSucesso}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#fd7e14';
                        e.target.style.boxShadow = '0 0 0 3px rgba(253, 126, 20, 0.1), inset 0 2px 4px rgba(0, 0, 0, 0.05)';
                      }}
                    />
                    {formData.descricao && (
                      <button
                        type="button"
                        className="btn position-absolute"
                        style={{
                          right: '15px',
                          top: '15px',
                          padding: '0',
                          background: 'transparent',
                          border: 'none',
                          color: '#888',
                          fontSize: '1.3rem',
                          width: '30px',
                          height: '30px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '50%',
                          transition: 'all 0.2s ease'
                        }}
                        onClick={() => limparCampo('descricao')}
                        title="Limpar campo"
                        disabled={isSubmitting}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#f0f0f0';
                          e.target.style.color = '#dc3545';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'transparent';
                          e.target.style.color = '#888';
                        }}
                      >
                        <FaTimes />
                      </button>
                    )}
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <small className="text-danger fw-semibold d-flex align-items-center">
                      {erros.descricao && (
                        <>
                          <FaInfoCircle className="me-1" />
                          {erros.descricao}
                        </>
                      )}
                    </small>
                    <small className={`fw-medium ${contadores.descricao > 180 ? "text-warning" : "text-muted"}`}>
                      <span className="fw-bold">{contadores.descricao}</span>/200 caracteres
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
                        background: modoEdicao 
                          ? 'linear-gradient(135deg, #28a745 0%, #20c997 100%)'
                          : 'linear-gradient(135deg, #007bff 0%, #6610f2 100%)',
                        border: 'none',
                        color: '#fff',
                        minWidth: '180px',
                        borderRadius: '12px',
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        boxShadow: modoEdicao
                          ? '0 8px 25px rgba(40, 167, 69, 0.4)'
                          : '0 8px 25px rgba(0, 123, 255, 0.4)',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      disabled={!podeEnviar() || isSubmitting}
                      onMouseEnter={(e) => {
                        if (podeEnviar() && !isSubmitting) {
                          e.target.style.transform = 'translateY(-3px)';
                          e.target.style.boxShadow = modoEdicao
                            ? '0 12px 30px rgba(40, 167, 69, 0.5)'
                            : '0 12px 30px rgba(0, 123, 255, 0.5)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (podeEnviar() && !isSubmitting) {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = modoEdicao
                            ? '0 8px 25px rgba(40, 167, 69, 0.4)'
                            : '0 8px 25px rgba(0, 123, 255, 0.4)';
                        }
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <FaSpinner className="me-2 fa-spin" />
                          {modoEdicao ? "Atualizando..." : "Salvando..."}
                        </>
                      ) : (
                        <>
                          {modoEdicao ? <FaEdit className="me-2" /> : <FaSave className="me-2" />}
                          {modoEdicao ? "Atualizar Perfil" : "Salvar Perfil"}
                        </>
                      )}
                    </button>

                    {/* Botão Limpar - SEMPRE aparece */}
                    <button
                      type="button"
                      className="btn btn-lg btn-outline-secondary px-5 py-3"
                      onClick={resetForm}
                      disabled={isSubmitting}
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
                      Limpar Campos
                    </button>
                  </div>
                </div>

                {/* Informação sobre navegação */}
                {!salvoComSucesso && modoEdicao && (
                  <div className="text-center mt-4 pt-3">
                    <small className="text-muted d-flex align-items-center justify-content-center">
                      <FaArrowLeft className="me-2" /> 
                      Use o botão "Cancelar" no topo para retornar à lista de perfis sem salvar as alterações
                    </small>
                  </div>
                )}
              </form>
            </div>
                   
          </div>
        </div>
      </div>
    </div>
  );
}