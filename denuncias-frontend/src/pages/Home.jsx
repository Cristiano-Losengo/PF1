import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  FaHeartbeat, FaWater, FaGraduationCap, FaBullhorn, FaShieldAlt 
} from 'react-icons/fa';

export default function Home() {
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    axios.get('http://localhost:8080/api/denuncias/home')
      .then(res => setMensagem(res.data.mensagem))
      .catch(err => console.error('Erro:', err));
  }, []);

  return (
    <div className="page bg-light min-vh-100 d-flex flex-column">
      
      {/* ===== HERO ===== */}
      <section 
        className="text-white d-flex align-items-center shadow-sm"
        style={{
          background: "linear-gradient(135deg, #0d47a1 0%, #1976d2 100%)",
          minHeight: "75vh"
        }}
      >
        <div className="container text-center py-5">
          <div className="mb-4">
            <FaBullhorn className="fs-1 text-warning mb-3" />
            <h1 className="display-4 fw-bold mb-3">Plataforma Nacional de Denúncias</h1>
            <p className="lead fw-light">
              Ferramenta oficial do <strong>Governo da República</strong> que garante
              ao cidadão o direito de relatar irregularidades de forma <strong>anónima,
              segura e protegida</strong>.
            </p>
            {mensagem && (
              <p className="fw-semibold fst-italic mt-3">{mensagem}</p>
            )}
            <button className="btn btn-warning btn-lg px-5 mt-4 fw-bold shadow">
              Fazer uma Denúncia
            </button>
          </div>
        </div>
      </section>

      {/* ===== ÁREAS DE DENÚNCIA ===== */}
      <main className="flex-grow-1">
        <div className="container my-5">
          <h2 className="text-center fw-bold mb-5 text-primary">
            Áreas Prioritárias de Denúncia
          </h2>
          <div className="row g-4">
            
            {/* Saúde */}
            <div className="col-md-4">
              <div className="h-100 p-4 bg-white border rounded shadow-sm text-center card-hover">
                <div className="icon-circle bg-danger bg-opacity-10 text-danger mx-auto mb-3">
                  <FaHeartbeat className="fs-2" />
                </div>
                <h4 className="fw-bold mb-3 text-danger">Saúde</h4>
                <p className="text-muted">
                  Denuncie negligência, falta de medicamentos, corrupção ou mau atendimento 
                  em hospitais e centros de saúde públicos.
                </p>
                <button className="btn btn-danger w-100">Denunciar Saúde</button>
              </div>
            </div>

            {/* Água */}
            <div className="col-md-4">
              <div className="h-100 p-4 bg-white border rounded shadow-sm text-center card-hover">
                <div className="icon-circle bg-info bg-opacity-10 text-info mx-auto mb-3">
                  <FaWater className="fs-2" />
                </div>
                <h4 className="fw-bold mb-3 text-info">Água</h4>
                <p className="text-muted">
                  Relate problemas de fornecimento, má gestão, desvios de recursos ou
                  irregularidades no setor de abastecimento.
                </p>
                <button className="btn btn-info text-white w-100">Denunciar Água</button>
              </div>
            </div>

            {/* Educação */}
            <div className="col-md-4">
              <div className="h-100 p-4 bg-white border rounded shadow-sm text-center card-hover">
                <div className="icon-circle bg-primary bg-opacity-10 text-primary mx-auto mb-3">
                  <FaGraduationCap className="fs-2" />
                </div>
                <h4 className="fw-bold mb-3 text-primary">Educação</h4>
                <p className="text-muted">
                  Registe denúncias sobre infraestrutura precária, má conduta de professores
                  ou corrupção em instituições educacionais.
                </p>
                <button className="btn btn-primary w-100">Denunciar Educação</button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ===== RODAPÉ ===== */}
      <footer className="bg-dark text-white mt-auto">
        <div className="container py-5">
          <div className="row">
            <div className="col-md-4 mb-3">
              <h5 className="fw-bold">Plataforma Nacional</h5>
              <p className="small text-secondary">
                Uma iniciativa do Governo da República para reforçar a transparência
                e promover a boa governação.
              </p>
            </div>
            <div className="col-md-4 mb-3">
              <h6 className="fw-bold">Links Rápidos</h6>
              <ul className="list-unstyled small">
                <li><a href="#" className="text-white text-decoration-none">Início</a></li>
                <li><a href="#" className="text-white text-decoration-none">Saúde</a></li>
                <li><a href="#" className="text-white text-decoration-none">Água</a></li>
                <li><a href="#" className="text-white text-decoration-none">Educação</a></li>
              </ul>
            </div>
            <div className="col-md-4 mb-3">
              <h6 className="fw-bold">Contacto</h6>
              <p className="small mb-1">Linha Verde: 111</p>
              <p className="small mb-1">Email: denuncias@gov.ao</p>
              <p className="small">Endereço: Largo da Independência, Luanda - Angola</p>
            </div>
          </div>
          <div className="border-top border-secondary pt-3 mt-3 text-center small text-secondary">
            {/* &copy; 2025 Governo da República - Plataforma Nacional de Denúncias. Todos os direitos reservados.
          */}
          </div>
        </div>
      </footer>

      {/* ===== ESTILOS EXTRA ===== */}
      <style>
        {`
          .card-hover {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
 
          .icon-circle {
            width: 70px;
            height: 70px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
          }
        `}
      </style>
    </div>
  );
}

