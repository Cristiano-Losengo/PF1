import { useState, useEffect } from "react";
import { FaUserPlus, FaUsers, FaToggleOn, FaToggleOff, FaCircle, FaInfoCircle } from "react-icons/fa";

export default function ContaCadastrar() {
  const [contas, setContas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [carregandoListas, setCarregandoListas] = useState(false);
  const [mensagem, setMensagem] = useState(null);
  const [perfis, setPerfis] = useState([]);
  const [erros, setErros] = useState({});

  // Formato ajustado - REMOVIDO nomeCompleto e confirmarSenha, ADICIONADO estado
  const [formData, setFormData] = useState({
    tipoConta: "",
    email: "",
    senha: "",
    fkPerfil: "",
    estado: "1" // Valor padrão: ativo
  });

  const [editando, setEditando] = useState(false);
  const [tocado, setTocado] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [salvoComSucesso, setSalvoComSucesso] = useState(false);

  // Carregar Contas e Perfis
  const carregarDados = async () => {
    try {
      setCarregandoListas(true);
      const [contasRes, perfisRes, contaPerfisRes] = await Promise.all([
        fetch("http://localhost:9090/api/seguranca/conta_listar"),
        fetch("http://localhost:9090/api/seguranca/perfil_listar"),
        fetch("http://localhost:9090/api/seguranca/conta_perfil_listar")
      ]);
      
      let contasData = [];
      let perfisData = [];
      let contaPerfisData = [];
      
      if (contasRes.ok) {
        contasData = await contasRes.json();
      }
      
      if (perfisRes.ok) {
        perfisData = await perfisRes.json();
      }
      
      if (contaPerfisRes.ok) {
        contaPerfisData = await contaPerfisRes.json();
      }
      
      // Combinar dados das contas com suas associações de perfil
      const contasCompletas = contasData.map(conta => {
        const associacao = contaPerfisData.find(cp => cp.fkConta === conta.pkConta);
        return {
          ...conta,
          fkPerfil: associacao ? associacao.fkPerfil : null,
          designacaoPerfil: associacao ? associacao.designacaoPerfil : 'Sem perfil',
          estadoAssociacao: associacao ? associacao.estado : false
        };
      });
      
      setContas(contasCompletas);
      setPerfis(perfisData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setMensagem({ tipo: "danger", texto: "Erro ao carregar dados do servidor." });
    } finally {
      setCarregandoListas(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Validações - REMOVIDO nomeCompleto e confirmarSenha
  const validarEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validarFormulario = () => {
    const novosErros = {};

    if (!formData.email.trim()) {
      novosErros.email = "Email é obrigatório";
    } else if (!validarEmail(formData.email)) {
      novosErros.email = "Email inválido";
    } else if (formData.email.trim().length > 50) {
      novosErros.email = "Email não pode exceder 50 caracteres";
    }

    if (!editando && !formData.senha) {
      novosErros.senha = "Senha é obrigatória";
    } else if (formData.senha && formData.senha.length < 6) {
      novosErros.senha = "Senha deve ter no mínimo 6 caracteres";
    } else if (formData.senha && formData.senha.length > 50) {
      novosErros.senha = "Senha não pode exceder 50 caracteres";
    }

    // REMOVIDO: validação de confirmarSenha

    if (!formData.tipoConta) {
      novosErros.tipoConta = "Tipo de conta é obrigatório";
    }

    if (!formData.fkPerfil) {
      novosErros.fkPerfil = "Perfil é obrigatório";
    }

    // ADICIONADO: validação do estado
    if (!formData.estado) {
      novosErros.estado = "Estado é obrigatório";
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  // Handle Input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (erros[name]) {
      setErros(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTocado(prev => ({ ...prev, [name]: true }));
  };

  // Função especial para o campo estado com estilo
  const handleBlurComEstilo = (e) => {
    handleBlur(e);
    e.target.style.borderColor = '#e0e0e0';
    e.target.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.05)';
  };

  const getCampoStatus = (campo) => {
    if (tocado[campo] || isSubmitting) {
      return erros[campo] ? "is-invalid" : "is-valid";
    }
    return "";
  };

  // Cadastrar Conta + ContaPerfil - AJUSTADO
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      setMensagem({ tipo: "danger", texto: "Por favor, corrija os erros no formulário." });
      return;
    }

    setLoading(true);
    setIsSubmitting(true);
    setMensagem(null);

    try {
      // 1. Criar a Conta - COM estado
      const dadosConta = {
        tipoConta: formData.tipoConta,
        email: formData.email.trim(),
        passwordHash: formData.senha, // Campo correto é passwordHash
        estado: parseInt(formData.estado) // Convertendo para inteiro
      };

      console.log("Criando conta:", dadosConta);

      const responseConta = await fetch("http://localhost:9090/api/seguranca/conta_cadastrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosConta),
      });

      const responseDataConta = await responseConta.json();
      
      if (!responseConta.ok) {
        throw new Error(responseDataConta.mensagem || "Erro ao criar conta");
      }

      // 2. Criar a associação ContaPerfil - SEM nomeCompleto
      if (responseDataConta.conta && responseDataConta.conta.pkConta) {
        const novaContaId = responseDataConta.conta.pkConta;
        
        // Buscar designação do perfil selecionado
        const perfilSelecionado = perfis.find(p => p.pkPerfil === parseInt(formData.fkPerfil));
        const designacaoPerfil = perfilSelecionado ? perfilSelecionado.designacao : "";
        
        const dadosContaPerfil = {
          fkConta: novaContaId,
          fkPerfil: parseInt(formData.fkPerfil),
          email: formData.email.trim(),
          tipoConta: formData.tipoConta,
          designacaoPerfil: designacaoPerfil,
          senha: formData.senha,
          estado: parseInt(formData.estado) === 1 // Convertendo para boolean
        };

        console.log("Criando conta-perfil:", dadosContaPerfil);

        const responseContaPerfil = await fetch("http://localhost:9090/api/seguranca/conta_perfil_cadastrar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dadosContaPerfil),
        });

        const responseDataContaPerfil = await responseContaPerfil.json();
        
        if (!responseContaPerfil.ok) {
          console.warn("Conta criada, mas erro ao criar associação:", responseDataContaPerfil.mensagem);
          // Mesmo com erro na associação, informamos que a conta foi criada
          setMensagem({ 
            tipo: "warning", 
            texto: "Conta criada, mas houve problema na associação com perfil." 
          });
        } else {
          setMensagem({ tipo: "success", texto: "Conta cadastrada com sucesso!" });
        }
      }

      setSalvoComSucesso(true);
      carregarDados();
      resetForm();
      
      setTimeout(() => {
        setSalvoComSucesso(false);
        setIsSubmitting(false);
      }, 3000);

    } catch (error) {
      setMensagem({ tipo: "danger", texto: error.message || "Erro ao cadastrar conta." });
      console.error("Erro ao cadastrar:", error);
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  // Editar Conta - DESABILITADO POR FALTA DE ENDPOINT
  const handleEdit = (conta) => {
    setMensagem({ 
      tipo: "warning", 
      texto: "Funcionalidade de edição não disponível no momento. O backend não possui endpoint para editar contas." 
    });
    
    // Mesmo assim, preencher o formulário para visualização
    setFormData({
      tipoConta: conta.tipoConta || "",
      email: conta.email || "",
      senha: "",
      fkPerfil: conta.fkPerfil ? conta.fkPerfil.toString() : "",
      estado: conta.estado ? conta.estado.toString() : "1"
    });
    setEditando(true);
  };

  // Excluir Conta - DESABILITADO POR FALTA DE ENDPOINT
  const handleDelete = (id) => {
    setMensagem({ 
      tipo: "warning", 
      texto: "Funcionalidade de exclusão não disponível no momento. O backend não possui endpoint para excluir contas." 
    });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      tipoConta: "",
      email: "",
      senha: "",
      fkPerfil: "",
      estado: "1" // Reset para valor padrão
    });
    setEditando(false);
    setErros({});
    setTocado({});
  };

  return (
    <div className="container mt-5 d-flex justify-content-center">
      <div className="card p-4 shadow w-50">
        <h3 className="mb-4 text-primary">
          <FaUserPlus className="me-2" /> Cadastrar Conta
        </h3>

        {/* Informação sobre limitações */}
        <div className="alert alert-info">
          <strong>Nota:</strong> Apenas cadastro disponível. Edição e exclusão requerem endpoints adicionais no backend.
        </div>

        {/* Mensagem */}
        {mensagem && (
          <div className={`alert alert-${mensagem.tipo} text-center`} role="alert">
            {mensagem.texto}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-3">
          {/* Email */}
          <div className="mb-3">
            <label className="form-label fw-bold">E-mail *</label>
            <input
              type="email"
              className={`form-control ${getCampoStatus('email')}`}
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Digite o e-mail (max 50 caracteres)"
              required
              disabled={loading}
              maxLength={50}
            />
            {erros.email && (
              <div className="invalid-feedback">{erros.email}</div>
            )}
            <small className="text-muted">{formData.email.length}/50 caracteres</small>
          </div>

          {/* Senha */}
          <div className="mb-3">
            <label className="form-label fw-bold">Senha *</label>
            <input
              type="password"
              className={`form-control ${getCampoStatus('senha')}`}
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Digite a senha (min 6, max 50)"
              required
              disabled={loading}
              minLength={6}
              maxLength={50}
            />
            {erros.senha && (
              <div className="invalid-feedback">{erros.senha}</div>
            )}
            <small className="text-muted">{formData.senha.length}/50 caracteres</small>
          </div>

          {/* tipoConta */}
          <div className="mb-3">
            <label className="form-label fw-bold">Tipo de Conta *</label>
            <select
              className={`form-select ${getCampoStatus('tipoConta')}`}
              name="tipoConta"
              value={formData.tipoConta}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              disabled={loading}
            >
              <option value="">Selecione...</option>
              <option value="ADMIN">ADMIN</option>
              <option value="GESTOR_PROVINCIAL">GESTOR PROVINCIAL</option>
              <option value="CIDADAO">CIDADÃO</option>
            </select>
            {erros.tipoConta && (
              <div className="invalid-feedback">{erros.tipoConta}</div>
            )}
          </div>

          {/* Perfil */}
          <div className="mb-3">
            <label className="form-label fw-bold d-flex align-items-center">
              <FaUsers className="me-2" /> Perfil *
            </label>
            <select
              className={`form-select ${getCampoStatus('fkPerfil')}`}
              name="fkPerfil"
              value={formData.fkPerfil}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              disabled={loading || carregandoListas}
            >
              <option value="">Selecione um perfil...</option>
              {perfis.map((p) => (
                <option key={p.pkPerfil} value={p.pkPerfil}>
                  {p.designacao} {p.estado === 1 ? '(ATIVO)' : '(INATIVO)'}
                </option>
              ))}
            </select>
            {erros.fkPerfil && (
              <div className="invalid-feedback">{erros.fkPerfil}</div>
            )}
          </div>

          {/* Campo Estado - ESTILIZADO */}
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
                <span style={{ fontSize: '1.1rem' }}>Estado da Conta *</span>
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
              <option value="" className="text-muted">Selecione o estado da conta</option>
              <option value="1" className="text-success fw-medium">
                <span className="d-inline-block me-2" style={{ width: '10px', height: '10px', background: '#28a745', borderRadius: '50%' }}></span>
                ✅ ATIVO - Conta disponível para uso
              </option>
              <option value="0" className="text-danger fw-medium">
                <span className="d-inline-block me-2" style={{ width: '10px', height: '10px', background: '#dc3545', borderRadius: '50%' }}></span>
                ❌ INATIVO - Conta desativada 
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

          {/* Botões */}
          <div className="text-center mt-4">
            <button
              type="submit"
              className="btn btn-primary me-2 px-4"
              disabled={loading || isSubmitting || editando}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Cadastrando...
                </>
              ) : (
                "Cadastrar"
              )}
            </button>

            <button
              type="button"
              className="btn btn-secondary px-4"
              onClick={resetForm}
              disabled={loading}
            >
              Limpar
            </button>
          </div>
        </form>

        {/* Lista de Contas - REMOVIDO nomeCompleto */}
        <div className="mt-5">
          <h4 className="mb-3">Contas Cadastradas</h4>
          {carregandoListas ? (
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Carregando...</span>
              </div>
            </div>
          ) : contas.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Email</th>
                    <th>Tipo</th>
                    <th>Perfil</th>
                    <th>Estado</th>
                    <th>Criado em</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {contas.map((conta) => (
                    <tr key={conta.pkConta}>
                      <td>{conta.pkConta}</td>
                      <td>{conta.email}</td>
                      <td>
                        <span className={`badge ${conta.tipoConta === 'ADMIN' ? 'bg-danger' : conta.tipoConta === 'GESTOR_PROVINCIAL' ? 'bg-warning' : 'bg-info'}`}>
                          {conta.tipoConta}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${conta.estadoAssociacao ? 'bg-success' : 'bg-secondary'}`}>
                          {conta.designacaoPerfil}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${conta.estado === 1 ? 'bg-success' : 'bg-danger'}`}>
                          {conta.estado === 1 ? 'ATIVO' : 'INATIVO'}
                        </span>
                      </td>
                      <td>{new Date(conta.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => handleEdit(conta)}
                          disabled={loading}
                          title="Edição não disponível"
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(conta.pkConta)}
                          disabled={loading}
                          title="Exclusão não disponível"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="alert alert-info text-center">
              Nenhuma conta cadastrada.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}