import React, { useState, useEffect } from "react";
import { 
  FaUserPlus, FaUsers, FaToggleOn, FaToggleOff, FaCircle, 
  FaInfoCircle, FaRoad, FaArrowLeft, FaEdit, FaSave, FaSpinner 
} from "react-icons/fa";
import { useLocation, useNavigate, useParams } from "react-router-dom";

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
  const [bairros, setBairros] = useState([]);
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
    estado: "1",
    provincia: "",
    municipio: "",
    bairro: "",
    nomeRua: "",
  });

  const [editando, setEditando] = useState(false);
  const [contaId, setContaId] = useState(null);
  const [tocado, setTocado] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [salvoComSucesso, setSalvoComSucesso] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  // Carregar Dados Gerais (perfis, gêneros, estados civis, endereços)
  const carregarDados = async () => {
    try {
      setCarregandoListas(true);
      
      const [perfisRes, generosRes, estadosCivisRes] = await Promise.all([
        fetch("http://localhost:9090/api/seguranca/perfil_listar"),
        fetch("http://localhost:9090/api/genero/genero_listar"),
        fetch("http://localhost:9090/api/estado_civil/estado_civil_listar")
      ]);
      
      let perfisData = [];
      let generosData = [];
      let estadosCivisData = [];
      
      if (perfisRes.ok) perfisData = await perfisRes.json();
      if (generosRes.ok) generosData = await generosRes.json();
      if (estadosCivisRes.ok) estadosCivisData = await estadosCivisRes.json();
      
      setPerfis(perfisData);
      setGeneros(generosData);
      setEstadosCivis(estadosCivisData);
      
      try {
        const provinciasRes = await fetch("http://localhost:9090/api/endereco/provincia_listar");
        if (provinciasRes.ok) {
          const provinciasData = await provinciasRes.json();
          setProvincias(provinciasData);
        } else {
          setProvincias([{ id: 1, nome: "Luanda" }]);
        }
      } catch (error) {
        console.error("Erro ao carregar províncias:", error);
        setProvincias([{ id: 1, nome: "Luanda" }]);
      }
      
      try {
        const municipiosRes = await fetch("http://localhost:9090/api/endereco/municipio_listar");
        if (municipiosRes.ok) {
          const municipiosData = await municipiosRes.json();
          setMunicipios(municipiosData);
        } else {
          setMunicipios([
            { id: 1, nome: "Belas", provinciaId: 1 },
            { id: 2, nome: "Cacuaco", provinciaId: 1 },
            { id: 3, nome: "Cazenga", provinciaId: 1 },
            { id: 4, nome: "Kilamba Kiaxi", provinciaId: 1 },
            { id: 5, nome: "Viana", provinciaId: 1 },
            { id: 6, nome: "Ingombota", provinciaId: 1 },
            { id: 7, nome: "Sambizanga", provinciaId: 1 },
            { id: 8, nome: "Maianga", provinciaId: 1 },
            { id: 9, nome: "Rangel", provinciaId: 1 },
            { id: 10, nome: "Samba", provinciaId: 1 },
            { id: 11, nome: "Talatona", provinciaId: 1 }
          ]);
        }
      } catch (error) {
        console.error("Erro ao carregar municípios:", error);
        setMunicipios([
          { id: 1, nome: "Belas", provinciaId: 1 },
          { id: 2, nome: "Cacuaco", provinciaId: 1 },
          { id: 3, nome: "Cazenga", provinciaId: 1 },
          { id: 4, nome: "Kilamba Kiaxi", provinciaId: 1 },
          { id: 5, nome: "Viana", provinciaId: 1 },
          { id: 6, nome: "Ingombota", provinciaId: 1 },
          { id: 7, nome: "Sambizanga", provinciaId: 1 },
          { id: 8, nome: "Maianga", provinciaId: 1 },
          { id: 9, nome: "Rangel", provinciaId: 1 },
          { id: 10, nome: "Samba", provinciaId: 1 },
          { id: 11, nome: "Talatona", provinciaId: 1 }
        ]);
      }
      
      try {
        const bairrosRes = await fetch("http://localhost:9090/api/endereco/bairro_listar");
        if (bairrosRes.ok) {
          const bairrosData = await bairrosRes.json();
          setBairros(bairrosData);
        } else {
          setBairros([
            { id: 101, nome: "Maculusso", municipioId: 6 },
            { id: 102, nome: "Patrice Lumumba", municipioId: 6 },
            { id: 103, nome: "Ilha do Cabo", municipioId: 6 },
            { id: 104, nome: "Quinanga", municipioId: 6 },
            { id: 105, nome: "Cidade Baixa", municipioId: 6 },
            { id: 106, nome: "Cidade Alta", municipioId: 6 },
            { id: 107, nome: "Chicala", municipioId: 6 },
            { id: 108, nome: "Coqueiros", municipioId: 6 },
            { id: 109, nome: "Bairro Azul", municipioId: 6 },
            { id: 110, nome: "Praia do Bispo", municipioId: 6 },
            { id: 111, nome: "Mutamba", municipioId: 6 },
            { id: 112, nome: "Vila Clotilde", municipioId: 6 },
            { id: 113, nome: "Malanga", municipioId: 7 },
            { id: 114, nome: "Bairro Operário", municipioId: 7 },
            { id: 115, nome: "Catambor", municipioId: 8 },
            { id: 116, nome: "Cassenda", municipioId: 8 },
            { id: 117, nome: "Prenda", municipioId: 8 },
            { id: 118, nome: "Neves Bendinha", municipioId: 8 },
            { id: 119, nome: "Catinton", municipioId: 8 },
            { id: 120, nome: "Calemba", municipioId: 8 },
            { id: 121, nome: "Serpa Pinto", municipioId: 8 },
            { id: 122, nome: "Bairro Jumbo", municipioId: 8 },
            { id: 123, nome: "Morro da Luz", municipioId: 8 },
            { id: 124, nome: "Margoso (chabá)", municipioId: 8 },
            { id: 125, nome: "Gamek", municipioId: 8 },
            { id: 126, nome: "Mártires do Kifangondo", municipioId: 8 },
            { id: 127, nome: "Sagrada Esperança", municipioId: 8 },
            { id: 128, nome: "Alvalade", municipioId: 8 },
            { id: 129, nome: "Cassequel", municipioId: 8 },
            { id: 130, nome: "Terra Nova", municipioId: 9 },
            { id: 131, nome: "Precol", municipioId: 9 },
            { id: 132, nome: "Combatentes", municipioId: 9 },
            { id: 133, nome: "Valódia", municipioId: 9 },
            { id: 134, nome: "Vila Alice", municipioId: 9 },
            { id: 135, nome: "Indígena", municipioId: 9 },
            { id: 136, nome: "Zangado", municipioId: 9 },
            { id: 137, nome: "Nelito Soares", municipioId: 9 },
            { id: 138, nome: "Saiotes", municipioId: 9 },
            { id: 139, nome: "Comissão do Rangel", municipioId: 9 },
            { id: 140, nome: "CTT", municipioId: 9 },
            { id: 141, nome: "Margal", municipioId: 9 },
            { id: 142, nome: "Rocha Pinto", municipioId: 10 },
            { id: 143, nome: "Prenda", municipioId: 10 },
            { id: 144, nome: "Gameque (Gamek)", municipioId: 10 },
            { id: 145, nome: "Morro Bento", municipioId: 10 },
            { id: 146, nome: "Mabunda", municipioId: 10 },
            { id: 147, nome: "Corimba", municipioId: 10 },
            { id: 148, nome: "Cazenga", municipioId: 3 },
            { id: 149, nome: "Hoji ya Henda", municipioId: 3 },
            { id: 150, nome: "11 de Novembro", municipioId: 3 },
            { id: 151, nome: "Kima Kieza", municipioId: 3 },
            { id: 152, nome: "Tala Hadi", municipioId: 3 },
            { id: 153, nome: "Kalawenda", municipioId: 3 },
            { id: 154, nome: "Kikolo", municipioId: 2 },
            { id: 155, nome: "Cacuaco", municipioId: 2 },
            { id: 156, nome: "Mulenvos de Baixo", municipioId: 2 },
            { id: 157, nome: "Sequele", municipioId: 2 },
            { id: 158, nome: "Viana", municipioId: 5 },
            { id: 159, nome: "Estalagem", municipioId: 5 },
            { id: 160, nome: "Kikuxi", municipioId: 5 },
            { id: 161, nome: "Baía", municipioId: 5 },
            { id: 162, nome: "Zango", municipioId: 5 },
            { id: 163, nome: "Vila Flôr", municipioId: 5 },
            { id: 164, nome: "Quenguela", municipioId: 1 },
            { id: 165, nome: "Morro dos Veados", municipioId: 1 },
            { id: 166, nome: "Ramiros", municipioId: 1 },
            { id: 167, nome: "Vila Verde", municipioId: 1 },
            { id: 168, nome: "Cabolombo", municipioId: 1 },
            { id: 169, nome: "Kilamba", municipioId: 1 },
            { id: 170, nome: "Golfe", municipioId: 4 },
            { id: 171, nome: "Sapú", municipioId: 4 },
            { id: 172, nome: "Palanca", municipioId: 4 },
            { id: 173, nome: "Nova Vida", municipioId: 4 },
            { id: 174, nome: "Benfica", municipioId: 11 },
            { id: 175, nome: "Futungo de Belas", municipioId: 11 },
            { id: 176, nome: "Lar do Patriota", provinciaId: 11 },
            { id: 177, nome: "Talatona", provinciaId: 11 },
            { id: 178, nome: "Camama", provinciaId: 11 },
            { id: 179, nome: "Cidade Universitária", provinciaId: 11 }
          ]);
        }
      } catch (error) {
        console.error("Erro ao carregar bairros:", error);
        setBairros([
          { id: 101, nome: "Maculusso", municipioId: 6 },
          { id: 102, nome: "Patrice Lumumba", municipioId: 6 },
          { id: 103, nome: "Ilha do Cabo", municipioId: 6 },
          { id: 104, nome: "Quinanga", municipioId: 6 },
          { id: 105, nome: "Cidade Baixa", municipioId: 6 },
          { id: 106, nome: "Cidade Alta", municipioId: 6 },
          { id: 107, nome: "Chicala", municipioId: 6 },
          { id: 108, nome: "Coqueiros", municipioId: 6 },
          { id: 109, nome: "Bairro Azul", municipioId: 6 },
          { id: 110, nome: "Praia do Bispo", municipioId: 6 },
          { id: 111, nome: "Mutamba", municipioId: 6 },
          { id: 112, nome: "Vila Clotilde", municipioId: 6 },
          { id: 113, nome: "Malanga", municipioId: 7 },
          { id: 114, nome: "Bairro Operário", municipioId: 7 },
          { id: 115, nome: "Catambor", municipioId: 8 },
          { id: 116, nome: "Cassenda", municipioId: 8 },
          { id: 117, nome: "Prenda", municipioId: 8 },
          { id: 118, nome: "Neves Bendinha", municipioId: 8 },
          { id: 119, nome: "Catinton", municipioId: 8 },
          { id: 120, nome: "Calemba", municipioId: 8 },
          { id: 121, nome: "Serpa Pinto", municipioId: 8 },
          { id: 122, nome: "Bairro Jumbo", municipioId: 8 },
          { id: 123, nome: "Morro da Luz", municipioId: 8 },
          { id: 124, nome: "Margoso (chabá)", municipioId: 8 },
          { id: 125, nome: "Gamek", municipioId: 8 },
          { id: 126, nome: "Mártires do Kifangondo", municipioId: 8 },
          { id: 127, nome: "Sagrada Esperança", municipioId: 8 },
          { id: 128, nome: "Alvalade", municipioId: 8 },
          { id: 129, nome: "Cassequel", municipioId: 8 },
          { id: 130, nome: "Terra Nova", municipioId: 9 },
          { id: 131, nome: "Precol", municipioId: 9 },
          { id: 132, nome: "Combatentes", municipioId: 9 },
          { id: 133, nome: "Valódia", municipioId: 9 },
          { id: 134, nome: "Vila Alice", municipioId: 9 },
          { id: 135, nome: "Indígena", municipioId: 9 },
          { id: 136, nome: "Zangado", municipioId: 9 },
          { id: 137, nome: "Nelito Soares", municipioId: 9 },
          { id: 138, nome: "Saiotes", municipioId: 9 },
          { id: 139, nome: "Comissão do Rangel", municipioId: 9 },
          { id: 140, nome: "CTT", municipioId: 9 },
          { id: 141, nome: "Margal", municipioId: 9 },
          { id: 142, nome: "Rocha Pinto", municipioId: 10 },
          { id: 143, nome: "Prenda", municipioId: 10 },
          { id: 144, nome: "Gameque (Gamek)", municipioId: 10 },
          { id: 145, nome: "Morro Bento", municipioId: 10 },
          { id: 146, nome: "Mabunda", municipioId: 10 },
          { id: 147, nome: "Corimba", municipioId: 10 },
          { id: 148, nome: "Cazenga", municipioId: 3 },
          { id: 149, nome: "Hoji ya Henda", municipioId: 3 },
          { id: 150, nome: "11 de Novembro", municipioId: 3 },
          { id: 151, nome: "Kima Kieza", municipioId: 3 },
          { id: 152, nome: "Tala Hadi", municipioId: 3 },
          { id: 153, nome: "Kalawenda", municipioId: 3 },
          { id: 154, nome: "Kikolo", municipioId: 2 },
          { id: 155, nome: "Cacuaco", municipioId: 2 },
          { id: 156, nome: "Mulenvos de Baixo", municipioId: 2 },
          { id: 157, nome: "Sequele", municipioId: 2 },
          { id: 158, nome: "Viana", municipioId: 5 },
          { id: 159, nome: "Estalagem", municipioId: 5 },
          { id: 160, nome: "Kikuxi", municipioId: 5 },
          { id: 161, nome: "Baía", municipioId: 5 },
          { id: 162, nome: "Zango", municipioId: 5 },
          { id: 163, nome: "Vila Flôr", municipioId: 5 },
          { id: 164, nome: "Quenguela", municipioId: 1 },
          { id: 165, nome: "Morro dos Veados", municipioId: 1 },
          { id: 166, nome: "Ramiros", municipioId: 1 },
          { id: 167, nome: "Vila Verde", municipioId: 1 },
          { id: 168, nome: "Cabolombo", municipioId: 1 },
          { id: 169, nome: "Kilamba", municipioId: 1 },
          { id: 170, nome: "Golfe", municipioId: 4 },
          { id: 171, nome: "Sapú", municipioId: 4 },
          { id: 172, nome: "Palanca", municipioId: 4 },
          { id: 173, nome: "Nova Vida", municipioId: 4 },
          { id: 174, nome: "Benfica", municipioId: 11 },
          { id: 175, nome: "Futungo de Belas", municipioId: 11 },
          { id: 176, nome: "Lar do Patriota", provinciaId: 11 },
          { id: 177, nome: "Talatona", provinciaId: 11 },
          { id: 178, nome: "Camama", provinciaId: 11 },
          { id: 179, nome: "Cidade Universitária", provinciaId: 11 }
        ]);
      }
      
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setMensagem({ tipo: "danger", texto: "Erro ao carregar dados do servidor." });
    } finally {
      setCarregandoListas(false);
    }
  };

  // Função para carregar conta específica para edição
  const carregarContaParaEdicao = async (idConta) => {
    try {
      setLoading(true);
      console.log("Carregando conta para edição ID:", idConta);
      
      // Buscar conta específica da API usando o endpoint correto
      const response = await fetch(`http://localhost:9090/api/seguranca/conta_buscar/${idConta}`);
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status} ${response.statusText}`);
      }
      
      const resultado = await response.json();
      console.log("Resposta da API:", resultado);
      
      if (!resultado.sucesso) {
        throw new Error(resultado.mensagem || "Conta não encontrada");
      }
      
      const conta = resultado.conta;
      console.log("Conta carregada da API:", conta);
      
      // Preencher o formulário com os dados da conta
      setContaId(conta.pkConta);
      setEditando(true);
      
      // CORREÇÃO: Converter data de nascimento para o formato correto (YYYY-MM-DD)
      let dataNascimentoFormatada = "";
      if (conta.dataNascimento) {
        const data = new Date(conta.dataNascimento);
        if (!isNaN(data.getTime())) {
          dataNascimentoFormatada = data.toISOString().split('T')[0];
        } else {
          // Tentar outros formatos
          const partes = conta.dataNascimento.split('-');
          if (partes.length === 3) {
            dataNascimentoFormatada = conta.dataNascimento;
          }
        }
      }
      
      setFormData({
        nomeCompleto: conta.nomeCompleto || "",
        dataNascimento: dataNascimentoFormatada,
        fkGenero: conta.fkGenero?.toString() || "",
        fkEstadoCivil: conta.fkEstadoCivil?.toString() || "",
        identificacao: conta.identificacao || "",
        telefone: conta.telefone || "",
        email: conta.email || "",
        passwordHash: "", // Deixar vazio na edição
        tipoConta: conta.tipoConta || "",
        fkPerfil: conta.fkPerfil?.toString() || "",
        estado: conta.estado?.toString() || "1",
        provincia: conta.provincia || "",
        municipio: conta.municipio || "",
        bairro: conta.bairro || "",
        nomeRua: conta.nomeRua || "",
      });
      
      setMensagem({
        tipo: "info",
        texto: `Editando conta: ${conta.nomeCompleto || 'ID ' + conta.pkConta}`
      });
      
      console.log("Formulário preenchido para edição:", formData);
      
    } catch (error) {
      console.error("Erro ao carregar conta para edição:", error);
      setMensagem({
        tipo: "danger",
        texto: `Erro ao carregar dados da conta: ${error.message}. Voltando para modo cadastro.`
      });
      
      // Limpar dados de edição e voltar para modo cadastro
      setEditando(false);
      setContaId(null);
      
      // Aguardar um pouco antes de limpar a mensagem
      setTimeout(() => {
        setMensagem(null);
      }, 3000);
      
    } finally {
      setLoading(false);
    }
  };

  // CORREÇÃO: useEffect simplificado e mais robusto
  useEffect(() => {
    console.log("🚀 ContaCadastrar CARREGANDO...");
    console.log("ID da URL:", id);
    
    // Carregar dados gerais (perfis, gêneros, etc.)
    carregarDados();
    
    // Verificar se estamos editando via ID na URL
    if (id) {
      console.log("📝 Modo edição via ID da URL:", id);
      
      // Pequeno delay para garantir que os dados gerais foram carregados
      const timer = setTimeout(() => {
        carregarContaParaEdicao(id);
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      console.log("📝 Modo cadastro normal");
      // Limpar estado se for modo cadastro
      setEditando(false);
      setContaId(null);
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
        estado: "1",
        provincia: "",
        municipio: "",
        bairro: "",
        nomeRua: "",
      });
    }
  }, [id]); // Somente reexecutar quando o ID mudar

  const contemCaracteresEspeciais = (texto) => {
    const caracteresEspeciais = /[!@#$%^&*()_+\-=\[\]{}|\\:;"'<>,.?\/]/;
    return caracteresEspeciais.test(texto);
  };

  const contemNumeros = (texto) => {
    return /\d/.test(texto);
  };

  const validaApenasNumerosLetrasHifen = (texto) => {
    return /^[A-Za-z0-9\-]+$/.test(texto);
  };

  const validaNomeRua = (texto) => {
    if (!texto.trim()) return { valido: true, erro: "" };
    
    const textoSemEspacos = texto.replace(/\s+/g, '');
    const apenasNumerosEspeciais = /^[\d!@#$%^&*()_+\-=\[\]{}|\\:;"'<>,.?\/]+$/;
    const contemLetras = /[a-zA-ZáàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]/i.test(texto);
    
    if (apenasNumerosEspeciais.test(textoSemEspacos) && !contemLetras) {
      return { 
        valido: false, 
        erro: "Nome da rua não pode conter apenas números e caracteres especiais. Deve incluir pelo menos uma letra." 
      };
    }
    
    return { valido: true, erro: "" };
  };

  const validarEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const emailSemNumeros = (email) => {
    if (!email) return true;
    const partes = email.split('@');
    if (partes.length < 2) return true;
    const nomeUsuario = partes[0];
    return !/\d/.test(nomeUsuario);
  };

  const validarFormulario = () => {
    const novosErros = {};

    if (!formData.nomeCompleto.trim()) {
      novosErros.nomeCompleto = "Nome completo é obrigatório";
    } else if (formData.nomeCompleto.trim().length > 100) {
      novosErros.nomeCompleto = "Nome não pode exceder 100 caracteres";
    } else if (contemCaracteresEspeciais(formData.nomeCompleto)) {
      novosErros.nomeCompleto = "Nome não pode conter caracteres especiais (!@#$%^&*()_+-=[]{}|\\:;\"'<>,.?/)";
    } else if (contemNumeros(formData.nomeCompleto)) {
      novosErros.nomeCompleto = "Nome não pode conter números";
    }

    if (!formData.dataNascimento) {
      novosErros.dataNascimento = "Data de nascimento é obrigatória";
    } else {
      const hoje = new Date();
      const dataNasc = new Date(formData.dataNascimento);
      if (dataNasc > hoje) {
        novosErros.dataNascimento = "Data de nascimento não pode ser futura";
      }
    }

    if (!formData.fkGenero) {
      novosErros.fkGenero = "Gênero é obrigatório";
    }

    if (!formData.fkEstadoCivil) {
      novosErros.fkEstadoCivil = "Estado civil é obrigatório";
    }

    if (!formData.identificacao.trim()) {
      novosErros.identificacao = "Bilhete de identidade é obrigatório";
    } else if (!validaApenasNumerosLetrasHifen(formData.identificacao)) {
      novosErros.identificacao = "BI não pode conter caracteres especiais (exceto hífen). Apenas letras, números e hífen são permitidos";
    }

    if (!formData.telefone.trim()) {
      novosErros.telefone = "Telefone é obrigatório";
    } else if (!/^[0-9]{9}$/.test(formData.telefone.trim())) {
      novosErros.telefone = "Telefone deve ter 9 dígitos (ex: 923456789)";
    }

    if (!formData.email.trim()) {
      novosErros.email = "Email é obrigatório";
    } else if (!validarEmail(formData.email)) {
      novosErros.email = "Email inválido";
    } else if (!emailSemNumeros(formData.email)) {
      novosErros.email = "Email não pode conter números no nome de usuário (parte antes do @)";
    }

    if (!editando && !formData.passwordHash) {
      novosErros.passwordHash = "Senha é obrigatória";
    } else if (formData.passwordHash && formData.passwordHash.length < 6) {
      novosErros.passwordHash = "Senha deve ter no mínimo 6 caracteres";
    }

    if (!formData.tipoConta) {
      novosErros.tipoConta = "Tipo de conta é obrigatório";
    }

    if (!formData.fkPerfil) {
      novosErros.fkPerfil = "Perfil é obrigatório";
    }

    if (!formData.estado) {
      novosErros.estado = "Estado da conta é obrigatório";
    }

    if (!formData.provincia) {
      novosErros.provincia = "Província é obrigatória";
    }

    if (!formData.municipio) {
      novosErros.municipio = "Município é obrigatório";
    }

    if (!formData.bairro) {
      novosErros.bairro = "Bairro é obrigatório";
    }

    if (formData.nomeRua) {
      if (formData.nomeRua.trim().length > 150) {
        novosErros.nomeRua = "Nome da rua não pode exceder 150 caracteres";
      } else {
        const validacaoRua = validaNomeRua(formData.nomeRua);
        if (!validacaoRua.valido) {
          novosErros.nomeRua = validacaoRua.erro;
        } else {
          const apenasNumeros = /^\d+$/.test(formData.nomeRua.trim());
          if (apenasNumeros) {
            novosErros.nomeRua = "Nome da rua não pode ser composto apenas por números";
          }
        }
      }
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

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
      estado: true,
      provincia: true,
      municipio: true,
      bairro: true,
      nomeRua: false,
    };
    setTocado(todosCampos);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Limpar erros anteriores deste campo
    if (erros[name]) {
      setErros(prev => ({ ...prev, [name]: "" }));
    }
    
    // Para nome completo: remover caracteres especiais e números enquanto digita
    if (name === 'nomeCompleto') {
      const valorLimpo = value.replace(/[!@#$%^&*()_+\-=\[\]{}|\\:;"'<>,.?\/\d]/g, '');
      setFormData((prev) => ({ ...prev, [name]: valorLimpo }));
      
      // Validação em tempo real para nome completo
      if (valorLimpo && valorLimpo.trim()) {
        if (contemCaracteresEspeciais(valorLimpo) || contemNumeros(valorLimpo)) {
          setErros(prev => ({ 
            ...prev, 
            [name]: "Nome não pode conter caracteres especiais ou números" 
          }));
        }
      }
    }
    // Para BI: permitir apenas letras, números e hífen
    else if (name === 'identificacao') {
      const valorLimpo = value.replace(/[^A-Za-z0-9\-]/g, '').toUpperCase();
      setFormData((prev) => ({ ...prev, [name]: valorLimpo }));
      
      // Validação em tempo real para BI
      if (valorLimpo && valorLimpo.trim()) {
        if (!validaApenasNumerosLetrasHifen(valorLimpo)) {
          setErros(prev => ({ 
            ...prev, 
            [name]: "BI não pode conter caracteres especiais (exceto hífen)" 
          }));
        }
      }
    }
    // Para nome da rua: validação em tempo real
    else if (name === 'nomeRua') {
      // Remover múltiplos caracteres especiais consecutivos
      const valorLimpo = value.replace(/([!@#$%^&*()_+\-=\[\]{}|\\:;"'<>,.?\/])\1+/g, '$1');
      setFormData((prev) => ({ ...prev, [name]: valorLimpo }));
      
      // Validação em tempo real para nome da rua
      if (valorLimpo && valorLimpo.trim()) {
        const validacaoRua = validaNomeRua(valorLimpo);
        if (!validacaoRua.valido) {
          setErros(prev => ({ ...prev, [name]: validacaoRua.erro }));
        }
      }
    }
    // Para email: validação em tempo real
    else if (name === 'email') {
      setFormData((prev) => ({ ...prev, [name]: value }));
      
      if (value && value.trim()) {
        if (!validarEmail(value)) {
          setErros(prev => ({ 
            ...prev, 
            [name]: "Email inválido" 
          }));
        } else if (!emailSemNumeros(value)) {
          setErros(prev => ({ 
            ...prev, 
            [name]: "Email não pode conter números no nome de usuário" 
          }));
        }
      }
    }
    // Para telefone: validação em tempo real
    else if (name === 'telefone') {
      // Permitir apenas números
      const valorLimpo = value.replace(/\D/g, '');
      setFormData((prev) => ({ ...prev, [name]: valorLimpo }));
      
      if (valorLimpo && valorLimpo.trim()) {
        if (!/^[0-9]{9}$/.test(valorLimpo)) {
          setErros(prev => ({ 
            ...prev, 
            [name]: "Telefone deve ter 9 dígitos" 
          }));
        }
      }
    }
    // Para outros campos
    else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      
      // Validação básica para campos obrigatórios
      const camposObrigatorios = [
        'dataNascimento', 'fkGenero', 'fkEstadoCivil', 'tipoConta', 
        'fkPerfil', 'estado', 'provincia', 'municipio', 'bairro'
      ];
      
      if (camposObrigatorios.includes(name) && !value) {
        const mensagensErro = {
          'dataNascimento': 'Data de nascimento é obrigatória',
          'fkGenero': 'Gênero é obrigatório',
          'fkEstadoCivil': 'Estado civil é obrigatório',
          'tipoConta': 'Tipo de conta é obrigatório',
          'fkPerfil': 'Perfil é obrigatório',
          'estado': 'Estado da conta é obrigatório',
          'provincia': 'Província é obrigatória',
          'municipio': 'Município é obrigatório',
          'bairro': 'Bairro é obrigatório'
        };
        
        setErros(prev => ({ ...prev, [name]: mensagensErro[name] || "Campo obrigatório" }));
      }
    }

    // Limpar municípios, bairros e campos de rua se a província mudar
    if (name === "provincia") {
      setFormData(prev => ({ 
        ...prev, 
        municipio: "",
        bairro: "",
        nomeRua: ""
      }));
    }
    
    // Limpar bairro e campos de rua se o município mudar
    if (name === "municipio") {
      setFormData(prev => ({ 
        ...prev, 
        bairro: "",
        nomeRua: ""
      }));
    }
    
    // Limpar campos de rua se o bairro mudar
    if (name === "bairro") {
      setFormData(prev => ({ 
        ...prev, 
        nomeRua: ""
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTocado(prev => ({ ...prev, [name]: true }));
  };

  const getCampoStatus = (campo) => {
    if (tocado[campo] || isSubmitting) {
      const valor = formData[campo];
      
      // SE HOUVER ERRO, SEMPRE RETORNAR "is-invalid"
      if (erros[campo]) {
        return "is-invalid";
      }
      
      const camposObrigatorios = [
        'nomeCompleto', 'dataNascimento', 'fkGenero', 'fkEstadoCivil',
        'identificacao', 'telefone', 'email', 'passwordHash',
        'tipoConta', 'fkPerfil', 'estado', 'provincia', 'municipio', 'bairro'
      ];
      
      if (camposObrigatorios.includes(campo)) {
        if (valor === undefined || valor === null || valor === "") {
          return "is-invalid";
        }
        return "is-valid";
      }
      
      if (valor && valor.trim() !== "") {
        // Validação específica para nomeRua
        if (campo === 'nomeRua') {
          const validacaoRua = validaNomeRua(valor);
          return validacaoRua.valido ? "is-valid" : "is-invalid";
        }
        return "is-valid";
      }
    }
    
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    marcarTodosCamposComoTocados();
    
    if (!validarFormulario()) {
      setMensagem({ 
        tipo: "danger", 
        texto: "Por favor, corrija os erros no formulário."
      });
      
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
      const provinciaSelecionada = provincias.find(p => 
        (p.nome || p.designacao) === formData.provincia
      );
      
      const municipioSelecionado = municipiosFiltrados.find(m => 
        (m.nome || m.designacao) === formData.municipio
      );
      
      const bairroSelecionado = bairrosFiltrados.find(b => 
        (b.nome || b.designacao) === formData.bairro
      );
      
      const dadosParaAPI = {
        nomeCompleto: formData.nomeCompleto.trim(),
        dataNascimento: formData.dataNascimento,
        fkGenero: parseInt(formData.fkGenero) || 0,
        fkEstadoCivil: parseInt(formData.fkEstadoCivil) || 0,
        identificacao: formData.identificacao.trim(),
        telefone: formData.telefone.trim(),
        email: formData.email.trim().toLowerCase(),
        passwordHash: formData.passwordHash || null,
        tipoConta: formData.tipoConta,
        fkPerfil: parseInt(formData.fkPerfil) || 0,
        estado: parseInt(formData.estado) || 1,
        provincia: provinciaSelecionada ? (provinciaSelecionada.nome || provinciaSelecionada.designacao) : "",
        municipio: municipioSelecionado ? (municipioSelecionado.nome || municipioSelecionado.designacao) : "",
        bairro: bairroSelecionado ? (bairroSelecionado.nome || bairroSelecionado.designacao) : "",
        nomeRua: formData.nomeRua.trim(),
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      try {
        // CORREÇÃO: Usar o endpoint correto com base no modo (editar ou cadastrar)
        const url = editando && contaId 
          ? `http://localhost:9090/api/seguranca/conta_atualizar/${contaId}`
          : "http://localhost:9090/api/seguranca/conta_cadastrar";
        
        const method = editando ? "PUT" : "POST";

        console.log(`${method} para ${url}`);
        console.log("Dados enviados:", dadosParaAPI);

        const response = await fetch(url, {
          method: method,
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(dadosParaAPI),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        const responseText = await response.text();
        
        let responseData;
        
        try {
          responseData = responseText ? JSON.parse(responseText) : {};
        } catch (parseError) {
          console.error("Erro ao parsear resposta:", parseError, "Texto:", responseText);
          
          if (response.status === 401 || response.status === 403) {
            throw new Error("Sem autorização para acessar o serviço");
          }
          
          if (responseText.includes("<!DOCTYPE") || responseText.includes("<html")) {
            throw new Error("O servidor retornou HTML em vez de JSON. Verifique se a API está funcionando.");
          }
          
          const errorMatch = responseText.match(/message["']?\s*:\s*["']([^"']+)["']/i) || 
                             responseText.match(/mensagem["']?\s*:\s*["']([^"']+)["']/i);
          
          if (errorMatch && errorMatch[1]) {
            throw new Error(errorMatch[1]);
          }
          
          throw new Error(`Resposta inválida do servidor: ${responseText.substring(0, 100)}...`);
        }
        
        if (typeof responseData !== 'object' || responseData === null) {
          throw new Error("Resposta do servidor em formato inválido");
        }
        
        if (responseData.sucesso === false) {
          throw new Error(responseData.mensagem || "Erro ao processar conta");
        }

        if (!responseData.sucesso && !responseData.mensagem) {
          throw new Error("Resposta do servidor incompleta");
        }

        const mensagemSucesso = responseData.mensagem || 
          (editando ? "✅ Conta atualizada com sucesso!" : "✅ Conta cadastrada com sucesso!");
        
        setMensagem({ 
          tipo: "success", 
          texto: mensagemSucesso
        });
        setSalvoComSucesso(true);
        
        // Aguardar 2 segundos e navegar para a lista
        setTimeout(() => {
          setSalvoComSucesso(false);
          setIsSubmitting(false);
          navigate('/conta/listar');
        }, 2000);

      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          throw new Error("Timeout: A requisição demorou muito para responder. Tente novamente.");
        }
        throw fetchError;
      }

    } catch (error) {
      console.error("Erro detalhado ao processar conta:", error);
      
      let errorMessage = error.message || `Erro ao ${editando ? 'atualizar' : 'cadastrar'} conta. Verifique os dados e tente novamente.`;
      
      if (errorMessage.includes("Transaction silently rolled back")) {
        errorMessage = "Erro no servidor ao processar os dados. Verifique se todos os campos obrigatórios foram preenchidos corretamente.";
      } else if (errorMessage.includes("constraint") || errorMessage.includes("duplicate")) {
        errorMessage = "Erro de dados duplicados. Verifique se o email ou identificação já estão cadastrados.";
      } else if (errorMessage.includes("Timeout")) {
        errorMessage = "A requisição está demorando muito. Verifique sua conexão e tente novamente.";
      } else if (errorMessage.includes("Sem autorização")) {
        errorMessage = "Sem permissão para realizar esta operação. Faça login novamente.";
      } else if (errorMessage.includes("HTML em vez de JSON")) {
        errorMessage = "Erro no servidor. A API pode estar indisponível.";
      }
      
      setMensagem({ 
        tipo: "danger", 
        texto: errorMessage
      });
      
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    // Se estiver editando, perguntar se quer voltar para a lista
    if (editando) {
      const confirmar = window.confirm("Deseja cancelar a edição e voltar para a lista?");
      if (confirmar) {
        navigate('/conta/listar');
      }
      return;
    }
    
    // Limpar o formulário no modo cadastro
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
      estado: "1",
      provincia: "",
      municipio: "",
      bairro: "",
      nomeRua: "",
    });
    setEditando(false);
    setContaId(null);
    setErros({});
    setTocado({});
    setMensagem(null);
  };

  const municipiosFiltrados = formData.provincia 
    ? municipios.filter(m => {
        const provinciaSelecionada = provincias.find(p => 
          (p.nome || p.designacao) === formData.provincia
        );
        
        if (!provinciaSelecionada) return false;
        
        const provinciaId = provinciaSelecionada.id || provinciaSelecionada.pkProvincia;
        
        return m.provinciaId === provinciaId || m.fkProvincia === provinciaId;
      })
    : [];

  const bairrosFiltrados = formData.municipio 
    ? bairros.filter(b => {
        const municipioSelecionado = municipiosFiltrados.find(m => 
          (m.nome || m.designacao) === formData.municipio
        );
        
        if (!municipioSelecionado) return false;
        
        const municipioId = municipioSelecionado.id || municipioSelecionado.pkMunicipio;
        
        return b.municipioId === municipioId || b.fkMunicipio === municipioId;
      })
    : [];

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
      <div className="card p-4 shadow w-100" style={{ maxWidth: '900px' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="mb-0 text-primary">
            <FaUserPlus className="me-2" /> Gestão Inteligente - {editando ? 'Editar' : 'Cadastrar'} Conta
            {editando && contaId && <span className="badge bg-warning ms-2">Editando ID: {contaId}</span>}
          </h3>
          
          {editando && (
            <button
              type="button"
              className="btn btn-light btn-sm px-4 py-2"
              onClick={() => navigate('/conta/listar')}
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
            >
              <FaArrowLeft className="me-2" />
              Cancelar Edição
            </button>
          )}
        </div>

        {mensagem && (
          <div className={`alert alert-${mensagem.tipo} text-center`} role="alert">
            <div className="d-flex align-items-center justify-content-center">
              {mensagem.tipo === "success" && <span className="me-2">✅</span>}
              {mensagem.tipo === "danger" && <span className="me-2">❌</span>}
              {mensagem.tipo === "info" && <span className="me-2">ℹ️</span>}
              <strong>{mensagem.texto}</strong>
            </div>
            {mensagem.tipo === "danger" && (
              <div className="mt-2">
                <small className="text-muted">
                  <FaInfoCircle className="me-1" /> 
                  Verifique todos os campos e tente novamente.
                </small>
              </div>
            )}
            {mensagem.tipo === "success" && (
              <div className="mt-2">
                <small className="text-muted">
                  <FaInfoCircle className="me-1" /> 
                  Redirecionando para a lista de contas...
                </small>
              </div>
            )}
          </div>
        )}

        {loading && !carregandoListas && (
          <div className="alert alert-info text-center">
            <span className="spinner-border spinner-border-sm me-2"></span>
            {editando ? "Carregando dados da conta..." : "Processando..."}
          </div>
        )}

        {carregandoListas && (
          <div className="alert alert-info text-center">
            <span className="spinner-border spinner-border-sm me-2"></span>
            Carregando dados de perfis, gêneros e endereços...
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-3">
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Dados Pessoais</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Nome Completo *</label>
                  <input
                    type="text"
                    className={`form-control ${getCampoStatus('nomeCompleto')}`}
                    name="nomeCompleto"
                    value={formData.nomeCompleto}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Digite o nome completo (apenas letras)"
                    required
                    disabled={loading || carregandoListas}
                    maxLength={100}
                  />
                  {erros.nomeCompleto ? (
                    <div className="invalid-feedback d-flex align-items-center">
                      <FaInfoCircle className="me-1" />
                      <strong>{erros.nomeCompleto}</strong>
                    </div>
                  ) : (
                    tocado.nomeCompleto && formData.nomeCompleto && !erros.nomeCompleto && (
                      <div className="valid-feedback d-flex align-items-center">
                        <FaInfoCircle className="me-1" />
                        <strong>Nome válido</strong>
                      </div>
                    )
                  )}
                  <small className="text-muted">Apenas letras são permitidas (não aceita números nem caracteres especiais)</small>
                </div>

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
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {erros.dataNascimento ? (
                    <div className="invalid-feedback d-flex align-items-center">
                      <FaInfoCircle className="me-1" />
                      <strong>{erros.dataNascimento}</strong>
                    </div>
                  ) : (
                    tocado.dataNascimento && formData.dataNascimento && !erros.dataNascimento && (
                      <div className="valid-feedback d-flex align-items-center">
                        <FaInfoCircle className="me-1" />
                        <strong>Data válida</strong>
                      </div>
                    )
                  )}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Gênero *</label>
                  <select
                    className={`form-select ${getCampoStatus('fkGenero')}`}
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
                  {erros.fkGenero ? (
                    <div className="invalid-feedback d-flex align-items-center">
                      <FaInfoCircle className="me-1" />
                      <strong>{erros.fkGenero}</strong>
                    </div>
                  ) : (
                    tocado.fkGenero && formData.fkGenero && !erros.fkGenero && (
                      <div className="valid-feedback d-flex align-items-center">
                        <FaInfoCircle className="me-1" />
                        <strong>Gênero selecionado</strong>
                      </div>
                    )
                  )}
                  {carregandoListas && generos.length === 0 && (
                    <small className="text-muted">Carregando gêneros...</small>
                  )}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Estado Civil *</label>
                  <select
                    className={`form-select ${getCampoStatus('fkEstadoCivil')}`}
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
                  {erros.fkEstadoCivil ? (
                    <div className="invalid-feedback d-flex align-items-center">
                      <FaInfoCircle className="me-1" />
                      <strong>{erros.fkEstadoCivil}</strong>
                    </div>
                  ) : (
                    tocado.fkEstadoCivil && formData.fkEstadoCivil && !erros.fkEstadoCivil && (
                      <div className="valid-feedback d-flex align-items-center">
                        <FaInfoCircle className="me-1" />
                        <strong>Estado civil selecionado</strong>
                      </div>
                    )
                  )}
                  {carregandoListas && estadosCivis.length === 0 && (
                    <small className="text-muted">Carregando estados civis...</small>
                  )}
                </div>

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
                    pattern="[A-Za-z0-9\-]+"
                    title="Apenas letras, números e hífen são permitidos"
                  />
                  {erros.identificacao ? (
                    <div className="invalid-feedback d-flex align-items-center">
                      <FaInfoCircle className="me-1" />
                      <strong>{erros.identificacao}</strong>
                    </div>
                  ) : (
                    tocado.identificacao && formData.identificacao && !erros.identificacao && (
                      <div className="valid-feedback d-flex align-items-center">
                        <FaInfoCircle className="me-1" />
                        <strong>BI válido</strong>
                      </div>
                    )
                  )}
                  <small className="text-muted">Apenas letras, números e hífen são permitidos</small>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Telefone *</label>
                  <input
                    type="tel"
                    className={`form-control ${getCampoStatus('telefone')}`}
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Digite o telefone (ex: 923456789)"
                    required
                    disabled={loading || carregandoListas}
                    pattern="[0-9]{9}"
                    title="Digite 9 dígitos (ex: 923456789)"
                  />
                  {erros.telefone ? (
                    <div className="invalid-feedback d-flex align-items-center">
                      <FaInfoCircle className="me-1" />
                      <strong>{erros.telefone}</strong>
                    </div>
                  ) : (
                    tocado.telefone && formData.telefone && !erros.telefone && (
                      <div className="valid-feedback d-flex align-items-center">
                        <FaInfoCircle className="me-1" />
                        <strong>Telefone válido</strong>
                      </div>
                    )
                  )}
                  <small className="text-muted">9 dígitos (ex: 923456789)</small>
                </div>
              </div>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-header bg-secondary text-white">
              <h5 className="mb-0">Dados da Conta</h5>
            </div>
            <div className="card-body">
              <div className="row">
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
                  {erros.email ? (
                    <div className="invalid-feedback d-flex align-items-center">
                      <FaInfoCircle className="me-1" />
                      <strong>{erros.email}</strong>
                    </div>
                  ) : (
                    tocado.email && formData.email && !erros.email && (
                      <div className="valid-feedback d-flex align-items-center">
                        <FaInfoCircle className="me-1" />
                        <strong>Email válido</strong>
                      </div>
                    )
                  )}
                  <small className="text-muted">Não pode conter números no nome de usuário</small>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Senha *</label>
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
                  {erros.passwordHash ? (
                    <div className="invalid-feedback d-flex align-items-center">
                      <FaInfoCircle className="me-1" />
                      <strong>{erros.passwordHash}</strong>
                    </div>
                  ) : (
                    tocado.passwordHash && formData.passwordHash && !erros.passwordHash && (
                      <div className="valid-feedback d-flex align-items-center">
                        <FaInfoCircle className="me-1" />
                        <strong>Senha válida</strong>
                      </div>
                    )
                  )}
                  {editando && (
                    <small className="text-muted">
                      Deixe em branco se não quiser alterar a senha
                    </small>
                  )}
                </div>

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
                  {erros.tipoConta ? (
                    <div className="invalid-feedback d-flex align-items-center">
                      <FaInfoCircle className="me-1" />
                      <strong>{erros.tipoConta}</strong>
                    </div>
                  ) : (
                    tocado.tipoConta && formData.tipoConta && !erros.tipoConta && (
                      <div className="valid-feedback d-flex align-items-center">
                        <FaInfoCircle className="me-1" />
                        <strong>Tipo de conta selecionado</strong>
                      </div>
                    )
                  )}
                </div>

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
                  {erros.fkPerfil ? (
                    <div className="invalid-feedback d-flex align-items-center">
                      <FaInfoCircle className="me-1" />
                      <strong>{erros.fkPerfil}</strong>
                    </div>
                  ) : (
                    tocado.fkPerfil && formData.fkPerfil && !erros.fkPerfil && (
                      <div className="valid-feedback d-flex align-items-center">
                        <FaInfoCircle className="me-1" />
                        <strong>Perfil selecionado</strong>
                      </div>
                    )
                  )}
                  {carregandoListas && perfis.length === 0 && (
                    <small className="text-muted">Carregando perfis...</small>
                  )}
                </div>

                <div className="col-12 mb-3">
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
                  {erros.estado ? (
                    <small className="text-danger fw-semibold d-block mt-2 d-flex align-items-center">
                      <FaInfoCircle className="me-1" />
                      <strong>{erros.estado}</strong>
                    </small>
                  ) : (
                    tocado.estado && formData.estado && !erros.estado && (
                      <small className="text-success fw-semibold d-block mt-2 d-flex align-items-center">
                        <FaInfoCircle className="me-1" />
                        <strong>Estado da conta definido</strong>
                      </small>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">Endereço Completo</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4 mb-3">
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
                    {provincias.map((p) => {
                      const nomeProvincia = p.nome || p.designacao;
                      return (
                        <option key={nomeProvincia} value={nomeProvincia}>
                          {nomeProvincia}
                        </option>
                      );
                    })}
                  </select>
                  {erros.provincia ? (
                    <div className="invalid-feedback d-flex align-items-center">
                      <FaInfoCircle className="me-1" />
                      <strong>{erros.provincia}</strong>
                    </div>
                  ) : (
                    tocado.provincia && formData.provincia && !erros.provincia && (
                      <div className="valid-feedback d-flex align-items-center">
                        <FaInfoCircle className="me-1" />
                        <strong>Província selecionada</strong>
                      </div>
                    )
                  )}
                </div>

                <div className="col-md-4 mb-3">
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
                    {municipiosFiltrados.map((m) => {
                      const nomeMunicipio = m.nome || m.designacao;
                      return (
                        <option key={nomeMunicipio} value={nomeMunicipio}>
                          {nomeMunicipio}
                        </option>
                      );
                    })}
                  </select>
                  {erros.municipio ? (
                    <div className="invalid-feedback d-flex align-items-center">
                      <FaInfoCircle className="me-1" />
                      <strong>{erros.municipio}</strong>
                    </div>
                  ) : (
                    tocado.municipio && formData.municipio && !erros.municipio && (
                      <div className="valid-feedback d-flex align-items-center">
                        <FaInfoCircle className="me-1" />
                        <strong>Município selecionado</strong>
                      </div>
                    )
                  )}
                  {formData.provincia && municipiosFiltrados.length === 0 && (
                    <small className="text-muted">
                      {carregandoListas ? 'Carregando municípios...' : 'Nenhum município disponível para esta província'}
                    </small>
                  )}
                </div>

                <div className="col-md-4 mb-3">
                  <label className="form-label fw-bold">Bairro *</label>
                  <select
                    className={`form-select ${getCampoStatus('bairro')}`}
                    name="bairro"
                    value={formData.bairro}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    disabled={loading || carregandoListas || !formData.municipio || bairrosFiltrados.length === 0}
                  >
                    <option value="">Selecione o bairro...</option>
                    {bairrosFiltrados.map((b) => {
                      const nomeBairro = b.nome || b.designacao;
                      return (
                        <option key={nomeBairro} value={nomeBairro}>
                          {nomeBairro}
                        </option>
                      );
                    })}
                  </select>
                  {erros.bairro ? (
                    <div className="invalid-feedback d-flex align-items-center">
                      <FaInfoCircle className="me-1" />
                      <strong>{erros.bairro}</strong>
                    </div>
                  ) : (
                    tocado.bairro && formData.bairro && !erros.bairro && (
                      <div className="valid-feedback d-flex align-items-center">
                        <FaInfoCircle className="me-1" />
                        <strong>Bairro selecionado</strong>
                      </div>
                    )
                  )}
                  {formData.municipio && bairrosFiltrados.length === 0 && (
                    <small className="text-muted">
                      {carregandoListas ? 'Carregando bairros...' : 'Nenhum bairro disponível para este município'}
                    </small>
                  )}
                </div>

                <div className="col-md-12 mb-3">
                  <label className="form-label fw-bold d-flex align-items-center">
                    <FaRoad className="me-2" /> Nome da Rua / Número
                  </label>
                  <input
                    type="text"
                    className={`form-control ${getCampoStatus('nomeRua')}`}
                    name="nomeRua"
                    value={formData.nomeRua}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Digite o nome da rua, avenida ou travessa"
                    disabled={loading || carregandoListas}
                    maxLength={150}
                  />
                  {erros.nomeRua ? (
                    <div className="invalid-feedback d-flex align-items-center">
                      <FaInfoCircle className="me-1" />
                      <strong>{erros.nomeRua}</strong>
                    </div>
                  ) : (
                    tocado.nomeRua && formData.nomeRua && !erros.nomeRua && (
                      <div className="valid-feedback d-flex align-items-center">
                        <FaInfoCircle className="me-1" />
                        <strong>Nome da rua válido</strong>
                      </div>
                    )
                  )}
                  <small className="text-muted">
                    Ex: Avenida 4 de Fevereiro, Rua Amílcar Cabral. 
                    Deve incluir pelo menos uma letra e não pode conter apenas números com caracteres especiais.
                  </small>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-4">
            <button
              type="submit"
              className="btn btn-primary me-2 px-4"
              disabled={loading || isSubmitting || carregandoListas}
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="fa-spin me-2" />
                  {editando ? "Atualizando..." : "Cadastrando..."}
                </>
              ) : carregandoListas ? (
                <>
                  <FaSpinner className="fa-spin me-2" />
                  Carregando dados...
                </>
              ) : editando ? (
                <>
                  <FaEdit className="me-2" />
                  Atualizar Conta
                </>
              ) : (
                <>
                  <FaSave className="me-2" />
                  Cadastrar Conta
                </>
              )}
            </button>

            <button
              type="button"
              className="btn btn-secondary px-4 me-2"
              onClick={resetForm}
              disabled={loading || carregandoListas}
            >
              {editando ? "Cancelar Edição" : "Limpar Formulário"}
            </button>

            {editando && (
              <button
                type="button"
                className="btn btn-warning px-4"
                onClick={() => {
                  if (window.confirm("Deseja cancelar a edição e voltar à lista?")) {
                    navigate('/conta/listar');
                  }
                }}
                disabled={loading || carregandoListas}
              >
                <FaArrowLeft className="me-2" />
                Voltar à Lista
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}