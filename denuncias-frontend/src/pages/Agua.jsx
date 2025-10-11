import { useParams } from 'react-router-dom';
import React, { useState } from 'react';
import {
  FaMapMarkerAlt, FaTint, FaExclamationCircle, FaCalendarAlt, FaFileAlt, FaUser,
  FaPhoneAlt, FaPaperclip, FaListAlt, FaComments, FaCheckCircle, FaHourglassHalf
} from 'react-icons/fa';

export default function Agua() {
  const { tipo } = useParams();
  const [anonimo, setAnonimo] = useState(false);
  const [formData, setFormData] = useState({
    local: '', municipio: '', bairro: '', rua: '', data: '', subtipo: '', descricao: '',
    nome: '', contacto: '', anexo: null
  });
  const [errors, setErrors] = useState({});

 
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


  const denunciasMock = [
    {
      id: 1,
      subtipo: "Água inexistente",
      descricao: "Estamos há 5 dias sem água no bairro Kifica.",
      status: "Pendente",
      comentario: "Sua denúncia foi encaminhada à administração municipal."
    },
    {
      id: 2,
      subtipo: "Água suja",
      descricao: "A água da torneira sai com cheiro forte e amarelada.",
      status: "Resolvido",
      comentario: "A empresa de distribuição realizou limpeza no reservatório."
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

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      alert("Formulário enviado com sucesso!");
    }
  };

  return (
    <div className="page">
      <main>
        <div className="container py-4">

          {/* Registrar denúncia */}
          {tipo === "registrar" && (
            <form className="container mt-5" onSubmit={handleSubmit} style={{ maxWidth: "700px" }}>
              <h2 className="mb-4">
                <FaTint className="me-2 text-primary" /> Registrar Ocorrência - Setor de Água
              </h2>

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
                  <option value="">Selecione...</option>
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
              {formData.bairro && (
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
              )}

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

              {/* NOME */}
              {!anonimo && (
                <div className="mb-3">
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
              )}

              {/* CONTACTO */}
              {!anonimo && (
                <div className="mb-3">
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
              )}

              {/* ANEXO */}
              <div className="mb-3">
                <label htmlFor="anexo" className="form-label">
                  <FaPaperclip className="me-2" /> Anexo (opcional)
                </label>
                <input type="file" id="anexo" name="anexo" onChange={handleChange} className="form-control" />
              </div>

              {/* ANÔNIMO */}
              <div className="form-check mb-4">
                <input
                  type="checkbox"
                  id="anonimo"
                  className="form-check-input"
                  checked={anonimo}
                  onChange={(e) => setAnonimo(e.target.checked)}
                />
                <label htmlFor="anonimo" className="form-check-label">
                  Deseja permanecer anônimo?
                </label>
              </div>

              <button type="submit" className="btn btn-primary w-100">Cadastrar Denúncia</button>
            </form>
          )}

          {/* Minhas denúncias */}
          {tipo === "minhas" && (
            <div className="container mt-5">
              <h2 className="mb-4 text-success">
                <FaListAlt className="me-2" /> Minhas Denúncias - Setor de Água
              </h2>

              {denunciasMock.length === 0 ? (
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
                      {denunciasMock.map((denuncia) => (
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