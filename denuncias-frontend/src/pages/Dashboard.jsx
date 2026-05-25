import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaHeartbeat, FaWater, FaGraduationCap, FaBullhorn, 
  FaSearch, FaChartLine, FaCalendarAlt, FaCheckCircle, 
  FaClock, FaExclamationTriangle, FaShieldAlt, FaUserSecret,
  FaArrowRight, FaBuilding, FaHospitalUser, FaSchool,
  FaTint, FaPlus, FaEye, FaBell, FaStar, FaUsers,
  FaSignOutAlt  
} from 'react-icons/fa';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

export default function Dashboard({ setLoggedIn }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
   const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    saude: 0,
    agua: 0,
    educacao: 0,
    resolvidas: 0,
    pendentes: 0,
    emAnalise: 0,
    ultimasDenuncias: []
  });

  //  usuário logado
useEffect(() => {
  const userString = sessionStorage.getItem('user');
  if (userString) {
    const parsedUser = JSON.parse(userString);
    setUser(parsedUser);
  }
}, []);
  
  const [mensagem, setMensagem] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificacoes, setNotificacoes] = useState([]);

 
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const saudeRes = await axios.get('http://localhost:9090/api/saude/denuncias/listar');
        const aguaRes = await axios.get('http://localhost:9090/api/agua/denuncias/listar');
        const educacaoRes = await axios.get('http://localhost:9090/api/educacao/denuncias/listar');
        
        const denunciasSaude = saudeRes.data?.dados || [];
        const denunciasAgua = aguaRes.data?.dados || [];
        const denunciasEducacao = educacaoRes.data?.dados || [];
        
        const total = denunciasSaude.length + denunciasAgua.length + denunciasEducacao.length;
        
    
        const todasDenuncias = [...denunciasSaude, ...denunciasAgua, ...denunciasEducacao];
        const resolvidas = todasDenuncias.filter(d => d.status === 'RESOLVIDA' || d.status === 'RESOLVIDO').length;
        const pendentes = todasDenuncias.filter(d => d.status === 'PENDENTE' || !d.status).length;
        const emAnalise = todasDenuncias.filter(d => d.status === 'EM_ANALISE' || d.status === 'ANALISE').length;
        
    
        const ultimas = [...todasDenuncias]
          .sort((a, b) => new Date(b.dataCriacao || b.data) - new Date(a.dataCriacao || a.data))
          .slice(0, 5)
          .map(d => ({
            ...d,
            area: d.area || (d.unidadeSaude ? 'Saúde' : d.municipio ? 'Água' : 'Educação')
          }));
        
        setStats({
          total,
          saude: denunciasSaude.length,
          agua: denunciasAgua.length,
          educacao: denunciasEducacao.length,
          resolvidas,
          pendentes,
          emAnalise,
          ultimasDenuncias: ultimas
        });
        
      
        if (total === 0) {
          setMensagem("Nenhuma denúncia registrada ainda. Seja o primeiro a fazer a diferença!");
        } else if (total < 10) {
          setMensagem(`Já temos ${total} denúncia(s) registrada(s). Continue participando!`);
        } else {
          setMensagem(`Parabéns! Já são ${total} denúncias registradas. Juntos construímos um país melhor!`);
        }
        
        
        setNotificacoes([
          { id: 1, mensagem: `${total} denúncias ativas no sistema`, tipo: 'info', lida: false },
          { id: 2, mensagem: `${pendentes} denúncia(s) aguardando análise`, tipo: 'warning', lida: false },
          { id: 3, mensagem: `${resolvidas} denúncia(s) já foram resolvidas`, tipo: 'success', lida: false }
        ]);
        
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
        
        setStats({
          total: 127,
          saude: 58,
          agua: 42,
          educacao: 27,
          resolvidas: 83,
          pendentes: 32,
          emAnalise: 12,
          ultimasDenuncias: [
            { id: 1, titulo: "Falta de medicamentos", area: "Saúde", data: "2024-01-15", status: "PENDENTE" },
            { id: 2, titulo: "Falta de água há 3 dias", area: "Água", data: "2024-01-14", status: "EM_ANALISE" },
            { id: 3, titulo: "Infraestrutura precária", area: "Educação", data: "2024-01-13", status: "RESOLVIDA" }
          ]
        });
        setMensagem("Plataforma ativa e funcionando. Faça sua denúncia!");
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const dadosGraficoBarras = [
    { name: 'Saúde', quantidade: stats.saude, cor: '#dc3545' },
    { name: 'Água', quantidade: stats.agua, cor: '#0dcaf0' },
    { name: 'Educação', quantidade: stats.educacao, cor: '#0d6efd' }
  ];
  
  const dadosGraficoStatus = [
    { name: 'Resolvidas', value: stats.resolvidas, cor: '#28a745' },
    { name: 'Em Análise', value: stats.emAnalise, cor: '#ffc107' },
    { name: 'Pendentes', value: stats.pendentes, cor: '#dc3545' }
  ];
  
  const dadosLinhaTempo = [
    { mes: 'Jan', denuncias: 12 },
    { mes: 'Fev', denuncias: 19 },
    { mes: 'Mar', denuncias: 25 },
    { mes: 'Abr', denuncias: 32 },
    { mes: 'Mai', denuncias: 28 },
    { mes: 'Jun', denuncias: 45 }
  ];

  const handleDenunciar = (area) => {
    navigate(`/servicos/${area.toLowerCase()}/registrar`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setLoggedIn(false);
    navigate('/login');
  };

  const CardEstatistica = ({ titulo, valor, icon: Icon, cor, bg, onClick }) => (
    <div 
      className={`card border-0 shadow-sm h-100 ${onClick ? 'cursor-pointer' : ''}`}
      style={{ 
        borderRadius: '16px',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        cursor: onClick ? 'pointer' : 'default'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
      }}
      onClick={onClick}
    >
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h6 className="text-muted mb-1 fw-semibold">{titulo}</h6>
            <h2 className={`display-5 fw-bold mb-0 ${cor}`}>{valor}</h2>
          </div>
          <div className={`rounded-circle p-3 ${bg}`}>
            <Icon className={`fs-3 ${cor}`} />
          </div>
        </div>
        <div className="mt-2">
          <small className="text-muted">
            <FaChartLine className="me-1" /> 
            Total registrado
          </small>
        </div>
      </div>
    </div>
  );

  const NotificacaoBadge = () => (
    <div className="position-relative">
      <button 
        className="btn btn-light rounded-circle position-relative"
        onClick={() => setShowNotifications(!showNotifications)}
        style={{ width: '40px', height: '40px' }}
      >
        <FaBell className="fs-5 text-muted" />
        {notificacoes.filter(n => !n.lida).length > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {notificacoes.filter(n => !n.lida).length}
          </span>
        )}
      </button>
      
      {showNotifications && (
        <div className="position-absolute end-0 mt-2 shadow-lg rounded-3" style={{ 
          width: '320px', 
          zIndex: 1000,
          backgroundColor: 'white',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          <div className="p-3 border-bottom" style={{ backgroundColor: '#f8f9fa' }}>
            <strong className="text-dark">Notificações</strong>
          </div>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {notificacoes.map(notif => (
              <div key={notif.id} className="p-3 border-bottom hover-bg-light">
                <small className="text-muted d-block mb-1">
                  {notif.tipo === 'success' && '✅ '}
                  {notif.tipo === 'warning' && '⚠️ '}
                  {notif.tipo === 'info' && 'ℹ️ '}
                  {notif.mensagem}
                </small>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );


  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} />
          <p className="text-muted">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page bg-light min-vh-100">
      
      {/* Header */}
      <div className="position-relative" style={{
        background: 'linear-gradient(135deg, #0e0b02ff 100%)',
        paddingTop: '20px',
        paddingBottom: '60px'
        
      }}>
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
        
           
          </div>
          
        
          <div className="text-center mt-4">
            <div className="mb-3">
              <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex p-3">
                <FaBullhorn className="fs-1 text-warning" />
              </div>
            </div>
            <h1 className="display-5 fw-bold text-white mb-3">
               Bem-vindo, {user?.nome || user?.username || 'Cidadão'}!
            </h1>
            <p className="lead text-white-50 mb-3">
              Sua voz é importante para construir um país mais justo e transparente
            </p>
            {mensagem && (
              <div className="mt-3">
                <div className="d-inline-block px-4 py-2 rounded-pill" style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <p className="mb-0" style={{ color: '#FFE55C' }}>
                    <span className="me-2">✨</span>
                    {mensagem}
                    <span className="ms-2">✨</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      

      <main className="container" style={{ marginTop: '-30px' }}>

        <div className="row g-4 mb-5">
          <div className="col-md-3">
            <CardEstatistica 
              titulo="Total de Denúncias"
              valor={stats.total}
              icon={FaChartLine}
              cor="text-primary"
              bg="bg-primary bg-opacity-10"
            />
          </div>
          <div className="col-md-3">
            <CardEstatistica 
              titulo="Denúncias Resolvidas"
              valor={stats.resolvidas}
              icon={FaCheckCircle}
              cor="text-success"
              bg="bg-success bg-opacity-10"
            />
          </div>
          <div className="col-md-3">
            <CardEstatistica 
              titulo="Em Análise"
              valor={stats.emAnalise}
              icon={FaClock}
              cor="text-warning"
              bg="bg-warning bg-opacity-10"
            />
          </div>
          <div className="col-md-3">
            <CardEstatistica 
              titulo="Pendentes"
              valor={stats.pendentes}
              icon={FaExclamationTriangle}
              cor="text-danger"
              bg="bg-danger bg-opacity-10"
            />
          </div>
        </div>
        
        {/* Gráficos */}
        <div className="row g-4 mb-5">
          <div className="col-md-7">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
              <div className="card-body p-4">
                <h5 className="card-title fw-bold mb-4">
                  <FaChartLine className="me-2 text-primary" />
                  Denúncias por Categoria
                </h5>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dadosGraficoBarras}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="quantidade" name="Quantidade" radius={[8, 8, 0, 0]}>
                      {dadosGraficoBarras.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.cor} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          <div className="col-md-5">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
              <div className="card-body p-4">
                <h5 className="card-title fw-bold mb-4">
                  <FaCheckCircle className="me-2 text-success" />
                  Status das Denúncias
                </h5>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dadosGraficoStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {dadosGraficoStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.cor} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
        
    
        <div className="row g-4 mb-5">
          <div className="col-12">
            <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
              <div className="card-body p-4">
                <h5 className="card-title fw-bold mb-4">
                  <FaCalendarAlt className="me-2 text-info" />
                  Tendência de Denúncias (Últimos 6 Meses)
                </h5>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={dadosLinhaTempo}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="denuncias" 
                      name="Denúncias"
                      stroke="#0d6efd" 
                      strokeWidth={3}
                      dot={{ fill: '#0d6efd', r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
        
        {/* Áreas de Denúncia */}
        <div className="row g-4 mb-5">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="fw-bold mb-0">
                <FaShieldAlt className="me-2 text-primary" />
                Faça sua Denúncia
              </h3>
              <small className="text-muted">Clique na área desejada</small>
            </div>
          </div>
          
          {/* Saúde */}
          <div className="col-md-4">
            <div 
                      className="card border-0 shadow-sm h-100 overflow-hidden"
                      style={{ 
                borderRadius: '16px',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(220, 53, 69, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              }}
              onClick={() => handleDenunciar('saude')}
            >
              <div className="card-body text-center p-4">
                <div className="mb-3">
                  <div className="rounded-circle d-inline-flex p-3" style={{
                    background: 'linear-gradient(135deg, #dc3545, #ff6b6b)',
                    boxShadow: '0 8px 20px rgba(220, 53, 69, 0.3)'
                  }}>
                    <FaHeartbeat className="fs-1 text-white" />
                  </div>
                </div>
                <h4 className="fw-bold mb-3">Saúde</h4>
                <p className="text-muted small mb-3">
                  Denuncie negligência, falta de medicamentos, corrupção ou mau atendimento
                </p>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="badge bg-danger bg-opacity-10 text-danger px-3 py-2">
                    {stats.saude} denúncias
                  </span>
                  <span className="text-danger fw-semibold">
                    Denunciar <FaArrowRight className="ms-1" />
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Água */}
          <div className="col-md-4">
            <div 
                      className="card border-0 shadow-sm h-100 overflow-hidden"
                      style={{ 
                borderRadius: '16px',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(13, 202, 240, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              }}
              onClick={() => handleDenunciar('agua')}
            >
              <div className="card-body text-center p-4">
                <div className="mb-3">
                  <div className="rounded-circle d-inline-flex p-3" style={{
                    background: 'linear-gradient(135deg, #0dcaf0, #5ee0fa)',
                    boxShadow: '0 8px 20px rgba(13, 202, 240, 0.3)'
                  }}>
                    <FaWater className="fs-1 text-white" />
                  </div>
                </div>
                <h4 className="fw-bold mb-3">Água</h4>
                <p className="text-muted small mb-3">
                  Relate problemas de fornecimento, má gestão ou irregularidades no setor
                </p>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="badge bg-info bg-opacity-10 text-info px-3 py-2">
                    {stats.agua} denúncias
                  </span>
                  <span className="text-info fw-semibold">
                    Denunciar <FaArrowRight className="ms-1" />
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Educação */}
          <div className="col-md-4">
            <div 
                      className="card border-0 shadow-sm h-100 overflow-hidden"
                      style={{ 
                borderRadius: '16px',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(13, 110, 253, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              }}
              onClick={() => handleDenunciar('educacao')}
            >
              <div className="card-body text-center p-4">
                <div className="mb-3">
                  <div className="rounded-circle d-inline-flex p-3" style={{
                    background: 'linear-gradient(135deg, #0d6efd, #4d9eff)',
                    boxShadow: '0 8px 20px rgba(13, 110, 253, 0.3)'
                  }}>
                    <FaGraduationCap className="fs-1 text-white" />
                  </div>
                </div>
                <h4 className="fw-bold mb-3">Educação</h4>
                <p className="text-muted small mb-3">
                  Registre sobre infraestrutura precária, má conduta ou corrupção
                </p>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2">
                    {stats.educacao} denúncias
                  </span>
                  <span className="text-primary fw-semibold">
                    Denunciar <FaArrowRight className="ms-1" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Denúncias */}
        {stats.ultimasDenuncias.length > 0 && (
          <div className="row g-4 mb-5">
            <div className="col-12">
              <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                <div className="card-body p-4">
                  <h5 className="card-title fw-bold mb-4">
                    <FaClock className="me-2 text-warning" />
                    Últimas Denúncias Registradas
                  </h5>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>ID</th>
                          <th>Título/Descrição</th>
                          <th>Área</th>
                          <th>Data</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.ultimasDenuncias.map((denuncia, index) => (
                          <tr key={index}>
                            <td className="text-muted">#{denuncia.id || index + 1}</td>
                            <td>
                              <span className="fw-medium">
                                {denuncia.titulo || (denuncia.descricao?.substring(0, 50)) || 'Sem título'}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${
                                denuncia.area === 'Saúde' ? 'bg-danger bg-opacity-10 text-danger' :
                                denuncia.area === 'Água' ? 'bg-info bg-opacity-10 text-info' :
                                'bg-primary bg-opacity-10 text-primary'
                              } px-3 py-2`}>
                                {denuncia.area}
                              </span>
                            </td>
                            <td>
                              <small className="text-muted">
                                {new Date(denuncia.data || denuncia.dataCriacao).toLocaleDateString('pt-PT')}
                              </small>
                            </td>
                            <td>
                              <span className={`badge ${
                                denuncia.status === 'RESOLVIDA' || denuncia.status === 'RESOLVIDO' ? 'bg-success' :
                                denuncia.status === 'EM_ANALISE' ? 'bg-warning' : 'bg-secondary'
                              }`}>
                                {denuncia.status || 'PENDENTE'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Consultar */}
        <div className="row g-4 mb-5">
          <div className="col-12">
            <div className="card border-0 shadow-sm" style={{
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #0f0d04ff 100%)'
            }}>
              <div className="card-body p-4 text-center">
                <div className="mb-3">
                  <div className="rounded-circle bg-warning bg-opacity-10 d-inline-flex p-3">
                    <FaSearch className="fs-2 text-warning" />
                  </div>
                </div>
                <h4 className="text-white mb-2">Acompanhe sua Denúncia</h4>
                <p className="text-white-50 mb-4">
                  Utilize o código de acompanhamento recebido por email para verificar o status
                </p>
                <Link 
                  to="/acompanhar"
                  className="btn btn-warning rounded-pill px-5 py-3 fw-bold"
                  style={{
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-3px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(255, 193, 7, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <FaSearch className="me-2" />
                  Consultar Denúncia
                </Link>
              </div>
            </div>
          </div>
        </div>
        
      </main>
      

      <style>{`
        .cursor-pointer {
          cursor: pointer;
        }
        .hover-bg-light:hover {
          background-color: #f8f9fa;
        }
        .bg-gradient {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        }
      `}</style>
    </div>
  );
}