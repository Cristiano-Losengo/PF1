import { useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import {
  FaMapMarkerAlt, FaTint, FaExclamationCircle, FaCalendarAlt, FaFileAlt, FaUser,
  FaPhoneAlt, FaPaperclip, FaListAlt, FaComments, FaCheckCircle, FaHourglassHalf
} from 'react-icons/fa';

export default function Agua() {
  const { tipo } = useParams();
  const [anonimo, setAnonimo] = useState(false);
  const [formData, setFormData] = useState({
    local: '',
    municipio: 'Luanda',
    bairro: 'Sambizanga',
    rua: '',
    data: '',
    subtipo: 'agua_inexistente',
    descricao: '',
    nome: '',
    contacto: '',
    anexo: null
  });

  const [errors, setErrors] = useState({});
  const [denuncias, setDenuncias] = useState([]);
  const [loading, setLoading] = useState(false);

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

  // --- BUSCAR DENÚNCIAS AO INICIAR ---
  useEffect(() => {
    fetchDenuncias();
  }, []);

  const fetchDenuncias = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:9090/api/denuncias");
      if (!res.ok) throw new Error('Erro ao buscar denúncias');
      const data = await res.json();
      setDenuncias(data || []);
    } catch (err) {
      console.error('fetchDenuncias:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- MANIPULAÇÃO DOS CAMPOS DO FORMULÁRIO ---
  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;

    if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files?.[0] || null }));
    } else if (type === 'checkbox') {
      if (name === 'anonimo') setAnonimo(checked);
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // --- VALIDAÇÃO DOS CAMPOS ---
  const validate = () => {
    const newErrors = {};
    if (!formData.local.trim()) newErrors.local = 'Informe o local da ocorrência.';
    if (!formData.municipio.trim()) newErrors.municipio = 'Informe o município.';
    if (!formData.bairro.trim()) newErrors.bairro = 'Informe o bairro.';
    if (!formData.rua.trim()) newErrors.rua = 'Informe a rua ou número.';
    if (!formData.data.trim()) newErrors.data = 'Informe a data.';
    if (!formData.subtipo.trim()) newErrors.subtipo = 'Escolha o tipo de problema.';
    if (!formData.descricao.trim()) newErrors.descricao = 'Descreva o problema.';
    if (!anonimo) {
      if (!formData.nome.trim()) newErrors.nome = 'Informe o nome.';
      if (!formData.contacto.trim()) newErrors.contacto = 'Informe o contacto.';
    }
    return newErrors;
  };

  // --- ENVIO DA DENÚNCIA ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const payload = {
      nome: anonimo ? null : formData.nome,
      contacto: anonimo ? null : formData.contacto,
      descricao: formData.descricao,
      anonima: anonimo,
      dataOcorrencia: formData.data,
      subtipo: formData.subtipo,
      localidade: {
        municipio: formData.municipio,
        bairro: formData.bairro,
        rua: formData.rua,
        local: formData.local
      }
    };

    try {
      const res = await fetch("http://localhost:9090/api/denuncias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const nova = await res.json();
        setDenuncias(prev => [...prev, nova]);
        setFormData({
          local: '', municipio: '', bairro: '', rua: '', data: '', subtipo: '', descricao: '',
          nome: '', contacto: '', anexo: null
        });
        setAnonimo(false);
        setErrors({});
        alert("✅ Denúncia registrada com sucesso!");
      } else {
        const text = await res.text();
        console.error('Erro no POST:', res.status, text);
        alert("❌ Erro ao enviar denúncia.");
      }
    } catch (err) {
      console.error('handleSubmit:', err);
      alert("⚠️ Falha ao conectar com o servidor!");
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

  // --- INTERFACE ---
  return (
    <div className="page">
      <main>
        <div className="container py-4">

          {/* FORMULÁRIO DE DENÚNCIA */}
          {tipo === "registrar" && (
            <form className="container mt-5" onSubmit={handleSubmit} style={{ maxWidth: "800px" }}>
              <h3 className="mb-4 text-primary">
                <FaTint className="me-2 text-primary" /> Registrar Ocorrência - Setor de Água
              </h3>

              {/* LOCAL */}
              <div className="mb-3">
                <label htmlFor="local" className="form-label">
                  <FaMapMarkerAlt className="me-2" /> Local Específico da Ocorrência
                </label>
                <input
                  type="text"
                  id="local"
                  name="local"
                  value={formData.local}
                  onChange={handleChange}
                  className={`form-control ${errors.local ? 'is-invalid' : ''}`}
                  placeholder="Ex: Canal, reservatório, torneira pública..."
                />
                {errors.local && <div className="invalid-feedback">{errors.local}</div>}
              </div>

              {/* MUNICÍPIO */}
              <div className="mb-3">
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
                    <FaMapMarkerAlt className="me-2" /> Bairro
                  </label>
                  <select
                    id="bairro"
                    name="bairro"
                    value={formData.bairro}
                    onChange={handleChange}
                    className={`form-select ${errors.bairro ? 'is-invalid' : ''}`}
                  >
                    <option value="">Selecione...</option>
                    {(bairrosPorMunicipio[formData.municipio] || []).map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                  {errors.bairro && <div className="invalid-feedback">{errors.bairro}</div>}
                </div>
              )}

              {/* RUA */}
              <div className="mb-3">
                <label htmlFor="rua" className="form-label">
                  <FaMapMarkerAlt className="me-2" /> Nome da Rua / Número
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

              {/* DATA */}
              <div className="mb-3">
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
                />
                {errors.data && <div className="invalid-feedback">{errors.data}</div>}
              </div>

              {/* SUBTIPO */}
              <div className="mb-3">
                <label htmlFor="subtipo" className="form-label">
                  <FaListAlt className="me-2" /> Tipo Específico
                </label>
                <select
                  id="subtipo"
                  name="subtipo"
                  value={formData.subtipo}
                  onChange={handleChange}
                  className={`form-select ${errors.subtipo ? 'is-invalid' : ''}`}
                >
                  <option value="">Selecione...</option>
                  <option value="agua_inexistente">Falta total de água</option>
                  <option value="agua_suja">Água contaminada</option>
                  <option value="vazamento">Vazamento</option>
                  <option value="conta_abusiva">Cobrança indevida</option>
                  <option value="infraestrutura">Problemas na infraestrutura</option>
                  <option value="desperdicio">Desperdício</option>
                  <option value="corte">Corte Abusivo</option>
                </select>
                {errors.subtipo && <div className="invalid-feedback">{errors.subtipo}</div>}
              </div>

              {/* DESCRIÇÃO */}
              <div className="mb-3">
                <label htmlFor="descricao" className="form-label">
                  <FaFileAlt className="me-2" /> Descrição Detalhada
                </label>
                <textarea
                  id="descricao"
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  className={`form-control ${errors.descricao ? 'is-invalid' : ''}`}
                  rows="4"
                />
                {errors.descricao && <div className="invalid-feedback">{errors.descricao}</div>}
              </div>

              {/* IDENTIFICAÇÃO */}
              {!anonimo && (
                <div className="row">
                  <div className="col-md-6 mb-3">
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
                    />
                    {errors.nome && <div className="invalid-feedback">{errors.nome}</div>}
                  </div>

                  <div className="col-md-6 mb-3">
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
                    />
                    {errors.contacto && <div className="invalid-feedback">{errors.contacto}</div>}
                  </div>
                </div>
              )}

              {/* ANEXO */}
              <div className="mb-3">
                <label htmlFor="anexo" className="form-label">
                  <FaPaperclip className="me-2" /> Anexo (opcional)
                </label>
                <input type="file" id="anexo" name="anexo" onChange={handleChange} className="form-control" />
                {formData.anexo && <small className="text-muted">Arquivo selecionado: {formData.anexo.name}</small>}
              </div>

              {/* ANÔNIMO */}
              <div className="form-check mb-4">
                <input
                  type="checkbox"
                  id="anonimo"
                  name="anonimo"
                  className="form-check-input"
                  checked={anonimo}
                  onChange={handleChange}
                />
                <label htmlFor="anonimo" className="form-check-label">Deseja permanecer anônimo?</label>
              </div>

              <button type="submit" className="btn btn-primary w-100">Cadastrar Denúncia</button>
            </form>
          )}

          {/* LISTAGEM DE DENÚNCIAS */}
          {tipo === "minhas" && (
            <div className="container mt-5">
              <h2 className="mb-4 text-success">
                <FaListAlt className="me-2" /> Minhas Denúncias - Setor de Água
              </h2>

              {loading ? (
                <p>Carregando denúncias...</p>
              ) : denuncias.length === 0 ? (
                <p className="text-muted">Ainda não existem denúncias registadas.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered table-striped">
                    <thead className="table-light">
                      <tr>
                        <th><FaExclamationCircle className="me-2 text-danger" /> Problema</th>
                        <th><FaFileAlt className="me-2 text-primary" /> Descrição</th>
                        <th><FaMapMarkerAlt className="me-2" /> Local</th>
                        <th><FaCalendarAlt className="me-2" /> Data</th>
                        <th><FaCheckCircle className="me-2 text-success" /> Status</th>
                        <th><FaComments className="me-2 text-info" /> Comentário / Resposta</th>
                      </tr>
                    </thead>
                    <tbody>
                      {denuncias.map((d) => (
                        <tr key={d.id || d.pkDenuncia}>
                          <td>{d.subtipo}</td>
                          <td style={{ maxWidth: 300 }}>{d.descricao}</td>
                          <td>
                            {d.localidade
                              ? `${d.localidade.bairro || ''}${d.localidade.rua ? ' — ' + d.localidade.rua : ''} (${d.localidade.municipio || ''})`
                              : '—'}
                          </td>
                          <td>{d.dataOcorrencia || d.data || ''}</td>
                          <td>{renderStatusBadge(d)}</td>
                          <td><em>{d.resposta?.comentario || d.comentario || '-'}</em></td>
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
    </div>
  );
}
