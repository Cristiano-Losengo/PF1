import { useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import {
  FaMapMarkerAlt, FaTint, FaExclamationCircle, FaCalendarAlt, FaFileAlt, FaUser,
  FaPhoneAlt, FaPaperclip, FaListAlt, FaComments, FaCheckCircle, FaHourglassHalf,
  FaCheck, FaTimes, FaEnvelope, FaClock // ✅ Adicione o FaClock aqui
} from 'react-icons/fa';
import Footer from './Footer';
export default function Agua() {
  const { tipo } = useParams();
  const [anonimo, setAnonimo] = useState(false);
  const [formData, setFormData] = useState({
    localEspecificoDaOcorrencia: '',
    municipio: 'Luanda',
    bairro: 'Sambizanga',
    nomeRua: '',
    dataOcorrecia: '',
    subtipo: 'agua_inexistente',
    descricaoDetalhada: '',
    nome: '',
    contacto: '',
    email: '',
    anexo: null
  });

  const [errors, setErrors] = useState({});
  const [denuncias, setDenuncias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [touched, setTouched] = useState({});
  const [submitErrors, setSubmitErrors] = useState([]);

  // --- MUNICÍPIOS E BAIRROS ---
  const municipios = [
    "Belas", "Cacuaco", "Cazenga", "Ícolo_e_Bengo",
    "Luanda", "KilambaKiaxi", "Quiçama", "Talatona", "Viana"
  ];

  const bairrosPorMunicipio = {
    Luanda: ["Ingombota", "Maianga", "Sambizanga", "Rangel", "Kinaxixi", "Mutamba"],
    Viana: ["Zango 1", "Zango 2", "Zango 3", "Zango 4", "Estalagem", "Vila de Viana", "Capalanga"],
    Cazenga: ["Hoji-ya-Henda", "Mabor", "Tala Hady", "Cazenga Popular"],
    Belas: ["Benfica", "Morro Bento", "Camama", "Kilamba", "Talismã"],
    Cacuaco: ["Sequele", "Ngola Kiluanje", "Kikolo", "Mulenvos"],
    Talatona: ["Patriota", "Futungo", "Cidade Universitária", "Morro Bento II"],
    KilambaKiaxi: ["Golfe 1", "Golfe 2", "Palanca", "Sapú", "Terra Nova"],
    "Ícolo_e_Bengo": ["Catete", "Cabiri", "Cassoneca", "Bom Jesus"],
    Quiçama: ["Mumbondo", "Demba Chio", "Muxima"]
  };

  // --- FUNÇÃO PARA MAPEAR SUBTIPO PARA TIPO ESPECÍFICO ---
  const getTipoEspecifico = (subtipo) => {
    const mapeamento = {
      'agua_inexistente': 'Falta total de água',
      'agua_suja': 'contaminada/suja',
      'vazamento na Infraestrutura': 'Vazamento',
      'conta_abusiva': 'Cobrança indevida',
      'infraestrutura': 'Problemas na infraestrutura',
      'corte': 'Corte Abusivo'
    };
    return mapeamento[subtipo] || 'Problema de Água';
  };

  // --- TESTAR CONEXÃO COM BACKEND ---
  const testarConexaoBackend = async () => {
    try {
      console.log('🔄 Testando conexão com backend...');
      console.log('URL: http://localhost:9090/api/denuncias');

      const res = await fetch("http://localhost:9090/api/denuncias", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });

      if (res.ok) {
        console.log('✅ Backend está respondendo! Status:', res.status);
        const data = await res.json();
        console.log('Total de denúncias:', data.length);
        console.log('Primeira denúncia:', data[0]);
        console.log('Província da primeira:', data[0]?.provincia);
        console.log('DataRegistro da primeira:', data[0]?.dataRegistro);
        return true;
      } else {
        console.log('❌ Backend respondeu com erro. Status:', res.status);
        const errorText = await res.text();
        console.log('Resposta do erro:', errorText);
        return false;
      }
    } catch (err) {
      console.log('❌ Não foi possível conectar ao backend:', err.message);
      console.log('Tipo de erro:', err.name);
      console.log('Stack:', err.stack);
      return false;
    }
  };

  // --- BUSCAR DADOS INICIAIS ---
  useEffect(() => {
    console.log('🔄 Componente Agua montado');
    console.log('Frontend URL:', window.location.href);
    console.log('Backend URL:', 'http://localhost:9090');

    // Testar conexão
    testarConexaoBackend();
    fetchDenuncias();
  }, []);

  const fetchDenuncias = async () => {
    try {
      setLoading(true);
      console.log('🔄 Buscando denúncias...');
      const res = await fetch("http://localhost:9090/api/denuncias");
      console.log('Resposta do GET denúncias:', res.status, res.statusText);

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Erro ao buscar denúncias:', errorText);
        throw new Error(`Erro ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      console.log('Dados recebidos da API:', data);
      console.log('Primeira denúncia:', data[0]);
      console.log('Província da primeira:', data[0]?.provincia);
      console.log('DataRegistro da primeira:', data[0]?.dataRegistro);
      console.log('Denúncias recebidas:', data.length);

      // ✅ CORREÇÃO: Agora filtra por categoriaNome (do DTO) em vez de categoria.nome
      const denunciasAgua = data.filter(d =>
        d.categoriaNome && d.categoriaNome === "Água"
      );

      console.log('Denúncias de água filtradas:', denunciasAgua.length);
      setDenuncias(denunciasAgua || []);
    } catch (err) {
      console.error('fetchDenuncias error:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- FUNÇÕES DE VALIDAÇÃO ---
  const validarSomenteLetras = (valor) => {
    return /^[A-Za-zÀ-ÿ\s]+$/.test(valor);
  };

  const validarContacto = (valor) => {
    return /^9\d{8}$/.test(valor.replace(/\s/g, ''));
  };

  const validarEmail = (valor) => {
    if (!valor || valor.trim() === '') return true; // Email é opcional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(valor);
  };

  const validarDescricao = (valor) => {
    return valor.trim().length >= 10;
  };

  const validarData = (data) => {
    if (!data) return false;

    const dataSelecionada = new Date(data);
    const hoje = new Date();
    const dataMinima = new Date();
    dataMinima.setFullYear(dataMinima.getFullYear() - 1);

    return dataSelecionada <= hoje && dataSelecionada >= dataMinima;
  };

  // --- FUNÇÕES DE VALIDAÇÃO ADICIONADAS PARA CARACTERES ESPECIAIS/NÚMEROS ---
  const validarNaoApenasNumeros = (valor) => {
    if (!valor || valor.trim() === '') return true;
    // Verificar se contém apenas números (incluindo espaços entre números)
    const apenasNumeros = /^[0-9\s]+$/.test(valor);
    return !apenasNumeros;
  };

  const validarNaoApenasEspeciais = (valor) => {
    if (!valor || valor.trim() === '') return true;
    // Remover espaços para verificar caracteres especiais
    const textoSemEspacos = valor.replace(/\s/g, '');
    // Lista de caracteres especiais
    const apenasEspeciais = /^[!@#$%^&*()_+\-=\[\]{}|\\:;"'<>,.?\/]+$/.test(textoSemEspacos);
    return !apenasEspeciais;
  };

  // FUNÇÃO MELHORADA: Verificar se contém apenas números E/OU caracteres especiais (sem letras)
  const validarApenasNumerosEspeciais = (valor) => {
    if (!valor || valor.trim() === '') return false;

    // Remover espaços para análise
    const textoSemEspacos = valor.replace(/\s/g, '');

    // Verificar se contém alguma letra (incluindo acentuadas)
    const temLetra = /[a-zA-ZÀ-ÿ]/.test(textoSemEspacos);

    // Se não tem letra, verificar se tem apenas números e/ou caracteres especiais
    if (!temLetra) {
      // Verificar se todos os caracteres são números OU caracteres especiais
      const apenasNumerosEspeciais = /^[0-9!@#$%^&*()_+\-=\[\]{}|\\:;"'<>,.?\/]+$/.test(textoSemEspacos);
      return apenasNumerosEspeciais;
    }

    return false;
  };

  const validarTemLetra = (valor) => {
    if (!valor || valor.trim() === '') return false;
    // Verificar se contém pelo menos uma letra (incluindo acentuadas)
    return /[a-zA-ZÀ-ÿ]/.test(valor);
  };

  const validarCampoTextoCompleto = (valor, nomeCampo) => {
    const valorTrim = valor.toString().trim();

    if (!valorTrim) {
      return `${nomeCampo} é obrigatório.`;
    }

    if (valorTrim.length < 1) {
      return `${nomeCampo} deve ter pelo menos 1 caracteres.`;
    }

    // Verificar se contém apenas números e/ou caracteres especiais (sem letras)
    if (validarApenasNumerosEspeciais(valorTrim)) {
      return `${nomeCampo} não pode conter apenas números e caracteres especiais. Deve incluir pelo menos uma letra.`;
    }

    // Verificar se contém pelo menos uma letra
    if (!validarTemLetra(valorTrim)) {
      return `${nomeCampo} deve conter pelo menos uma letra.`;
    }

    return null;
  };

  // --- MANIPULAÇÃO DOS CAMPOS ---
  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;

    if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files?.[0] || null }));
      // Limpar erro do anexo quando um novo arquivo é selecionado
      if (errors.anexo) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.anexo;
          return newErrors;
        });
      }
    } else if (type === 'checkbox') {
      if (name === 'anonimo') setAnonimo(checked);
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      let valorProcessado = value;

      if (name === 'nome') {
        valorProcessado = value.replace(/[0-9]/g, '');
      } else if (name === 'contacto') {
        valorProcessado = value.replace(/[^\d]/g, '');
      }

      setFormData(prev => ({ ...prev, [name]: valorProcessado }));

      // Validação em tempo real apenas para feedback visual
      if (touched[name]) {
        const fieldError = validarCampo(name, valorProcessado);
        if (fieldError) {
          setErrors(prev => ({ ...prev, [name]: fieldError }));
        } else {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
          });
        }
      }
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (!touched[name]) {
      setTouched(prev => ({ ...prev, [name]: true }));
    }

    const fieldError = validarCampo(name, value);
    if (fieldError) {
      setErrors(prev => ({ ...prev, [name]: fieldError }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validarCampo = (name, value) => {
    const valorTrim = value.toString().trim();

    switch (name) {
      case 'localEspecificoDaOcorrencia':
        return validarCampoTextoCompleto(valorTrim, 'Local Específico da Ocorrência');

      case 'municipio':
        if (!valorTrim) return 'Selecione o município.';
        return null;

      case 'bairro':
        if (!valorTrim) return 'Selecione o bairro.';
        return null;

      case 'nomeRua':
        return validarCampoTextoCompleto(valorTrim, 'Nome da Rua / Número');

      case 'dataOcorrecia':
        if (!valorTrim) return 'Informe a data da ocorrência.';
        if (!validarData(valorTrim)) return 'Data deve ser entre 1 ano atrás e hoje.';
        return null;

      case 'subtipo':
        if (!valorTrim) return 'Selecione o tipo de problema.';
        return null;

      case 'descricaoDetalhada':
        // Validação específica para descrição detalhada
        if (!valorTrim) return 'Descreva o problema.';
        if (valorTrim.length < 10) return 'Descrição deve ter pelo menos 10 caracteres.';

        // Verificar se contém apenas números e/ou caracteres especiais (sem letras)
        if (validarApenasNumerosEspeciais(valorTrim)) {
          return 'Descrição não pode conter apenas números e caracteres especiais. Deve incluir pelo menos uma letra.';
        }

        // Verificar se contém pelo menos uma letra
        if (!validarTemLetra(valorTrim)) {
          return 'Descrição deve conter pelo menos uma letra.';
        }

        return null;

      case 'nome':
        if (!anonimo) {
          if (!valorTrim) return 'Informe o nome completo.';
          if (!validarSomenteLetras(valorTrim)) return 'Nome deve conter apenas letras.';
          if (valorTrim.length < 3) return 'Nome deve ter pelo menos 3 caracteres.';
          if (valorTrim.split(' ').length < 2) return 'Informe nome e sobrenome.';
        }
        return null;

      case 'contacto':
        if (!anonimo) {
          if (!valorTrim) return 'Informe o contacto.';
          if (!validarContacto(valorTrim)) return 'Contacto inválido. Use formato: 9XXXXXXXX';
        }
        return null;

      case 'email':
        if (!anonimo && valorTrim) {
          if (!validarEmail(valorTrim)) return 'Email inválido. Use formato: exemplo@dominio.com';
        }
        return null;

      default:
        return null;
    }
  };

  // --- VALIDAÇÃO COMPLETA ---
  const validarFormulario = () => {
    const newErrors = {};

    Object.keys(formData).forEach(key => {
      if (key !== 'anexo') {
        const error = validarCampo(key, formData[key]);
        if (error) {
          newErrors[key] = error;
        }
      }
    });

    return newErrors;
  };

  // --- UPLOAD DE ARQUIVO ---
  const handleFileUpload = async (file) => {
    if (!file) return null;

    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const tamanhoMaximo = 5 * 1024 * 1024;

    if (!tiposPermitidos.includes(file.type)) {
      throw new Error('Tipo de arquivo não permitido. Use JPG, PNG, PDF ou DOC.');
    }

    if (file.size > tamanhoMaximo) {
      throw new Error('Arquivo muito grande. Tamanho máximo: 5MB.');
    }

    try {
      console.log('📤 Iniciando upload do arquivo:', file.name);
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const res = await fetch("http://localhost:9090/api/denuncias/upload", {
        method: "POST",
        body: uploadFormData
      });

      if (res.ok) {
        const nomeArquivo = await res.text();
        console.log('✅ Upload concluído:', nomeArquivo);
        return nomeArquivo;
      } else {
        const errorText = await res.text();
        console.error('❌ Erro no upload:', errorText);
        throw new Error('Erro ao fazer upload do arquivo.');
      }
    } catch (err) {
      console.error('❌ Erro no handleFileUpload:', err);
      throw new Error('Falha ao conectar com servidor.');
    }
  };

  // --- ENVIO DA DENÚNCIA ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('=== INICIANDO ENVIO DA DENÚNCIA ===');
    console.log('FormData:', formData);
    console.log('Anônimo:', anonimo);

    // Limpar erros anteriores do submit
    setSubmitErrors([]);

    // Marcar todos os campos como tocados
    const allTouched = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    // Validar formulário
    const newErrors = validarFormulario();
    setErrors(newErrors);

    // Verificar se há erros de validação
    if (Object.keys(newErrors).length > 0) {
      console.log('❌ Erros de validação:', newErrors);
      const firstErrorField = Object.keys(newErrors)[0];
      const errorElement = document.getElementById(firstErrorField);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        errorElement.focus();
      }
      return;
    }

    try {
      setLoading(true);

      // Upload do anexo
      let nomeArquivo = null;
      if (formData.anexo) {
        try {
          nomeArquivo = await handleFileUpload(formData.anexo);
        } catch (uploadError) {
          console.error('❌ Erro no upload do arquivo:', uploadError);
          setSubmitErrors([uploadError.message]);
          setLoading(false);
          return;
        }
      }

      // 🔧🔧🔧 PAYLOAD CORRETO PARA O DTO DO BACKEND (COM CORREÇÕES)
      const tipoEspecifico = getTipoEspecifico(formData.subtipo);

      const payload = {
        nome: anonimo ? null : formData.nome.trim(),
        email: anonimo ? null : (formData.email ? formData.email.trim() : null), // ✅ ADICIONADO EMAIL
        descricaoDetalhada: formData.descricaoDetalhada.trim(),
        tipoEspecifico: tipoEspecifico, // ✅ VALOR DIFERENTE DO SUBTIPO
        subtipo: formData.subtipo, // ✅ VALOR ORIGINAL DO SELECT
        anexo: nomeArquivo,
        localEspecificoDaOcorrencia: formData.localEspecificoDaOcorrencia.trim(),
        anonima: anonimo,
        contacto: anonimo ? null : formData.contacto,
        dataOcorrecia: formData.dataOcorrecia,
        municipio: formData.municipio,
        bairro: formData.bairro,
        nomeRua: formData.nomeRua.trim(),
        local: formData.localEspecificoDaOcorrencia.trim(),
        categoriaNome: "Água"
      };

      // ✅ DEBUG PARA VERIFICAR OS DADOS ENVIADOS
      console.log('📤 Enviando payload para DTO:', {
        ...payload,
        tipoEspecifico,
        subtipo: formData.subtipo,
        emailIncluido: !!(anonimo ? null : formData.email)
      });
      console.log('📤 Email do formData:', formData.email);
      console.log('📤 Anônimo?:', anonimo);
      console.log('📤 Tipo Específico:', tipoEspecifico);
      console.log('📤 Subtipo:', formData.subtipo);
      console.log('📤 URL: http://localhost:9090/api/denuncias');

      // Enviar denúncia
      const res = await fetch("http://localhost:9090/api/denuncias", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      });

      console.log('📥 Resposta recebida:', res.status, res.statusText);

      if (res.ok) {
        const nova = await res.json();
        console.log('✅ Denúncia salva com sucesso:', nova);
        console.log('✅ Email salvo?', nova.email);
        console.log('✅ Tipo Específico salvo?', nova.tipoEspecifico);
        console.log('✅ Subtipo salvo?', nova.subtipo);

        setDenuncias(prev => [...prev, nova]);

        // Reset do formulário
        setFormData({
          localEspecificoDaOcorrencia: '',
          municipio: 'Luanda',
          bairro: 'Sambizanga',
          nomeRua: '',
          dataOcorrecia: '',
          subtipo: 'agua_inexistente',
          descricaoDetalhada: '',
          nome: '',
          contacto: '',
          email: '',
          anexo: null
        });

        setAnonimo(false);
        setErrors({});
        setTouched({});
        setSubmitSuccess(true);

        setTimeout(() => setSubmitSuccess(false), 5000);
        fetchDenuncias();
        window.scrollTo({ top: 0, behavior: 'smooth' });

      } else {
        const errorText = await res.text();
        console.error('❌ Erro no POST:', res.status, errorText);

        // Melhor tratamento de erro
        let errorMessage = 'Erro ao enviar denúncia.';

        // Verificar tipo de erro
        if (!res.ok) {
          if (res.status === 0 || res.status >= 500) {
            errorMessage = 'Erro no servidor. Tente novamente mais tarde.';
          } else if (res.status === 404) {
            errorMessage = 'Endpoint não encontrado. Verifique a URL.';
          } else if (res.status === 400) {
            errorMessage = 'Dados inválidos. Verifique os campos.';
          } else if (res.status === 401 || res.status === 403) {
            errorMessage = 'Acesso não autorizado.';
          } else if (res.status === 415) {
            errorMessage = 'Tipo de conteúdo não suportado.';
          }
        }

        // Tentar extrair mensagem do backend
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          if (errorText && errorText.trim() !== '') {
            errorMessage = errorText;
          }
        }

        console.error('❌ Erro detalhado:', errorMessage);
        setSubmitErrors([errorMessage]);
      }
    } catch (err) {
      console.error('❌ handleSubmit catch:', err);

      // Identificar tipo de erro
      let errorMessage = 'Falha ao conectar com servidor.';

      if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        errorMessage = 'Não foi possível conectar ao servidor. Verifique:';
        errorMessage += '\n1. O backend está rodando?';
        errorMessage += '\n2. A URL está correta?';
        errorMessage += '\n3. Há problemas de CORS?';
      } else if (err.message && err.message.includes('NetworkError')) {
        errorMessage = 'Erro de rede. Verifique sua conexão com a internet.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      console.error('❌ Erro final:', errorMessage);
      setSubmitErrors([errorMessage]);

    } finally {
      setLoading(false);
    }
  };

  // --- EXIBIR STATUS VISUAL ---
  const renderStatusBadge = (d) => {
    const status = d.status || (d.resposta ? 'Resolvido' : 'Pendente');
    if (status === 'Resolvido' || status === 'Concluído') {
      return <span className="badge bg-success"><FaCheckCircle className="me-1" /> {status}</span>;
    }
    return <span className="badge bg-warning text-dark"><FaHourglassHalf className="me-1" /> {status}</span>;
  };

  // --- FORMATAR CONTACTO ---
  const formatarContacto = (valor) => {
    if (!valor) return '';
    const apenasNumeros = valor.replace(/\D/g, '');
    if (apenasNumeros.length <= 3) return apenasNumeros;
    if (apenasNumeros.length <= 6) return `${apenasNumeros.slice(0, 3)} ${apenasNumeros.slice(3)}`;
    return `${apenasNumeros.slice(0, 3)} ${apenasNumeros.slice(3, 6)} ${apenasNumeros.slice(6, 9)}`;
  };

  // --- INTERFACE ---
  return (
    <div className="page">
      <main>
        <div className="container py-4">

          {/* MENSAGEM DE SUCESSO */}
          {submitSuccess && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              <FaCheck className="me-2" />
              <strong>✅ Denúncia registrada com sucesso!</strong> Sua denúncia foi enviada e será analisada.
              <button type="button" className="btn-close" onClick={() => setSubmitSuccess(false)}></button>
            </div>
          )}
          {submitErrors.length > 0 && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <FaTimes className="me-2" />
              <strong>Erro ao enviar denúncia:</strong>
              <ul className="mb-0 mt-2">
                {submitErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
              <button type="button" className="btn-close" onClick={() => setSubmitErrors([])}></button>
            </div>
          )}

          {/* FORMULÁRIO DE DENÚNCIA */}
          {tipo === "registrar" && (
            <form className="container mt-5" onSubmit={handleSubmit} style={{ maxWidth: "800px" }}>
              <h3 className="mb-4 text-primary">
                <FaTint className="me-2 text-primary" /> Registrar Ocorrência - Setor de Água
              </h3>

              {/* LOCAL */}
              <div className="mb-3">
                <label htmlFor="localEspecificoDaOcorrencia" className="form-label">
                  <FaMapMarkerAlt className="me-2" /> Local Específico da avaria *
                </label>
                <input
                  type="text"
                  id="localEspecificoDaOcorrencia"
                  name="localEspecificoDaOcorrencia"
                  value={formData.localEspecificoDaOcorrencia}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`form-control ${errors.localEspecificoDaOcorrencia ? 'is-invalid' : touched.localEspecificoDaOcorrencia && !errors.localEspecificoDaOcorrencia ? 'is-valid' : ''}`}
                  placeholder="Ex: Canal, reservatório, torneira pública..."
                  maxLength="100"
                />
                {errors.localEspecificoDaOcorrencia && <div className="invalid-feedback">{errors.localEspecificoDaOcorrencia}</div>}
                <small className="text-muted">Mínimo 3 caracteres. Deve incluir pelo menos uma letra.</small>
              </div>

              {/* MUNICÍPIO */}
              <div className="mb-3">
                <label htmlFor="municipio" className="form-label">
                  <FaMapMarkerAlt className="me-2" /> Município *
                </label>
                <select
                  id="municipio"
                  name="municipio"
                  value={formData.municipio}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`form-select ${errors.municipio ? 'is-invalid' : touched.municipio && !errors.municipio ? 'is-valid' : ''}`}
                >
                  <option value="">Selecione o município...</option>
                  {municipios.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                {errors.municipio && <div className="invalid-feedback">{errors.municipio}</div>}
              </div>

              {/* BAIRRO */}
              {formData.municipio && (
                <div className="mb-3">
                  <label htmlFor="bairro" className="form-label">
                    <FaMapMarkerAlt className="me-2" /> Bairro *
                  </label>
                  <select
                    id="bairro"
                    name="bairro"
                    value={formData.bairro}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`form-select ${errors.bairro ? 'is-invalid' : touched.bairro && !errors.bairro ? 'is-valid' : ''}`}
                  >
                    <option value="">Selecione o bairro...</option>
                    {(bairrosPorMunicipio[formData.municipio] || []).map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                  {errors.bairro && <div className="invalid-feedback">{errors.bairro}</div>}
                </div>
              )}

              {/* RUA */}
              <div className="mb-3">
                <label htmlFor="nomeRua" className="form-label">
                  <FaMapMarkerAlt className="me-2" /> Nome da Rua / Número *
                </label>
                <input
                  type="text"
                  id="nomeRua"
                  name="nomeRua"
                  value={formData.nomeRua}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`form-control ${errors.nomeRua ? 'is-invalid' : touched.nomeRua && !errors.nomeRua ? 'is-valid' : ''}`}
                  placeholder="Ex: Rua 12 de Julho, nº 45"
                  maxLength="100"
                />
                {errors.nomeRua && <div className="invalid-feedback">{errors.nomeRua}</div>}
                <small className="text-muted">Mínimo 2 caracteres. Deve incluir pelo menos uma letra.</small>
              </div>

              {/* DATA */}
              <div className="mb-3">
                <label htmlFor="dataOcorrecia" className="form-label">
                  <FaCalendarAlt className="me-2" /> Data da Ocorrência *
                </label>
                <input
                  type="date"
                  id="dataOcorrecia"
                  name="dataOcorrecia"
                  value={formData.dataOcorrecia}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`form-control ${errors.dataOcorrecia ? 'is-invalid' : touched.dataOcorrecia && !errors.dataOcorrecia ? 'is-valid' : ''}`}
                  max={new Date().toISOString().split('T')[0]}
                  min={new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0]}
                />
                {errors.dataOcorrecia && <div className="invalid-feedback">{errors.dataOcorrecia}</div>}
                <small className="text-muted">Máximo 1 ano atrás</small>
              </div>

              {/* SUBTIPO */}
              <div className="mb-3">
                <label htmlFor="subtipo" className="form-label">
                  <FaListAlt className="me-2" /> Tipo Específico *
                </label>
                <select
                  id="subtipo"
                  name="subtipo"
                  value={formData.subtipo}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`form-select ${errors.subtipo ? 'is-invalid' : touched.subtipo && !errors.subtipo ? 'is-valid' : ''}`}
                >
                  <option value="">Selecione o tipo de problema...</option>
                  <option value="agua_inexistente">Falta total de água</option>
                  <option value="agua_suja">Água contaminada/suja</option>
                  <option value="vazamento">Vazamento</option>
                  <option value="conta_abusiva">Cobrança indevida</option>
                  <option value="infraestrutura">Problemas na infraestrutura</option>
                  <option value="desperdicio">Desperdício</option>
                  <option value="corte">Corte Abusivo</option>
                </select>
                {errors.subtipo && <div className="invalid-feedback">{errors.subtipo}</div>}
                <small className="text-muted">
                  Será salvo como: <strong>{getTipoEspecifico(formData.subtipo)}</strong>
                </small>
              </div>

              {/* DESCRIÇÃO */}
              <div className="mb-3">
                <label htmlFor="descricaoDetalhada" className="form-label">
                  <FaFileAlt className="me-2" /> Descrição Detalhada *
                </label>
                <textarea
                  id="descricaoDetalhada"
                  name="descricaoDetalhada"
                  value={formData.descricaoDetalhada}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`form-control ${errors.descricaoDetalhada ? 'is-invalid' : touched.descricaoDetalhada && !errors.descricaoDetalhada ? 'is-valid' : ''}`}
                  rows="4"
                  placeholder="Descreva detalhadamente o problema encontrado..."
                  maxLength="1000"
                />
                {errors.descricaoDetalhada && <div className="invalid-feedback">{errors.descricaoDetalhada}</div>}
                <small className="text-muted">
                  Mínimo 10 caracteres. Deve incluir pelo menos uma letra.
                  Restam {1000 - formData.descricaoDetalhada.length} caracteres
                </small>
              </div>

              {/* IDENTIFICAÇÃO */}
              {!anonimo && (
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="nome" className="form-label">
                      <FaUser className="me-2" /> Nome do Denunciante *
                    </label>
                    <input
                      type="text"
                      id="nome"
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`form-control ${errors.nome ? 'is-invalid' : touched.nome && !errors.nome ? 'is-valid' : ''}`}
                      placeholder="Seu nome completo"
                      maxLength="100"
                    />
                    {errors.nome && <div className="invalid-feedback">{errors.nome}</div>}
                    <small className="text-muted">Apenas letras, nome e sobrenome</small>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="contacto" className="form-label">
                      <FaPhoneAlt className="me-2" /> Contacto *
                    </label>
                    <input
                      type="tel"
                      id="contacto"
                      name="contacto"
                      value={formatarContacto(formData.contacto)}
                      onChange={(e) => {
                        const apenasNumeros = e.target.value.replace(/\D/g, '');
                        setFormData(prev => ({ ...prev, contacto: apenasNumeros }));
                      }}
                      onBlur={handleBlur}
                      className={`form-control ${errors.contacto ? 'is-invalid' : touched.contacto && !errors.contacto ? 'is-valid' : ''}`}
                      placeholder="9XX XXX XXX"
                      maxLength="11"
                    />
                    {errors.contacto && <div className="invalid-feedback">{errors.contacto}</div>}
                    <small className="text-muted">Formato: 9XXXXXXXX (9 dígitos)</small>
                  </div>
                </div>
              )}

              {/* EMAIL (OPCIONAL) - Agora será salvo no backend */}
              {!anonimo && (
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    <FaEnvelope className="me-2" /> Email (opcional)
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`form-control ${errors.email ? 'is-invalid' : touched.email && !errors.email ? 'is-valid' : ''}`}
                    placeholder="seu.email@exemplo.com"
                    maxLength="100"
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  <small className="text-muted">Para contato adicional (opcional)</small>
                </div>
              )}

              {/* ANEXO */}
              <div className="mb-3">
                <label htmlFor="anexo" className="form-label">
                  <FaPaperclip className="me-2" /> Anexo (opcional)
                </label>
                <input
                  type="file"
                  id="anexo"
                  name="anexo"
                  onChange={handleChange}
                  className={`form-control ${errors.anexo ? 'is-invalid' : ''}`}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                {errors.anexo && <div className="invalid-feedback">{errors.anexo}</div>}
                {formData.anexo && !errors.anexo && (
                  <div className="mt-2">
                    <small className="text-success">
                      <FaCheck className="me-1" />
                      Arquivo selecionado: {formData.anexo.name}
                    </small>
                    <small className="d-block text-muted">
                      Tamanho: {(formData.anexo.size / 1024).toFixed(2)} KB
                    </small>
                  </div>
                )}
                <small className="text-muted">Tipos permitidos: JPG, PNG, PDF, DOC. Máximo: 5MB</small>
              </div>

              {/* ANÔNIMO */}
              <div className="form-check mb-4">
                <input
                  type="checkbox"
                  id="anonimo"
                  name="anonimo"
                  className="form-check-input"
                  checked={anonimo}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    setAnonimo(isChecked);
                    if (isChecked) {
                      setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.nome;
                        delete newErrors.contacto;
                        delete newErrors.email;
                        return newErrors;
                      });
                    }
                  }}
                />
                <label htmlFor="anonimo" className="form-check-label">Deseja permanecer anônimo?</label>
                {anonimo && (
                  <small className="d-block text-muted mt-1">
                    <FaExclamationCircle className="me-1" />
                    Se selecionar esta opção, seu nome, contacto e email não serão armazenados.
                  </small>
                )}
              </div>

              {/* RESUMO DOS CAMPOS OBRIGATÓRIOS 
              <div className="alert alert-info mb-4">
                <FaExclamationCircle className="me-2" />
                <strong>Campos marcados com * são obrigatórios.</strong> Todos os dados serão tratados com confidencialidade.
              </div>*/}

              <button
                type="submit"
                className="btn btn-primary w-100 py-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Enviando...
                  </>
                ) : (
                  <>
                    <FaFileAlt className="me-2" />
                    Enviar Denúncia
                  </>
                )}
              </button>
            </form>
          )}

          {/* LISTAGEM DE DENÚNCIAS (COM AS CORREÇÕES SOLICITADAS) */}
          {tipo === "minhas" && (
            <div className="container mt-5">
              <h2 className="mb-4 text-success">
                <FaListAlt className="me-2" /> Minhas Denúncias - Setor de Água
              </h2>

              {loading ? (
                <div className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Carregando...</span>
                  </div>
                  <p className="mt-2">Carregando denúncias...</p>
                </div>
              ) : denuncias.length === 0 ? (
                <div className="alert alert-info">
                  <FaExclamationCircle className="me-2" />
                  Ainda não existem denúncias registadas para o setor de água.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered table-striped table-hover">
                    <thead className="table-light">
                      <tr>
                        <th><FaExclamationCircle className="me-2 text-danger" /> Problema</th>
                        <th><FaFileAlt className="me-2 text-primary" /> Descrição</th>
                        <th><FaMapMarkerAlt className="me-2" /> Localização</th>
                        <th><FaClock className="me-2" /> Data e Hora do Registro</th>
                        <th><FaCheckCircle className="me-2 text-success" /> Status</th>
                        <th><FaComments className="me-2 text-info" /> Comentário / Resposta</th>
                      </tr>
                    </thead>
                    <tbody>
                      {denuncias.map((d) => (
                        <tr key={d.pkDenuncia || d.id}>
                          <td>
                            <strong>
                              {d.tipoEspecifico ? d.tipoEspecifico : (
                                d.subtipo === 'agua_inexistente' ? 'Falta total de água' :
                                  d.subtipo === 'agua_suja' ? 'Água contaminada' :
                                    d.subtipo === 'vazamento' ? 'Vazamento' :
                                      d.subtipo === 'conta_abusiva' ? 'Cobrança indevida' :
                                        d.subtipo === 'infraestrutura' ? 'Problemas na infraestrutura' :
                                          d.subtipo === 'desperdicio' ? 'Desperdício' :
                                            d.subtipo === 'corte' ? 'Corte Abusivo' :
                                              d.subtipo || 'Não especificado'
                              )}
                            </strong>
                          </td>

                          <td style={{ maxWidth: 300 }}>
                            <div className="text-truncate" title={d.descricaoDetalhada || d.descricao}>
                              {d.descricaoDetalhada || d.descricao}
                            </div>
                          </td>

                          <td>
                            <div className="location-info">
                              <div className="mb-2">
                                <span className="fw-semibold">Província:</span> {d.provincia || 'Luanda'}
                              </div>
                              <div className="mb-2">
                                <span className="fw-semibold">Município:</span> {d.municipio || '—'}
                              </div>
                              <div className="mb-2">
                                <span className="fw-semibold">Bairro:</span> {d.bairro || 'Zango 4'}
                              </div>
                              <div className="mb-2">
                                <span className="fw-semibold">Rua:</span> {d.nomeRua || 'np'}
                              </div>

                              <div className="mb-3">
                                <span className="fw-semibold">Local específico da avaria:</span> {d.localEspecificoDaOcorrencia || 'torneira'}
                              </div>

                              {d.email && (
                                <div className="mb-2 text-muted">
                                  <FaEnvelope className="me-1" />
                                  email: {d.email}
                                </div>
                              )}

                              {d.contacto && (
                                <div className="mb-2 text-muted">
                                  <FaPhoneAlt className="me-1" />
                                  contacto: {formatarContacto(d.contacto)}
                                </div>
                              )}

                              {/* ANEXO */}
                              {d.anexo && (
                                <div className="mb-2 text-muted">
                                  <FaPaperclip className="me-1" />
                                  Anexo: {d.anexo}
                                </div>
                              )}
                            </div>
                          </td>


                          <td>
                            <div className="datetime-info">
                              {d.dataRegistro ? (
                                <>
                                  <div>
                                    {new Date(d.dataRegistro).toLocaleDateString('pt-AO', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric'
                                    })}
                                  </div>
                                  <div className="small text-muted">
                                    <FaClock className="me-1" />
                                    {new Date(d.dataRegistro).toLocaleTimeString('pt-AO', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      hour12: false
                                    })}
                                  </div>
                                </>
                              ) : (
                                '—'
                              )}
                            </div>
                          </td>

                          {/* COLUNA STATUS */}
                          <td>{renderStatusBadge(d)}</td>

                          <td>
                            <em>{d.resposta?.comentario || d.comentario || 'Aguardando resposta...'}</em>
                            {d.resposta && d.resposta.dataResposta && (
                              <small className="d-block text-muted">
                                Respondido em: {new Date(d.resposta.dataResposta).toLocaleDateString('pt-AO', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric'
                                })}
                              </small>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
       <Footer/>
    </div>
  );
}