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
  FaExclamation,
  FaArrowLeft
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

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

  const carregarDados = async () => {
    setCarregandoListas(true);
    setMensagem(null);
    
    try {
      const resFunc = await fetch(`${BASE_URL}/funcionalidade_listar`);
      if (!resFunc.ok) throw new Error(`Erro ao carregar funcionalidades: ${resFunc.status}`);
      const funcData = await resFunc.json();
      if (funcData.sucesso && funcData.dados) {
        setFuncionalidades(funcData.dados);
      } else {
        setFuncionalidades([]);
      }

      const resPerfis = await fetch(`${BASE_URL}/perfil_listar`);
      if (!resPerfis.ok) throw new Error(`Erro ao carregar perfis: ${resPerfis.status}`);
      const perfisData = await resPerfis.json();
      setPerfis(Array.isArray(perfisData) ? perfisData : []);

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

  const associacaoJaExiste = (fkFuncionalidade, fkPerfil) => {
    return associacoesExistentes.some(assoc => 
      assoc.fkFuncionalidade === parseInt(fkFuncionalidade) && 
      assoc.fkPerfil === parseInt(fkPerfil)
    );
  };

  const raizEstaSelecionada = () => funcionalidadesSelecionadas.includes(1);

  // CORREÇÃO: toggleFuncionalidade melhorado
  const toggleFuncionalidade = (funcId) => {
    const funcIdNum = parseInt(funcId);
    
    // Se clicou na raiz (ID 1)
    if (funcIdNum === 1) {
      // Se já está selecionada, desselecionar
      if (funcionalidadesSelecionadas.includes(1)) {
        setFuncionalidadesSelecionadas([]);
        setMensagem(null);
        return;
      }
      
      // Se não está selecionada, perguntar se quer selecionar
      if (funcionalidadesSelecionadas.length > 0) {
        const confirmar = window.confirm(
          "⚠️ ATENÇÃO!\n\n" +
          "A funcionalidade raiz 'Sistema PND - Plataforma Nacional de Denúncias' concede ACESSO TOTAL a TODO o sistema.\n\n" +
          "Ao selecioná-la, todas as outras funcionalidades selecionadas serão removidas.\n\n" +
          "Deseja continuar?"
        );
        if (!confirmar) return;
      }
      
      // Selecionar APENAS a raiz
      setFuncionalidadesSelecionadas([1]);
      setMensagem({
        tipo: "info",
        texto: "⚠️ <strong>Funcionalidade Raiz Selecionada!</strong><br/>" +
               "Ela concede acesso a <strong>TODO o sistema</strong>. O perfil terá acesso total a todas as funcionalidades."
      });
      return;
    }
    
    // Se raiz já está selecionada, não permite adicionar outras
    if (raizEstaSelecionada()) {
      setMensagem({
        tipo: "warning",
        texto: "❌ <strong>Operação não permitida!</strong><br/>" +
               "A funcionalidade raiz já está selecionada e concede acesso TOTAL ao sistema.<br/>" +
               "Remova a raiz primeiro se desejar atribuir outras funcionalidades específicas."
      });
      return;
    }
    
    // Caso normal: alternar seleção
    setFuncionalidadesSelecionadas(prev => {
      if (prev.includes(funcIdNum)) {
        return prev.filter(id => id !== funcIdNum);
      } else {
        return [...prev, funcIdNum];
      }
    });
  };

  const toggleExpansao = (funcId) => {
    const nova = new Set(funcionalidadesExpandidas);
    nova.has(funcId) ? nova.delete(funcId) : nova.add(funcId);
    setFuncionalidadesExpandidas(nova);
  };

  const toggleTodasFuncionalidades = () => {
    // Se raiz estiver selecionada, não permite selecionar todas
    if (raizEstaSelecionada()) {
      setMensagem({
        tipo: "warning",
        texto: "❌ A funcionalidade raiz já está selecionada. Remova-a primeiro se desejar selecionar outras."
      });
      return;
    }
    
    const idsFiltrados = funcionalidadesFiltradas.map(f => f.pkFuncionalidade);
    const raizNaLista = idsFiltrados.includes(1);
    
    // Se a lista filtrada contém a raiz, avisar
    if (raizNaLista && funcionalidadesSelecionadas.length !== idsFiltrados.length) {
      const confirmar = window.confirm(
        "⚠️ ATENÇÃO!\n\n" +
        "A lista inclui a funcionalidade raiz que concede ACESSO TOTAL.\n\n" +
        "Deseja selecionar APENAS a funcionalidade raiz (acesso total) ou continuar com a seleção atual?"
      );
      
      if (confirmar) {
        setFuncionalidadesSelecionadas([1]);
        setMensagem({
          tipo: "info",
          texto: "⚠️ Funcionalidade raiz selecionada! Concede acesso TOTAL ao sistema."
        });
      }
      return;
    }
    
    // Selecionar/deselecionar todas
    if (funcionalidadesSelecionadas.length === idsFiltrados.length) {
      setFuncionalidadesSelecionadas([]);
    } else {
      setFuncionalidadesSelecionadas(idsFiltrados.filter(id => id !== 1)); // Excluir raiz da seleção em massa
    }
  };

  const removerFuncionalidade = (funcId) => {
    setFuncionalidadesSelecionadas(prev => prev.filter(id => id !== funcId));
    if (funcId === 1) {
      setMensagem(null);
    }
  };

  const limparFuncionalidadesSelecionadas = () => {
    setFuncionalidadesSelecionadas([]);
    setMensagem(null);
  };

  const resetFormCompleto = () => {
    const temDadosParaLimpar = 
      formData.fkPerfil !== "" || 
      formData.detalhe !== "" || 
      funcionalidadesSelecionadas.length > 0;
    
    if (temDadosParaLimpar) {
      const confirmar = window.confirm("Tem certeza que deseja limpar todo o formulário? Todos os dados serão perdidos.");
      if (!confirmar) return;
    }
    
    setFormData({ fkPerfil: "", detalhe: "" });
    setFuncionalidadesSelecionadas([]);
    setFiltroFunc("");
    setErros({});
    setTouched({});
    setMostrarSeletorFunc(false);
    setFuncionalidadesExpandidas(new Set());
    setMensagem(null);
  };

  const limparFormularioSemConfirmacao = () => {
    setFormData({ fkPerfil: "", detalhe: "" });
    setFuncionalidadesSelecionadas([]);
    setFiltroFunc("");
    setErros({});
    setTouched({});
    setMostrarSeletorFunc(false);
    setFuncionalidadesExpandidas(new Set());
    setMensagem(null);
  };

  const funcionalidadesFiltradas = filtroFunc 
    ? funcionalidades.filter(f => 
        f.designacao.toLowerCase().includes(filtroFunc.toLowerCase()) ||
        (f.descricao && f.descricao.toLowerCase().includes(filtroFunc.toLowerCase()))
      )
    : funcionalidades;

  const construirArvore = () => {
    const map = new Map();
    const raiz = [];
    
    funcionalidadesFiltradas.forEach(item => {
      map.set(item.pkFuncionalidade, {
        ...item,
        filhos: [],
        nivel: 0,
        temFilhos: false
      });
    });
    
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

  const renderNode = (node, depth = 0) => {
    const temFilhos = node.filhos && node.filhos.length > 0;
    const aberto = funcionalidadesExpandidas.has(node.pkFuncionalidade);
    const estaSelecionada = funcionalidadesSelecionadas.includes(node.pkFuncionalidade);
    const jaAssociada = formData.fkPerfil 
      ? associacaoJaExiste(node.pkFuncionalidade, formData.fkPerfil)
      : false;
    const eRaiz = node.pkFuncionalidade === 1;
    const podeSerSelecionada = !jaAssociada && (eRaiz || !raizEstaSelecionada());

    return (
      <motion.div 
        key={node.pkFuncionalidade}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
        style={{ marginLeft: `${depth * 24}px`, marginBottom: '4px' }}
      >
        <div 
          style={{
            padding: '12px 15px',
            cursor: podeSerSelecionada ? 'pointer' : 'not-allowed',
            opacity: podeSerSelecionada ? 1 : 0.6,
            borderLeft: estaSelecionada ? '3px solid #D4AF37' : '3px solid transparent',
            background: estaSelecionada ? 'linear-gradient(135deg, rgba(212,175,55,0.05), rgba(212,175,55,0.02))' : 'white',
            borderBottom: '1px solid #f0f0f0',
            transition: 'all 0.2s ease'
          }}
          onClick={(e) => {
            if (podeSerSelecionada && !e.target.closest('.func-checkbox') && !e.target.closest('.func-expand')) {
              toggleFuncionalidade(node.pkFuncionalidade);
            }
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {/* Ícone de expansão */}
            <div style={{ width: '34px', display: 'flex', alignItems: 'center' }}>
              {temFilhos && (
                <button
                  type="button"
                  className="func-expand"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpansao(node.pkFuncionalidade);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {aberto ? (
                    <FaChevronDown size={12} style={{ color: '#D4AF37' }} />
                  ) : (
                    <FaChevronRight size={12} style={{ color: '#999' }} />
                  )}
                </button>
              )}
            </div>

            {/* Checkbox */}
            <div className="func-checkbox" style={{ marginRight: '12px' }} onClick={(e) => e.stopPropagation()}>
              {jaAssociada ? (
                <FaCheckSquare style={{ color: '#10b981', fontSize: '18px' }} />
              ) : estaSelecionada ? (
                <FaCheckSquare 
                  style={{ color: '#D4AF37', fontSize: '18px', cursor: podeSerSelecionada ? 'pointer' : 'not-allowed' }} 
                  onClick={() => podeSerSelecionada && toggleFuncionalidade(node.pkFuncionalidade)}
                />
              ) : (
                <FaSquare 
                  style={{ color: podeSerSelecionada ? '#D4AF37' : '#ccc', fontSize: '18px', cursor: podeSerSelecionada ? 'pointer' : 'not-allowed' }} 
                  onClick={() => podeSerSelecionada && toggleFuncionalidade(node.pkFuncionalidade)}
                />
              )}
            </div>

            {/* Ícone */}
            <div style={{ marginRight: '12px' }}>
              {eRaiz ? (
                <FaLock style={{ color: '#ef4444', fontSize: '16px' }} />
              ) : temFilhos ? (
                aberto ? <FaFolderOpen style={{ color: '#D4AF37', fontSize: '16px' }} /> : <FaFolder style={{ color: '#D4AF37', fontSize: '16px' }} />
              ) : (
                <FaFolder style={{ color: '#999', fontSize: '16px' }} />
              )}
            </div>

            {/* Conteúdo */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <strong style={{ fontSize: '14px', color: '#333' }}>{node.designacao}</strong>
                {eRaiz && (
                  <span style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: '600' }}>
                    ACESSO TOTAL
                  </span>
                )}
                {node.designacaoTipoFuncionalidade && !eRaiz && (
                  <span style={{ background: 'rgba(212,175,55,0.1)', color: '#D4AF37', padding: '2px 8px', borderRadius: '12px', fontSize: '10px' }}>
                    {node.designacaoTipoFuncionalidade}
                  </span>
                )}
              </div>
              {node.descricao && (
                <small style={{ color: '#999', fontSize: '11px', display: 'block', marginTop: '4px' }}>{node.descricao}</small>
              )}
              {jaAssociada && (
                <span style={{ background: '#10b981', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', marginTop: '4px', display: 'inline-block' }}>
                  Já atribuída
                </span>
              )}
            </div>
          </div>
        </div>

        {temFilhos && aberto && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {node.filhos.map(child => renderNode(child, depth + 1))}
          </motion.div>
        )}
      </motion.div>
    );
  };

  const validarCampo = (nome, valor) => {
    let erro = "";
    switch (nome) {
      case "fkPerfil":
        if (!valor.trim()) erro = "O perfil é obrigatório";
        else {
          const perfilSelecionado = perfis.find(p => p.pkPerfil === parseInt(valor));
          if (perfilSelecionado && perfilSelecionado.estado !== 1) {
            erro = `O perfil "${perfilSelecionado.designacao}" está inativo.`;
          }
        }
        break;
      case "detalhe":
        if (valor && valor.length > 500) erro = "O detalhe não pode exceder 500 caracteres";
        break;
      default: break;
    }
    return erro;
  };

  const validarFuncionalidades = () => {
    const errosFunc = [];
    if (funcionalidadesSelecionadas.length === 0) {
      errosFunc.push("Selecione pelo menos uma funcionalidade");
    }
    if (raizEstaSelecionada() && funcionalidadesSelecionadas.length > 1) {
      errosFunc.push("A funcionalidade raiz concede acesso TOTAL e não pode ser atribuída em conjunto com outras.");
    }
    if (formData.fkPerfil) {
      const perfilId = parseInt(formData.fkPerfil);
      const funcionalidadesDuplicadas = funcionalidadesSelecionadas.filter(funcId => associacaoJaExiste(funcId, perfilId));
      if (funcionalidadesDuplicadas.length > 0) {
        const funcsDuplicadas = funcionalidades.filter(f => funcionalidadesDuplicadas.includes(f.pkFuncionalidade)).map(f => f.designacao);
        errosFunc.push(`Funcionalidades já atribuídas: ${funcsDuplicadas.join(", ")}`);
      }
    }
    return errosFunc;
  };

  const validarFormulario = () => {
    const novosErros = {};
    Object.keys(formData).forEach(campo => {
      const erro = validarCampo(campo, formData[campo]);
      if (erro) novosErros[campo] = erro;
    });
    const errosFunc = validarFuncionalidades();
    if (errosFunc.length > 0) novosErros.funcionalidades = errosFunc.join("; ");
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === "fkPerfil") setMensagem(null);
    if (touched[name]) {
      const erro = validarCampo(name, value);
      setErros(prev => erro ? { ...prev, [name]: erro } : { ...prev, [name]: undefined });
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const erro = validarCampo(name, formData[name]);
    setErros(prev => erro ? { ...prev, [name]: erro } : { ...prev, [name]: undefined });
  };

  const podeEnviar = () => {
    const validoBasico = formData.fkPerfil.trim() !== "" &&
      funcionalidadesSelecionadas.length > 0 &&
      !Object.keys(erros).some(k => erros[k]) &&
      !loading &&
      !carregandoListas;
    if (validoBasico && raizEstaSelecionada() && funcionalidadesSelecionadas.length > 1) return false;
    return validoBasico;
  };

  // CORREÇÃO CRÍTICA: Preparar dados para enviar - Garantir que a raiz seja enviada corretamente
  const prepararDadosParaEnviar = () => {
    const perfil = perfis.find(p => p.pkPerfil === parseInt(formData.fkPerfil));
    
    return funcionalidadesSelecionadas.map(funcId => {
      const funcionalidade = funcionalidades.find(f => f.pkFuncionalidade === funcId);
      const eRaiz = funcId === 1;
      
      return {
        fkFuncionalidade: funcId,
        fkPerfil: parseInt(formData.fkPerfil),
        detalhe: formData.detalhe || "",
        nomePerfil: perfil?.designacao || "",
        nomeFuncionalidade: funcionalidade?.designacao || "",
        tipoFuncionalidade: funcionalidade?.designacaoTipoFuncionalidade || "",
        detalhePerfil: perfil?.descricao || "",
        detalheFuncionalidade: funcionalidade?.descricao || "",
        estadoPerfil: perfil?.estado === 1 ? "ATIVO" : "INATIVO",
        isRaiz: eRaiz  // Marcar se é a funcionalidade raiz
      };
    });
  };

  // CORREÇÃO: handleSubmit melhorado para garantir envio da raiz
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensagem(null);
    setTouched({ fkPerfil: true, detalhe: true });

    if (!validarFormulario()) {
      setMensagem({ tipo: "danger", texto: "❌ Corrija os erros no formulário antes de enviar." });
      setLoading(false);
      return;
    }

    const perfilSelecionado = perfis.find(p => p.pkPerfil === parseInt(formData.fkPerfil));
    if (perfilSelecionado && perfilSelecionado.estado !== 1) {
      setMensagem({ tipo: "danger", texto: `❌ O perfil "${perfilSelecionado.designacao}" está inativo.` });
      setLoading(false);
      return;
    }

    if (raizEstaSelecionada() && funcionalidadesSelecionadas.length > 1) {
      setMensagem({ tipo: "danger", texto: "❌ A funcionalidade raiz não pode ser atribuída em conjunto com outras." });
      setLoading(false);
      return;
    }

    try {
      const associacoesParaEnviar = prepararDadosParaEnviar();
      console.log("Enviando associações:", associacoesParaEnviar);
      
      const resultados = [];

      for (const dados of associacoesParaEnviar) {
        try {
          console.log(`Enviando${dados.isRaiz ? ' (RAIZ)' : ''}:`, dados);
          
          const response = await fetch(`${BASE_URL}/funcionalidade_perfil_cadastrar`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify(dados),
          });
          
          let data;
          try { 
            data = await response.json(); 
            console.log("Resposta:", data);
          } catch (e) { 
            data = { sucesso: false, mensagem: "Erro ao processar resposta" }; 
          }
          
          resultados.push({ 
            sucesso: response.ok && data.sucesso, 
            mensagem: data.mensagem || data.erro || (response.ok ? "Sucesso" : "Erro"),
            funcionalidade: dados.nomeFuncionalidade,
            isRaiz: dados.isRaiz
          });
          
        } catch (fetchError) {
          console.error("Erro na requisição:", fetchError);
          resultados.push({ 
            sucesso: false, 
            mensagem: "Erro de conexão", 
            funcionalidade: dados.nomeFuncionalidade,
            isRaiz: dados.isRaiz
          });
        }
      }

      const sucessos = resultados.filter(r => r.sucesso);
      const falhas = resultados.filter(r => !r.sucesso);
      
      const sucessoRaiz = sucessos.some(r => r.isRaiz);
      const falhaRaiz = falhas.some(r => r.isRaiz);

      if (falhas.length === 0) {
        let mensagemSucesso = `✅ ${sucessos.length} funcionalidade(s) atribuída(s) com sucesso!`;
        if (sucessoRaiz) {
          mensagemSucesso = `✅ Funcionalidade RAIZ atribuída com sucesso! O perfil "${perfilSelecionado?.designacao}" agora tem ACESSO TOTAL ao sistema.`;
        }
        setMensagem({ tipo: "success", texto: mensagemSucesso });
        
        // Atualizar lista de associações existentes
        const novasAssociacoes = associacoesParaEnviar.map(assoc => ({
          fkFuncionalidade: assoc.fkFuncionalidade,
          fkPerfil: assoc.fkPerfil,
          nomeFuncionalidade: assoc.nomeFuncionalidade,
          nomePerfil: assoc.nomePerfil
        }));
        setAssociacoesExistentes(prev => [...prev, ...novasAssociacoes]);
        
        setTimeout(() => limparFormularioSemConfirmacao(), 2000);
        
      } else if (sucessos.length > 0) {
        let mensagemParcial = `⚠️ ${sucessos.length} sucesso(s), ${falhas.length} falha(s).`;
        if (falhaRaiz) {
          mensagemParcial = `⚠️ ERRO CRÍTICO: Não foi possível atribuir a funcionalidade RAIZ. Verifique se o backend está configurado corretamente.`;
        }
        setMensagem({ tipo: "warning", texto: mensagemParcial });
        
        // Remover apenas as que foram salvas com sucesso
        setFuncionalidadesSelecionadas(prev => prev.filter(id => {
          const func = funcionalidades.find(f => f.pkFuncionalidade === id);
          return !sucessos.some(s => s.funcionalidade === func?.designacao);
        }));
        
      } else {
        let mensagemErro = `❌ Erro ao atribuir: ${falhas.map(f => `${f.funcionalidade}: ${f.mensagem}`).join("; ")}`;
        if (falhaRaiz) {
          mensagemErro = `❌ ERRO: Não foi possível atribuir a funcionalidade RAIZ ao perfil. Verifique se o backend está rodando e se a API está correta.`;
        }
        setMensagem({ tipo: "danger", texto: mensagemErro });
      }
      
    } catch (error) {
      console.error("Erro completo:", error);
      setMensagem({ tipo: "danger", texto: "❌ Erro de comunicação com o servidor." });
    } finally {
      setLoading(false);
    }
  };

  const FuncionalidadesSelecionadasComponent = () => {
    if (funcionalidadesSelecionadas.length === 0) return null;
    const funcsSelecionadas = funcionalidadesSelecionadas.map(id => funcionalidades.find(f => f.pkFuncionalidade === id)).filter(Boolean);
    const raizSelecionada = raizEstaSelecionada();

    return (
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#D4AF37', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaListOl /> Funcionalidades Selecionadas ({funcionalidadesSelecionadas.length})
            {raizSelecionada && <span style={{ background: '#ef4444', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: '600' }}>ACESSO TOTAL</span>}
          </label>
          <button onClick={limparFuncionalidadesSelecionadas} style={{ padding: '4px 12px', background: 'transparent', border: '1px solid #ef4444', borderRadius: '20px', color: '#ef4444', fontSize: '11px', cursor: 'pointer' }}>Limpar Todas</button>
        </div>
        {raizSelecionada && (
          <div style={{ background: 'rgba(239,68,68,0.1)', borderLeft: '3px solid #ef4444', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaLock style={{ color: '#ef4444' }} />
              <div>
                <strong style={{ color: '#ef4444' }}>ACESSO TOTAL AO SISTEMA</strong>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#666' }}>O perfil terá acesso a todas as funcionalidades do sistema.</p>
              </div>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {funcsSelecionadas.map(func => (
            <div key={func.pkFuncionalidade} onClick={() => removerFuncionalidade(func.pkFuncionalidade)} style={{
              background: func.pkFuncionalidade === 1 ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #D4AF37, #FFE55C)',
              color: func.pkFuncionalidade === 1 ? 'white' : '#000',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}>
              <span>{func.designacao}</span>
              <FaTimes size={10} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (carregandoListas) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <FaSpinner style={{ fontSize: '48px', color: '#D4AF37', animation: 'spin 1s linear infinite' }} />
          <h5 style={{ marginTop: '16px', color: '#333' }}>Carregando dados...</h5>
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
          <FaUserCog style={{ fontSize: '2rem', color: '#D4AF37' }} />
        </div>
        <h1 style={{ color: '#D4AF37', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>Atribuir Funcionalidades</h1>
        <p style={{ color: '#aaa', marginTop: '0.5rem' }}>Associe funcionalidades aos perfis do sistema</p>
      </div>

      <div style={{ maxWidth: '900px', margin: '-40px auto 0', padding: '2rem' }}>
        {/* Mensagens */}
        <AnimatePresence>
          {mensagem && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ marginBottom: '1.5rem' }}>
              <div style={{
                background: mensagem.tipo === 'success' ? '#10b981' : mensagem.tipo === 'warning' ? '#f59e0b' : mensagem.tipo === 'info' ? '#0ea5e9' : '#ef4444',
                color: 'white',
                padding: '16px 20px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {mensagem.tipo === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
                  <span dangerouslySetInnerHTML={{ __html: mensagem.texto }} />
                </div>
                <button onClick={() => setMensagem(null)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' }}>×</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card Principal */}
        <div style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
          
          {/* Header do Card */}
          <div style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)', padding: '20px 28px', borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ background: 'rgba(212,175,55,0.15)', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaCogs style={{ fontSize: '24px', color: '#D4AF37' }} />
              </div>
              <div>
                <h4 style={{ margin: 0, color: '#D4AF37', fontWeight: '700' }}>Nova Associação</h4>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#aaa' }}>Preencha os dados abaixo</p>
              </div>
            </div>
          </div>

          <div style={{ padding: '28px' }}>
            <form onSubmit={handleSubmit} noValidate>
              
              {/* Campo Perfil */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '14px' }}>
                  <FaUsers style={{ marginRight: '8px', color: '#D4AF37' }} /> Perfil *
                </label>
                <select
                  name="fkPerfil"
                  value={formData.fkPerfil}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: erros.fkPerfil ? '2px solid #ef4444' : '2px solid #e0e0e0',
                    fontSize: '14px',
                    transition: 'all 0.2s ease',
                    background: 'white'
                  }}
                >
                  <option value="">Selecione um perfil...</option>
                  {perfis.map(p => (
                    <option key={p.pkPerfil} value={p.pkPerfil}>
                      {p.designacao} {p.estado === 1 ? '(ATIVO)' : '(INATIVO)'}
                    </option>
                  ))}
                </select>
                {erros.fkPerfil && <small style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{erros.fkPerfil}</small>}
              </div>

              {/* Funcionalidades Selecionadas */}
              <FuncionalidadesSelecionadasComponent />

              {/* Botão Selecionar Funcionalidades */}
              <div style={{ marginBottom: '24px' }}>
                <button
                  type="button"
                  onClick={() => setMostrarSeletorFunc(!mostrarSeletorFunc)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'white',
                    border: `2px solid ${erros.funcionalidades ? '#ef4444' : '#D4AF37'}`,
                    borderRadius: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    color: erros.funcionalidades ? '#ef4444' : '#D4AF37'
                  }}
                >
                  <span><FaCogs style={{ marginRight: '8px' }} /> {funcionalidadesSelecionadas.length === 0 ? 'Selecionar Funcionalidades' : `${funcionalidadesSelecionadas.length} funcionalidade(s) selecionada(s)`}</span>
                  {mostrarSeletorFunc ? <FaChevronUp /> : <FaChevronDown />}
                </button>
                {erros.funcionalidades && <small style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{erros.funcionalidades}</small>}
              </div>

              {/* Seletor de Funcionalidades */}
              <AnimatePresence>
                {mostrarSeletorFunc && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ marginBottom: '24px', overflow: 'hidden' }}>
                    <div style={{ border: '1px solid #e0e0e0', borderRadius: '16px', overflow: 'hidden' }}>
                      <div style={{ padding: '16px', background: '#f8f9fa', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                        <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', background: 'white', borderRadius: '30px', padding: '4px 12px', border: '1px solid #e0e0e0' }}>
                          <FaSearch style={{ color: '#D4AF37', marginRight: '8px' }} />
                          <input
                            type="text"
                            placeholder="Buscar funcionalidades..."
                            value={filtroFunc}
                            onChange={(e) => setFiltroFunc(e.target.value)}
                            style={{ flex: 1, padding: '8px 0', border: 'none', outline: 'none', background: 'transparent' }}
                          />
                        </div>
                        <button onClick={toggleTodasFuncionalidades} style={{ padding: '6px 16px', background: 'transparent', border: '1px solid #D4AF37', borderRadius: '20px', color: '#D4AF37', fontSize: '12px', cursor: 'pointer' }}>
                          {funcionalidadesSelecionadas.length === funcionalidadesFiltradas.length ? 'Deselecionar Todas' : 'Selecionar Todas'}
                        </button>
                      </div>
                      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {arvoreFuncionalidades.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>Nenhuma funcionalidade encontrada</div>
                        ) : (
                          arvoreFuncionalidades.map(node => renderNode(node))
                        )}
                      </div>
                      <div style={{ padding: '12px 16px', background: '#f8f9fa', borderTop: '1px solid #e0e0e0', fontSize: '12px', color: '#666' }}>
                        {funcionalidadesFiltradas.length} funcionalidade(s) | {funcionalidadesSelecionadas.length} selecionada(s)
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Campo Detalhe */}
              <div style={{ marginBottom: '28px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '14px' }}>
                  <FaAlignLeft style={{ marginRight: '8px', color: '#D4AF37' }} /> Detalhe (opcional)
                </label>
                <textarea
                  name="detalhe"
                  value={formData.detalhe}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  rows="3"
                  placeholder="Informações adicionais sobre esta associação..."
                  maxLength="500"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: erros.detalhe ? '2px solid #ef4444' : '2px solid #e0e0e0',
                    fontSize: '14px',
                    resize: 'vertical',
                    transition: 'all 0.2s ease',
                    fontFamily: 'inherit'
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                  {erros.detalhe && <small style={{ color: '#ef4444' }}>{erros.detalhe}</small>}
                  <small style={{ color: '#999', marginLeft: 'auto' }}>{formData.detalhe.length}/500 caracteres</small>
                </div>
              </div>

              {/* Botões */}
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  style={{
                    padding: '12px 28px',
                    background: 'transparent',
                    border: '2px solid #D4AF37',
                    borderRadius: '50px',
                    color: '#D4AF37',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <FaArrowLeft /> Voltar
                </button>
                <button
                  type="submit"
                  disabled={!podeEnviar()}
                  style={{
                    padding: '12px 32px',
                    background: 'linear-gradient(135deg, #D4AF37, #FFE55C)',
                    border: 'none',
                    borderRadius: '50px',
                    color: '#000',
                    fontWeight: '700',
                    cursor: podeEnviar() ? 'pointer' : 'not-allowed',
                    opacity: podeEnviar() ? 1 : 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    minWidth: '200px',
                    justifyContent: 'center'
                  }}
                >
                  {loading ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : <FaSave />}
                  {loading ? 'Salvando...' : `Salvar (${funcionalidadesSelecionadas.length})`}
                </button>
                <button
                  type="button"
                  onClick={resetFormCompleto}
                  disabled={loading}
                  style={{
                    padding: '12px 28px',
                    background: 'white',
                    border: '2px solid #ccc',
                    borderRadius: '50px',
                    color: '#666',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <FaTimes /> Limpar
                </button>
              </div>
            </form>
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