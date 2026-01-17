import { useState, useEffect } from "react";
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
  FaExclamationCircle,
  FaChevronDown,
  FaChevronUp,
  FaCheckSquare,
  FaSquare,
  FaSearch,
  FaListOl,
  FaFolder,
  FaFolderOpen,
  FaChevronRight,
  FaLock,
  FaExclamation
} from "react-icons/fa";

export default function FuncionalidadePerfilCadastrar() {
  const [funcionalidades, setFuncionalidades] = useState([]);
  const [perfis, setPerfis] = useState([]);
  const [associacoesExistentes, setAssociacoesExistentes] = useState([]);
  const [carregandoListas, setCarregandoListas] = useState(true);
  const [loading, setLoading] = useState(false);
  const [mostrarSeletorFunc, setMostrarSeletorFunc] = useState(false);
  const [filtroFunc, setFiltroFunc] = useState("");
  const [funcionalidadesSelecionadas, setFuncionalidadesSelecionadas] = useState([]);
  const [funcionalidadesExpandidas, setFuncionalidadesExpandidas] = useState(new Set());

  const [formData, setFormData] = useState({
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
      // Carregar funcionalidades
      const resFunc = await fetch(`${BASE_URL}/funcionalidade_listar`);
      if (!resFunc.ok) {
        throw new Error(`Erro ao carregar funcionalidades: ${resFunc.status}`);
      }
      const funcData = await resFunc.json();
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

  // Verificar se associação já existe para uma funcionalidade específica
  const associacaoJaExiste = (fkFuncionalidade, fkPerfil) => {
    return associacoesExistentes.some(assoc => 
      assoc.fkFuncionalidade === parseInt(fkFuncionalidade) && 
      assoc.fkPerfil === parseInt(fkPerfil)
    );
  };

  // Verificar se a funcionalidade raiz (ID 1) está selecionada
  const raizEstaSelecionada = () => {
    return funcionalidadesSelecionadas.includes(1);
  };

  // Verificar se pode adicionar mais funcionalidades (não pode se raiz estiver selecionada)
  const podeAdicionarFuncionalidade = (funcId) => {
    if (raizEstaSelecionada()) {
      return false; // Se raiz já está selecionada, não pode adicionar mais nada
    }
    
    // Se tentando selecionar a raiz (ID 1), limpar todas as outras seleções
    if (funcId === 1 && funcionalidadesSelecionadas.length > 0) {
      return true; // Permitir, mas será tratado no toggleFuncionalidade
    }
    
    return true; // Caso normal, pode adicionar
  };

  // Alternar seleção de uma funcionalidade - COM NOVA LÓGICA
  const toggleFuncionalidade = (funcId) => {
    const funcIdNum = parseInt(funcId);
    
    // Se for a raiz (ID 1) e já estiver selecionada, desselecionar
    if (funcIdNum === 1 && funcionalidadesSelecionadas.includes(1)) {
      setFuncionalidadesSelecionadas(prev => prev.filter(id => id !== funcIdNum));
      return;
    }
    
    // Se for a raiz (ID 1) e NÃO estiver selecionada
    if (funcIdNum === 1 && !funcionalidadesSelecionadas.includes(1)) {
      // Se houver outras funcionalidades selecionadas, perguntar se quer substituir
      if (funcionalidadesSelecionadas.length > 0) {
        const confirmar = window.confirm(
          "Atenção! Ao selecionar a funcionalidade raiz 'Sistema PND - Plataforma Nacional de Denúncias', " +
          "todas as outras funcionalidades serão automaticamente desselecionadas.\n\n" +
          "Isso ocorre porque a funcionalidade raiz já concede acesso a TODO o sistema.\n\n" +
          "Deseja continuar?"
        );
        
        if (!confirmar) return;
      }
      
      // Selecionar APENAS a raiz
      setFuncionalidadesSelecionadas([1]);
      setMensagem({
        tipo: "info",
        texto: "⚠️ <strong>Atenção!</strong> A funcionalidade raiz 'Sistema PND - Plataforma Nacional de Denúncias' foi selecionada. " +
               "Ela concede acesso a <strong>TODO o sistema</strong>. Nenhuma outra funcionalidade pode ser atribuída em conjunto com a raiz."
      });
      return;
    }
    
    // Se raiz já está selecionada, não permite adicionar outras funcionalidades
    if (raizEstaSelecionada()) {
      setMensagem({
        tipo: "warning",
        texto: "❌ <strong>Operação não permitida!</strong> A funcionalidade raiz 'Sistema PND - Plataforma Nacional de Denúncias' já está selecionada. " +
               "Ela concede acesso a TODO o sistema, portanto não é possível atribuir outras funcionalidades em conjunto."
      });
      return;
    }
    
    // Caso normal: alternar seleção da funcionalidade
    setFuncionalidadesSelecionadas(prev => {
      if (prev.includes(funcIdNum)) {
        return prev.filter(id => id !== funcIdNum);
      } else {
        return [...prev, funcIdNum];
      }
    });
  };

  // Toggle expansão de uma funcionalidade
  const toggleExpansao = (funcId) => {
    const nova = new Set(funcionalidadesExpandidas);
    nova.has(funcId) ? nova.delete(funcId) : nova.add(funcId);
    setFuncionalidadesExpandidas(nova);
  };

  // Selecionar todas/deselecionar todas as funcionalidades - ATUALIZADO
  const toggleTodasFuncionalidades = () => {
    const idsFiltrados = funcionalidadesFiltradas.map(f => f.pkFuncionalidade);
    
    // Verificar se a raiz (ID 1) está na lista filtrada
    const raizNaLista = idsFiltrados.includes(1);
    
    // Se tentando selecionar todas E a raiz está na lista
    if (funcionalidadesSelecionadas.length !== idsFiltrados.length && raizNaLista) {
      const confirmar = window.confirm(
        "Atenção! A seleção inclui a funcionalidade raiz 'Sistema PND - Plataforma Nacional de Denúncias'.\n\n" +
        "Esta funcionalidade concede acesso a TODO o sistema. Ao selecioná-la, " +
        "as outras funcionalidades serão automaticamente desselecionadas.\n\n" +
        "Deseja selecionar apenas a funcionalidade raiz?"
      );
      
      if (confirmar) {
        // Selecionar apenas a raiz
        setFuncionalidadesSelecionadas([1]);
        setMensagem({
          tipo: "info",
          texto: "⚠️ <strong>Atenção!</strong> A funcionalidade raiz 'Sistema PND - Plataforma Nacional de Denúncias' foi selecionada. " +
                 "Ela concede acesso a <strong>TODO o sistema</strong>. Nenhuma outra funcionalidade pode ser atribuída em conjunto."
        });
      }
      return;
    }
    
    // Lógica normal de selecionar/deselecionar todas
    if (funcionalidadesSelecionadas.length === idsFiltrados.length) {
      setFuncionalidadesSelecionadas([]);
    } else {
      setFuncionalidadesSelecionadas(idsFiltrados);
    }
  };

  // Remover uma funcionalidade da seleção
  const removerFuncionalidade = (funcId) => {
    setFuncionalidadesSelecionadas(prev => prev.filter(id => id !== funcId));
    
    // Se remover a raiz, limpar mensagem de alerta
    if (funcId === 1) {
      setMensagem(null);
    }
  };

  const limparFuncionalidadesSelecionadas = () => {
    setFuncionalidadesSelecionadas([]);
    setMensagem(null);
  };

  // Limpar formulário COMPLETO - COM CONFIRMAÇÃO
  const resetFormCompleto = () => {
    console.log("Botão Limpar Tudo clicado");
    console.log("Dados atuais:", { 
      fkPerfil: formData.fkPerfil,
      detalhe: formData.detalhe,
      funcionalidadesSelecionadas: funcionalidadesSelecionadas.length 
    });
    
    const temDadosParaLimpar = 
      formData.fkPerfil !== "" || 
      formData.detalhe !== "" || 
      funcionalidadesSelecionadas.length > 0;
    
    console.log("Tem dados para limpar?", temDadosParaLimpar);
    
    // Só mostra alerta se realmente houver dados para limpar
    if (temDadosParaLimpar) {
      const confirmar = window.confirm("Tem certeza que deseja limpar todo o formulário? Todos os dados serão perdidos.");
      console.log("Usuário confirmou?", confirmar);
      if (!confirmar) return;
    }
    
    // Limpar TUDO
    setFormData({
      fkPerfil: "",
      detalhe: "",
    });
    setFuncionalidadesSelecionadas([]);
    setFiltroFunc("");
    setErros({});
    setTouched({});
    setMostrarSeletorFunc(false);
    setFuncionalidadesExpandidas(new Set());
    setMensagem(null);
    
    console.log("Formulário limpo completamente");
  };

  // Função para limpar sem confirmação (para usar após sucesso)
  const limparFormularioSemConfirmacao = () => {
    setFormData({
      fkPerfil: "",
      detalhe: "",
    });
    setFuncionalidadesSelecionadas([]);
    setFiltroFunc("");
    setErros({});
    setTouched({});
    setMostrarSeletorFunc(false);
    setFuncionalidadesExpandidas(new Set());
    setMensagem(null);
    
    console.log("Formulário limpo automaticamente (sem confirmação)");
  };

  // Filtrar funcionalidades baseado no texto de busca
  const funcionalidadesFiltradas = filtroFunc 
    ? funcionalidades.filter(f => 
        f.designacao.toLowerCase().includes(filtroFunc.toLowerCase()) ||
        (f.descricao && f.descricao.toLowerCase().includes(filtroFunc.toLowerCase()))
      )
    : funcionalidades;

  // Construir árvore hierárquica de funcionalidades
  const construirArvore = () => {
    const map = new Map();
    const raiz = [];
    
    // Criar mapa de funcionalidades
    funcionalidadesFiltradas.forEach(item => {
      map.set(item.pkFuncionalidade, {
        ...item,
        filhos: [],
        nivel: 0,
        temFilhos: false
      });
    });
    
    // Construir hierarquia usando fkFuncionalidadePai
    funcionalidadesFiltradas.forEach(item => {
      const node = map.get(item.pkFuncionalidade);
      
      const paiId = item.fkFuncionalidadePai !== null && item.fkFuncionalidadePai !== undefined 
        ? item.fkFuncionalidadePai 
        : 0;
      
      if (paiId && paiId !== 0) {
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
    
    // Ordenar recursivamente
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

  const arvoreFuncionalidades = construirArvore();

  // Função para renderizar um nó da árvore - ATUALIZADA
  const renderNode = (node, depth = 0) => {
    const temFilhos = node.filhos && node.filhos.length > 0;
    const aberto = funcionalidadesExpandidas.has(node.pkFuncionalidade);
    const estaSelecionada = funcionalidadesSelecionadas.includes(node.pkFuncionalidade);
    const jaAssociada = formData.fkPerfil 
      ? associacaoJaExiste(node.pkFuncionalidade, formData.fkPerfil)
      : false;
    
    // Verificar se é a raiz (ID 1)
    const eRaiz = node.pkFuncionalidade === 1;
    
    // Verificar se pode ser selecionada
    const podeSerSelecionada = !jaAssociada && 
      (eRaiz || !raizEstaSelecionada());

    return (
      <div 
        key={node.pkFuncionalidade}
        style={{ marginLeft: `${depth * 24}px` }}
      >
        <div 
          className={`list-group-item list-group-item-action ${jaAssociada ? 'bg-light' : ''} ${!podeSerSelecionada && !jaAssociada ? 'bg-warning bg-opacity-10' : ''}`}
          style={{
            cursor: podeSerSelecionada ? 'pointer' : 'not-allowed',
            opacity: podeSerSelecionada ? 1 : 0.6,
            borderLeft: estaSelecionada ? '4px solid #6f42c1' : '4px solid transparent',
            padding: '12px 15px',
            border: 'none',
            borderBottom: '1px solid #f0f0f0',
            position: 'relative'
          }}
          onClick={(e) => {
            if (podeSerSelecionada) {
              // Prevenir que o clique no checkbox propague para o container
              if (!e.target.closest('.func-checkbox')) {
                toggleFuncionalidade(node.pkFuncionalidade);
              }
            } else if (!jaAssociada) {
              // Mostrar mensagem explicativa se não pode ser selecionada
              if (eRaiz && raizEstaSelecionada()) {
                setMensagem({
                  tipo: "warning",
                  texto: "❌ <strong>Atenção!</strong> A funcionalidade raiz já está selecionada. " +
                         "Ela concede acesso a TODO o sistema e não permite atribuição de outras funcionalidades em conjunto."
                });
              } else if (raizEstaSelecionada()) {
                setMensagem({
                  tipo: "warning",
                  texto: "❌ <strong>Operação não permitida!</strong> A funcionalidade raiz 'Sistema PND - Plataforma Nacional de Denúncias' já está selecionada. " +
                         "Ela concede acesso a TODO o sistema, portanto não é possível atribuir outras funcionalidades em conjunto."
                });
              }
            }
          }}
        >
          <div className="d-flex align-items-center">
            {/* Ícones de expansão */}
            <div className="me-2 d-flex align-items-center">
              {temFilhos && (
                <button
                  type="button"
                  className="btn btn-sm btn-link p-0 me-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpansao(node.pkFuncionalidade);
                  }}
                  style={{ minWidth: '20px' }}
                >
                  {aberto ? (
                    <FaChevronDown size={14} className="text-secondary" />
                  ) : (
                    <FaChevronRight size={14} className="text-secondary" />
                  )}
                </button>
              )}
              {!temFilhos && <div style={{ width: '34px' }}></div>}
            </div>

            {/* Checkbox */}
            <div 
              className="me-3 func-checkbox"
              onClick={(e) => e.stopPropagation()}
            >
              {jaAssociada ? (
                <FaCheckSquare className="text-success" title="Já associada a este perfil" size={20} />
              ) : estaSelecionada ? (
                <FaCheckSquare 
                  className="text-primary" 
                  onClick={() => toggleFuncionalidade(node.pkFuncionalidade)}
                  style={{ cursor: podeSerSelecionada ? 'pointer' : 'not-allowed' }}
                  size={20}
                />
              ) : (
                <FaSquare 
                  className={podeSerSelecionada ? "text-muted" : "text-secondary"} 
                  onClick={() => podeSerSelecionada && toggleFuncionalidade(node.pkFuncionalidade)}
                  style={{ cursor: podeSerSelecionada ? 'pointer' : 'not-allowed' }}
                  size={20}
                />
              )}
            </div>

            {/* Ícone de pasta ou cadeado para raiz */}
            <div className="me-3">
              {eRaiz ? (
                <FaLock className="text-danger" size={18} title="Funcionalidade Raiz - Acesso Total" />
              ) : temFilhos ? (
                aberto ? (
                  <FaFolderOpen className="text-warning" size={18} />
                ) : (
                  <FaFolder className="text-warning" size={18} />
                )
              ) : (
                <FaFolder className="text-muted" size={18} />
              )}
            </div>

            {/* Conteúdo */}
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <strong className="d-block">
                    {node.designacao}
                    {eRaiz && (
                      <span className="badge bg-danger bg-opacity-20 text-danger border border-danger border-opacity-25 ms-2">
                        RAÍZ
                      </span>
                    )}
                  </strong>
                  {node.descricao && (
                    <small className="text-muted d-block mt-1">{node.descricao}</small>
                  )}
                  <div className="mt-1">
                    <small className="text-muted me-2">ID: {node.pkFuncionalidade}</small>
                    {node.designacaoTipoFuncionalidade && (
                      <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25">
                        {node.designacaoTipoFuncionalidade}
                      </span>
                    )}
                    {eRaiz && (
                      <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 ms-1">
                        ACESSO TOTAL
                      </span>
                    )}
                  </div>
                </div>
                {jaAssociada && (
                  <span className="badge bg-warning text-dark">Já atribuída</span>
                )}
                {!podeSerSelecionada && !jaAssociada && raizEstaSelecionada() && (
                  <span className="badge bg-danger text-white">
                    <FaExclamation className="me-1" />
                    Bloqueado
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Renderizar filhos se aberto */}
        {temFilhos && aberto && (
          <div>
            {node.filhos.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // Validação dos campos
  const validarCampo = (nome, valor) => {
    let erro = "";

    switch (nome) {
      case "fkPerfil":
        if (!valor.trim()) {
          erro = "O perfil é obrigatório";
        } else {
          // Verificar se o perfil está inativo
          const perfilSelecionado = perfis.find(p => p.pkPerfil === parseInt(valor));
          if (perfilSelecionado && perfilSelecionado.estado !== 1) {
            erro = `O perfil "${perfilSelecionado.designacao}" está inativo. Não é possível atribuir funcionalidades a perfis inativos.`;
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

  // Validação das funcionalidades selecionadas - ATUALIZADA
  const validarFuncionalidades = () => {
    const errosFunc = [];
    
    if (funcionalidadesSelecionadas.length === 0) {
      errosFunc.push("Selecione pelo menos uma funcionalidade");
    }

    // Verificar se raiz está selecionada junto com outras funcionalidades
    if (raizEstaSelecionada() && funcionalidadesSelecionadas.length > 1) {
      errosFunc.push("A funcionalidade raiz 'Sistema PND - Plataforma Nacional de Denúncias' concede acesso a TODO o sistema e não pode ser atribuída em conjunto com outras funcionalidades.");
    }

    if (formData.fkPerfil) {
      const perfilId = parseInt(formData.fkPerfil);
      const funcionalidadesDuplicadas = funcionalidadesSelecionadas.filter(funcId => 
        associacaoJaExiste(funcId, perfilId)
      );

      if (funcionalidadesDuplicadas.length > 0) {
        const funcsDuplicadas = funcionalidades.filter(f => 
          funcionalidadesDuplicadas.includes(f.pkFuncionalidade)
        ).map(f => f.designacao);
        
        errosFunc.push(`As seguintes funcionalidades já estão atribuídas a este perfil: ${funcsDuplicadas.join(", ")}`);
      }
    }

    return errosFunc;
  };

  const validarFormulario = () => {
    const novosErros = {};
    Object.keys(formData).forEach((campo) => {
      const erro = validarCampo(campo, formData[campo]);
      if (erro) {
        novosErros[campo] = erro;
      }
    });

    // Validar funcionalidades
    const errosFunc = validarFuncionalidades();
    if (errosFunc.length > 0) {
      novosErros.funcionalidades = errosFunc.join("; ");
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  // Handle input com validação em tempo real
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Se mudar o perfil, limpar mensagens relacionadas a duplicidades
    if (name === "fkPerfil") {
      setMensagem(null);
    }

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

  // Verificar se pode enviar - ATUALIZADO
  const podeEnviar = () => {
    const validoBasico = 
      formData.fkPerfil.trim() !== "" &&
      funcionalidadesSelecionadas.length > 0 &&
      Object.keys(erros).length === 0 &&
      !loading &&
      !carregandoListas;
    
    // Validação adicional: se raiz está selecionada, não pode ter outras funcionalidades
    if (validoBasico && raizEstaSelecionada() && funcionalidadesSelecionadas.length > 1) {
      return false;
    }
    
    return validoBasico;
  };

  // CORREÇÃO CRÍTICA: Preparar dados para enviar (múltiplas funcionalidades)
  // O backend espera fkFuncionalidade, não fkFuncionalidadePai
  const prepararDadosParaEnviar = () => {
    const perfil = perfis.find(p => p.pkPerfil === parseInt(formData.fkPerfil));
    
    // Para cada funcionalidade selecionada, criar um objeto de associação
    const associacoes = funcionalidadesSelecionadas.map(funcId => {
      const funcionalidade = funcionalidades.find(f => f.pkFuncionalidade === funcId);
      
      return {
        // CORREÇÃO: Usar fkFuncionalidade (como o backend realmente espera)
        fkFuncionalidade: funcId, // IMPORTANTE: backend espera fkFuncionalidade, não fkFuncionalidadePai
        fkPerfil: parseInt(formData.fkPerfil),
        detalhe: formData.detalhe || "",
        nomePerfil: perfil?.designacao || "",
        nomeFuncionalidade: funcionalidade?.designacao || "",
        tipoFuncionalidade: funcionalidade?.designacaoTipoFuncionalidade || "",
        detalhePerfil: perfil?.descricao || "",
        detalheFuncionalidade: funcionalidade?.descricao || "",
        paiFuncionalidade: perfil?.designacao || "",
        estadoPerfil: perfil?.estado === 1 ? "ATIVO" : "INATIVO"
      };
    });

    console.log("Dados preparados para envio:", associacoes);
    return associacoes;
  };

  // Enviar múltiplas associações - COM CORREÇÃO
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensagem(null);

    // Marcar todos os campos como tocados
    setTouched({
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

    // Validação extra: se raiz está selecionada com outras funcionalidades
    if (raizEstaSelecionada() && funcionalidadesSelecionadas.length > 1) {
      setMensagem({
        tipo: "danger",
        texto: "❌ <strong>Erro de validação!</strong> A funcionalidade raiz 'Sistema PND - Plataforma Nacional de Denúncias' " +
               "concede acesso a TODO o sistema e não pode ser atribuída em conjunto com outras funcionalidades."
      });
      setLoading(false);
      return;
    }

    try {
      // Preparar dados no formato correto
      const associacoesParaEnviar = prepararDadosParaEnviar();
      
      // Enviar cada associação individualmente
      const resultados = [];
      const funcsNomes = funcionalidadesSelecionadas.map(id => 
        funcionalidades.find(f => f.pkFuncionalidade === id)?.designacao
      ).filter(Boolean);

      console.log(`Enviando ${associacoesParaEnviar.length} associações...`);

      for (const dados of associacoesParaEnviar) {
        console.log("Enviando associação:", dados);
        
        try {
          const response = await fetch(
            `${BASE_URL}/funcionalidade_perfil_cadastrar`,
            {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                "Accept": "application/json"
              },
              body: JSON.stringify(dados),
            }
          );

          let data;
          try {
            data = await response.json();
            console.log("Resposta do backend:", data);
          } catch (e) {
            data = { sucesso: false, mensagem: "Erro ao processar resposta" };
          }

          resultados.push({
            sucesso: response.ok && data.sucesso,
            mensagem: data.mensagem || data.erro || `Status: ${response.status}`,
            funcionalidade: dados.nomeFuncionalidade
          });

        } catch (fetchError) {
          console.error("Erro na requisição:", fetchError);
          resultados.push({
            sucesso: false,
            mensagem: "Erro de conexão",
            funcionalidade: dados.nomeFuncionalidade
          });
        }
      }

      // Analisar resultados
      const sucessos = resultados.filter(r => r.sucesso);
      const falhas = resultados.filter(r => !r.sucesso);

      if (falhas.length === 0) {
        // Todas as associações foram criadas com sucesso
        setMensagem({
          tipo: "success",
          texto: `✅ ${sucessos.length} funcionalidade(s) atribuída(s) ao perfil "${perfilSelecionado?.designacao}" com sucesso!`
        });
        
        // Atualizar lista de associações existentes
        const novasAssociacoes = associacoesParaEnviar.map(assoc => ({
          fkFuncionalidade: assoc.fkFuncionalidadePai, // Usar fkFuncionalidadePai como fkFuncionalidade
          fkPerfil: assoc.fkPerfil,
          nomeFuncionalidade: assoc.nomeFuncionalidade,
          nomePerfil: assoc.nomePerfil
        }));
        setAssociacoesExistentes(prev => [...prev, ...novasAssociacoes]);
        
        // Limpar formulário após sucesso SEM confirmação
        setTimeout(() => {
          limparFormularioSemConfirmacao();
        }, 2000);

      } else if (sucessos.length > 0 && falhas.length > 0) {
        // Algumas foram criadas, outras falharam
        const funcsSucesso = sucessos.map(s => s.funcionalidade).join(", ");
        const funcsFalha = falhas.map(f => f.funcionalidade).join(", ");
        
        setMensagem({
          tipo: "warning",
          texto: `⚠️ Resultado parcial: ${sucessos.length} funcionalidade(s) atribuída(s) com sucesso (${funcsSucesso}), mas ${falhas.length} falharam (${funcsFalha}).`
        });

        // Limpar apenas as funcionalidades que foram salvas com sucesso
        setFuncionalidadesSelecionadas(prev => 
          prev.filter(id => {
            const func = funcionalidades.find(f => f.pkFuncionalidade === id);
            return !sucessos.some(s => s.funcionalidade === func?.designacao);
          })
        );

      } else {
        // Todas falharam
        let mensagemErro = "❌ Erro ao atribuir funcionalidades: ";
        if (falhas.length === 1 && falhas[0].mensagem.toLowerCase().includes("duplic")) {
          mensagemErro = `❌ A funcionalidade "${falhas[0].funcionalidade}" já está atribuída a este perfil.`;
        } else if (falhas.length === 1 && falhas[0].mensagem.toLowerCase().includes("não encontrada")) {
          mensagemErro = `❌ ${falhas[0].mensagem}`;
        } else {
          mensagemErro += falhas.map(f => `${f.funcionalidade}: ${f.mensagem}`).join("; ");
        }
        
        setMensagem({
          tipo: "danger",
          texto: mensagemErro
        });
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

  // Componente para mostrar funcionalidades selecionadas - ATUALIZADO
  const FuncionalidadesSelecionadasComponent = () => {
    if (funcionalidadesSelecionadas.length === 0) return null;

    const funcsSelecionadas = funcionalidadesSelecionadas.map(id => 
      funcionalidades.find(f => f.pkFuncionalidade === id)
    ).filter(Boolean);

    const raizSelecionada = raizEstaSelecionada();

    return (
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <label className="form-label fw-bold d-flex align-items-center">
            <FaListOl className="me-2 text-primary" />
            Funcionalidades Selecionadas ({funcionalidadesSelecionadas.length})
            {raizSelecionada && (
              <span className="badge bg-danger ms-2">
                <FaLock className="me-1" />
                ACESSO TOTAL
              </span>
            )}
          </label>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={limparFuncionalidadesSelecionadas}
            disabled={loading}
          >
            <FaTimes className="me-1" />
            Limpar Todas
          </button>
        </div>
        
        {/* Mensagem especial quando raiz está selecionada */}
        {raizSelecionada && (
          <div className="alert alert-warning border-warning mb-3">
            <div className="d-flex align-items-center">
              <FaExclamationTriangle className="text-warning me-2" />
              <div>
                <strong>Atenção:</strong> A funcionalidade raiz <strong>"Sistema PND - Plataforma Nacional de Denúncias"</strong> foi selecionada.
                <br />
                <small className="text-muted">
                  Esta funcionalidade concede acesso a <strong>TODO o sistema</strong>. Nenhuma outra funcionalidade pode ser atribuída em conjunto.
                </small>
              </div>
            </div>
          </div>
        )}
        
        <div className="d-flex flex-wrap gap-2">
          {funcsSelecionadas.map(func => (
            <div 
              key={func.pkFuncionalidade}
              className={`badge p-3 d-flex align-items-center ${func.pkFuncionalidade === 1 ? 'bg-danger bg-gradient' : 'bg-primary bg-gradient'}`}
              style={{
                borderRadius: '8px',
                fontSize: '0.9rem',
                background: func.pkFuncionalidade === 1 
                  ? 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)' 
                  : 'linear-gradient(135deg, #6f42c1 0%, #d63384 100%)',
                cursor: 'pointer'
              }}
              onClick={() => removerFuncionalidade(func.pkFuncionalidade)}
            >
              <span className="me-2">
                {func.designacao}
                {func.pkFuncionalidade === 1 && (
                  <FaLock className="ms-1" size={12} />
                )}
              </span>
              <FaTimes 
                className="text-white ms-1"
                style={{ 
                  fontSize: '0.7rem',
                  cursor: 'pointer'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  removerFuncionalidade(func.pkFuncionalidade);
                }}
              />
            </div>
          ))}
        </div>
      </div>
    );
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
                    Atribuir Múltiplas Funcionalidades
                  </h4>
                  <p className="mb-0 text-white opacity-90" style={{ fontSize: '0.9rem' }}>
                    Associe uma ou mais funcionalidades aos perfis do sistema
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
                    borderLeft: `5px solid ${mensagem.tipo === 'success' ? '#28a745' : 
                      mensagem.tipo === 'warning' ? '#ffc107' : 
                      mensagem.tipo === 'info' ? '#0dcaf0' : '#dc3545'}`,
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
                          background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 152, 0, 0.1) 100%)'
                        }}>
                          <FaExclamationTriangle className="text-warning" />
                        </div>
                      ) : mensagem.tipo === 'info' ? (
                        <div className="p-2 rounded-circle" style={{
                          background: 'linear-gradient(135deg, rgba(13, 202, 240, 0.1) 0%, rgba(0, 123, 255, 0.1) 100%)'
                        }}>
                          <FaExclamationCircle className="text-info" />
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
                        {mensagem.tipo === 'success' ? '🎉 Sucesso!' : 
                         mensagem.tipo === 'warning' ? '⚠️ Atenção!' :
                         mensagem.tipo === 'info' ? 'ℹ️ Informação!' : '❌ Erro!'}
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
                        <FaExclamationTriangle className="me-1" />
                        {erros.fkPerfil}
                      </>
                    )}
                  </small>
                </div>

                {/* Campo Funcionalidades (Seletor Múltiplo) */}
                <div className="mb-4 position-relative">
                  <label className="form-label fw-bold d-flex align-items-center mb-3">
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
                      <span style={{ fontSize: '1.1rem' }}>Funcionalidades</span>
                      <div className="d-flex align-items-center mt-1">
                        <FaInfoCircle className="text-danger me-1" style={{ fontSize: '0.6rem' }} />
                        <small className="text-muted ms-1">Selecione uma ou mais funcionalidades</small>
                      </div>
                    </div>
                  </label>
                  
                  {/* Funcionalidades Selecionadas */}
                  <FuncionalidadesSelecionadasComponent />

                  {/* Botão para abrir/fechar o seletor */}
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-lg w-100 d-flex justify-content-between align-items-center"
                    onClick={() => setMostrarSeletorFunc(!mostrarSeletorFunc)}
                    style={{
                      borderRadius: '10px',
                      padding: '12px 15px',
                      border: '2px solid #e0e0e0',
                      background: 'white',
                      transition: 'all 0.3s ease'
                    }}
                    disabled={loading || carregandoListas}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.target.style.borderColor = '#6f42c1';
                        e.target.style.boxShadow = '0 0 0 3px rgba(111, 66, 193, 0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) {
                        e.target.style.borderColor = '#e0e0e0';
                        e.target.style.boxShadow = 'none';
                      }
                    }}
                  >
                    <span>
                      {funcionalidadesSelecionadas.length === 0 
                        ? 'Clique para selecionar funcionalidades...' 
                        : `${funcionalidadesSelecionadas.length} funcionalidade(s) selecionada(s)`}
                    </span>
                    {mostrarSeletorFunc ? <FaChevronUp /> : <FaChevronDown />}
                  </button>

                  <small className="text-danger fw-semibold d-block mt-2 d-flex align-items-center">
                    {erros.funcionalidades && (
                      <>
                        <FaExclamationTriangle className="me-1" />
                        {erros.funcionalidades}
                      </>
                    )}
                  </small>

                  {/* Seletor de Funcionalidades (Dropdown Hierárquico) */}
                  {mostrarSeletorFunc && (
                    <div className="card mt-3 border shadow-sm" style={{
                      borderRadius: '10px',
                      maxHeight: '400px',
                      overflow: 'hidden'
                    }}>
                      {/* Cabeçalho do seletor */}
                      <div className="card-header bg-light py-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="input-group" style={{ width: '70%' }}>
                            <span className="input-group-text bg-white border-end-0">
                              <FaSearch className="text-muted" />
                            </span>
                            <input
                              type="text"
                              className="form-control border-start-0"
                              placeholder="Buscar funcionalidades..."
                              value={filtroFunc}
                              onChange={(e) => setFiltroFunc(e.target.value)}
                              style={{ borderLeft: 'none' }}
                            />
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={toggleTodasFuncionalidades}
                            disabled={raizEstaSelecionada()}
                          >
                            {funcionalidadesSelecionadas.length === funcionalidadesFiltradas.length
                              ? 'Deselecionar Todas'
                              : 'Selecionar Todas'}
                          </button>
                        </div>
                      </div>

                      {/* Lista de funcionalidades hierárquica */}
                      <div className="card-body p-0" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {arvoreFuncionalidades.length === 0 ? (
                          <div className="text-center py-4 text-muted">
                            Nenhuma funcionalidade encontrada
                          </div>
                        ) : (
                          <div className="list-group list-group-flush">
                            {arvoreFuncionalidades.map(node => renderNode(node))}
                          </div>
                        )}
                      </div>

                      {/* Rodapé do seletor */}
                      <div className="card-footer bg-light py-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-muted">
                            {funcionalidadesFiltradas.length} funcionalidade(s) encontrada(s)
                          </small>
                          <small className="text-primary fw-bold">
                            {funcionalidadesSelecionadas.length} selecionada(s)
                            {raizEstaSelecionada() && (
                              <span className="badge bg-danger ms-1">
                                <FaLock size={10} /> RAÍZ
                              </span>
                            )}
                          </small>
                        </div>
                      </div>
                    </div>
                  )}
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
                          Salvar Associações ({funcionalidadesSelecionadas.length})
                        </>
                      )}
                    </button>

                    {/* Botão Limpar Tudo - AGORA FUNCIONANDO */}
                    <button
                      type="button"
                      className="btn btn-lg btn-outline-secondary px-5 py-3"
                      onClick={resetFormCompleto}
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
                      Limpar Tudo
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