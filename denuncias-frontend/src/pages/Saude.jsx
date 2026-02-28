import React, { useState, useEffect } from 'react';
import {
  FaMapMarkerAlt, FaCalendarAlt, FaExclamationCircle, FaUser, FaPhoneAlt, FaEnvelope,
  FaFileAlt, FaStethoscope, FaHeartbeat, FaListAlt, FaPaperclip, FaHospital, FaComments, 
  FaCheckCircle, FaHourglassHalf, FaClock
} from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import Footer from './Footer';
export default function Saude() {
  const { tipo } = useParams();
  const [anonimo, setAnonimo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    unidade: 'centro-de-saude',
    municipio: 'Cazenga',
    bairro: 'Hoji-ya-Henda',
    rua: '',
    local: '',
    data: '',
    subtipo: 'nao-atendido',
    descricao: '',
    nome: '',
    contacto: '',
    email: '',
    anexo: null
  });
  const [errors, setErrors] = useState({});
  
  // Estado para denúncias (AGORA ARMAZENANDO LOCALMENTE)
  const [denuncias, setDenuncias] = useState(() => {
    // Recupera denúncias salvas no localStorage
    const saved = localStorage.getItem('denunciasSaude');
    return saved ? JSON.parse(saved) : [];
  });

  // Lista de municípios e bairros
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
    Ícolo_e_Bengo: ["Catete", "Cabiri", "Cassoneca", "Bom Jesus"],
    Quicama: ["Mumbondo", "Demba Chio", "Muxima"]
  };

  // Função para formatar contacto
  const formatarContacto = (contacto) => {
    if (!contacto) return '—';
    return contacto;
  };

  // Função para renderizar badge de status
  const renderStatusBadge = (denuncia) => {
    const status = denuncia.status || 'Pendente';
    switch(status.toLowerCase()) {
      case 'resolvido':
        return (
          <span className="badge bg-success">
            <FaCheckCircle className="me-1" /> Resolvido
          </span>
        );
      case 'em_andamento':
        return (
          <span className="badge bg-info">
            <FaHourglassHalf className="me-1" /> Em andamento
          </span>
        );
      case 'pendente':
        return (
          <span className="badge bg-warning text-dark">
            <FaHourglassHalf className="me-1" /> Pendente
          </span>
        );
      default:
        return (
          <span className="badge bg-secondary">
            {status}
          </span>
        );
    }
  };

  // ✅ Funções de validação atualizadas
  const validarNome = (nome) => {
    const regex = /^[A-Za-zÀ-ÿ\s]+$/; // Apenas letras e espaços
    return regex.test(nome) && nome.trim().length > 0;
  };

  const validarContacto = (contacto) => {
    const regex = /^[0-9+\s()-]+$/; // Apenas números e caracteres de telefone
    return regex.test(contacto) && contacto.trim().length >= 8;
  };

  const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email) || email.trim() === '';
  };

  const validarLocalDescricao = (texto) => {
    if (!texto.trim()) return false;
    
    // Verifica se contém apenas caracteres especiais e números
    const regexSomenteEspeciaisNumeros = /^[\d\s\W_]+$/;
    if (regexSomenteEspeciaisNumeros.test(texto.trim())) {
      return false;
    }
    
    // Verifica se contém pelo menos uma letra
    const regexLetras = /[A-Za-zÀ-ÿ]/;
    return regexLetras.test(texto);
  };

  const validarRua = (rua) => {
    if (!rua.trim()) return false;
    
    // Permite letras, números, espaços e alguns caracteres especiais comuns em endereços
    const regex = /^[A-Za-zÀ-ÿ0-9\s\-\/,\.ºª]+$/;
    return regex.test(rua);
  };

  // ✅ Função para validar data (não pode ser futura - CORRIGIDA)
  const validarData = (data) => {
    if (!data) return false;
    
    const dataSelecionada = new Date(data);
    const hoje = new Date();
    
    // Zerar horas para comparar apenas a data
    dataSelecionada.setHours(0, 0, 0, 0);
    hoje.setHours(0, 0, 0, 0);
    
    // Permite hoje mas não amanhã
    return dataSelecionada <= hoje;
  };

  // Carregar denúncias (simulação)
  useEffect(() => {
    if (tipo === "minhas") {
      setLoading(true);
      
      // Simulando chamada à API com timeout
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  }, [tipo]);

  // Salvar denúncias no localStorage sempre que atualizar
  useEffect(() => {
    localStorage.setItem('denunciasSaude', JSON.stringify(denuncias));
  }, [denuncias]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
    
    // Limpar erro quando o usuário começa a digitar
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = {};
    
    // Validações básicas
    if (!formData.unidade.trim()) newErrors.unidade = 'Selecione a unidade de saúde.';
    if (!formData.municipio.trim()) newErrors.municipio = 'Selecione o município.';
    if (!formData.bairro.trim()) newErrors.bairro = 'Selecione o bairro.';
    
    // ✅ Validação da Rua (modificada)
    if (!formData.rua.trim()) {
      newErrors.rua = 'Informe a rua ou número.';
    } else if (!validarRua(formData.rua)) {
      newErrors.rua = 'Informe um nome de rua válido.';
    }
    
    // ✅ Validação da Data (não pode ser futura - CORRIGIDA)
    if (!formData.data.trim()) {
      newErrors.data = 'Informe a data.';
    } else if (!validarData(formData.data)) {
      newErrors.data = 'A data não pode ser futura (incluindo hoje é permitido).';
    }
    
    if (!formData.subtipo.trim()) newErrors.subtipo = 'Escolha o tipo de problema.';
    
    // ✅ Validação do Local da Ocorrência (mensagem atualizada)
    if (!formData.local.trim()) {
      newErrors.local = 'Informe o local da ocorrência.';
    } else if (!validarLocalDescricao(formData.local)) {
      newErrors.local = 'O local não pode conter apenas caracteres especiais e números.';
    }
    
    // ✅ Validação da Descrição Detalhada (mensagem atualizada)
    if (!formData.descricao.trim()) {
      newErrors.descricao = 'Descreva o problema.';
    } else if (!validarLocalDescricao(formData.descricao)) {
      newErrors.descricao = 'A descrição não pode conter apenas caracteres especiais e números.';
    }
    
    // Validações do denunciante (se não for anônimo)
    if (!anonimo) {
      // ✅ Validação do Nome
      if (!formData.nome.trim()) {
        newErrors.nome = 'Informe o nome.';
      } else if (!validarNome(formData.nome)) {
        newErrors.nome = 'O nome deve conter apenas letras.';
      }
      
      // ✅ Validação do Contacto
      if (!formData.contacto.trim()) {
        newErrors.contacto = 'Informe o contacto.';
      } else if (!validarContacto(formData.contacto)) {
        newErrors.contacto = 'Contacto inválido. Use apenas números.';
      }
      
      // ✅ Validação do Email (opcional)
      if (formData.email.trim() && !validarEmail(formData.email)) {
        newErrors.email = 'Email inválido.';
      }
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      // Criar nova denúncia
      const novaDenuncia = {
        id: Date.now(), // ID único baseado no timestamp
        unidade: formData.unidade === 'hospital-publico' ? 'Hospital Público' : 'Centro de Saúde',
        municipio: formData.municipio,
        bairro: formData.bairro,
        nomeRua: formData.rua,
        localEspecifico: formData.local,
        subtipo: formData.subtipo,
        descricao: formData.descricao,
        status: 'Pendente',
        comentario: 'Aguardando análise',
        dataRegistro: new Date().toISOString(),
        dataOcorrencia: formData.data,
        // Dados do denunciante (se não for anônimo)
        ...(!anonimo && {
          nome: formData.nome,
          contacto: formData.contacto,
          email: formData.email
        }),
        // Se for anônimo, não salva dados pessoais
        ...(anonimo && {
          nome: 'Anônimo',
          contacto: '—',
          email: '—'
        })
      };
      
      console.log("Denúncia enviada:", novaDenuncia);
      
      // ✅ ADICIONAR À LISTA DE DENÚNCIAS
      setDenuncias(prev => [novaDenuncia, ...prev]);
      
      alert("Denúncia registrada com sucesso!");
      
      // Limpar o formulário após envio
      setFormData({
        unidade: 'centro-de-saude',
        municipio: 'Cazenga',
        bairro: 'Hoji-ya-Henda',
        rua: '',
        local: '',
        data: '',
        subtipo: 'nao-atendido',
        descricao: '',
        nome: '',
        contacto: '',
        email: '',
        anexo: null
      });
      setAnonimo(false);
    }
  };

  return (
    <div className="page">
      <main>
        <div className="container py-4">

          {/* Registrar Denúncia */}
          {tipo === "registrar" && (
            <form className="container mt-5" onSubmit={handleSubmit} style={{ maxWidth: "800px" }}>
              <h2 className="mb-4 text-center text-primary">
                <FaHeartbeat className="me-2" /> Registrar Ocorrência - Setor de Saúde
              </h2>
              <div className="row g-3">
                {/* Unidade de Saúde */}
                <div className="col-md-6">
                  <label htmlFor="unidade" className="form-label">
                    <FaHospital className="me-2" /> Unidade de Saúde
                  </label>
                  <select
                    id="unidade"
                    name="unidade"
                    value={formData.unidade}
                    onChange={handleChange}
                    className={`form-select ${errors.unidade ? 'is-invalid' : ''}`}
                  >
                    <option value="hospital-publico">Hospital Público</option>
                    <option value="centro-de-saude">Centro de Saúde</option>
                  </select>
                  {errors.unidade && <div className="invalid-feedback">{errors.unidade}</div>}
                </div>

                {/* Município */}
                <div className="col-md-6">
                  <label htmlFor="municipio" className="form-label">
                    <FaMapMarkerAlt className="me-2" /> Município
                  </label>
                  <select
                    id="municipio"
                    name="municipio"
                    value={formData.municipio}
                    onChange={handleChange}
                    className={`form-select ${errors.municipio ? 'is-invalid' : ''}`}
                  >
                    <option value="">Selecione...</option>
                    {municipios.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  {errors.municipio && <div className="invalid-feedback">{errors.municipio}</div>}
                </div>

                {/* Bairro */}
                <div className="col-md-6">
                  <label htmlFor="bairro" className="form-label">
                    <FaMapMarkerAlt className="me-2" /> Bairro
                  </label>
                  <select
                    id="bairro"
                    name="bairro"
                    value={formData.bairro}
                    onChange={handleChange}
                    className={`form-select ${errors.bairro ? 'is-invalid' : ''}`}
                    disabled={!formData.municipio}
                  >
                    <option value="">Selecione...</option>
                    {formData.municipio &&
                      bairrosPorMunicipio[formData.municipio]?.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                  </select>
                  {errors.bairro && <div className="invalid-feedback">{errors.bairro}</div>}
                </div>

                {/* Rua */}
                <div className="col-md-6">
                  <label htmlFor="rua" className="form-label">
                    <FaMapMarkerAlt className="me-2" /> Nome da Rua / Nº
                  </label>
                  <input
                    type="text"
                    id="rua"
                    name="rua"
                    value={formData.rua}
                    onChange={handleChange}
                    className={`form-control ${errors.rua ? 'is-invalid' : ''}`}
                    placeholder="Ex: Rua 12, nº 45"
                  />
                  {errors.rua && <div className="invalid-feedback">{errors.rua}</div>}
                </div>

                {/* Local da Ocorrência */}
                <div className="col-md-12">
                  <label htmlFor="local" className="form-label">
                    <FaMapMarkerAlt className="me-2" /> Local da Ocorrência
                  </label>
                  <input
                    type="text"
                    id="local"
                    name="local"
                    value={formData.local}
                    onChange={handleChange}
                    className={`form-control ${errors.local ? 'is-invalid' : ''}`}
                    placeholder="Ex: Urgência, consultório, triagem..."
                  />
                  {errors.local && <div className="invalid-feedback">{errors.local}</div>}
                  <small className="text-muted">Não pode conter apenas caracteres especiais e números.</small>
                </div>
              </div>

              <hr className="my-4" />

              {/* Data e Tipo */}
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="data" className="form-label">
                    <FaCalendarAlt className="me-2" /> Data da Ocorrência
                  </label>
                  <input
                    type="date"
                    id="data"
                    name="data"
                    value={formData.data}
                    onChange={handleChange}
                    className={`form-control ${errors.data ? 'is-invalid' : ''}`}
                    max={new Date().toISOString().split('T')[0]} // ✅ Impede seleção de datas futuras
                  />
                  {errors.data && <div className="invalid-feedback">{errors.data}</div>}
                  <small className="text-muted">Não é permitido selecionar datas futuras.</small>
                </div>

                <div className="col-md-6">
                  <label htmlFor="subtipo" className="form-label">
                    <FaListAlt className="me-2" /> Tipo de Problema
                  </label>
                  <select
                    id="subtipo"
                    name="subtipo"
                    value={formData.subtipo}
                    onChange={handleChange}
                    className={`form-select ${errors.subtipo ? 'is-invalid' : ''}`}
                  >
                    <option value="">Selecione...</option>
                    <option value="nao-atendido">Paciente não foi atendido</option>
                    <option value="diagnostico-errado">Diagnóstico incorreto</option>
                    <option value="espera">Tempo de Espera Excessivo</option>
                    <option value="pagamento">Corrupção ou Pagamento Indevido</option>
                    <option value="sem-medicamentos">Medicamentos em Falta</option>
                    <option value="negligencia">Negligência Médica</option>
                    <option value="sem-enfermeiros">Falta de Enfermeiros</option>
                    <option value="sem-medicos">Falta de Médicos</option>
                    <option value="abandono">Abandono durante o atendimento</option>
                  </select>
                  {errors.subtipo && <div className="invalid-feedback">{errors.subtipo}</div>}
                </div>
              </div>

              {/* Descrição Detalhada */}
              <div className="mt-3">
                <label htmlFor="descricao" className="form-label">
                  <FaFileAlt className="me-2" /> Descrição Detalhada
                </label>
                <textarea
                  id="descricao"
                  name="descricao"
                  rows="4"
                  value={formData.descricao}
                  onChange={handleChange}
                  className={`form-control ${errors.descricao ? 'is-invalid' : ''}`}
                  placeholder="Descreva com detalhes o que aconteceu..."
                />
                {errors.descricao && <div className="invalid-feedback">{errors.descricao}</div>}
                <small className="text-muted">Não pode conter apenas caracteres especiais e números.</small>
              </div>

              {/* Nome, Contacto e Email */}
              {!anonimo && (
                <div className="row g-3 mt-3">
                  <div className="col-md-6">
                    <label htmlFor="nome" className="form-label">
                      <FaUser className="me-2" /> Nome do Denunciante
                    </label>
                    <input
                      type="text"
                      id="nome"
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      className={`form-control ${errors.nome ? 'is-invalid' : ''}`}
                      placeholder="Digite seu nome completo"
                    />
                    {errors.nome && <div className="invalid-feedback">{errors.nome}</div>}
                    <small className="text-muted">Apenas letras e espaços.</small>
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="contacto" className="form-label">
                      <FaPhoneAlt className="me-2" /> Contacto
                    </label>
                    <input
                      type="text"
                      id="contacto"
                      name="contacto"
                      value={formData.contacto}
                      onChange={handleChange}
                      className={`form-control ${errors.contacto ? 'is-invalid' : ''}`}
                      placeholder="Ex: +244 123 456 789"
                    />
                    {errors.contacto && <div className="invalid-feedback">{errors.contacto}</div>}
                    <small className="text-muted">Apenas números e caracteres de telefone.</small>
                  </div>

                  {/* Campo Email */}
                  <div className="col-md-6">
                    <label htmlFor="email" className="form-label">
                      <FaEnvelope className="me-2" /> Email (opcional)
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      placeholder="seu.email@exemplo.com"
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>
                </div>
              )}

              {/* Anexo */}
              <div className="mb-3 mt-3">
                <label htmlFor="anexo" className="form-label">
                  <FaPaperclip className="me-2" /> Anexo (opcional)
                </label>
                <input 
                  type="file" 
                  id="anexo" 
                  name="anexo" 
                  onChange={handleChange} 
                  className="form-control" 
                />
              </div>

              {/* Anônimo */}
              <div className="form-check mb-4">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="anonimo"
                  checked={anonimo}
                  onChange={(e) => {
                    setAnonimo(e.target.checked);
                    if (e.target.checked) {
                      // Limpar erros relacionados ao denunciante
                      setErrors((prev) => ({
                        ...prev,
                        nome: '',
                        contacto: '',
                        email: ''
                      }));
                    }
                  }}
                />
                <label className="form-check-label" htmlFor="anonimo">
                  Deseja permanecer anônimo?
                </label>
              </div>

              <button type="submit" className="btn btn-primary w-100">Cadastrar Denúncia</button>
            </form>
          )}

          {/* Minhas Denúncias */}
          {tipo === "minhas" && (
            <div className="container mt-5">
              <h2 className="mb-4 text-success">
                <FaListAlt className="me-2" /> Minhas Denúncias - Setor de Saúde
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
                  Ainda não existem denúncias registadas para o setor de saúde.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered table-striped table-hover">
                    <thead className="table-light">
                      <tr>
                        <th><FaExclamationCircle className="me-2 text-danger" /> Problema</th>
                        <th><FaFileAlt className="me-2 text-primary" /> Descrição</th>
                        <th><FaMapMarkerAlt className="me-2" /> Localização</th>
                        <th><FaCalendarAlt className="me-2" /> Data e hora da Ocorrência</th>
                        <th><FaCheckCircle className="me-2 text-success" /> Status</th>
                        <th><FaComments className="me-2 text-info" /> Comentário / Resposta</th>
                      </tr>
                    </thead>
                    <tbody>
                      {denuncias.map((d) => (
                        <tr key={d.id}>
                          <td>
                            <strong>
                              {d.subtipo === 'nao-atendido' ? 'Paciente não foi atendido' :
                                d.subtipo === 'diagnostico-errado' ? 'Diagnóstico incorreto' :
                                  d.subtipo === 'espera' ? 'Tempo de Espera Excessivo' :
                                    d.subtipo === 'pagamento' ? 'Corrupção ou Pagamento Indevido' :
                                      d.subtipo === 'sem-medicamentos' ? 'Medicamentos em Falta' :
                                        d.subtipo === 'negligencia' ? 'Negligência Médica' :
                                          d.subtipo === 'sem-enfermeiros' ? 'Falta de Enfermeiros' :
                                            d.subtipo === 'sem-medicos' ? 'Falta de Médicos' :
                                              d.subtipo === 'abandono' ? 'Abandono durante o atendimento' :
                                                d.subtipo || 'Não especificado'}
                            </strong>
                          </td>

                          <td style={{ maxWidth: 300 }}>
                            <div className="text-truncate" title={d.descricao}>
                              {d.descricao}
                            </div>
                          </td>

                          <td>
                            <div className="location-info">
                              <div className="mb-2">
                                <span className="fw-semibold">Unidade:</span> {d.unidade || '—'}
                              </div>
                              <div className="mb-2">
                                <span className="fw-semibold">Município:</span> {d.municipio || '—'}
                              </div>
                              <div className="mb-2">
                                <span className="fw-semibold">Bairro:</span> {d.bairro || '—'}
                              </div>
                              <div className="mb-2">
                                <span className="fw-semibold">Rua:</span> {d.nomeRua || '—'}
                              </div>
                              <div className="mb-3">
                                <span className="fw-semibold">Local:</span> {d.localEspecifico || '—'}
                              </div>

                              {d.email && d.email !== '—' && (
                                <div className="mb-2 text-muted">
                                  <FaEnvelope className="me-1" />
                                  email: {d.email}
                                </div>
                              )}

                              {d.contacto && d.contacto !== '—' && (
                                <div className="mb-2 text-muted">
                                  <FaPhoneAlt className="me-1" />
                                  contacto: {formatarContacto(d.contacto)}
                                </div>
                              )}

                              {d.nome && d.nome !== 'Anônimo' && (
                                <div className="mb-2 text-muted">
                                  <FaUser className="me-1" />
                                  denunciante: {d.nome}
                                </div>
                              )}
                            </div>
                          </td>

                               
                          {/* Data do Registro */}
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
                            <em>{d.comentario || 'Aguardando resposta...'}</em>
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