import { useState, useEffect } from "react";
import { FaUserPlus, FaUsers, FaToggleOn, FaToggleOff, FaCircle, FaInfoCircle } from "react-icons/fa";

export default function ContaCadastrar() {
  const [contas, setContas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [carregandoListas, setCarregandoListas] = useState(false);
  const [mensagem, setMensagem] = useState(null);
  const [perfis, setPerfis] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [estadosCivis, setEstadosCivis] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [erros, setErros] = useState({});

  const [formData, setFormData] = useState({
    nomeCompleto: "",
    dataNascimento: "",
    fkGenero: "",
    fkEstadoCivil: "",
    identificacao: "",
    telefone: "",
    email: "",
    passwordHash: "",
    tipoConta: "",
    fkPerfil: "",
    provincia: "",
    municipio: "",
    estado: "1"
  });

  const [editando, setEditando] = useState(false);
  const [tocado, setTocado] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [salvoComSucesso, setSalvoComSucesso] = useState(false);

  // Carregar Dados
  const carregarDados = async () => {
    try {
      setCarregandoListas(true);
      
      // Carregar todos os dados necessários
      const [contasRes, perfisRes, generosRes, estadosCivisRes, contaPerfisRes] = await Promise.all([
        fetch("http://localhost:9090/api/seguranca/conta_listar"),
        fetch("http://localhost:9090/api/seguranca/perfil_listar"),
        fetch("http://localhost:9090/api/genero/genero_listar"),
        fetch("http://localhost:9090/api/estado_civil/estado_civil_listar"),
        fetch("http://localhost:9090/api/seguranca/conta_perfil_listar")
      ]);
      
      let contasData = [];
      let perfisData = [];
      let generosData = [];
      let estadosCivisData = [];
      let contaPerfisData = [];
      
      if (contasRes.ok) contasData = await contasRes.json();
      if (perfisRes.ok) perfisData = await perfisRes.json();
      if (generosRes.ok) generosData = await generosRes.json();
      if (estadosCivisRes.ok) estadosCivisData = await estadosCivisRes.json();
      if (contaPerfisRes.ok) contaPerfisData = await contaPerfisRes.json();
      
      // Combinar dados das contas
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
      setGeneros(generosData);
      setEstadosCivis(estadosCivisData);
      
      // Carregar províncias da API (se disponível)
      try {
        const provinciasRes = await fetch("http://localhost:9090/api/endereco/provincia_listar");
        if (provinciasRes.ok) {
          const provinciasData = await provinciasRes.json();
          setProvincias(provinciasData);
        } else {
          // Fallback para dados mockados
          setProvincias([
            { id: 1, nome: "Luanda" },
            { id: 2, nome: "Huíla" },
            { id: 3, nome: "Benguela" },
            { id: 4, nome: "Huambo" },
            { id: 5, nome: "Cabinda" }
          ]);
        }
      } catch (error) {
        console.error("Erro ao carregar províncias:", error);
        // Fallback para dados mockados
        setProvincias([
          { id: 1, nome: "Luanda" },
          { id: 2, nome: "Huíla" },
          { id: 3, nome: "Benguela" },
          { id: 4, nome: "Huambo" },
          { id: 5, nome: "Cabinda" }
        ]);
      }
      
      // Carregar municípios da API (se disponível)
      try {
        const municipiosRes = await fetch("http://localhost:9090/api/endereco/municipio_listar");
        if (municipiosRes.ok) {
          const municipiosData = await municipiosRes.json();
          setMunicipios(municipiosData);
        } else {
          // Fallback para dados mockados
          setMunicipios([
            { id: 1, nome: "Belas", provinciaId: 1 },
            { id: 2, nome: "Cacuaco", provinciaId: 1 },
            { id: 3, nome: "Viana", provinciaId: 1 },
            { id: 4, nome: "Lubango", provinciaId: 2 },
            { id: 5, nome: "Humpata", provinciaId: 2 },
            { id: 6, nome: "Benguela", provinciaId: 3 },
            { id: 7, nome: "Baía Farta", provinciaId: 3 },
            { id: 8, nome: "Huambo", provinciaId: 4 },
            { id: 9, nome: "Caála", provinciaId: 4 },
            { id: 10, nome: "Cabinda", provinciaId: 5 },
            { id: 11, nome: "Cacongo", provinciaId: 5 }
          ]);
        }
      } catch (error) {
        console.error("Erro ao carregar municípios:", error);
        // Fallback para dados mockados
        setMunicipios([
          { id: 1, nome: "Belas", provinciaId: 1 },
          { id: 2, nome: "Cacuaco", provinciaId: 1 },
          { id: 3, nome: "Viana", provinciaId: 1 },
          { id: 4, nome: "Lubango", provinciaId: 2 },
          { id: 5, nome: "Humpata", provinciaId: 2 },
          { id: 6, nome: "Benguela", provinciaId: 3 },
          { id: 7, nome: "Baía Farta", provinciaId: 3 },
          { id: 8, nome: "Huambo", provinciaId: 4 },
          { id: 9, nome: "Caála", provinciaId: 4 },
          { id: 10, nome: "Cabinda", provinciaId: 5 },
          { id: 11, nome: "Cacongo", provinciaId: 5 }
        ]);
      }
      
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

  // Validações
  const validarEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validarFormulario = () => {
    const novosErros = {};

    // Dados Pessoais
    if (!formData.nomeCompleto.trim()) {
      novosErros.nomeCompleto = "Nome completo é obrigatório";
    } else if (formData.nomeCompleto.trim().length > 100) {
      novosErros.nomeCompleto = "Nome não pode exceder 100 caracteres";
    }

    if (!formData.dataNascimento) {
      novosErros.dataNascimento = "Data de nascimento é obrigatória";
    }

    if (!formData.fkGenero) {
      novosErros.fkGenero = "Gênero é obrigatório";
    }

    if (!formData.fkEstadoCivil) {
      novosErros.fkEstadoCivil = "Estado civil é obrigatório";
    }

    if (!formData.identificacao.trim()) {
      novosErros.identificacao = "Bilhete de identidade é obrigatório";
    }

    if (!formData.telefone.trim()) {
      novosErros.telefone = "Telefone é obrigatório";
    }

    // Dados da Conta
    if (!formData.email.trim()) {
      novosErros.email = "Email é obrigatório";
    } else if (!validarEmail(formData.email)) {
      novosErros.email = "Email inválido";
    }

    if (!editando && !formData.passwordHash) {
      novosErros.passwordHash = "passwordHash é obrigatória";
    } else if (formData.passwordHash && formData.passwordHash.length < 6) {
      novosErros.passwordHash = "passwordHash deve ter no mínimo 6 caracteres";
    }

    if (!formData.tipoConta) {
      novosErros.tipoConta = "Tipo de conta é obrigatório";
    }

    if (!formData.fkPerfil) {
      novosErros.fkPerfil = "Perfil é obrigatório";
    }

    // Endereço
    if (!formData.provincia) {
      novosErros.provincia = "Província é obrigatória";
    }

    if (!formData.municipio) {
      novosErros.municipio = "Município é obrigatório";
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  // Função para marcar todos os campos obrigatórios como tocados
  const marcarTodosCamposComoTocados = () => {
    const todosCampos = {
      nomeCompleto: true,
      dataNascimento: true,
      fkGenero: true,
      fkEstadoCivil: true,
      identificacao: true,
      telefone: true,
      email: true,
      passwordHash: true,
      tipoConta: true,
      fkPerfil: true,
      provincia: true,
      municipio: true,
      estado: true
    };
    setTocado(todosCampos);
  };

  // Handle Input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (erros[name]) {
      setErros(prev => ({ ...prev, [name]: "" }));
    }

    // Limpar municípios se a província mudar
    if (name === "provincia") {
      setFormData(prev => ({ ...prev, municipio: "" }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTocado(prev => ({ ...prev, [name]: true }));
  };

  // Função atualizada para mostrar is-valid quando tem valor e is-invalid quando vazio
  const getCampoStatus = (campo) => {
    // Se o campo foi tocado ou está sendo submetido
    if (tocado[campo] || isSubmitting) {
      const valor = formData[campo];
      
      // Se tem erro específico, mostra como inválido
      if (erros[campo]) {
        return "is-invalid";
      }
      
      // Para campos obrigatórios, verifica se tem valor
      // Apenas campos obrigatórios são validados aqui
      const camposObrigatorios = [
        'nomeCompleto', 'dataNascimento', 'genero', 'estadoCivil',
        'identificacao', 'telefone', 'email', 'passwordHash',
        'tipoConta', 'fkPerfil', 'provincia', 'municipio', 'estado'
      ];
      
      if (camposObrigatorios.includes(campo)) {
        if (valor === undefined || valor === null || valor === "") {
          return "is-invalid";
        }
        return "is-valid";
      }
      
      // Para campos não obrigatórios, apenas não mostra validação se estiver vazio
      if (valor && valor.trim() !== "") {
        return "is-valid";
      }
    }
    
    return "";
  };

  // Cadastrar Conta
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Marcar todos os campos como tocados antes de validar
    marcarTodosCamposComoTocados();
    
    if (!validarFormulario()) {
      setMensagem({ 
        tipo: "danger", 
        texto: "Por favor, corrija os erros no formulário.",
        mostrarCamposErro: true 
      });
      
      // Rolagem para o primeiro erro
      setTimeout(() => {
        const primeiroErro = document.querySelector('.is-invalid');
        if (primeiroErro) {
          primeiroErro.scrollIntoView({ behavior: 'smooth', block: 'center' });
          primeiroErro.focus();
        }
      }, 100);
      
      return;
    }

    setLoading(true);
    setIsSubmitting(true);
    setMensagem(null);

    try {
      // Encontrar os objetos completos de gênero e estado civil
      const generoSelecionado = generos.find(g => g.pkGenero === parseInt(formData.fkGenero));
      const estadoCivilSelecionado = estadosCivis.find(ec => ec.pkEstadoCivil === parseInt(formData.fkEstadoCivil));
      
      if (!generoSelecionado) {
        throw new Error("Gênero selecionado não encontrado");
      }
      
      if (!estadoCivilSelecionado) {
        throw new Error("Estado civil selecionado não encontrado");
      }

      // Encontrar o perfil selecionado
      const perfilSelecionado = perfis.find(p => p.pkPerfil === parseInt(formData.fkPerfil));
      
      if (!perfilSelecionado) {
        throw new Error("Perfil selecionado não encontrado");
      }

      // Preparar dados para a API
      const dadosParaAPI = {
        nomeCompleto: formData.nomeCompleto.trim(),
        dataNascimento: formData.dataNascimento,
        fkGenero: parseInt(formData.fkGenero), // Usar o nome do gênero
        fkEstadoCivil: parseInt(formData.fkEstadoCivil), // Usar o nome do estado civil
        identificacao: formData.identificacao.trim(),
        telefone: formData.telefone.trim(),
        email: formData.email.trim(),
        passwordHash: formData.passwordHash,
        tipoConta: formData.tipoConta,
        fkPerfil: parseInt(formData.fkPerfil),
        provincia: formData.provincia,
        municipio: formData.municipio,
        estado: parseInt(formData.estado)
      };

      console.log("Enviando dados para cadastro:", dadosParaAPI);

      // Enviar para a API
      const response = await fetch("http://localhost:9090/api/seguranca/conta_cadastrar", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify(dadosParaAPI),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.mensagem || responseData.message || "Erro ao cadastrar conta");
      }

      setMensagem({ tipo: "success", texto: "Conta cadastrada com sucesso!" });
      setSalvoComSucesso(true);
      
      // Recarregar dados após cadastro
      carregarDados();
      resetForm();
      
      setTimeout(() => {
        setSalvoComSucesso(false);
        setIsSubmitting(false);
      }, 3000);

    } catch (error) {
      console.error("Erro detalhado ao cadastrar:", error);
      setMensagem({ 
        tipo: "danger", 
        texto: error.message || "Erro ao cadastrar conta. Verifique os dados e tente novamente." 
      });
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      nomeCompleto: "",
      dataNascimento: "",
      fkGenero: "",
      fkEstadoCivil: "",
      identificacao: "",
      telefone: "",
      email: "",
      passwordHash: "",
      tipoConta: "",
      fkPerfil: "",
      provincia: "",
      municipio: "",
      estado: "1"
    });
    setEditando(false);
    setErros({});
    setTocado({});
  };

  // Filtrar municípios por província
  const municipiosFiltrados = formData.provincia 
    ? municipios.filter(m => m.provinciaId === parseInt(formData.provincia) || m.fkProvincia === parseInt(formData.provincia))
    : [];

  // Formatar nome do estado civil para exibição
  const formatarEstadoCivil = (nome) => {
    const formatacoes = {
      'SOLTEIRO': 'Solteiro(a)',
      'CASADO': 'Casado(a)',
      'DIVORCIADO': 'Divorciado(a)',
      'VIUVO': 'Viúvo(a)',
      'UNIAO_DE_FACTO': 'União de Facto'
    };
    return formatacoes[nome] || nome;
  };

  return (
    <div className="container mt-5 d-flex justify-content-center">
      <div className="card p-4 shadow w-100" style={{ maxWidth: '800px' }}>
        <h3 className="mb-4 text-primary">
          <FaUserPlus className="me-2" /> Gestão Inteligente - Cadastrar Conta
        </h3>

        {/* Mensagem */}
        {mensagem && (
          <div className={`alert alert-${mensagem.tipo} text-center`} role="alert">
            {mensagem.texto}
            {mensagem.tipo === "danger" && (
              <div className="mt-2">
                <small className="text-muted">
                  <FaInfoCircle className="me-1" /> 
                  Campos em vermelho precisam ser preenchidos
                </small>
              </div>
            )}
          </div>
        )}

        {carregandoListas && (
          <div className="alert alert-info text-center">
            <span className="spinner-border spinner-border-sm me-2"></span>
            Carregando dados...
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-3">
          {/* Dados Pessoais */}
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Dados Pessoais</h5>
            </div>
            <div className="card-body">
              <div className="row">
                {/* Nome Completo */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Nome Completo *</label>
                  <input
                    type="text"
                    className={`form-control ${getCampoStatus('nomeCompleto')}`}
                    name="nomeCompleto"
                    value={formData.nomeCompleto}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Digite o nome completo"
                    required
                    disabled={loading || carregandoListas}
                    maxLength={100}
                  />
                  {erros.nomeCompleto && (
                    <div className="invalid-feedback d-flex align-items-center">
                      <FaInfoCircle className="me-1" />
                      {erros.nomeCompleto}
                    </div>
                  )}
                  {tocado.nomeCompleto && !erros.nomeCompleto && formData.nomeCompleto && (
                    <div className="valid-feedback d-flex align-items-center">
                      <FaInfoCircle className="me-1" />
                      Nome válido
                    </div>
                  )}
                </div>

                {/* Data de Nascimento */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Data de Nascimento *</label>
                  <input
                    type="date"
                    className={`form-control ${getCampoStatus('dataNascimento')}`}
                    name="dataNascimento"
                    value={formData.dataNascimento}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    disabled={loading || carregandoListas}
                  />
                  {erros.dataNascimento && (
                    <div className="invalid-feedback d-flex align-items-center">
                      <FaInfoCircle className="me-1" />
                      {erros.dataNascimento}
                    </div>
                  )}
                  {tocado.dataNascimento && !erros.dataNascimento && formData.dataNascimento && (
                    <div className="valid-feedback d-flex align-items-center">
                      <FaInfoCircle className="me-1" />
                      Data válida
                    </div>
                  )}
                </div>

                {/* Gênero - Carregado da API */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Gênero *</label>
                  <select
                    className={`form-select ${getCampoStatus('genero')}`}
                    name="fkGenero"
                    value={formData.fkGenero}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    disabled={loading || carregandoListas || generos.length === 0}
                  >
                    <option value="">Selecione o gênero...</option>
                    {generos.map((genero) => (
                      <option key={genero.pkGenero} value={genero.pkGenero}>
                        {genero.nome}
                      </option>
                    ))}
                  </select>
                  {erros.genero && (
                    <div className="invalid-feedback d-flex align-items-center">
                      <FaInfoCircle className="me-1" />
                      {erros.genero}
                    </div>
                  )}
                  {tocado.genero && !erros.genero && formData.genero && (
                    <div className="valid-feedback d-flex align-items-center">
                      <FaInfoCircle className="me-1" />
                      Gênero selecionado
                    </div>
                  )}
                  {carregandoListas && generos.length === 0 && (
                    <small className="text-muted">Carregando gêneros...</small>
                  )}
                </div>

                {/* Estado Civil - Carregado da API */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Estado Civil *</label>
                  <select
                    className={`form-select ${getCampoStatus('estadoCivil')}`}
                    name="fkEstadoCivil"
                    value={formData.fkEstadoCivil}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    disabled={loading || carregandoListas || estadosCivis.length === 0}
                  >
                    <option value="">Selecione o estado civil...</option>
                    {estadosCivis.map((estadoCivil) => (
                      <option key={estadoCivil.pkEstadoCivil} value={estadoCivil.pkEstadoCivil}>
                        {formatarEstadoCivil(estadoCivil.nome)}
                      </option>
                    ))}
                  </select>
                  {erros.estadoCivil && (
                    <div className="invalid-feedback d-flex align-items-center">
                      <FaInfoCircle className="me-1" />
                      {erros.estadoCivil}
                    </div>
                  )}
                  {tocado.estadoCivil && !erros.estadoCivil && formData.estadoCivil && (
                    <div className="valid-feedback d-flex align-items-center">
                      <FaInfoCircle className="me-1" />
                      Estado civil selecionado
                    </div>
                  )}
                  {carregandoListas && estadosCivis.length === 0 && (
                    <small className="text-muted">Carregando estados civis...</small>
                  )}
                </div>

                {/* Bilhete de Identidade */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Bilhete de Identidade *</label>
                  <input
                    type="text"
                    className={`form-control ${getCampoStatus('identificacao')}`}
                    name="identificacao"
                    value={formData.identificacao}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Digite o número do BI"
                    required
                    disabled={loading || carregandoListas}
                  />
                  {erros.identificacao && (
                    <div className="invalid-feedback d-flex align-items-center">
                      <FaInfoCircle className="me-1" />
                      {erros.identificacao}
                    </div>
                  )}
                  {tocado.identificacao && !erros.identificacao && formData.identificacao && (
                    <div className="valid-feedback d-flex align-items-center">
                      <FaInfoCircle className="me-1" />
                      BI válido
                    </div>
                  )}
                </div>

                {/* Telefone */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Telefone *</label>
                  <input
                    type="tel"
                    className={`form-control ${getCampoStatus('telefone')}`}
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Digite o telefone"
                    required
                    disabled={loading || carregandoListas}
                  />
                  {erros.telefone && (
                    <div className="invalid-feedback d-flex align-items-center">
                      <FaInfoCircle className="me-1" />
                      {erros.telefone}
                    </div>
                  )}
                  {tocado.telefone && !erros.telefone && formData.telefone && (
                    <div className="valid-feedback d-flex align-items-center">
                      <FaInfoCircle className="me-1" />
                      Telefone válido
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Dados da Conta */}
          <div className="card mb-4">
            <div className="card-header bg-secondary text-white">
              <h5 className="mb-0">Dados da Conta</h5>
            </div>
            <div className="card-body">
              <div className="row">
                {/* Email */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Email *</label>
                  <input
                    type="email"
                    className={`form-control ${getCampoStatus('email')}`}
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="exemplo@dominio.com"
                    required
                    disabled={loading || carregandoListas}
                  />
                  {erros.email && (
                    <div className="invalid-feedback d-flex align-items-center">
                      <FaInfoCircle className="me-1" />
                      {erros.email}
                    </div>
                  )}
                  {tocado.email && !erros.email && formData.email && (
                    <div className="valid-feedback d-flex align-items-center">
                      <FaInfoCircle className="me-1" />
                      Email válido
                    </div>
                  )}
                </div>

                {/* passwordHash */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">passwordHash *</label>
                  <input
                    type="password"
                    className={`form-control ${getCampoStatus('passwordHash')}`}
                    name="passwordHash"
                    value={formData.passwordHash}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Mínimo 6 caracteres"
                    required={!editando}
                    disabled={loading || carregandoListas}
                    minLength={6}
                  />
                  {erros.passwordHash && (
                    <div className="invalid-feedback d-flex align-items-center">
                      <FaInfoCircle className="me-1" />
                      {erros.passwordHash}
                    </div>
                  )}
                  {tocado.passwordHash && !erros.passwordHash && formData.passwordHash && (
                    <div className="valid-feedback d-flex align-items-center">
                      <FaInfoCircle className="me-1" />
                      passwordHash válida
                    </div>
                  )}
                </div>

                {/* Tipo de Conta */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Tipo de Conta *</label>
                  <select
                    className={`form-select ${getCampoStatus('tipoConta')}`}
                    name="tipoConta"
                    value={formData.tipoConta}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    disabled={loading || carregandoListas}
                  >
                    <option value="">Selecione o tipo de conta...</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="GESTOR_PROVINCIAL">GESTOR PROVINCIAL</option>
                    <option value="CIDADAO">CIDADÃO</option>
                  </select>
                  {erros.tipoConta && (
                    <div className="invalid-feedback d-flex align-items-center">
                      <FaInfoCircle className="me-1" />
                      {erros.tipoConta}
                    </div>
                  )}
                  {tocado.tipoConta && !erros.tipoConta && formData.tipoConta && (
                    <div className="valid-feedback d-flex align-items-center">
                      <FaInfoCircle className="me-1" />
                      Tipo de conta selecionado
                    </div>
                  )}
                </div>

                {/* Perfil */}
                <div className="col-md-6 mb-3">
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
                    disabled={loading || carregandoListas || perfis.length === 0}
                  >
                    <option value="">Selecione um perfil...</option>
                    {perfis.map((p) => (
                      <option key={p.pkPerfil} value={p.pkPerfil}>
                        {p.designacao} {p.estado === 1 ? '(ATIVO)' : '(INATIVO)'}
                      </option>
                    ))}
                  </select>
                  {erros.fkPerfil && (
                    <div className="invalid-feedback d-flex align-items-center">
                      <FaInfoCircle className="me-1" />
                      {erros.fkPerfil}
                    </div>
                  )}
                  {tocado.fkPerfil && !erros.fkPerfil && formData.fkPerfil && (
                    <div className="valid-feedback d-flex align-items-center">
                      <FaInfoCircle className="me-1" />
                      Perfil selecionado
                    </div>
                  )}
                  {carregandoListas && perfis.length === 0 && (
                    <small className="text-muted">Carregando perfis...</small>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="card mb-4">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">Endereço</h5>
            </div>
            <div className="card-body">
              <div className="row">
                {/* Província */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Província *</label>
                  <select
                    className={`form-select ${getCampoStatus('provincia')}`}
                    name="provincia"
                    value={formData.provincia}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    disabled={loading || carregandoListas || provincias.length === 0}
                  >
                    <option value="">Selecione a província...</option>
                    {provincias.map((p) => (
                      <option key={p.id || p.pkProvincia} value={p.id || p.pkProvincia}>
                        {p.nome || p.designacao}
                      </option>
                    ))}
                  </select>
                  {erros.provincia && (
                    <div className="invalid-feedback d-flex align-items-center">
                      <FaInfoCircle className="me-1" />
                      {erros.provincia}
                    </div>
                  )}
                  {tocado.provincia && !erros.provincia && formData.provincia && (
                    <div className="valid-feedback d-flex align-items-center">
                      <FaInfoCircle className="me-1" />
                      Província selecionada
                    </div>
                  )}
                </div>

                {/* Município */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Município *</label>
                  <select
                    className={`form-select ${getCampoStatus('municipio')}`}
                    name="municipio"
                    value={formData.municipio}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    disabled={loading || carregandoListas || !formData.provincia || municipiosFiltrados.length === 0}
                  >
                    <option value="">Selecione o município...</option>
                    {municipiosFiltrados.map((m) => (
                      <option key={m.id || m.pkMunicipio} value={m.id || m.pkMunicipio}>
                        {m.nome || m.designacao}
                      </option>
                    ))}
                  </select>
                  {erros.municipio && (
                    <div className="invalid-feedback d-flex align-items-center">
                      <FaInfoCircle className="me-1" />
                      {erros.municipio}
                    </div>
                  )}
                  {tocado.municipio && !erros.municipio && formData.municipio && (
                    <div className="valid-feedback d-flex align-items-center">
                      <FaInfoCircle className="me-1" />
                      Município selecionado
                    </div>
                  )}
                  {formData.provincia && municipiosFiltrados.length === 0 && (
                    <small className="text-muted">
                      {carregandoListas ? 'Carregando municípios...' : 'Nenhum município disponível para esta província'}
                    </small>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Estado da Conta */}
          <div className="card mb-4">
            <div className="card-header bg-warning text-dark">
              <h5 className="mb-0">Estado da Conta</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label fw-bold d-flex align-items-center">
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
                    <span style={{ fontSize: '1.1rem' }}>Estado *</span>
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
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  disabled={isSubmitting || salvoComSucesso || carregandoListas}
                >
                  <option value="1" className="text-success fw-medium">
                    <span className="d-inline-block me-2" style={{ width: '10px', height: '10px', background: '#28a745', borderRadius: '50%' }}></span>
                    ✅ ATIVO - Conta disponível para uso
                  </option>
                  <option value="0" className="text-danger fw-medium">
                    <span className="d-inline-block me-2" style={{ width: '10px', height: '10px', background: '#dc3545', borderRadius: '50%' }}></span>
                    ❌ INATIVO - Conta desativada 
                  </option>
                </select>
                {erros.estado && (
                  <small className="text-danger fw-semibold d-block mt-2 d-flex align-items-center">
                    <FaInfoCircle className="me-1" />
                    {erros.estado}
                  </small>
                )}
                {tocado.estado && !erros.estado && formData.estado && (
                  <small className="text-success fw-semibold d-block mt-2 d-flex align-items-center">
                    <FaInfoCircle className="me-1" />
                    Estado da conta definido
                  </small>
                )}
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="text-center mt-4">
            <button
              type="submit"
              className="btn btn-primary me-2 px-4"
              disabled={loading || isSubmitting || carregandoListas}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Cadastrando...
                </>
              ) : carregandoListas ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Carregando dados...
                </>
              ) : (
                "Cadastrar Conta"
              )}
            </button>

            <button
              type="button"
              className="btn btn-secondary px-4"
              onClick={resetForm}
              disabled={loading || carregandoListas}
            >
              Limpar Formulário
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}