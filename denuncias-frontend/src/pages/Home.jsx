import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaHeartbeat, FaWater, FaGraduationCap, FaBullhorn } from 'react-icons/fa';

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
        className="text-white d-flex align-items-center shadow"
        style={{
          background: "linear-gradient(135deg, #000000 0%, #000000 50%,rgb(5, 4, 1) 100%)",
          minHeight: "75vh",
        }}
      >
        <div className="container text-center py-5">
          <div className="mb-4">
            <img
              src="/brasao-angola.png"
              alt="República de Angola"
              width="70"
              className="mb-3 rounded-circle border border-warning p-1 bg-white"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <FaBullhorn className="fs-1 text-warning mb-3" />
            <h1 className="display-5 fw-bold mb-3 text-warning">
              Plataforma Nacional de Denúncias
            </h1>
            <p className="lead fw-light text-white-50">
              Iniciativa oficial do <strong>Governo da República de Angola</strong> que garante
              ao cidadão o direito de relatar irregularidades de forma
              <strong> anónima, segura e protegida.</strong>
            </p>
            {mensagem && (
              <p className="fw-semibold fst-italic mt-3 text-warning">
                {mensagem}
              </p>
            )}
            <button className="btn btn-warning btn-lg px-5 mt-4 fw-bold shadow-lg border-0">
              Fazer uma Denúncia
            </button>
          </div>
        </div>
      </section>

      {/* ===== ÁREAS DE DENÚNCIA ===== */}
      <main className="flex-grow-1">
        <div className="container my-5">
          <h2 className="text-center fw-bold mb-5 text-dark">
            Áreas Prioritárias de Denúncia
          </h2>

          <div className="row g-4">
            {/* Saúde */}
            <div className="col-md-4">
              <div className="h-100 p-4 bg-white border rounded-4 shadow-sm text-center hover-shadow">
                <div className="icon-circle bg-danger bg-opacity-10 text-danger mx-auto mb-3">
                  <FaHeartbeat className="fs-2" />
                </div>
                <h4 className="fw-bold mb-3 text-danger">Saúde</h4>
                <p className="text-muted small">
                  Denuncie negligência, falta de medicamentos, corrupção ou mau atendimento
                  em hospitais e centros de saúde públicos.
                </p>
                <button className="btn btn-outline-danger w-100 fw-semibold">
                  Denunciar Saúde
                </button>
              </div>
            </div>

            {/* Água */}
            <div className="col-md-4">
              <div className="h-100 p-4 bg-white border rounded-4 shadow-sm text-center hover-shadow">
                <div className="icon-circle bg-info bg-opacity-10 text-info mx-auto mb-3">
                  <FaWater className="fs-2" />
                </div>
                <h4 className="fw-bold mb-3 text-info">Água</h4>
                <p className="text-muted small">
                  Relate problemas de fornecimento, má gestão, desvios de recursos ou
                  irregularidades no setor de abastecimento público.
                </p>
                <button className="btn btn-outline-info w-100 fw-semibold ">
                  Denunciar Água
                </button>
              </div>
            </div>

            {/* Educação */}
            <div className="col-md-4">
              <div className="h-100 p-4 bg-white border rounded-4 shadow-sm text-center hover-shadow">
                <div className="icon-circle bg-primary bg-opacity-10 text-primary mx-auto mb-3">
                  <FaGraduationCap className="fs-2" />
                </div>
                <h4 className="fw-bold mb-3 text-primary">Educação</h4>
                <p className="text-muted small">
                  Registe denúncias sobre infraestrutura precária, má conduta de professores
                  ou corrupção em instituições de ensino.
                </p>
                <button className="btn btn-outline-primary w-100 fw-semibold">
                  Denunciar Educação
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

     
    </div>
  );
}
