import React, { useState } from 'react';
import {
  FaMapMarkerAlt, FaCalendarAlt, FaExclamationCircle, FaUser, FaPhoneAlt,
  FaFileAlt, FaStethoscope, FaHeartbeat, FaListAlt, FaPaperclip, FaHospital, FaComments, FaCheckCircle, FaHourglassHalf
} from 'react-icons/fa';
import { useParams } from 'react-router-dom';
export default function Saude() {
  const { tipo } = useParams();
  const [anonimo, setAnonimo] = useState(false);
  const [formData, setFormData] = useState({
    unidade: 'centro-de-saude',   // ✅ Valor padrão
    municipio: 'Cazenga',         // ✅ Valor padrão
    bairro: 'Hoji-ya-Henda',      // ✅ Valor padrão
    rua: '',
    local: '',
    data: '',
    subtipo: 'nao-atendido',      // ✅ Valor padrão
    descricao: '',
    nome: '',
    contacto: '',
    anexo: null
  });
  const [errors, setErrors] = useState({});

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

  // Mock para "Minhas Denúncias"
  const denunciasSaudeMock = [
    {
      id: 1,
      subtipo: "Tempo de Espera Excessivo",
      descricao: "Fiquei 6 horas sem ser atendido no Hospital Geral.",
      status: "Pendente",
      comentario: "Sua denúncia foi recebida e será analisada."
    },
    {
      id: 2,
      subtipo: "Medicamentos em Falta",
      descricao: "Não havia antibióticos disponíveis no centro de saúde.",
      status: "Resolvido",
      comentario: "O abastecimento foi regularizado esta semana."
    }
  ];

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.unidade.trim()) newErrors.unidade = 'Selecione a unidade de saúde.';
    if (!formData.municipio.trim()) newErrors.municipio = 'Selecione o município.';
    if (!formData.bairro.trim()) newErrors.bairro = 'Selecione o bairro.';
    if (!formData.rua.trim()) newErrors.rua = 'Informe a rua ou número.';
    if (!formData.local.trim()) newErrors.local = 'Informe o local da ocorrência.';
    if (!formData.data.trim()) newErrors.data = 'Informe a data.';
    if (!formData.subtipo.trim()) newErrors.subtipo = 'Escolha o tipo de problema.';
    if (!formData.descricao.trim()) newErrors.descricao = 'Descreva o problema.';
    if (!anonimo) {
      if (!formData.nome.trim()) newErrors.nome = 'Informe o nome.';
      if (!formData.contacto.trim()) newErrors.contacto = 'Informe o contacto.';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      console.log("Denúncia enviada:", formData);
      alert("Denúncia registrada com sucesso!");
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

                {/* Local */}
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
                  />
                  {errors.data && <div className="invalid-feedback">{errors.data}</div>}
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

              {/* Descrição */}
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
              </div>

              {/* Nome e Contacto */}
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
                    />
                    {errors.nome && <div className="invalid-feedback">{errors.nome}</div>}
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
                    />
                    {errors.contacto && <div className="invalid-feedback">{errors.contacto}</div>}
                  </div>
                </div>
              )}

              {/* Anexo */}
              <div className="mb-3 mt-3">
                <label htmlFor="anexo" className="form-label">
                  <FaPaperclip className="me-2" /> Anexo (opcional)
                </label>
                <input type="file" id="anexo" name="anexo" onChange={handleChange} className="form-control" />
              </div>

              {/* Anônimo */}
              <div className="form-check mb-4">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="anonimo"
                  checked={anonimo}
                  onChange={(e) => setAnonimo(e.target.checked)}
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

              {denunciasSaudeMock.length === 0 ? (
                <p className="text-muted">Você ainda não realizou nenhuma denúncia.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered table-striped">
                    <thead className="table-light">
                      <tr>
                        <th><FaExclamationCircle className="me-2 text-danger" /> Problema</th>
                        <th><FaFileAlt className="me-2 text-primary" /> Descrição</th>
                        <th><FaCheckCircle className="me-2 text-success" /> Status</th>
                        <th><FaComments className="me-2 text-info" /> Comentário</th>
                      </tr>
                    </thead>
                    <tbody>
                      {denunciasSaudeMock.map((denuncia) => (
                        <tr key={denuncia.id}>
                          <td>{denuncia.subtipo}</td>
                          <td>{denuncia.descricao}</td>
                          <td>
                            {denuncia.status === "Resolvido" ? (
                              <span className="badge bg-success">
                                <FaCheckCircle className="me-1" /> {denuncia.status}
                              </span>
                            ) : (
                              <span className="badge bg-warning text-dark">
                                <FaHourglassHalf className="me-1" /> {denuncia.status}
                              </span>
                            )}
                          </td>
                          <td><em>{denuncia.comentario}</em></td>
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
