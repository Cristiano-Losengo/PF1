import React, { useState } from 'react';
import {
  FaMapMarkerAlt, FaCalendarAlt, FaExclamationCircle, FaUser, FaPhoneAlt,
  FaFileAlt, FaListAlt, FaPaperclip, FaSchool, FaComments, FaCheckCircle, FaHourglassHalf
} from 'react-icons/fa';
import { useParams } from 'react-router-dom';

export default function Educacao() {
  const { tipo } = useParams();
  const [anonimo, setAnonimo] = useState(false);
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
    anexo: null
  });
  const [errors, setErrors] = useState({});

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


  const denunciasEducacaoMock = [
    {
      id: 1,
      subtipo: "Infraestrutura Precária",
      descricao: "A escola tem telhados a cair e salas sem carteiras.",
      status: "Pendente",
      comentario: "A denúncia foi encaminhada à direção provincial."
    },
    {
      id: 2,
      subtipo: "Falta de Professores",
      descricao: "Turmas de matemática estão sem professor há 3 meses.",
      status: "Resolvido",
      comentario: "Professores foram destacados para a escola."
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
    if (!formData.escola.trim()) newErrors.escola = 'Informe o nome da escola.';
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
              <h2 className="mb-4 text-center">
                <FaExclamationCircle className="me-2 text-danger" /> Registrar Ocorrência - Setor de Educação
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
                    bairrosPorMunicipio[formData.municipio].map((b) => (
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
              />
              {errors.data && <div className="invalid-feedback">{errors.data}</div>}
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
            </div>

            {/* Nome */}
            {!anonimo && (
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
                />
                {errors.nome && <div className="invalid-feedback">{errors.nome}</div>}
              </div>
            )}

            {/* Contacto */}
            {!anonimo && (
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
                />
                {errors.contacto && <div className="invalid-feedback">{errors.contacto}</div>}
              </div>
            )}

            {/* Anexo */}
            <div className="mb-3">
              <label htmlFor="anexo" className="form-label">
                <FaPaperclip className="me-2" /> Anexo (opcional)
              </label>
              <input type="file" className="form-control" id="anexo" name="anexo" onChange={handleChange} />
            </div>

            {/* Anônimo */}
            <div className="form-check mb-4">
              <input
                className="form-check-input"
                type="checkbox"
                id="anonimo"
                name="anonimo"
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
                <FaListAlt className="me-2" /> Minhas Denúncias - Setor de Educação
              </h2>
              {denunciasEducacaoMock.length === 0 ? (
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
                      {denunciasEducacaoMock.map((denuncia) => (
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
