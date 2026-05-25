import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaBullhorn, FaShieldAlt, FaHandshake, FaChartLine, FaUsers,
  FaRegBuilding, FaTint, FaHeartbeat, FaGraduationCap,
  FaEye, FaLock, FaRegSmile, FaArrowLeft, FaStar, FaAward
} from 'react-icons/fa';

export default function Sobre() {
  return (
    <div className="bg-light min-vh-100">
      {/* Hero Section - estilo igual à Página Inicial */}
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
              <FaBullhorn className="fs-1" style={{ color: '#D4AF37' }} />
            </div>
          </div>
          <h1 className="display-5 fw-bold mb-3" style={{
            background: 'linear-gradient(135deg, #D4AF37 0%, #FFE55C 50%, #D4AF37 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Sobre a Plataforma Nacional de Denúncias
          </h1>
          <p className="lead mx-auto" style={{ maxWidth: '700px', color: '#FFFFFF' }}>
            Uma iniciativa do Governo da República de Angola para fortalecer a cidadania e a transparência
          </p>
        </div>
      </div>

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            
            {/* Missão */}
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
              <div className="card-body p-4 text-center">
                <div className="rounded-circle d-inline-flex p-3 mb-3" style={{ background: 'rgba(212, 175, 55, 0.1)' }}>
                  <FaRegSmile style={{ color: '#D4AF37', fontSize: '28px' }} />
                </div>
                <h3 className="fw-bold mb-3" style={{ color: '#D4AF37' }}>Nossa Missão</h3>
                <p className="text-muted" style={{ maxWidth: '700px', margin: '0 auto' }}>
                  Garantir que todos os cidadãos angolanos possam relatar irregularidades, abusos, corrupção, 
                  má gestão ou quaisquer condutas inapropriadas nos serviços públicos de forma 
                  <strong> segura, confidencial e acessível</strong>.
                </p>
              </div>
            </div>

            {/* Visão */}
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
              <div className="card-body p-4 text-center">
                <div className="rounded-circle d-inline-flex p-3 mb-3" style={{ background: 'rgba(212, 175, 55, 0.1)' }}>
                  <FaEye style={{ color: '#D4AF37', fontSize: '28px' }} />
                </div>
                <h3 className="fw-bold mb-3" style={{ color: '#D4AF37' }}>Nossa Visão</h3>
                <p className="text-muted" style={{ maxWidth: '700px', margin: '0 auto' }}>
                  Ser o principal canal de participação cidadã em Angola, promovendo a transparência, 
                  a integridade e a melhoria contínua dos serviços públicos.
                </p>
              </div>
            </div>

            {/* Valores */}
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
              <div className="card-body p-4">
                <h3 className="fw-bold mb-4 text-center" style={{ color: '#D4AF37' }}>Nossos Valores</h3>
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center p-3 bg-light rounded">
                      <div className="rounded-circle p-2 me-3" style={{ background: 'rgba(212, 175, 55, 0.2)' }}>
                        <FaStar style={{ color: '#D4AF37' }} />
                      </div>
                      <div>
                        <h6 className="fw-bold mb-0">Transparência</h6>
                        <small className="text-muted">Informações claras e acessíveis</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center p-3 bg-light rounded">
                      <div className="rounded-circle p-2 me-3" style={{ background: 'rgba(212, 175, 55, 0.2)' }}>
                        <FaLock style={{ color: '#D4AF37' }} />
                      </div>
                      <div>
                        <h6 className="fw-bold mb-0">Confidencialidade</h6>
                        <small className="text-muted">Proteção total da sua identidade</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center p-3 bg-light rounded">
                      <div className="rounded-circle p-2 me-3" style={{ background: 'rgba(212, 175, 55, 0.2)' }}>
                        <FaHandshake style={{ color: '#D4AF37' }} />
                      </div>
                      <div>
                        <h6 className="fw-bold mb-0">Compromisso</h6>
                        <small className="text-muted">Com o cidadão e com a verdade</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center p-3 bg-light rounded">
                      <div className="rounded-circle p-2 me-3" style={{ background: 'rgba(212, 175, 55, 0.2)' }}>
                        <FaChartLine style={{ color: '#D4AF37' }} />
                      </div>
                      <div>
                        <h6 className="fw-bold mb-0">Melhoria Contínua</h6>
                        <small className="text-muted">Dos serviços públicos</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Áreas de Atuação */}
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
              <div className="card-body p-4">
                <h3 className="fw-bold mb-4 text-center" style={{ color: '#D4AF37' }}>Áreas de Atuação</h3>
                <div className="row g-4">
                  <div className="col-md-4">
                    <div className="text-center p-3">
                      <div className="rounded-circle d-inline-flex p-3 mb-3" style={{ background: 'rgba(13, 110, 253, 0.1)' }}>
                        <FaHeartbeat className="text-primary" size={24} />
                      </div>
                      <h6 className="fw-bold">Saúde</h6>
                      <small className="text-muted">Denúncias sobre serviços de saúde</small>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="text-center p-3">
                      <div className="rounded-circle d-inline-flex p-3 mb-3" style={{ background: 'rgba(13, 202, 240, 0.1)' }}>
                        <FaTint className="text-info" size={24} />
                      </div>
                      <h6 className="fw-bold">Água</h6>
                      <small className="text-muted">Problemas de abastecimento e gestão</small>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="text-center p-3">
                      <div className="rounded-circle d-inline-flex p-3 mb-3" style={{ background: 'rgba(255, 193, 7, 0.1)' }}>
                        <FaGraduationCap className="text-warning" size={24} />
                      </div>
                      <h6 className="fw-bold">Educação</h6>
                      <small className="text-muted">Irregularidades no ensino</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Parceiros / Apoio */}
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
              <div className="card-body p-4 text-center">
                <div className="rounded-circle d-inline-flex p-3 mb-3" style={{ background: 'rgba(212, 175, 55, 0.1)' }}>
                  <FaUsers style={{ color: '#D4AF37', fontSize: '28px' }} />
                </div>
                <h3 className="fw-bold mb-3" style={{ color: '#D4AF37' }}>Instituições Parceiras</h3>
                <p className="text-muted">
                  Esta plataforma é mantida com o apoio de instituições públicas e da sociedade civil, 
                  comprometidas com a integridade, a transparência e o desenvolvimento social de Angola.
                </p>
                <div className="mt-3">
                  <span className="badge bg-light text-dark mx-1 p-2">Governo de Angola</span>
                  <span className="badge bg-light text-dark mx-1 p-2">PALOP</span>
                  <span className="badge bg-light text-dark mx-1 p-2">Sociedade Civil</span>
                </div>
              </div>
            </div>

            {/* Destaques */}
            <div className="row g-4 mb-4">
              <div className="col-md-4">
                <div className="text-center p-3">
                  <h2 className="fw-bold" style={{ color: '#D4AF37' }}>100%</h2>
                  <small className="text-muted">Anónimo e Seguro</small>
                </div>
              </div>
              <div className="col-md-4">
                <div className="text-center p-3">
                  <h2 className="fw-bold" style={{ color: '#D4AF37' }}>24/7</h2>
                  <small className="text-muted">Disponível</small>
                </div>
              </div>
              <div className="col-md-4">
                <div className="text-center p-3">
                  <h2 className="fw-bold" style={{ color: '#D4AF37' }}>Gratuito</h2>
                  <small className="text-muted">Para todos os cidadãos</small>
                </div>
              </div>
            </div>

            {/* Botão voltar */}
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