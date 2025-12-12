import { useState, useEffect, useCallback } from "react";
import { FaUserPlus, FaSave, FaSpinner, FaCheckCircle, FaEdit, FaArrowLeft } from "react-icons/fa";
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

    if (touched[name]) {
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
    }
  }, [touched]);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

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
          : `✅ Perfil salvo com sucesso! O perfil "${formData.designacao.trim()}" foi cadastrado.`;
        
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
            resetForm();
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
      const confirmar = window.confirm(
        "Tem certeza que deseja limpar o formulário? Todos os dados serão perdidos."
      );
      if (!confirmar) return;

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
      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow-sm border-0">
              <div className="card-body text-center py-5">
                <FaSpinner className="fa-spin fa-2x mb-3 text-primary" />
                <p>Carregando dados do perfil...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Breadcrumb */}
  

      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-0 pt-4 pb-3">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0 text-primary">
                  {modoEdicao ? <FaEdit className="me-2" /> : <FaUserPlus className="me-2" />} 
                  {modoEdicao ? "Editar Perfil" : "Cadastrar Perfil"}
                </h4>
              </div>
            </div>
            
            <div className="card-body p-4">
              {mensagem && (
                <div
                  className={`alert alert-${mensagem.tipo} alert-dismissible fade show mb-4`}
                  role="alert"
                  aria-live="assertive"
                >
                  <div className="d-flex align-items-center">
                    <div className="me-3" style={{ fontSize: '1.2rem' }}>
                      {mensagem.tipo === 'success' ? <FaCheckCircle /> : '⚠️'}
                    </div>
                    <div className="flex-grow-1">
                      <strong className="d-block mb-1">
                        {mensagem.tipo === 'success' ? 'Sucesso!' : 
                         mensagem.tipo === 'warning' ? 'Atenção!' : 'Erro!'}
                      </strong>
                      {mensagem.texto}
                    </div>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setMensagem(null)}
                      aria-label="Close"
                    ></button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                {/* Designação */}
                <div className="mb-3 position-relative">
                  <label htmlFor="designacao" className="form-label fw-bold">
                    Nome do Perfil *
                  </label>
                  <input
                    type="text"
                    className={`form-control form-control-sm ${getCampoStatus('designacao')}`}
                    id="designacao"
                    name="designacao"
                    value={formData.designacao}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Digite a designação"
                    required
                    maxLength="50"
                    disabled={isSubmitting || salvoComSucesso}
                  />
                  {formData.designacao && (
                    <button
                      type="button"
                      className="btn btn-link position-absolute"
                      style={{ right: '10px', top: '38px', padding: '0', color: '#6c757d' }}
                      onClick={() => limparCampo('designacao')}
                      title="Limpar campo"
                      disabled={isSubmitting}
                    >
                      ×
                    </button>
                  )}
                  <div className="d-flex justify-content-between mt-1">
                    <small className="text-danger" aria-live="polite">{erros.designacao}</small>
                    <small className={`text-muted ${contadores.designacao > 45 ? "text-warning" : ""}`}>
                      {contadores.designacao}/50
                    </small>
                  </div>
                  <small className="form-text text-muted">
                    Campo obrigatório. Apenas letras, espaços, hífens e apóstrofos. Mínimo 3 caracteres.
                  </small>
                </div>

                {/* Estado */}
                <div className="mb-3">
                  <label htmlFor="estado" className="form-label fw-bold">Estado *</label>
                  <select
                    className={`form-select form-select-sm ${getCampoStatus('estado')}`}
                    id="estado"
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    disabled={isSubmitting || salvoComSucesso}
                  >
                    <option value="">Selecione o estado</option>
                    <option value="1">ATIVO</option>
                    <option value="0">INATIVO</option>
                  </select>
                  <small className="text-danger" aria-live="polite">{erros.estado}</small>
                  <small className="form-text text-muted">
                    Campo obrigatório. Selecione ATIVO ou INATIVO.
                  </small>
                </div>

                {/* Descrição */}
                <div className="mb-4 position-relative">
                  <label htmlFor="descricao" className="form-label fw-bold">Descrição</label>
                  <textarea
                    className={`form-control form-control-sm ${getCampoStatus('descricao')}`}
                    id="descricao"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Descreva aqui (opcional)"
                    rows="2"
                    maxLength="200"
                    disabled={isSubmitting || salvoComSucesso}
                  ></textarea>
                  {formData.descricao && (
                    <button
                      type="button"
                      className="btn btn-link position-absolute"
                      style={{ right: '10px', top: '38px', padding: '0', color: '#6c757d' }}
                      onClick={() => limparCampo('descricao')}
                      title="Limpar campo"
                      disabled={isSubmitting}
                    >
                      ×
                    </button>
                  )}
                  <div className="d-flex justify-content-between mt-1">
                    <small className="text-danger" aria-live="polite">{erros.descricao}</small>
                    <small className={`text-muted ${contadores.descricao > 180 ? "text-warning" : ""}`}>
                      {contadores.descricao}/200
                    </small>
                  </div>
                  <small className="form-text text-muted">
                    Campo opcional. Letras, números e pontuação básica (, . ! ?). Máximo 200 caracteres.
                  </small>
                </div>

                {/* Botões */}
                <div className="text-center mt-4">
                  {!salvoComSucesso ? (
                    <div className="d-flex justify-content-center gap-2 flex-wrap">
                      {/* Botão Principal (Salvar/Atualizar) */}
                      <button
                        type="submit"
                        className="btn btn-sm px-4"
                        style={{ 
                          backgroundColor: modoEdicao ? "#28a745" : "#007bff", 
                          borderColor: modoEdicao ? "#28a745" : "#007bff", 
                          color: "#fff",
                          minWidth: "100px"
                        }}
                        disabled={!podeEnviar()}
                      >
                        {isSubmitting ? (
                          <>
                            <FaSpinner className="me-2 fa-spin" />
                            {modoEdicao ? "Atualizando..." : "Salvando..."}
                          </>
                        ) : (
                          <>
                            {modoEdicao ? <FaEdit className="me-2" /> : <FaSave className="me-2" />}
                            {modoEdicao ? "Atualizar" : "Salvar"}
                          </>
                        )}
                      </button>

                      {/* Botão Limpar */}
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary px-4"
                        onClick={resetForm}
                        disabled={isSubmitting}
                      >
                        Limpar
                      </button>
                      
                      {/* Botão Voltar/Cancelar */}
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary px-4"
                        onClick={voltarParaLista}
                        disabled={isSubmitting}
                      >
                        <FaArrowLeft className="me-1" />
                        {modoEdicao ? "Cancelar" : "Voltar"}
                      </button>
                    </div>
                  ) : (
                    <div className="alert alert-info alert-sm py-2">
                      <FaCheckCircle className="me-2" />
                      {modoEdicao 
                        ? "Perfil atualizado com sucesso!" 
                        : "Cadastro realizado com sucesso!"}
                    </div>
                  )}
                </div>

                {!salvoComSucesso && (
                  <div className="mt-3 text-center">
                    <small className={`text-muted ${podeEnviar() ? 'text-success' : 'text-warning'}`}>
                      {podeEnviar() 
                        ? "✓ Formulário válido. Você pode salvar os dados." 
                        : "✗ Preencha todos os campos obrigatórios corretamente para salvar."}
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