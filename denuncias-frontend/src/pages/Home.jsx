import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, Link, NavLink, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FaHeartbeat, FaWater, FaGraduationCap, FaBullhorn, FaSignOutAlt, FaSearch } from 'react-icons/fa';
import Footer from './Footer';

export default function Home({ setLoggedIn }) {
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    axios.get('http://localhost:9090/api/denuncias/home')
      .then(res => setMensagem(res.data.mensagem))
      .catch(err => console.error('Erro:', err));
  }, []);

  return (
    <div className="page bg-light min-vh-100 d-flex flex-column">

      {/* ===== HERO ===== */}
      <section
        className="d-flex align-items-center shadow position-relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0d0d0d 100%)",
          minHeight: "75vh",
        }}
      >

        <div className="position-absolute w-100 h-100 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(212, 175, 55, 0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}></div>

        <div className="container text-center py-5 position-relative">
          <div className="mb-4">
            {/* Animação de fade-in para os ícones 
            <div className="d-flex justify-content-center gap-3 mb-4 animate__animated animate__fadeInUp">
              <img
                src="/brasao-angola.png"
                alt="República de Angola"
                width="70"
                className="rounded-circle border border-warning p-1 bg-white shadow-lg"
                style={{ transition: 'transform 0.3s' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
              */}

            {/* Título com gradiente */}
            <h1 className="display-5 fw-bold mb-3" style={{
              background: 'linear-gradient(135deg, #D4AF37 0%, #FFE55C 50%, #D4AF37 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 2px 10px rgba(212, 175, 55, 0.2)'
            }}>
              Plataforma Nacional de Denúncias
            </h1>

             <p className="lead fw-light text-white-70" style={{ maxWidth: '800px', margin: '0 auto', fontSize: '1.2rem' }}>
              Iniciativa oficial do <strong className="text-warning">Governo da República de Angola</strong> que garante
              ao cidadão o direito de relatar irregularidades de forma
              <strong> anónima, segura e protegida.</strong>
            </p>

            {/* Mensagem dinâmica */}
            {mensagem && (
              <div className="mt-4 animate__animated animate__fadeInUp">
                <div className="d-inline-block px-4 py-2 rounded-pill" style={{
                  background: 'rgba(212, 175, 55, 0.15)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(212, 175, 55, 0.3)'
                }}>
                  <p className="fw-semibold fst-italic mb-0" style={{ color: '#FFE55C' }}>
                    <span className="me-2">✨</span>
                    {mensagem}
                    <span className="ms-2">✨</span>
                  </p>
                </div>
              </div>
            )}

             <div className="mt-5 animate__animated animate__fadeInUp animate__delay-1s">
              <Link
                to="/acompanhar"
                className="btn btn-consultar-denuncia"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 40px',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  borderRadius: '50px',
                  background: 'linear-gradient(135deg, #D4AF37 0%, #FFE55C 50%, #D4AF37 100%)',
                  color: '#000',
                  border: 'none',
                  boxShadow: '0 8px 25px rgba(212, 175, 55, 0.3)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  textDecoration: 'none',
                  letterSpacing: '0.5px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 15px 35px rgba(212, 175, 55, 0.4)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #FFE55C 0%, #D4AF37 50%, #FFE55C 100%)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(212, 175, 55, 0.3)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #D4AF37 0%, #FFE55C 50%, #D4AF37 100%)';
                }}
              >
                <FaSearch size={20} />
                Consultar Denúncia
                <span style={{ fontSize: '1.2rem' }}>→</span>
              </Link>
            </div>
            <div className="mt-5 d-flex justify-content-center gap-4 flex-wrap">
              <div className="d-flex align-items-center gap-2">
                <div className="bg-success rounded-circle p-1" style={{ width: '8px', height: '8px' }}></div>
                <small className="text-white-50">100% Anônimo</small>
              </div>
              <div className="d-flex align-items-center gap-2">
                <div className="bg-success rounded-circle p-1" style={{ width: '8px', height: '8px' }}></div>
                <small className="text-white-50">Dados Criptografados</small>
              </div>
              <div className="d-flex align-items-center gap-2">
                <div className="bg-success rounded-circle p-1" style={{ width: '8px', height: '8px' }}></div>
                <small className="text-white-50">Protegido por Lei</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ÁREAS DE DENÚNCIA ===== */}
      <main className="flex-grow-1">
        <div className="container my-5">
          <h2 className="text-center fw-bold mb-5 text-dark position-relative">
            Áreas Prioritárias de Denúncia
            <div className="position-absolute bottom-0 start-50 translate-middle-x" style={{
              width: '60px',
              height: '3px',
              background: 'linear-gradient(90deg, #D4AF37, #FFE55C)',
              borderRadius: '3px',
              marginTop: '10px'
            }}></div>
          </h2>

          <div className="row g-4">
            {/* Saúde */}
            <div className="col-md-4">
              <div className="h-100 p-4 bg-white border rounded-4 shadow-sm text-center hover-card" style={{
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
              }}>
                <div className="icon-circle bg-danger bg-opacity-10 text-danger mx-auto mb-3" style={{
                  width: '70px',
                  height: '70px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  transition: 'transform 0.3s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                  <FaHeartbeat className="fs-1" />
                </div>
                <h4 className="fw-bold mb-3 text-danger">Saúde</h4>
                <p className="text-muted small">
                  Denuncie negligência, falta de medicamentos, corrupção ou mau atendimento
                  em hospitais e centros de saúde públicos.
                </p>
                <Link
                  to="servicos/saude/registrar"
                  className="btn btn-outline-danger w-100 fw-semibold rounded-pill"
                  style={{ transition: 'all 0.3s' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  Denunciar Saúde →
                </Link>
              </div>
            </div>

            {/* Água - Card melhorado */}
            <div className="col-md-4">
              <div className="h-100 p-4 bg-white border rounded-4 shadow-sm text-center hover-card" style={{
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
              }}>
                <div className="icon-circle bg-info bg-opacity-10 text-info mx-auto mb-3" style={{
                  width: '70px',
                  height: '70px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  transition: 'transform 0.3s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                  <FaWater className="fs-1" />
                </div>
                <h4 className="fw-bold mb-3 text-info">Água</h4>
                <p className="text-muted small">
                  Relate problemas de fornecimento, má gestão, desvios de recursos ou
                  irregularidades no setor de abastecimento público.
                </p>
                <Link
                  to="servicos/agua/registrar"
                  className="btn btn-outline-info w-100 fw-semibold rounded-pill"
                  style={{ transition: 'all 0.3s' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(13, 202, 240, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  Denunciar Água →
                </Link>
              </div>
            </div>

            {/* Educação - Card melhorado */}
            <div className="col-md-4">
              <div className="h-100 p-4 bg-white border rounded-4 shadow-sm text-center hover-card" style={{
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
              }}>
                <div className="icon-circle bg-primary bg-opacity-10 text-primary mx-auto mb-3" style={{
                  width: '70px',
                  height: '70px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  transition: 'transform 0.3s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                  <FaGraduationCap className="fs-1" />
                </div>
                <h4 className="fw-bold mb-3 text-primary">Educação</h4>
                <p className="text-muted small">
                  Registe denúncias sobre infraestrutura precária, má conduta de professores
                  ou corrupção em instituições de ensino.
                </p>
                <Link
                  to="servicos/educacao/registrar"
                  className="btn btn-outline-primary w-100 fw-semibold rounded-pill"
                  style={{ transition: 'all 0.3s' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(13, 110, 253, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  Denunciar Educação →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

    
      

    </div>
  );
}