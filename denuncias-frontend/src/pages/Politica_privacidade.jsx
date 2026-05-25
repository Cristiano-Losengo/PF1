import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaShieldAlt, FaLock, FaUserSecret, FaDatabase, 
  FaCookie, FaEnvelope, FaCheckCircle, FaArrowLeft,
  FaRegBuilding, FaGavel, FaChartLine
} from 'react-icons/fa';

export default function PoliticaPrivacidade() {
  return (
    <div className="bg-light min-vh-100">
      {/* Hero */}
      <div className="position-relative" style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0d0d0d 100%)',
        paddingTop: '60px',
        paddingBottom: '80px'
      }}>
        <div className="position-absolute w-100 h-100 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(212, 175, 55, 0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}></div>
        
        <div className="container text-center position-relative">
          <div className="mb-4">
            <div className="rounded-circle d-inline-flex p-4" style={{
              background: 'rgba(212, 175, 55, 0.15)',
              border: '2px solid rgba(212, 175, 55, 0.3)'
            }}>
              <FaShieldAlt className="fs-1" style={{ color: '#D4AF37' }} />
            </div>
          </div>
          <h1 className="display-5 fw-bold mb-3" style={{
            background: 'linear-gradient(135deg, #D4AF37 0%, #FFE55C 50%, #D4AF37 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Política de Privacidade
          </h1>
          <p className="lead mx-auto" style={{ maxWidth: '700px', color: '#FFFFFF' }}>
            O compromisso do Governo da República de Angola com a proteção dos seus dados
          </p>
          <p className="mt-2" style={{ color: '#D4AF37', fontSize: '0.9rem' }}>
            Última atualização: {new Date().toLocaleDateString('pt-PT')}
          </p>
        </div>
      </div>

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            {/* destaques - institucionais */}
            <div className="row g-4 mb-5">
              <div className="col-md-4">
                <div className="card border-0 shadow-sm h-100 text-center p-3" style={{ borderRadius: '16px' }}>
                  <div className="rounded-circle d-inline-flex mx-auto mb-3 p-3" style={{ background: 'rgba(212, 175, 55, 0.1)' }}>
                    <FaLock style={{ color: '#D4AF37', fontSize: '24px' }} />
                  </div>
                  <h5 className="fw-bold">Proteção Legal</h5>
                  <small className="text-muted">Lei nº 22/11 sobre Proteção de Dados</small>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card border-0 shadow-sm h-100 text-center p-3" style={{ borderRadius: '16px' }}>
                  <div className="rounded-circle d-inline-flex mx-auto mb-3 p-3" style={{ background: 'rgba(212, 175, 55, 0.1)' }}>
                    <FaUserSecret style={{ color: '#D4AF37', fontSize: '24px' }} />
                  </div>
                  <h5 className="fw-bold">Anonimato Garantido</h5>
                  <small className="text-muted">Denúncias anónimas protegidas por lei</small>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card border-0 shadow-sm h-100 text-center p-3" style={{ borderRadius: '16px' }}>
                  <div className="rounded-circle d-inline-flex mx-auto mb-3 p-3" style={{ background: 'rgba(212, 175, 55, 0.1)' }}>
                    <FaDatabase style={{ color: '#D4AF37', fontSize: '24px' }} />
                  </div>
                  <h5 className="fw-bold">Dados Seguros</h5>
                  <small className="text-muted">Criptografia de ponta a ponta</small>
                </div>
              </div>
            </div>

          
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
              <div className="card-body p-4">
                <h3 className="fw-bold mb-3" style={{ color: '#D4AF37' }}>1. Compromisso com a Privacidade</h3>
                <p className="text-muted">
                  A Plataforma Nacional de Denúncias (PND) está comprometida com a proteção da privacidade 
                  e dos dados pessoais dos cidadãos que utilizam os nossos serviços, em conformidade com a 
                  <strong> Lei nº 22/11, de 17 de Junho</strong> - Lei de Proteção de Dados da República de Angola.
                </p>
              </div>
            </div>

            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
              <div className="card-body p-4">
                <h3 className="fw-bold mb-3" style={{ color: '#D4AF37' }}>2. Informações que Recolhemos</h3>
                
                <div className="mt-4">
                  <h5 className="fw-semibold d-flex align-items-center">
                    <div className="rounded-circle me-2 p-1" style={{ background: 'rgba(212, 175, 55, 0.2)' }}>
                      <FaRegBuilding className="text-primary" size={12} />
                    </div>
                    Denúncias Anónimas
                  </h5>
                  <p className="text-muted ms-4">Apenas dados relacionados à denúncia (local, tipo de problema, descrição) - sem identificação pessoal.</p>
                </div>
                
                <div className="mt-3">
                  <h5 className="fw-semibold d-flex align-items-center">
                    <div className="rounded-circle me-2 p-1" style={{ background: 'rgba(212, 175, 55, 0.2)' }}>
                      <FaRegBuilding className="text-primary" size={12} />
                    </div>
                    Denúncias Identificadas (opcional)
                  </h5>
                  <p className="text-muted ms-4">Nome, contacto (email/telefone) e dados da denúncia.</p>
                </div>
                
                <div className="mt-3">
                  <h5 className="fw-semibold d-flex align-items-center">
                    <div className="rounded-circle me-2 p-1" style={{ background: 'rgba(212, 175, 55, 0.2)' }}>
                      <FaRegBuilding className="text-primary" size={12} />
                    </div>
                    Utilizadores Autorizados
                  </h5>
                  <p className="text-muted ms-4">Nome, email institucional, perfil de acesso, registo de atividades (logs).</p>
                </div>
              </div>
            </div>

            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
              <div className="card-body p-4">
                <h3 className="fw-bold mb-3" style={{ color: '#D4AF37' }}>3. Utilização dos Dados</h3>
                <div className="row">
                  <div className="col-md-6">
                    <ul className="list-unstyled">
                      <li className="mb-3 d-flex align-items-center">
                        <FaCheckCircle style={{ color: '#D4AF37' }} className="me-2" />
                        <span className="text-muted">Processar denúncias</span>
                      </li>
                      <li className="mb-3 d-flex align-items-center">
                        <FaCheckCircle style={{ color: '#D4AF37' }} className="me-2" />
                        <span className="text-muted">Melhorar serviços públicos</span>
                      </li>
                      <li className="mb-3 d-flex align-items-center">
                        <FaCheckCircle style={{ color: '#D4AF37' }} className="me-2" />
                        <span className="text-muted">Gerar relatórios anónimos</span>
                      </li>
                    </ul>
                  </div>
                  <div className="col-md-6">
                    <ul className="list-unstyled">
                      <li className="mb-3 d-flex align-items-center">
                        <FaCheckCircle style={{ color: '#D4AF37' }} className="me-2" />
                        <span className="text-muted">Combate à corrupção</span>
                      </li>
                      <li className="mb-3 d-flex align-items-center">
                        <FaCheckCircle style={{ color: '#D4AF37' }} className="me-2" />
                        <span className="text-muted">Garantir transparência</span>
                      </li>
                      <li className="mb-3 d-flex align-items-center">
                        <FaCheckCircle style={{ color: '#D4AF37' }} className="me-2" />
                        <span className="text-muted">Auditoria e controlo</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
              <div className="card-body p-4">
                <h3 className="fw-bold mb-3" style={{ color: '#D4AF37' }}>4. Medidas de Segurança</h3>
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center p-2 bg-light rounded">
                      <FaLock className="text-success me-2" />
                      <span className="small">Criptografia TLS/SSL</span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center p-2 bg-light rounded">
                      <FaDatabase className="text-success me-2" />
                      <span className="small">Armazenamento encriptado</span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center p-2 bg-light rounded">
                      <FaUserSecret className="text-success me-2" />
                      <span className="small">Controlo de acessos</span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center p-2 bg-light rounded">
                      <FaChartLine className="text-success me-2" />
                      <span className="small">Registo de auditoria</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
              <div className="card-body p-4">
                <h3 className="fw-bold mb-3" style={{ color: '#D4AF37' }}>5. Cookies</h3>
                <div className="d-flex align-items-start">
                  <FaCookie style={{ color: '#D4AF37' }} className="me-3 mt-1" />
                  <p className="text-muted mb-0">
                    Utilizamos cookies apenas para autenticação e sessão de utilizadores autorizados. 
                    <strong> Não utilizamos cookies de rastreamento ou publicidade.</strong>
                  </p>
                </div>
              </div>
            </div>

            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
              <div className="card-body p-4">
                <h3 className="fw-bold mb-3" style={{ color: '#D4AF37' }}>6. Contacto</h3>
                <div className="d-flex align-items-start">
                  <FaEnvelope style={{ color: '#D4AF37' }} className="me-3 mt-1" />
                  <div>
                    <p className="text-muted mb-1">
                      Para questões relacionadas com privacidade:
                    </p>
                    <p className="mb-0">
                      <strong>privacidade@pnd.gov.ao</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Botão voltar */}
            <div className="text-center mt-5">
              <Link to="/" className="btn rounded-pill px-5 py-3" style={{
                background: 'linear-gradient(135deg, #D4AF37 0%, #FFE55C 100%)',
                color: '#000',
                fontWeight: 'bold',
                border: 'none'
              }}>
                <FaArrowLeft className="me-2" />
                Voltar à Página Inicial
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}