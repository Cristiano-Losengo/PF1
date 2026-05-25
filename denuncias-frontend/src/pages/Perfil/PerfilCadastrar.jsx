import { useState, useEffect, useCallback } from "react";
import { 
  FaUserPlus, FaSave, FaSpinner, FaCheckCircle, FaEdit, FaArrowLeft,
  FaTag, FaToggleOn, FaToggleOff, FaAlignLeft, FaTimes, FaShareAlt
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
  const [modoEdicao, setModoEdicao] = useState(false);
  const [perfilId, setPerfilId] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [perfisDisponiveis, setPerfisDisponiveis] = useState([]);
  const [perfisSelecionadosHeranca, setPerfisSelecionadosHeranca] = useState([]);
  const [carregandoPerfis, setCarregandoPerfis] = useState(false);

  const [formData, setFormData] = useState({
    designacao: "",
    estado: "1",
    descricao: "",
  });

  const regexDesignacao = /^[a-zA-ZÀ-ÿ\s\-']+$/;
  const regexDescricao = /^[a-zA-ZÀ-ÿ0-9\s\-',.!?]*$/;

  const carregarPerfisParaHeranca = async () => {
    setCarregandoPerfis(true);
    try {
      const response = await fetch(`${BASE_URL}/perfil_listar`);
      const data = await response.json();
      const perfis = Array.isArray(data) ? data : data.dados || [];
      setPerfisDisponiveis(perfis.filter(p => !modoEdicao || p.pkPerfil !== perfilId));
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setCarregandoPerfis(false);
    }
  };

  const togglePerfilHeranca = (id) => {
    setPerfisSelecionadosHeranca(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    const carregarEdicao = async () => {
      if (location.state?.modoEdicao) {
        setCarregando(true);
        setModoEdicao(true);
        try {
          const perfil = location.state?.perfil;
          if (perfil) {
            setPerfilId(perfil.pkPerfil);
            setFormData({
              designacao: perfil.designacao || "",
              estado: perfil.estado?.toString() || "1",
              descricao: perfil.descricao || "",
            });
          }
        } catch (error) {
          setMensagem({ tipo: "danger", texto: "❌ Erro ao carregar perfil" });
        } finally {
          setCarregando(false);
        }
      }
    };
    carregarEdicao();
    carregarPerfisParaHeranca();
  }, [location.state]);

  const validarCampo = (nome, valor) => {
    const v = valor?.trim() || "";
    switch (nome) {
      case "designacao":
        if (!v) return "Designação é obrigatória";
        if (v.length < 3) return "Mínimo 3 caracteres";
        if (v.length > 50) return "Máximo 50 caracteres";
        if (!regexDesignacao.test(v)) return "Não pode conter números ou especiais";
        return null;
      case "estado":
        return !v ? "Estado é obrigatório" : null;
      case "descricao":
        if (v && v.length > 200) return "Máximo 200 caracteres";
        if (v && !regexDescricao.test(v)) return "Caracteres inválidos";
        return null;
      default: return null;
    }
  };

  const validarFormulario = () => {
    const novos = {};
    Object.keys(formData).forEach(k => {
      const erro = validarCampo(k, formData[k]);
      if (erro) novos[k] = erro;
    });
    setErros(novos);
    return Object.keys(novos).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let final = value;
    if (name === "designacao" && value.length > 50) final = value.slice(0, 50);
    if (name === "descricao" && value.length > 200) final = value.slice(0, 200);
    setFormData(prev => ({ ...prev, [name]: final }));
    const erro = validarCampo(name, final);
    if (erro) setErros(prev => ({ ...prev, [name]: erro }));
    else setErros(prev => { const newE = { ...prev }; delete newE[name]; return newE; });
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const erro = validarCampo(name, value);
    if (erro) setErros(prev => ({ ...prev, [name]: erro }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTouched({ designacao: true, estado: true, descricao: true });

    if (!validarFormulario()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const dados = {
        designacao: formData.designacao.trim(),
        estado: parseInt(formData.estado),
        descricao: formData.descricao?.trim() || "",
        herdarDePerfis: perfisSelecionadosHeranca
      };

      const url = modoEdicao ? `${BASE_URL}/perfil_editar/${perfilId}` : `${BASE_URL}/perfil_cadastrar`;
      const method = modoEdicao ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });

      const data = await response.json();

      if (response.ok && data.sucesso) {
        setMensagem({ tipo: "success", texto: modoEdicao ? "✅ Perfil atualizado!" : `✅ Perfil salvo! Herdou ${perfisSelecionadosHeranca.length} perfil(is)` });
        setTimeout(() => {
          if (modoEdicao) navigate('/seguranca/perfis/listar');
          else {
            setFormData({ designacao: "", estado: "1", descricao: "" });
            setPerfisSelecionadosHeranca([]);
          }
        }, 2000);
      } else {
        setMensagem({ tipo: "danger", texto: `❌ ${data.mensagem || "Erro ao salvar"}` });
      }
    } catch (error) {
      setMensagem({ tipo: "danger", texto: "❌ Erro de comunicação" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    if (modoEdicao) {
      if (!window.confirm("Descartar alterações?")) return;
      const original = location.state?.perfil;
      if (original) setFormData({
        designacao: original.designacao || "",
        estado: original.estado?.toString() || "1",
        descricao: original.descricao || "",
      });
    } else {
      setFormData({ designacao: "", estado: "1", descricao: "" });
      setPerfisSelecionadosHeranca([]);
    }
    setErros({});
    setTouched({});
    setMensagem(null);
  };

  const voltarParaLista = () => navigate('/seguranca/perfis/listar');

  if (carregando) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '50px', height: '50px', border: '4px solid #D4AF37', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: "'Inter', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {/* Hero Section */}
      <div style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)', padding: '2rem 1rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', background: 'rgba(212,175,55,0.15)', marginBottom: '1rem' }}>
          {modoEdicao ? <FaEdit style={{ fontSize: '2rem', color: '#D4AF37' }} /> : <FaUserPlus style={{ fontSize: '2rem', color: '#D4AF37' }} />}
        </div>
        <h1 style={{ color: '#D4AF37', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{modoEdicao ? "Editar Perfil" : "Cadastrar Perfil"}</h1>
        <p style={{ color: '#aaa', marginTop: '0.5rem' }}>{modoEdicao ? "Modifique as informações deste perfil" : "Crie um novo perfil para o sistema"}</p>
      </div>

      <div style={{ maxWidth: '600px', margin: '-40px auto 0', padding: '2rem' }}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
          
          {mensagem && (
            <div style={{ padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', background: mensagem.tipo === 'success' ? '#d1fae5' : '#fee2e2', color: mensagem.tipo === 'success' ? '#065f46' : '#991b1b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {mensagem.tipo === 'success' ? <FaCheckCircle /> : <FaTimes />}
                <span>{mensagem.texto}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Designação */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}><FaTag style={{ color: '#D4AF37' }} /> Designação *</label>
              <input type="text" name="designacao" value={formData.designacao} onChange={handleChange} onBlur={handleBlur}
                placeholder="Ex: Administrador, Usuário..." maxLength={50}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: `2px solid ${erros.designacao ? '#ef4444' : '#e5e7eb'}`, outline: 'none' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                <small style={{ color: '#ef4444' }}>{erros.designacao}</small>
                <small style={{ color: '#666' }}>{formData.designacao.length}/50</small>
              </div>
            </div>

            {/* Estado */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                {formData.estado === "1" ? <FaToggleOn style={{ color: '#10b981' }} /> : <FaToggleOff />} Estado *
              </label>
              <select name="estado" value={formData.estado} onChange={handleChange} onBlur={handleBlur}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: `2px solid ${erros.estado ? '#ef4444' : '#e5e7eb'}`, background: 'white' }}>
                <option value="1">✅ Ativo</option>
                <option value="0">❌ Inativo</option>
              </select>
              <small style={{ color: '#ef4444' }}>{erros.estado}</small>
            </div>

            {/* Descrição */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}><FaAlignLeft /> Descrição</label>
              <textarea name="descricao" value={formData.descricao} onChange={handleChange} onBlur={handleBlur}
                rows="3" maxLength={200} placeholder="Descrição opcional..."
                style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: `2px solid ${erros.descricao ? '#ef4444' : '#e5e7eb'}`, resize: 'vertical', outline: 'none' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                <small style={{ color: '#ef4444' }}>{erros.descricao}</small>
                <small style={{ color: '#666' }}>{formData.descricao.length}/200</small>
              </div>
            </div>

            {/* Herança */}
            {!modoEdicao && perfisDisponiveis.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}><FaShareAlt style={{ color: '#D4AF37' }} /> Herdar Funcionalidades</label>
                <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1rem', maxHeight: '150px', overflowY: 'auto' }}>
                  {carregandoPerfis ? (
                    <div style={{ textAlign: 'center' }}><FaSpinner className="fa-spin" /> Carregando...</div>
                  ) : (
                    perfisDisponiveis.map(p => (
                      <div key={p.pkPerfil} style={{ marginBottom: '0.5rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                          <input type="checkbox" checked={perfisSelecionadosHeranca.includes(p.pkPerfil)} onChange={() => togglePerfilHeranca(p.pkPerfil)} />
                          <strong>{p.designacao}</strong>
                          {p.descricao && <small style={{ color: '#666' }}>({p.descricao.substring(0, 50)})</small>}
                        </label>
                      </div>
                    ))
                  )}
                </div>
                {perfisSelecionadosHeranca.length > 0 && (
                  <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#dbeafe', borderRadius: '8px', fontSize: '0.75rem' }}>
                    ℹ️ Serão herdadas funcionalidades de {perfisSelecionadosHeranca.length} perfil(is)
                  </div>
                )}
              </div>
            )}

            {/* Botões */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button onClick={voltarParaLista} style={{ padding: '0.75rem 1.5rem', borderRadius: '50px', border: '2px solid #D4AF37', background: 'transparent', color: '#D4AF37', fontWeight: 'bold', cursor: 'pointer' }}>
                <FaArrowLeft /> Voltar
              </button>
              <button type="submit" disabled={!formData.designacao.trim() || isSubmitting} style={{ flex: 1, padding: '0.75rem', borderRadius: '50px', border: 'none', background: 'linear-gradient(135deg, #D4AF37, #FFE55C)', color: '#000', fontWeight: 'bold', cursor: 'pointer', opacity: !formData.designacao.trim() || isSubmitting ? 0.6 : 1 }}>
                {isSubmitting ? <FaSpinner className="fa-spin" /> : (modoEdicao ? <FaEdit /> : <FaSave />)} {modoEdicao ? "Atualizar" : "Salvar"}
              </button>
              <button type="button" onClick={resetForm} style={{ padding: '0.75rem 1.5rem', borderRadius: '50px', border: '2px solid #ccc', background: 'white', cursor: 'pointer' }}>Limpar</button>
            </div>
          </form>
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