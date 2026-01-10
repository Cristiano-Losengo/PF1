import React, { useEffect, useState } from "react";
import { 
  FaUsers, FaPhone, FaIdCard, FaEnvelope, FaMapMarkerAlt, 
  FaRoad, FaUserTag, FaUser, FaHome, FaCity, FaLandmark,
  FaToggleOn, FaToggleOff, FaExclamationTriangle 
} from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // IMPORTE O useNavigate

export default function ContaListar() {
  const [contas, setContas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [perfis, setPerfis] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [estadosCivis, setEstadosCivis] = useState([]);
  const [mensagem, setMensagem] = useState(null);
  const [contaDetalhe, setContaDetalhe] = useState(null);
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false);
  const [alternandoEstado, setAlternandoEstado] = useState(null);
  
  // ADICIONE ESTA LINHA
  const navigate = useNavigate(); // Hook para navegação

  const carregarDados = async () => {
    try {
      setLoading(true);

      console.log("Iniciando carregamento de dados...");

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

      console.log("DEBUG - Dados retornados:");
      console.log("Contas:", contasData.length, "registros");
      console.log("Perfis:", perfisData.length, "registros");
      console.log("Associações Conta-Perfil:", contaPerfisData.length, "registros");

      if (contasData.length > 0) {
        console.log("Primeira conta (completa):", contasData[0]);
        console.log("Campos da conta:", Object.keys(contasData[0]));
      }

      if (perfisData.length > 0) {
        console.log("Primeiro perfil:", perfisData[0]);
      }

      if (contaPerfisData.length > 0) {
        console.log("Primeira associação:", contaPerfisData[0]);
        console.log("Campos da associação:", Object.keys(contaPerfisData[0]));
      }

      const perfisMap = {};
      perfisData.forEach(perfil => {
        perfisMap[perfil.pkPerfil] = perfil;
      });

      console.log("Perfis mapeados:", perfisMap);

      // Combinar dados das contas com perfis, gêneros e estados civis
      const contasCompletas = contasData.map(conta => {
        console.log(`\nProcessando conta ID ${conta.pkConta}:`);
        console.log("Dados da conta:", conta);

        let fkPerfilDaConta = conta.fkPerfil || null;
        console.log("fkPerfil direto da conta:", fkPerfilDaConta);

        const associacao = contaPerfisData.find(cp => cp.fkConta === conta.pkConta);
        console.log("Associação encontrada:", associacao);

        let perfilId = fkPerfilDaConta;
        if (!perfilId && associacao) {
          perfilId = associacao.fkPerfil;
        }
        console.log("Perfil ID final:", perfilId);

        let designacaoPerfil = 'Sem perfil';
        let estadoAssociacao = false;

        if (perfilId && perfisMap[perfilId]) {
          const perfil = perfisMap[perfilId];
          designacaoPerfil = perfil.designacao || perfil.nome || 'Perfil ' + perfilId;
          estadoAssociacao = perfil.estado || false;
          console.log("Perfil encontrado no mapa:", perfil);
        } else if (associacao && associacao.designacaoPerfil) {
          designacaoPerfil = associacao.designacaoPerfil;
          estadoAssociacao = associacao.estado || false;
          console.log("Usando designação da associação:", designacaoPerfil);
        } else if (perfilId) {
          const perfilEncontrado = perfisData.find(p => p.pkPerfil === perfilId);
          if (perfilEncontrado) {
            designacaoPerfil = perfilEncontrado.designacao || perfilEncontrado.nome || 'Perfil ' + perfilId;
            estadoAssociacao = perfilEncontrado.estado || false;
            console.log("Perfil encontrado na lista:", perfilEncontrado);
          }
        }

        console.log("Designação do perfil final:", designacaoPerfil);

        const genero = generosData.find(g => g.pkGenero === conta.fkGenero);
        const estadoCivil = estadosCivisData.find(ec => ec.pkEstadoCivil === conta.fkEstadoCivil);

        let provincia = conta.provincia || "-";
        let municipio = conta.municipio || "-";
        let bairro = conta.bairro || "-";

        if ((!conta.provincia || conta.provincia === "-") && conta.localidade) {
          const partes = conta.localidade.split(',');

          if (partes.length >= 3) {
            provincia = partes[0]?.trim() || "-";
            municipio = partes[1]?.trim() || "-";
            bairro = partes[2]?.trim() || "-";
          } else if (partes.length === 2) {
            const primeiraParte = partes[0]?.trim() || "";
            const segundaParte = partes[1]?.trim() || "";

            const provinciasConhecidas = ["Luanda", "Benguela", "Huíla", "Cabinda", "Malanje", "Huambo", "Bié", "Moxico", "Uíge", "Zaire", "Cuanza Norte", "Cuanza Sul", "Cunene", "Lunda Norte", "Lunda Sul", "Namibe", "Cuando Cubango"];
            if (provinciasConhecidas.includes(primeiraParte)) {
              provincia = primeiraParte;
              municipio = segundaParte;
            } else {
              municipio = primeiraParte;
              bairro = segundaParte;
            }
          } else if (partes.length === 1) {
            provincia = partes[0]?.trim() || "-";
          }
        }

        const nomeRua = conta.nomeRua || "-";

        return {
          ...conta,
          fkPerfil: perfilId,
          designacaoPerfil: designacaoPerfil,
          estadoAssociacao: estadoAssociacao,
          nomeGenero: genero ? genero.nome : 'Não informado',
          nomeEstadoCivil: estadoCivil ? estadoCivil.nome : 'Não informado',
          provincia: provincia,
          municipio: municipio,
          bairro: bairro,
          nomeRua: nomeRua,
          localidadeOriginal: conta.localidade || null
        };
      });

      console.log("\n=== RESUMO FINAL ===");
      console.log("Total de contas processadas:", contasCompletas.length);
      if (contasCompletas.length > 0) {
        console.log("Exemplo de conta processada:", {
          id: contasCompletas[0].pkConta,
          nome: contasCompletas[0].nomeCompleto,
          fkPerfil: contasCompletas[0].fkPerfil,
          designacaoPerfil: contasCompletas[0].designacaoPerfil,
          estadoAssociacao: contasCompletas[0].estadoAssociacao
        });
      }

      setContas(contasCompletas);
      setPerfis(perfisData);
      setGeneros(generosData);
      setEstadosCivis(estadosCivisData);

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setMensagem({
        tipo: "danger",
        texto: "Erro ao carregar dados do servidor: " + error.message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // ADICIONADO: Função para alternar estado da conta
  const handleAlternarEstado = async (id, nome) => {
    if (!window.confirm(`Deseja ${contas.find(c => c.pkConta === id)?.estado === 1 ? "desativar" : "ativar"} a conta de ${nome}?`)) {
      return;
    }

    try {
      setAlternandoEstado(id);
      const response = await fetch(`http://localhost:9090/api/seguranca/conta_alternar_estado/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        }
      });

      const result = await response.json();
      
      if (response.ok && result.sucesso) {
        setMensagem({ 
          tipo: "success", 
          texto: result.mensagem || "Estado da conta alterado com sucesso!" 
        });
        carregarDados(); // Recarrega a lista
      } else {
        throw new Error(result.mensagem || "Erro ao alterar estado da conta");
      }
    } catch (error) {
      console.error("Erro ao alternar estado:", error);
      setMensagem({ 
        tipo: "danger", 
        texto: error.message || "Erro ao alterar estado da conta" 
      });
    } finally {
      setAlternandoEstado(null);
    }
  };

  // MODIFICADO: Função para editar conta usando React Router
  const handleEditarConta = (conta) => {
    console.log("=== INICIANDO EDIÇÃO COM REACT-ROUTER ===");
    
    // Preparar dados da conta para passar via state
    const contaParaEditar = {
      pkConta: conta.pkConta,
      nomeCompleto: conta.nomeCompleto || "",
      dataNascimento: conta.dataNascimento ? new Date(conta.dataNascimento).toISOString().split('T')[0] : "",
      fkGenero: conta.fkGenero?.toString() || "",
      fkEstadoCivil: conta.fkEstadoCivil?.toString() || "",
      identificacao: conta.identificacao || "",
      telefone: conta.telefone || "",
      email: conta.email || "",
      passwordHash: "", // Deixar vazio na edição
      tipoConta: conta.tipoConta || "ADMIN",
      fkPerfil: conta.fkPerfil?.toString() || "",
      estado: conta.estado?.toString() || "1",
      provincia: conta.provincia || "",
      municipio: conta.municipio || "",
      bairro: conta.bairro || "",
      nomeRua: conta.nomeRua || "",
    };
    
    console.log("Navegando para edição com dados:", contaParaEditar);
    
    // Usar navigate com state (igual ao PerfilListar)
    navigate('/conta/cadastrar', {
      state: {
        modoEdicao: true,
        conta: contaParaEditar
      }
    });
  };

  const handleDelete = async (id, nome) => {
    const conta = contas.find(c => c.pkConta === id);
    
    const confirmacao = window.confirm(
      `⚠️ ATENÇÃO: EXCLUSÃO DEFINITIVA DE CONTA\n\n` +
      `Conta: ${nome}\n` +
      `Email: ${conta?.email || 'Não informado'}\n` +
      `Estado: ${conta?.estado === 1 ? 'ATIVO' : 'INATIVO'}\n\n` +
      `📌 Recomendação:\n` +
      `• Se deseja apenas suspender o acesso, use "Desativar" em vez de excluir.\n` +
      `• A desativação mantém o histórico e pode ser revertida.\n\n` +
      `❌ Esta exclusão é PERMANENTE e IRREVERSÍVEL.\n` +
      `Todos os dados relacionados serão apagados.\n\n` +
      `Deseja realmente EXCLUIR esta conta?\n\n` +
      `(Clique em OK para excluir, CANCELAR para manter)`
    );

    if (!confirmacao) return;

    try {
      const response = await fetch(`http://localhost:9090/api/seguranca/conta_excluir/${id}`, {
        method: "DELETE"
      });

      const result = await response.json();
      
      if (response.ok && result.sucesso) {
        setMensagem({ tipo: "success", texto: "Conta excluída com sucesso!" });
        carregarDados();
      } else {
        throw new Error(result.mensagem || "Erro ao excluir conta");
      }
    } catch (error) {
      console.error("Erro ao excluir conta:", error);
      setMensagem({ 
        tipo: "danger", 
        texto: error.message || "Erro ao excluir conta. Verifique se a conta não está associada a outros registros." 
      });
    }
  };

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

  const obterEstadoFormatado = (conta) => {
    const estado = conta.estado === null || conta.estado === undefined ? 1 : conta.estado;
    return {
      texto: estado === 1 ? 'ATIVO' : 'INATIVO',
      classe: estado === 1 ? 'bg-success' : 'bg-danger',
      icone: estado === 1 ? '✅' : '❌'
    };
  };

  const formatarDataLocal = (dataString) => {
    if (!dataString) return "-";
    try {
      const data = new Date(dataString);
      return data.toLocaleString('pt-AO', {
        timeZone: 'Africa/Luanda',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return dataString;
    }
  };

  const formatarTelefone = (telefone) => {
    if (!telefone) return "-";
    let telFormatado = telefone.replace('244', '');
    if (telFormatado.length === 9) {
      return `${telFormatado.substring(0, 3)} ${telFormatado.substring(3, 6)} ${telFormatado.substring(6, 9)}`;
    }
    return telefone;
  };

  const mostrarDetalhesConta = (conta) => {
    setContaDetalhe(conta);
    setMostrarDetalhes(true);
  };

  if (loading) {
    return (
      <div className="container mt-5 d-flex justify-content-center">
        <div className="alert alert-info text-center w-100" style={{ maxWidth: '800px' }}>
          <span className="spinner-border spinner-border-sm me-2"></span>
          Carregando dados das contas...
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h3 className="mb-4 text-primary">
        <FaUsers className="me-2" /> Lista de Contas
        <span className="badge bg-secondary ms-2">{contas.length}</span>
      </h3>

      {mensagem && (
        <div className={`alert alert-${mensagem.tipo} alert-dismissible fade show`} role="alert">
          <div className="d-flex align-items-center">
            {mensagem.tipo === "success" && <span className="me-2">✅</span>}
            {mensagem.tipo === "danger" && <span className="me-2">❌</span>}
            <strong>{mensagem.texto}</strong>
          </div>
          <button type="button" className="btn-close" onClick={() => setMensagem(null)}></button>
        </div>
      )}

      {mostrarDetalhes && contaDetalhe && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <FaUserTag className="me-2" />
                  Detalhes da Conta: {contaDetalhe.nomeCompleto}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setMostrarDetalhes(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6 mb-4">
                    <h6 className="border-bottom pb-2 mb-3 text-primary">Dados Pessoais</h6>
                    <div className="mb-2">
                      <strong><FaIdCard className="me-2" /> Bilhete de Identidade:</strong>
                      <div className="ms-4">{contaDetalhe.identificacao || "-"}</div>
                    </div>
                    <div className="mb-2">
                      <strong><FaPhone className="me-2" /> Telefone:</strong>
                      <div className="ms-4">{formatarTelefone(contaDetalhe.telefone)}</div>
                    </div>
                    <div className="mb-2">
                      <strong>Data de Nascimento:</strong>
                      <div className="ms-4">{contaDetalhe.dataNascimento ? new Date(contaDetalhe.dataNascimento).toLocaleDateString('pt-AO') : "-"}</div>
                    </div>
                    <div className="mb-2">
                      <strong>Gênero:</strong>
                      <div className="ms-4">{contaDetalhe.nomeGenero}</div>
                    </div>
                    <div className="mb-2">
                      <strong>Estado Civil:</strong>
                      <div className="ms-4">{formatarEstadoCivil(contaDetalhe.nomeEstadoCivil)}</div>
                    </div>
                  </div>

                  <div className="col-md-6 mb-4">
                    <h6 className="border-bottom pb-2 mb-3 text-success">Dados da Conta</h6>
                    <div className="mb-2">
                      <strong><FaEnvelope className="me-2" /> Email:</strong>
                      <div className="ms-4">{contaDetalhe.email}</div>
                    </div>
                    <div className="mb-2">
                      <strong>Tipo de Conta:</strong>
                      <div className="ms-4">
                        <span className={`badge ${contaDetalhe.tipoConta === 'ADMIN' ? 'bg-danger' : contaDetalhe.tipoConta === 'GESTOR_PROVINCIAL' ? 'bg-warning' : 'bg-success'}`}>
                          {contaDetalhe.tipoConta}
                        </span>
                      </div>
                    </div>
                    <div className="mb-2">
                      <strong>Perfil:</strong>
                      <div className="ms-4">
                        <span className={`badge ${contaDetalhe.estadoAssociacao ? 'bg-success' : 'bg-secondary'}`}>
                          {contaDetalhe.designacaoPerfil}
                        </span>
                        {contaDetalhe.fkPerfil && (
                          <small className="text-muted ms-2">(ID: {contaDetalhe.fkPerfil})</small>
                        )}
                      </div>
                    </div>
                    <div className="mb-2">
                      <strong>Estado da Conta:</strong>
                      <div className="ms-4">
                        {obterEstadoFormatado(contaDetalhe).texto === 'ATIVO' ? (
                          <span className="badge bg-success">✅ ATIVO</span>
                        ) : (
                          <span className="badge bg-danger">❌ INATIVO</span>
                        )}
                      </div>
                    </div>
                    <div className="mb-2">
                      <strong>Data de Criação:</strong>
                      <div className="ms-4">{formatarDataLocal(contaDetalhe.createdAt)}</div>
                    </div>
                    <div className="mb-2">
                      <strong>Última Atualização:</strong>
                      <div className="ms-4">{contaDetalhe.updatedAt ? formatarDataLocal(contaDetalhe.updatedAt) : "-"}</div>
                    </div>
                  </div>

                  <div className="col-12 mb-4">
                    <h6 className="border-bottom pb-2 mb-3 text-info">Endereço</h6>
                    <div className="row">
                      <div className="col-md-3 mb-2">
                        <strong><FaMapMarkerAlt className="me-2" /> Província:</strong>
                        <div className="ms-4">{contaDetalhe.provincia || "-"}</div>
                      </div>
                      <div className="col-md-3 mb-2">
                        <strong><FaLandmark className="me-2" /> Município:</strong>
                        <div className="ms-4">{contaDetalhe.municipio || "-"}</div>
                      </div>
                      <div className="col-md-3 mb-2">
                        <strong><FaHome className="me-2" /> Bairro:</strong>
                        <div className="ms-4">{contaDetalhe.bairro || "-"}</div>
                      </div>
                      <div className="col-md-3 mb-2">
                        <strong><FaRoad className="me-2" /> Rua/Número:</strong>
                        <div className="ms-4">{contaDetalhe.nomeRua || "-"}</div>
                      </div>
                      {contaDetalhe.localidadeOriginal && (
                        <div className="col-12 mt-2">
                          <small className="text-muted">
                            <em>Localidade original: {contaDetalhe.localidadeOriginal}</em>
                          </small>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setMostrarDetalhes(false)}
                >
                  Fechar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setMostrarDetalhes(false);
                    handleEditarConta(contaDetalhe);
                  }}
                >
                  Editar Conta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card shadow">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered table-striped table-hover">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Nome Completo</th>
                  <th>Gênero</th>
                  <th>BI</th>
                  <th>Email</th>
                  <th>Telefone</th>
                  <th>Tipo Conta</th>
                  <th>Perfil</th>
                  <th>Endereço</th>
                  <th>Estado</th>
                  <th>Criado em</th>
                  <th>Atualizado em</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {contas.length > 0 ? (
                  contas.map((conta, i) => {
                    const estadoFormatado = obterEstadoFormatado(conta);

                    return (
                      <tr key={conta.pkConta}>
                        <td>{i + 1}</td>
                        <td>
                          <strong>{conta.nomeCompleto}</strong>
                          <div className="small text-muted">
                            {formatarEstadoCivil(conta.nomeEstadoCivil)}
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <FaUser className="text-info me-2" />
                            {conta.nomeGenero}
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <FaIdCard className="text-warning me-2" />
                            {conta.identificacao || "-"}
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <FaEnvelope className="text-primary me-2" />
                            {conta.email}
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <FaPhone className="text-success me-2" />
                            {formatarTelefone(conta.telefone)}
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${conta.tipoConta === 'ADMIN' ? 'bg-danger' : conta.tipoConta === 'GESTOR_PROVINCIAL' ? 'bg-warning' : 'bg-success'}`}>
                            {conta.tipoConta}
                          </span>
                        </td>
                        <td>
                          <div>
                            <span className={`badge ${conta.estadoAssociacao ? 'bg-success' : 'bg-secondary'}`}>
                              {conta.designacaoPerfil}
                            </span>
                            {conta.fkPerfil && conta.designacaoPerfil !== 'Sem perfil' && (
                              <small className="text-muted ms-1">(ID: {conta.fkPerfil})</small>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="small">
                            <div className="d-flex align-items-center">
                              <FaMapMarkerAlt className="me-1 text-info" />
                              {conta.provincia || "-"}
                            </div>
                            <div className="text-muted">
                              <div className="d-flex align-items-center">
                                <FaLandmark className="me-1" />
                                {conta.municipio || "-"}
                              </div>
                              <div className="d-flex align-items-center">
                                <FaHome className="me-1" />
                                {conta.bairro || "-"}
                              </div>
                            </div>
                            {conta.nomeRua && conta.nomeRua !== "-" && (
                              <div className="text-muted small mt-1">
                                <div className="d-flex align-items-center">
                                  <FaRoad className="me-1" />
                                  <span className="text-truncate" style={{ maxWidth: '150px' }} title={conta.nomeRua}>
                                    {conta.nomeRua}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${estadoFormatado.classe}`}>
                            {estadoFormatado.icone} {estadoFormatado.texto}
                          </span>
                        </td>
                        <td>
                          <div className="small">
                            {formatarDataLocal(conta.createdAt)}
                          </div>
                        </td>
                        <td>
                          <div className="small">
                            {formatarDataLocal(conta.updatedAt)}
                          </div>
                        </td>
                        <td>
                          <div className="btn-group" role="group">
                            <button
                              className="btn btn-sm btn-outline-info me-2"
                              onClick={() => mostrarDetalhesConta(conta)}
                              title="Ver Detalhes"
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-primary me-2"
                              onClick={() => handleEditarConta(conta)}
                              title="Editar"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            
                            {/* ADICIONADO: Botão para ativar/desativar */}
                            <button
                              className={`btn btn-sm ${conta.estado === 1 ? 'btn-outline-warning' : 'btn-outline-success'} me-2`}
                              onClick={() => handleAlternarEstado(conta.pkConta, conta.nomeCompleto)}
                              disabled={alternandoEstado === conta.pkConta}
                              title={conta.estado === 1 ? "Desativar Conta" : "Ativar Conta"}
                            >
                              {alternandoEstado === conta.pkConta ? (
                                <span className="spinner-border spinner-border-sm"></span>
                              ) : conta.estado === 1 ? (
                                <>
                                  <FaToggleOff className="me-1" />
                                  Desativar
                                </>
                              ) : (
                                <>
                                  <FaToggleOn className="me-1" />
                                  Ativar
                                </>
                              )}
                            </button>
                            
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(conta.pkConta, conta.nomeCompleto)}
                              title="Excluir Permanentemente"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={13} className="text-center py-4">
                      <div className="alert alert-info mb-0">
                        <FaUsers className="me-2" />
                        Nenhuma conta cadastrada
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* ADICIONADO: Legenda das ações */}
          <div className="mt-4 p-3 bg-light rounded">
            <h6 className="text-primary mb-3">
              <FaExclamationTriangle className="me-2" />
              Legenda das Ações Disponíveis
            </h6>
            <div className="row">
              <div className="col-md-3 mb-2">
                <span className="badge bg-info me-2">
                  <i className="bi bi-eye"></i>
                </span>
                <small>Ver detalhes da conta</small>
              </div>
              <div className="col-md-3 mb-2">
                <span className="badge bg-primary me-2">
                  <i className="bi bi-pencil"></i>
                </span>
                <small>Editar dados da conta</small>
              </div>
              <div className="col-md-3 mb-2">
                <span className="badge bg-warning me-2">
                  <FaToggleOff />
                </span>
                <small>Desativar conta (recomendado)</small>
              </div>
              <div className="col-md-3 mb-2">
                <span className="badge bg-danger me-2">
                  <i className="bi bi-trash"></i>
                </span>
                <small>Excluir permanentemente</small>
              </div>
            </div>
            <div className="mt-2 text-muted small">
              <strong>Dica:</strong> Use a desativação para suspender acesso temporariamente. 
              A exclusão é permanente e irreversível.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}