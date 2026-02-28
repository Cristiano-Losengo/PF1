import React, { useState, useEffect } from 'react';
import {
  FaMapMarkerAlt, FaCalendarAlt, FaExclamationCircle, FaUser, FaPhoneAlt, FaEnvelope,
  FaFileAlt, FaGraduationCap, FaListAlt, FaPaperclip, FaSchool, FaComments, 
  FaCheckCircle, FaHourglassHalf, FaClock
} from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import Footer from './Footer';
export default function Educacao() {
  const { tipo } = useParams();
  const [anonimo, setAnonimo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    escola: '',
    municipio: '',
    bairro: '',
    rua: '',
    local: '',
    data: '',
    subtipo: '',
    descricao: '',
    nome: '',
    contacto: '',
    email: '', // ✅ Campo email adicionado
    anexo: null
  });
  const [errors, setErrors] = useState({});
  
  // Estado para denúncias (armazenando localmente)
  const [denuncias, setDenuncias] = useState(() => {
    // Recupera denúncias salvas no localStorage
    const saved = localStorage.getItem('denunciasEducacao');
    return saved ? JSON.parse(saved) : [];
  });

  // Municípios e bairros
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

  // ✅ Função para formatar contacto
  const formatarContacto = (contacto) => {
    if (!contacto || contacto === '—') return '—';
    return contacto;
  };

  // ✅ Função para renderizar badge de status
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

  // ✅ Funções de validação
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

  const validarEscola = (escola) => {
    if (!escola.trim()) return false;
    return escola.trim().length >= 3;
  };

  // ✅ Função para validar data (não pode ser futura)
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

  // Carregar denúncias
  useEffect(() => {
    if (tipo === "minhas") {
      setLoading(true);
      
      // Simulando chamada à API com timeout
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  }, [tipo]);

  // ✅ Salvar denúncias no localStorage sempre que atualizar
  useEffect(() => {
    localStorage.setItem('denunciasEducacao', JSON.stringify(denuncias));
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
    
    // ✅ Validações
    if (!formData.escola.trim()) {
      newErrors.escola = 'Informe o nome da escola.';
    } else if (!validarEscola(formData.escola)) {
      newErrors.escola = 'Nome da escola deve ter pelo menos 3 caracteres.';
    }
    
    if (!formData.municipio.trim()) newErrors.municipio = 'Selecione o município.';
    if (!formData.bairro.trim()) newErrors.bairro = 'Selecione o bairro.';
    
    if (!formData.rua.trim()) {
      newErrors.rua = 'Informe a rua ou número.';
    } else if (!validarRua(formData.rua)) {
      newErrors.rua = 'Informe um nome de rua válido.';
    }
    
    if (!formData.data.trim()) {
      newErrors.data = 'Informe a data.';
    } else if (!validarData(formData.data)) {
      newErrors.data = 'A data não pode ser futura (incluindo hoje é permitido).';
    }
    
    if (!formData.subtipo.trim()) newErrors.subtipo = 'Escolha o tipo de problema.';
    
    if (!formData.local.trim()) {
      newErrors.local = 'Informe o local da ocorrência.';
    } else if (!validarLocalDescricao(formData.local)) {
      newErrors.local = 'O local não pode conter apenas caracteres especiais e números.';
    }
    
    if (!formData.descricao.trim()) {
      newErrors.descricao = 'Descreva o problema.';
    } else if (!validarLocalDescricao(formData.descricao)) {
      newErrors.descricao = 'A descrição não pode conter apenas caracteres especiais e números.';
    }
    
    // Validações do denunciante (se não for anônimo)
    if (!anonimo) {
      if (!formData.nome.trim()) {
        newErrors.nome = 'Informe o nome.';
      } else if (!validarNome(formData.nome)) {
        newErrors.nome = 'O nome deve conter apenas letras.';
      }
      
      if (!formData.contacto.trim()) {
        newErrors.contacto = 'Informe o contacto.';
      } else if (!validarContacto(formData.contacto)) {
        newErrors.contacto = 'Contacto inválido. Use apenas números.';
      }
      
      if (formData.email.trim() && !validarEmail(formData.email)) {
        newErrors.email = 'Email inválido.';
      }
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      // Criar nova denúncia
      const novaDenuncia = {
        id: Date.now(), // ID único baseado no timestamp
        escola: formData.escola,
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
        escola: '',
        municipio: '',
        bairro: '',
        rua: '',
        local: '',
        data: '',
        subtipo: '',
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
                <FaGraduationCap className="me-2" /> Registrar Ocorrência - Setor de Educação
              </h2>

              {/* Nome da Escola */}
              <div className="mb-3">
                <label className="form-label"><FaSchool className="me-2" /> Escola</label>
                <input
                  type="text"
                  name="escola"
                  className={`form-control ${errors.escola ? "is-invalid" : ""}`}
                  value={formData.escola}
                  onChange={handleChange}
                  placeholder="Digite o nome completo da escola"
                />
                {errors.escola && <div className="invalid-feedback">{errors.escola}</div>}
              </div>

              {/* Município */}
              <div className="mb-3">
                <label className="form-label"><FaMapMarkerAlt className="me-2" /> Município</label>
                <select
                  name="municipio"
                  className={`form-select ${errors.municipio ? "is-invalid" : ""}`}
                  value={formData.municipio}
                  onChange={handleChange}
                >
                  <option value="">Selecione o município</option>
                  {municipios.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                {errors.municipio && <div className="invalid-feedback">{errors.municipio}</div>}
              </div>

              {/* Bairro */}
              <div className="mb-3">
                <label className="form-label"><FaMapMarkerAlt className="me-2" /> Bairro</label>
                <select
                  name="bairro"
                  className={`form-select ${errors.bairro ? "is-invalid" : ""}`}
                  value={formData.bairro}
                  onChange={handleChange}
                  disabled={!formData.municipio}
                >
                  <option value="">Selecione o bairro</option>
                  {formData.municipio &&
                    bairrosPorMunicipio[formData.municipio]?.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                </select>
                {errors.bairro && <div className="invalid-feedback">{errors.bairro}</div>}
              </div>

              {/* Rua */}
              <div className="mb-3">
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
              <div className="mb-3">
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
                  placeholder="Ex: Sala de aula, pátio, diretoria..."
                />
                {errors.local && <div className="invalid-feedback">{errors.local}</div>}
                <small className="text-muted">Não pode conter apenas caracteres especiais e números.</small>
              </div>

              {/* Data */}
              <div className="mb-3">
                <label htmlFor="data" className="form-label">
                  <FaCalendarAlt className="me-2" /> Data da Ocorrência
                </label>
                <input
                  type="date"
                  className={`form-control ${errors.data ? 'is-invalid' : ''}`}
                  id="data"
                  name="data"
                  value={formData.data}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]} // ✅ Impede seleção de datas futuras
                />
                {errors.data && <div className="invalid-feedback">{errors.data}</div>}
                <small className="text-muted">Não é permitido selecionar datas futuras.</small>
              </div>

              {/* Tipo de Problema */}
              <div className="mb-3">
                <label htmlFor="subtipo" className="form-label">
                  <FaListAlt className="me-2" /> Tipo de Problema
                </label>
                <select
                  className={`form-select ${errors.subtipo ? 'is-invalid' : ''}`}
                  id="subtipo"
                  name="subtipo"
                  value={formData.subtipo}
                  onChange={handleChange}
                >
                  <option value="">Selecione...</option>
                  <option value="professor_faltou">Falta de Professores</option>
                  <option value="infraestrutura_ruim">Infraestrutura precária</option>
                  <option value="livros_faltando">Falta de material didático</option>
                  <option value="falta_merenda">Falta de merenda escolar</option>
                  <option value="corrupcao">Corrupção ou Pagamento Indevido</option>
                  <option value="fissuras">Infraestrutura Escolar Degradada (fissuras)</option>
                  <option value="assedio">Assédio</option>
                  <option value="sem_carteiras">Falta de carteiras</option>
                  <option value="banheiros">Casas de Banho Degradadas</option>
                </select>
                {errors.subtipo && <div className="invalid-feedback">{errors.subtipo}</div>}
              </div>

              {/* Descrição */}
              <div className="mb-3">
                <label htmlFor="descricao" className="form-label">
                  <FaFileAlt className="me-2" /> Descrição Detalhada
                </label>
                <textarea
                  className={`form-control ${errors.descricao ? 'is-invalid' : ''}`}
                  id="descricao"
                  name="descricao"
                  rows="4"
                  value={formData.descricao}
                  onChange={handleChange}
                  placeholder="Descreva com detalhes o ocorrido..."
                />
                {errors.descricao && <div className="invalid-feedback">{errors.descricao}</div>}
                <small className="text-muted">Não pode conter apenas caracteres especiais e números.</small>
              </div>

              {/* Nome, Contacto e Email */}
              {!anonimo && (
                <>
                  <div className="mb-3">
                    <label htmlFor="nome" className="form-label">
                      <FaUser className="me-2" /> Nome do Denunciante
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.nome ? 'is-invalid' : ''}`}
                      id="nome"
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      placeholder="Digite seu nome completo"
                    />
                    {errors.nome && <div className="invalid-feedback">{errors.nome}</div>}
                    <small className="text-muted">Apenas letras e espaços.</small>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="contacto" className="form-label">
                      <FaPhoneAlt className="me-2" /> Contacto
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.contacto ? 'is-invalid' : ''}`}
                      id="contacto"
                      name="contacto"
                      value={formData.contacto}
                      onChange={handleChange}
                      placeholder="Ex: +244 123 456 789"
                    />
                    {errors.contacto && <div className="invalid-feedback">{errors.contacto}</div>}
                    <small className="text-muted">Apenas números e caracteres de telefone.</small>
                  </div>

                  {/* ✅ Campo Email adicionado */}
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      <FaEnvelope className="me-2" /> Email (opcional)
                    </label>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="seu.email@exemplo.com"
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>
                </>
              )}

              {/* Anexo */}
              <div className="mb-3">
                <label htmlFor="anexo" className="form-label">
                  <FaPaperclip className="me-2" /> Anexo (opcional)
                </label>
                <input 
                  type="file" 
                  className="form-control" 
                  id="anexo" 
                  name="anexo" 
                  onChange={handleChange} 
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

          {/* Minhas Denúncias (atualizado) */}
          {tipo === "minhas" && (
            <div className="container mt-5">
              <h2 className="mb-4 text-success">
                <FaListAlt className="me-2" /> Minhas Denúncias - Setor de Educação
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
                  Ainda não existem denúncias registadas para o setor de educação.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered table-striped table-hover">
                    <thead className="table-light">
                      <tr>
                        <th><FaExclamationCircle className="me-2 text-danger" /> Problema</th>
                        <th><FaFileAlt className="me-2 text-primary" /> Descrição</th>
                        <th><FaMapMarkerAlt className="me-2" /> Localização</th>
                        <th><FaClock className="me-2" /> Data da Ocorrência</th>
                        <th><FaCalendarAlt className="me-2" /> Data do Registro</th>
                        <th><FaCheckCircle className="me-2 text-success" /> Status</th>
                        <th><FaComments className="me-2 text-info" /> Comentário / Resposta</th>
                      </tr>
                    </thead>
                    <tbody>
                      {denuncias.map((d) => (
                        <tr key={d.id}>
                          <td>
                            <strong>
                              {d.subtipo === 'professor_faltou' ? 'Falta de Professores' :
                                d.subtipo === 'infraestrutura_ruim' ? 'Infraestrutura precária' :
                                  d.subtipo === 'livros_faltando' ? 'Falta de material didático' :
                                    d.subtipo === 'falta_merenda' ? 'Falta de merenda escolar' :
                                      d.subtipo === 'corrupcao' ? 'Corrupção ou Pagamento Indevido' :
                                        d.subtipo === 'fissuras' ? 'Infraestrutura Escolar Degradada (fissuras)' :
                                          d.subtipo === 'assedio' ? 'Assédio' :
                                            d.subtipo === 'sem_carteiras' ? 'Falta de carteiras' :
                                              d.subtipo === 'banheiros' ? 'Casas de Banho Degradadas' :
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
                                <span className="fw-semibold">Escola:</span> {d.escola || '—'}
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

                          {/* Data da Ocorrência */}
                          <td>
                            <div className="datetime-info">
                              {d.dataOcorrencia ? (
                                <div>
                                  {new Date(d.dataOcorrencia).toLocaleDateString('pt-AO', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                  })}
                                </div>
                              ) : (
                                '—'
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