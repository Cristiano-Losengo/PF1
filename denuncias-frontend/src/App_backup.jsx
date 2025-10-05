import { useState } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { FaClipboard, FaListAlt } from 'react-icons/fa';

import {
  FaHome, FaTint, FaGraduationCap, FaUserMd, FaSignOutAlt, FaSignInAlt,
  FaInfoCircle, FaEnvelope, FaTwitter, FaLinkedin, FaGithub, FaBullhorn,
  FaBan, FaWater, FaTintSlash, FaTimesCircle, FaMoneyBillWave, FaTools, FaEllipsisH, FaHospital, FaClinicMedical, FaUserInjured,
  FaExclamationTriangle, FaPills, FaClock, FaBuilding, FaUserTimes, FaBook
} from 'react-icons/fa';

import { NavLink } from 'react-router-dom';
import { matchPath } from 'react-router-dom';


import Home from './pages/Home';
import Login from './pages/Login';
import Agua from './pages/Agua';
import Saude from './pages/Saude';
import Educacao from './pages/Educacao';
import Sobre from './pages/Sobre';
import Contacto from './pages/Contacto';

function App() {
  const [loggedIn, setLoggedIn] = useState(true);
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  const isActive = (path) => location.pathname.startsWith(path);
  const isSaudeActive = matchPath("/saude/*", location.pathname);


  return (
    <div className="d-flex flex-column min-vh-100">
      <main className="flex-shrink-0">
        {/* NAVBAR */}
        {!isLoginPage && (
          <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom py-3 shadow-sm">
            <div className="container px-5">
              <Link className="navbar-brand d-flex align-items-center me-auto" to="/">
                <FaBullhorn className="text-primary fs-3 me-2" />
                <span className="fw-bold fs-5 text-primary">Plataforma de Denúncias</span>
              </Link>

              <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarSupportedContent"
                aria-controls="navbarSupportedContent"
                aria-expanded="false"
                aria-label="Toggle navigation"
              >
                <span className="navbar-toggler-icon" />
              </button>

              <div className="collapse navbar-collapse justify-content-end" id="navbarSupportedContent">
                <ul className="navbar-nav d-flex flex-row flex-wrap align-items-center gap-3">



                  <li className="nav-item">
                    <NavLink
                      to="/"
                      className={({ isActive }) =>
                        `nav-link ${isActive ? 'text-primary fw-bold border-bottom border-3 border-primary' : 'border-primary'}`
                      }
                    >
                      <FaHome className="me-1" /> Home
                    </NavLink>
                  </li>


                  {/* ÁGUA */}
                  <li className="nav-item dropdown">
                    <Link
                      to="#"
                      className={`nav-link dropdown-toggle ${location.pathname.startsWith('/agua') ? 'text-primary fw-bold border-bottom border-3 border-primary' : 'border-primary'}`}
                      role="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <FaTint className="me-1" /> Água
                    </Link>

                    <ul className="dropdown-menu shadow-sm border-0 animate__animated animate__fadeIn">
                      <li>
                        <Link className="dropdown-item d-flex align-items-center" to="/agua/registrar">
                          <FaClipboard className="me-2 text-primary" /> Registrar Denúncia
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item d-flex align-items-center" to="/agua/minhas">
                          <FaListAlt className="me-2 text-success" /> Minhas Denúncias
                        </Link>
                      </li>
                    </ul>
                  </li>



                  <li className="nav-item dropdown">
                    <NavLink
                      to="/saude/hospital_publicos"
                      data-bs-toggle="dropdown"
                      role="button"
                      aria-expanded="false"
                      className={`nav-link dropdown-toggle ${isSaudeActive
                          ? "text-primary fw-bold border-bottom border-3 border-primary"
                          : "border-primary"
                        }`}
                    >
                      <FaUserMd className="me-1" /> Saúde
                    </NavLink>

                    <ul className="dropdown-menu shadow-sm border-0 animate__animated animate__fadeIn">
                      <li>
                        <Link
                          className="dropdown-item d-flex align-items-center"
                          to="/saude/hospital_publicos"
                        >
                          <FaHospital className="me-2 text-primary" /> Hospitais Públicos
                        </Link>
                      </li>

                      {/* Centro de Saúde com submenu */}
                      <li className="dropdown-submenu dropend">
                        <Link
                          className="dropdown-item dropdown-toggle d-flex align-items-center"
                          to="#"
                          data-bs-toggle="dropdown"
                        >
                          <FaClinicMedical className="me-2 text-primary" /> Centros de Saúde
                        </Link>

                        <ul className="dropdown-menu shadow-sm border-0 animate__animated animate__fadeIn">
                          <li>
                            <Link
                              className="dropdown-item d-flex align-items-center"
                              to="/saude/centro_saude/maternidade"
                            >
                              🏥 Maternidade
                            </Link>
                          </li>
                          <li>
                            <Link
                              className="dropdown-item d-flex align-items-center"
                              to="/saude/centro_saude/pediatria"
                            >
                              👶 Pediatria
                            </Link>
                          </li>
                          <li>
                            <Link
                              className="dropdown-item d-flex align-items-center"
                              to="/saude/centro_saude/urgencia"
                            >
                              🚑 Urgência
                            </Link>
                          </li>
                        </ul>
                      </li>
                    </ul>
                  </li>



                  {/* EDUCAÇÃO */}
                  <li className="nav-item dropdown">
                    <Link
                      to="#"
                      className={`nav-link dropdown-toggle ${location.pathname.startsWith('/educacao') ? 'text-primary fw-bold border-bottom border-3 border-primary' : 'border-primary'}`}
                      role="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <FaGraduationCap className="me-1" /> Educação
                    </Link>

                    <ul className="dropdown-menu shadow-sm border-0 animate__animated animate__fadeIn">
                      <li>
                        <Link className="dropdown-item d-flex align-items-center" to="/educacao/escolas_publicas">
                          <FaBuilding className="me-2 text-danger" /> Escolas Públicas
                        </Link>
                      </li>

                    </ul>
                  </li>


                  {/* ... 
	 <li className="nav-item">
	    <NavLink
	      to="/educacao"
	      className={({ isActive }) =>
		`nav-link ${isActive ? 'text-primary fw-bold border-bottom border-3 border-primary' : 'border-primary'}`
	      }
	    >
	      <FaGraduationCap className="me-1" /> Educação
	    </NavLink>
	  </li>
		
                  <li className="nav-item">
                    <Link className="nav-link" to="/sobre">
                      <FaInfoCircle className="me-1" /> Sobre Nós
                    </Link>
                  </li>

                  <li className="nav-item">
                    <Link className="nav-link" to="/contacto">
                      <FaEnvelope className="me-1" /> Contacto
                    </Link>
                  </li>
                  */}
                </ul>

                <div className="d-flex ms-3">

                  <button className="btn btn-primary" onClick={() => setLoggedIn(false)}>
                    <Link className="btn btn-primary" to="/login">
                      <FaSignOutAlt className="me-1" /> Logout
                    </Link>
                  </button>

                </div>
              </div>
            </div>
          </nav>
        )}

        {/* ROTAS */}
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/agua/:tipo" element={loggedIn ? <Agua /> : <Navigate to="/login" />} />

          <Route path="/saude/:tipo" element={loggedIn ? <Saude /> : <Navigate to="/login" />} />
          <Route path="/educacao/:tipo" element={loggedIn ? <Educacao /> : <Navigate to="/login" />} />
          <Route path="/sobre" element={loggedIn ? <Sobre /> : <Navigate to="/login" />} />
          <Route path="/contacto" element={loggedIn ? <Contacto /> : <Navigate to="/login" />} />
          <Route path="/login" element={<Login setLoggedIn={setLoggedIn} />} />
        </Routes>
      </main>

      {/* RODAPÉ */}
      {!isLoginPage && (
        <footer className="bg-white py-4 border-top mt-auto">
          <div className="container text-center">
            <div className="mb-2 small text-muted">  &copy; 2025 Plataforma de Denúncias. Todos os direitos reservados</div>
            <div className="d-flex justify-content-center fs-4 gap-4 mb-3">
              <a className="text-primary" href="#" aria-label="Twitter">
                <FaTwitter />
              </a>
              <a className="text-primary" href="#" aria-label="LinkedIn">
                <FaLinkedin />
              </a>
              <a className="text-primary" href="#" aria-label="GitHub">
                <FaGithub />
              </a>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;

