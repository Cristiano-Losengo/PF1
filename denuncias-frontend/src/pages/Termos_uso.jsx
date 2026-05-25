import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaFileContract, FaCheckCircle, FaExclamationTriangle, FaUserSecret,
  FaBan, FaGavel, FaRegBuilding, FaArrowLeft, FaInfoCircle,
  FaShieldAlt, FaUserCheck, FaClock, FaDatabase, FaGlobe
} from 'react-icons/fa';

export default function TermosUso() {
  return (
    <div className="bg-light min-vh-100">
     
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
              <FaFileContract className="fs-1" style={{ color: '#D4AF37' }} />
            </div>
          </div>
          <h1 className="display-5 fw-bold mb-3" style={{
            background: 'linear-gradient(135deg, #D4AF37 0%, #FFE55C 50%, #D4AF37 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Termos e Condições de Uso
          </h1>
          <p className="lead mx-auto" style={{ maxWidth: '700px', color: '#FFFFFF' }}>
            Leia atentamente os termos que regem a utilização da Plataforma Nacional de Denúncias
          </p>
          <p className="mt-2" style={{ color: '#D4AF37', fontSize: '0.9rem' }}>
            Última atualização: {new Date().toLocaleDateString('pt-PT')}
          </p>
        </div>
      </div>

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
        
            <div className="row g-4 mb-5">
              <div className="col-md-4">
                <div className="card border-0 shadow-sm h-100 text-center p-3" style={{ borderRadius: '16px' }}>
                  <div className="rounded-circle d-inline-flex mx-auto mb-3 p-3" style={{ background: 'rgba(212, 175, 55, 0.1)' }}>
                    <FaUserCheck style={{ color: '#D4AF37', fontSize: '24px' }} />
                  </div>
                  <h5 className="fw-bold">Acesso Responsável</h5>
                  <small className="text-muted">Uso ético e legal da plataforma</small>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card border-0 shadow-sm h-100 text-center p-3" style={{ borderRadius: '16px' }}>
                  <div className="rounded-circle d-inline-flex mx-auto mb-3 p-3" style={{ background: 'rgba(212, 175, 55, 0.1)' }}>
                    <FaUserSecret style={{ color: '#D4AF37', fontSize: '24px' }} />
                  </div>
                  <h5 className="fw-bold">Anonimato Garantido</h5>
                  <small className="text-muted">Identidade protegida por lei</small>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card border-0 shadow-sm h-100 text-center p-3" style={{ borderRadius: '16px' }}>
                  <div className="rounded-circle d-inline-flex mx-auto mb-3 p-3" style={{ background: 'rgba(212, 175, 55, 0.1)' }}>
                    <FaGavel style={{ color: '#D4AF37', fontSize: '24px' }} />
                  </div>
                  <h5 className="fw-bold">Subordinação à Lei</h5>
                  <small className="text-muted">Conformidade com a legislação angolana</small>
                </div>
              </div>
            </div>

            {/* 1.Termos */}
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
              <div className="card-body p-4">
                <h3 className="fw-bold mb-3" style={{ color: '#D4AF37' }}>1. Aceitação dos Termos</h3>
                <p className="text-muted">
                  Ao aceder e utilizar a Plataforma Nacional de Denúncias (PND), o utilizador declara 
                  expressamente que leu, compreendeu e aceita todos os termos e condições aqui descritos, 
                  bem como a nossa <Link to="/politica-privacidade" className="text-decoration-none">Política de Privacidade</Link>.
                </p>
                <div className="alert alert-warning mt-3" style={{ borderRadius: '12px', borderLeft: '4px solid #ffc107' }}>
                  <FaExclamationTriangle className="me-2" />
                  <small>Se não concordar com algum destes termos, por favor, não utilize a plataforma.</small>
                </div>
              </div>
            </div>

            {/* 2. Objetivo */}
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
              <div className="card-body p-4">
                <h3 className="fw-bold mb-3" style={{ color: '#D4AF37' }}>2. Objetivo da Plataforma</h3>
                <p className="text-muted">
                  A PND tem como objetivo principal permitir que cidadãos angolanos possam relatar 
                  irregularidades, abusos, corrupção, má gestão ou condutas inapropriadas nos serviços 
                  públicos (Saúde, Água, Educação), de forma anónima, segura e protegida.
                </p>
              </div>
            </div>

            {/* 3. Obrigações*/}
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
              <div className="card-body p-4">
                <h3 className="fw-bold mb-3" style={{ color: '#D4AF37' }}>3. Obrigações do Utilizador</h3>
                <div className="row">
                  <div className="col-md-6">
                    <div className="d-flex align-items-start mb-3">
                      <FaCheckCircle style={{ color: '#D4AF37' }} className="me-2 mt-1" />
                      <span className="text-muted">Fornecer informações verdadeiras e precisas</span>
                    </div>
                    <div className="d-flex align-items-start mb-3">
                      <FaCheckCircle style={{ color: '#D4AF37' }} className="me-2 mt-1" />
                      <span className="text-muted">Utilizar a plataforma para fins legítimos</span>
                    </div>
                    <div className="d-flex align-items-start mb-3">
                      <FaCheckCircle style={{ color: '#D4AF37' }} className="me-2 mt-1" />
                      <span className="text-muted">Respeitar os direitos de terceiros</span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-start mb-3">
                      <FaBan style={{ color: '#dc3545' }} className="me-2 mt-1" />
                      <span className="text-muted">Não fazer denúncias falsas ou caluniosas</span>
                    </div>
                    <div className="d-flex align-items-start mb-3">
                      <FaBan style={{ color: '#dc3545' }} className="me-2 mt-1" />
                      <span className="text-muted">Não violar segredos protegidos por lei</span>
                    </div>
                    <div className="d-flex align-items-start mb-3">
                      <FaBan style={{ color: '#dc3545' }} className="me-2 mt-1" />
                      <span className="text-muted">Não tentar burlar medidas de segurança</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Denúncias */}
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
              <div className="card-body p-4">
                <h3 className="fw-bold mb-3" style={{ color: '#D4AF37' }}>4. Modalidades de Denúncia</h3>
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded" style={{ borderRadius: '12px' }}>
                      <h5 className="fw-bold mb-2">📋 Denúncia Anónima</h5>
                    s
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded" style={{ borderRadius: '12px' }}>
                      <h5 className="fw-bold mb-2">📋 Denúncia Identificada</h5>
                      <small className="text-muted">
                        Opcionalmente, pode fornecer contacto para acompanhamento. Os dados são protegidos por lei.
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Responsabilidades */}
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
              <div className="card-body p-4">
                <h3 className="fw-bold mb-3" style={{ color: '#D4AF37' }}>5. Responsabilidades</h3>
                <div className="row">
                  <div className="col-md-6">
                    <h6 className="fw-semibold">Da Plataforma:</h6>
                    <ul className="text-muted small">
                      <li>Garantir a segurança e confidencialidade dos dados</li>
                      <li>Manter a disponibilidade da plataforma</li>
                      <li>Processar denúncias com a devida diligência</li>
                      <li>Notificar sobre alterações nos termos</li>
                    </ul>
                  </div>
                  <div className="col-md-6">
                    <h6 className="fw-semibold">Do Utilizador:</h6>
                    <ul className="text-muted small">
                      <li>Pela veracidade das informações prestadas</li>
                      <li>Pelo uso adequado da plataforma</li>
                      <li>Pela confidencialidade das suas credenciais (se aplicável)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* 6. Propriedade */}
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
              <div className="card-body p-4">
                <h3 className="fw-bold mb-3" style={{ color: '#D4AF37' }}>6. Propriedade Intelectual</h3>
                <p className="text-muted">
                  Todo o conteúdo da plataforma (textos, logótipos, código, design) é propriedade exclusiva 
                  do Governo da República de Angola ou utilizado com devida autorização. É proibida a reprodução, 
                  distribuição ou modificação sem autorização expressa.
                </p>
              </div>
            </div>

            {/* 7. Suspensão e Cancelamento */}
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
              <div className="card-body p-4">
                <h3 className="fw-bold mb-3" style={{ color: '#D4AF37' }}>7. Suspensão e Cancelamento</h3>
                <p className="text-muted">
                  A plataforma reserva-se o direito de suspender ou cancelar o acesso de utilizadores que:
                </p>
                <ul className="text-muted">
                  <li>Façam uso indevido da plataforma</li>
                  <li>Violem estes termos de uso</li>
                  <li>Realizem denúncias falsas ou maliciosas</li>
                  <li>Tentem comprometer a segurança do sistema</li>
                </ul>
              </div>
            </div>

            {/* 8. Responsabilidade */}
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
              <div className="card-body p-4">
                <h3 className="fw-bold mb-3" style={{ color: '#D4AF37' }}>8. Limitação de Responsabilidade</h3>
                <p className="text-muted">
                  A plataforma não se responsabiliza por:
                </p>
                <ul className="text-muted">
                  <li>Interrupções temporárias do serviço por razões técnicas</li>
                  <li>Perda de dados por eventos fora do nosso controlo</li>
                  <li>Uso indevido da plataforma por terceiros</li>
                  <li>Consequências de denúncias falsas ou maliciosas</li>
                </ul>
              </div>
            </div>

            {/* 9. Legislação Aplicável */}
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
              <div className="card-body p-4">
                <h3 className="fw-bold mb-3" style={{ color: '#D4AF37' }}>9. Legislação Aplicável</h3>
                <div className="d-flex align-items-start">
                  <FaGavel style={{ color: '#D4AF37' }} className="me-3 mt-1" />
                  <div>
                    <p className="text-muted mb-1">
                      Estes termos regem-se pelas leis da <strong>República de Angola</strong>. Qualquer disputa 
                      será resolvida nos tribunais da comarca de Luanda.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 10. Contacto */}
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
              <div className="card-body p-4">
                <h3 className="fw-bold mb-3" style={{ color: '#D4AF37' }}>10. Contacto</h3>
                <p className="text-muted">
                  Questões relacionadas com estes Termos de Uso devem ser enviadas para:
                </p>
                <div className="d-flex align-items-start mt-3">
                  <FaGlobe style={{ color: '#D4AF37' }} className="me-3 mt-1" />
                  <div>
                    <p className="mb-0"><strong>Email:</strong> termos@pnd.gov.ao</p>
                    <p className="mb-0"><strong>Website:</strong> www.pnd.gov.ao</p>
                  </div>
                </div>
              </div>
            </div>

         
            <div className="text-center mt-4">
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