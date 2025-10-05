import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, Link, NavLink, useLocation } from 'react-router-dom';
import {
  FaClipboard, FaListAlt, FaHome, FaTint, FaGraduationCap, FaUserMd,
  FaSignOutAlt, FaHospital, FaBuilding, FaUser, FaBullhorn
} from 'react-icons/fa';

import Home from './pages/Home';
import Login from './pages/Login';
import Agua from './pages/Agua';
import Saude from './pages/Saude';
import Educacao from './pages/Educacao';
import Sobre from './pages/Sobre';
import Contacto from './pages/Contacto';
import Seguranca from './pages/Seguranca';
import FuncionalidadeCadastrar from './pages/Funcionalidade/FuncionalidadeCadastrar';
import FuncionalidadeListar from './pages/Funcionalidade/FuncionalidadeListar';
import PerfilCadastrar from './pages/Perfil/PerfilCadastrar';
import PerfilListar from './pages/Perfil/PerfilListar';
import ContaCadastrar from './pages/Conta/ContaCadastrar';
import ContaAtribuirContas from './pages/Conta/ContaAtribuirContas';


function App() {
  const [loggedIn, setLoggedIn] = useState(true);

  // mobile nav open (true = expanded)
  const [navOpen, setNavOpen] = useState(false);

  // top-level dropdowns control (only one open at a time)
  const [openTop, setOpenTop] = useState({
    agua: false,
    saude: false,
    educacao: false,
    seguranca: false,
  });

  // submenus inside "Segurança"
  const [segOpen, setSegOpen] = useState({
    funcionalidade: false,
    perfis: false,
    contas: false,
  });

  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  const navRef = useRef(null);

  // Toggle top-level, close others
  const toggleTop = (key) => {
    setOpenTop(prev => {
      const next = { agua: false, saude: false, educacao: false, seguranca: false };
      next[key] = !prev[key];
      return next;
    });
    // when opening a top-level other than seguranca, ensure seg submenus are closed
    if (key !== 'seguranca') {
      setSegOpen({ funcionalidade: false, perfis: false, contas: false });
    }
  };

  // Toggle submenu of seguranca
const toggleSeg = (key) => {
  setSegOpen(prev => {
    const next = { funcionalidade: false, perfis: false, contas: false };
    next[key] = !prev[key]; // se já estava aberto, fecha
    return next;
  });
};

  const closeAll = () => {
    setNavOpen(false);
    setOpenTop({ agua: false, saude: false, educacao: false, seguranca: false });
    setSegOpen({ funcionalidade: false, perfis: false, contas: false });
  };

  // close menus when user navigates to a new route
  useEffect(() => {
    closeAll();
  }, [location.pathname]);

  // click outside to close
  useEffect(() => {
    const handler = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        closeAll();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // small helper to determine active top path
  const startsWith = (p) => location.pathname.startsWith(p);

  return (
    <div className="d-flex flex-column min-vh-100">
      <main className="flex-shrink-0">
        {/* NAVBAR */}
        {!isLoginPage && (
          <nav ref={navRef} className="navbar navbar-expand-lg navbar-light bg-white border-bottom py-3 shadow-sm">
            <div className="container px-5">
              <Link className="navbar-brand d-flex align-items-center me-auto" to="/">
                <FaBullhorn className="text-primary fs-3 me-2" />
                <span className="fw-bold fs-5 text-primary">Plataforma de Denúncias</span>
              </Link>

              {/* mobile toggler (controlled) */}
              <button
                className="navbar-toggler"
                type="button"
                aria-label="Toggle navigation"
                onClick={() => setNavOpen(open => !open)}
              >
                <span className="navbar-toggler-icon" />
              </button>

              <div className={`collapse navbar-collapse justify-content-end ${navOpen ? 'show' : ''}`} id="navbarSupportedContent">
                <ul className="navbar-nav d-flex flex-row flex-wrap align-items-center gap-3">

                  {/* HOME */}
                  <li className="nav-item">
                    <NavLink
                      to="/"
                      className={({ isActive }) =>
                        `nav-link ${isActive ? 'text-primary fw-bold border-bottom border-3 border-primary' : 'border-primary'}`
                      }
                      onClick={closeAll}
                    >
                      <FaHome className="me-1" /> Home
                    </NavLink>
                  </li>

                  {/* ÁGUA */}
                  <li className="nav-item dropdown">
                    <button
                      className={`nav-link btn btn-link dropdown-toggle text-start ${startsWith('/agua') ? 'text-primary fw-bold border-bottom border-3 border-primary' : 'border-primary'}`}
                      onClick={(e) => { e.preventDefault(); toggleTop('agua'); }}
                      aria-expanded={openTop.agua}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleTop('agua'); } }}
                    >
                      <FaTint className="me-1" /> Água
                    </button>

                    <ul className={`dropdown-menu shadow-sm border-0 animate__animated animate__fadeIn ${openTop.agua ? 'show' : ''}`}>
                      <li>
                        <Link className="dropdown-item d-flex align-items-center" to="/agua/registrar" onClick={closeAll}>
                          <FaClipboard className="me-2 text-primary" /> Registrar Denúncia
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item d-flex align-items-center" to="/agua/minhas" onClick={closeAll}>
                          <FaListAlt className="me-2 text-success" /> Minhas Denúncias
                        </Link>
                      </li>
                    </ul>
                  </li>

                  {/* SAÚDE */}
                  <li className="nav-item dropdown">
                    <button
                      className={`nav-link btn btn-link dropdown-toggle text-start ${startsWith('/saude') ? 'text-primary fw-bold border-bottom border-3 border-primary' : 'border-primary'}`}
                      onClick={(e) => { e.preventDefault(); toggleTop('saude'); }}
                      aria-expanded={openTop.saude}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleTop('saude'); } }}
                    >
                      <FaUserMd className="me-1" /> Saúde
                    </button>

                    <ul className={`dropdown-menu shadow-sm border-0 animate__animated animate__fadeIn ${openTop.saude ? 'show' : ''}`}>
                      <li>
                        <Link className="dropdown-item d-flex align-items-center" to="/saude/registrar" onClick={closeAll}>
                          <FaHospital className="me-2 text-primary" /> Registrar Denúncia
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item d-flex align-items-center" to="/saude/minhas" onClick={closeAll}>
                          <FaHospital className="me-2 text-success" /> Minhas Denúncias
                        </Link>
                      </li>
                    </ul>
                  </li>

                  {/* EDUCAÇÃO */}
                  <li className="nav-item dropdown">
                    <button
                      className={`nav-link btn btn-link dropdown-toggle text-start ${startsWith('/educacao') ? 'text-primary fw-bold border-bottom border-3 border-primary' : 'border-primary'}`}
                      onClick={(e) => { e.preventDefault(); toggleTop('educacao'); }}
                      aria-expanded={openTop.educacao}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleTop('educacao'); } }}
                    >
                      <FaGraduationCap className="me-1" /> Educação
                    </button>

                    <ul className={`dropdown-menu shadow-sm border-0 animate__animated animate__fadeIn ${openTop.educacao ? 'show' : ''}`}>
                      <li>
                        <Link className="dropdown-item d-flex align-items-center" to="/educacao/registrar" onClick={closeAll}>
                          <FaBuilding className="me-2 text-danger" /> Registrar Denúncia
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item d-flex align-items-center" to="/educacao/minhas" onClick={closeAll}>
                          <FaListAlt className="me-2 text-success" /> Minhas Denúncias
                        </Link>
                      </li>
                    </ul>
                  </li>

                  {/* SEGURANÇA (top-level) */}
                  <li className="nav-item dropdown">
                    <button
                      className={`nav-link btn btn-link dropdown-toggle text-start ${startsWith('/seguranca') ? 'text-primary fw-bold border-bottom border-3 border-primary' : 'border-primary'}`}
                      onClick={(e) => { e.preventDefault(); toggleTop('seguranca'); }}
                      aria-expanded={openTop.seguranca}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleTop('seguranca'); } }}
                    >
                      <FaGraduationCap className="me-1" /> Segurança
                    </button>

                    <ul className={`dropdown-menu shadow-sm border-0 animate__animated animate__fadeIn ${openTop.seguranca ? 'show' : ''}`}>

                      {/* Funcionalidade (submenu) */}
                      <li className="dropdown-submenu">
                        <button
                          className="dropdown-item dropdown-toggle d-flex align-items-center btn btn-link text-start"
                          onClick={(e) => { e.preventDefault(); toggleSeg('funcionalidade'); }}
                          aria-expanded={segOpen.funcionalidade}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSeg('funcionalidade'); } }}
                        >
                          <FaBuilding className="me-2 text-danger" /> Funcionalidade
                        </button>
                        <ul className={`dropdown-menu border-0 shadow-sm ${segOpen.funcionalidade ? 'show' : ''}`}>
                          <li><Link className="dropdown-item" to="/seguranca/funcionalidade/cadastrar" onClick={closeAll}>➕ Cadastrar</Link></li>
                          <li><Link className="dropdown-item" to="/seguranca/funcionalidade/listar" onClick={closeAll}>📋 Listar</Link></li>
                        </ul>
                      </li>

                      {/* Perfis (submenu) */}
                      <li className="dropdown-submenu">
                        <button
                          className="dropdown-item dropdown-toggle d-flex align-items-center btn btn-link text-start"
                          onClick={(e) => { e.preventDefault(); toggleSeg('perfis'); }}
                          aria-expanded={segOpen.perfis}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSeg('perfis'); } }}
                        >
                          <FaListAlt className="me-2 text-success" /> Perfis
                        </button>
                        <ul className={`dropdown-menu border-0 shadow-sm ${segOpen.perfis ? 'show' : ''}`}>
                          <li><Link className="dropdown-item" to="/seguranca/perfis/cadastrar" onClick={closeAll}>➕ Cadastrar</Link></li>
                          <li><Link className="dropdown-item" to="/seguranca/perfis/listar" onClick={closeAll}>📋 Listar</Link></li>
                          <li><Link className="dropdown-item" to="/seguranca/perfis/atribuir" onClick={closeAll}>⚙️ Atribuir Perfis</Link></li>
                        </ul>
                      </li>

                      {/* Contas (submenu) */}
                      <li className="dropdown-submenu">
                        <button
                          className="dropdown-item dropdown-toggle d-flex align-items-center btn btn-link text-start"
                          onClick={(e) => { e.preventDefault(); toggleSeg('contas'); }}
                          aria-expanded={segOpen.contas}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSeg('contas'); } }}
                        >
                          <FaUser className="me-2 text-info" /> Contas
                        </button>
                        <ul className={`dropdown-menu border-0 shadow-sm ${segOpen.contas ? 'show' : ''}`}>
                          <li><Link className="dropdown-item" to="/seguranca/contas/cadastrar" onClick={closeAll}>➕ Cadastrar</Link></li>
                          <li><Link className="dropdown-item" to="/seguranca/contas/listar" onClick={closeAll}>📋 Listar</Link></li>
                          <li><Link className="dropdown-item" to="/seguranca/contas/atribuir" onClick={closeAll}>⚙️ Atribuir Contas</Link></li>
                        </ul>
                      </li>

                    </ul>
                  </li>

                </ul>

                <div className="d-flex ms-3">
                  <Link
                    to="/login"
                    className="btn btn-primary d-flex align-items-center"
                    onClick={() => { setLoggedIn(false); closeAll(); }}
                  >
                    <FaSignOutAlt className="me-1" /> Logout
                  </Link>
                </div>
              </div>
            </div>
          </nav>
        )}

        {/* ROTAS (mantive as suas rotas) */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/agua/:tipo" element={loggedIn ? <Agua /> : <Navigate to="/login" />} />
          <Route path="/saude/:tipo" element={loggedIn ? <Saude /> : <Navigate to="/login" />} />
          <Route path="/educacao/:tipo" element={loggedIn ? <Educacao /> : <Navigate to="/login" />} />
          <Route path="/sobre" element={loggedIn ? <Sobre /> : <Navigate to="/login" />} />
          <Route path="/contacto" element={loggedIn ? <Contacto /> : <Navigate to="/login" />} />
          <Route path="/seguranca/*" element={loggedIn ? <Seguranca /> : <Navigate to="/login" />} />
          <Route path="/seguranca/funcionalidade/cadastrar" element={loggedIn ? <FuncionalidadeCadastrar /> : <Navigate to="/login" />} />
          <Route path="/seguranca/funcionalidade/listar" element={loggedIn ? <FuncionalidadeListar /> : <Navigate to="/login" />} />
          <Route path="/seguranca/perfis/cadastrar" element={loggedIn ? <PerfilCadastrar /> : <Navigate to="/login" />} />
          <Route path="/seguranca/perfis/listar" element={loggedIn ? <PerfilListar /> : <Navigate to="/login" />} />
          <Route path="/seguranca/contas/cadastrar" element={loggedIn ? <ContaCadastrar /> : <Navigate to="/login" />} />
          <Route path="/seguranca/contas/listar" element={loggedIn ? <ContaAtribuirContas /> : <Navigate to="/login" />} />
          
          
          <Route path="/login" element={<Login setLoggedIn={setLoggedIn} />} />
        </Routes>
      </main>

      {/* RODAPÉ */}
      {!isLoginPage && (
        <footer className="bg-white py-4 border-top mt-auto">
          <div className="container text-center">
            <div className="mb-2 small text-muted">&copy; 2025 Governo da República - Plataforma Nacional de Denúncias. Todos os direitos reservados.</div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;