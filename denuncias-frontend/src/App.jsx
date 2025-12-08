// src/App.js
import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, Link, NavLink, useLocation } from 'react-router-dom';
import {
  FaClipboard, FaListAlt, FaHome, FaTint, FaGraduationCap, FaUserMd,
  FaSignOutAlt, FaHospital, FaBuilding, FaUser, FaBullhorn, FaTwitter, FaLinkedin, FaGithub
} from 'react-icons/fa';

import './App.css';
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
import FuncionalidadePerfilCadastrar from './pages/Funcionalidade/FuncionalidadePerfilCadastrar';
import FuncionalidadePerfilListar from './pages/Funcionalidade/FuncionalidadePerfilListar';
import PerfilCadastrar from './pages/Perfil/PerfilCadastrar';
import PerfilListar from './pages/Perfil/PerfilListar';
import ContaCadastrar from './pages/Conta/ContaCadastrar';
import ContaListar from './pages/Conta/ContaListar';
import ContaPerfilCadastrar from './pages/Conta/ContaPerfilCadastrar';
import ContaPerfilListar from './pages/Conta/ContaPerfilListar';

function App() {
  const [loggedIn, setLoggedIn] = useState(true);
  const [navOpen, setNavOpen] = useState(false);

  const [openTop, setOpenTop] = useState({
    agua: false,
    saude: false,
    educacao: false,
    seguranca: false,
  });

  const [segOpen, setSegOpen] = useState({
    funcionalidade: false,
    perfis: false,
    contas: false,
  });

  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const navRef = useRef(null);

  const toggleTop = (key) => {
    setOpenTop(prev => {
      const next = { agua: false, saude: false, educacao: false, seguranca: false };
      next[key] = !prev[key];
      return next;
    });
    if (key !== 'seguranca') {
      setSegOpen({ funcionalidade: false, perfis: false, contas: false });
    }
  };

  const toggleSeg = (key) => {
    setSegOpen(prev => {
      const next = { funcionalidade: false, perfis: false, contas: false };
      next[key] = !prev[key];
      return next;
    });
  };

  const closeAll = () => {
    setNavOpen(false);
    setOpenTop({ agua: false, saude: false, educacao: false, seguranca: false });
    setSegOpen({ funcionalidade: false, perfis: false, contas: false });
  };

  useEffect(() => { closeAll(); }, [location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) closeAll();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const startsWith = (p) => location.pathname.startsWith(p);

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* TOP INSTITUTIONAL BANNER */}
      {!isLoginPage && (
        <div className="bg-black  text-light text-center py-1 small fw-semibold">
        </div>

      )}

      <main className="flex-shrink-0">
        {/* NAVBAR */}
        {!isLoginPage && (
          <nav ref={navRef} className="navbar navbar-expand-lg navbar-dark bg-black border-bottom py-3 shadow-sm">
            <div className="container px-4">
              <Link className="navbar-brand d-flex align-items-center me-auto" to="/">
                {/* Coloca a imagem brasao-angola.png em public/brasao-angola.png,  
                <img src="/brasao-angola2.png" alt="República de Angola" width="270" style={{ marginRight: 10 }} onError={(e)=>{ e.currentTarget.style.display='none'; }} />
        <span className="fw-bold fs-5 text-warning">Plataforma Nacional de Denúncias</span>bg-black ou dark
        Governo da República de Angola — Ministério da Administração do Território e Reforma do Estado.
        */}
                <img src="/brasao-angola5.png" alt="República de Angola" width="200" style={{ marginRight: -5 }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              </Link>
              <button
                className="navbar-toggler"
                type="button"
                aria-controls="navbarSupportedContent"
                aria-expanded={navOpen}
                aria-label="Alternar navegação"
                onClick={() => setNavOpen(o => !o)}
              >
                <span className="navbar-toggler-icon" />
              </button>

              <div id="navbarSupportedContent" className={`collapse navbar-collapse justify-content-end ${navOpen ? 'show' : ''}`}>
                <ul className="navbar-nav d-flex flex-row flex-wrap align-items-center gap-3">

                  {/* HOME */}
                  <li className="nav-item">
                    <NavLink
                      to="/"
                      className={({ isActive }) => `nav-link ${isActive ? 'text-warning fw-bold border-bottom border-3 border-warning' : 'text-light'}`}
                      onClick={closeAll}
                    >
                      <FaHome className="me-1" /> Home
                    </NavLink>
                  </li>

                  {/* ÁGUA */}
                  <li className="nav-item dropdown">
                    <button
                      type="button"
                      className={`nav-link btn btn-link dropdown-toggle text-start ${startsWith('/agua') ? 'fw-bold text-warning' : 'text-light'}`}
                      aria-expanded={openTop.agua}
                      onClick={(e) => { e.preventDefault(); toggleTop('agua'); }}
                    >
                      <FaTint className="me-1" /> Água
                    </button>
                    <ul className={`dropdown-menu shadow-sm border-0 ${openTop.agua ? 'show' : ''}`}>
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
                      type="button"
                      className={`nav-link btn btn-link dropdown-toggle text-start ${startsWith('/saude') ? 'fw-bold text-warning' : 'text-light'}`}
                      aria-expanded={openTop.saude}
                      onClick={(e) => { e.preventDefault(); toggleTop('saude'); }}
                    >
                      <FaUserMd className="me-1" /> Saúde
                    </button>
                    <ul className={`dropdown-menu shadow-sm border-0 ${openTop.saude ? 'show' : ''}`}>
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
                      type="button"
                      className={`nav-link btn btn-link dropdown-toggle text-start ${startsWith('/educacao') ? 'fw-bold text-warning' : 'text-light'}`}
                      aria-expanded={openTop.educacao}
                      onClick={(e) => { e.preventDefault(); toggleTop('educacao'); }}
                    >
                      <FaGraduationCap className="me-1" /> Educação
                    </button>
                    <ul className={`dropdown-menu shadow-sm border-0 ${openTop.educacao ? 'show' : ''}`}>
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
                  {/* SEGURANÇA (estilizado) */}
                  <li className="nav-item dropdown">
                    <button
                      type="button"
                      className={`nav-link btn btn-link dropdown-toggle text-start d-flex align-items-center gap-2 py-2 px-3
      ${startsWith('/seguranca') ? 'fw-bold text-warning' : 'text-light'}`}
                      aria-expanded={openTop.seguranca}
                      aria-controls="seguranca-menu"
                      onClick={(e) => { e.preventDefault(); toggleTop('seguranca'); }}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleTop('seguranca'); } }}
                    >
                      <FaBuilding className="me-1 fs-5" /> <span className="me-auto">Segurança</span>
                      <span className={`menu-arrow ${openTop.seguranca ? 'open' : ''}`} aria-hidden>▸</span>
                    </button>

                    <ul
                      id="seguranca-menu"
                      role="menu"
                      className={`dropdown-menu shadow-lg border-0 seguranca-menu ${openTop.seguranca ? 'show' : ''}`}
                    >
                      {/* FUNCIONALIDADE */}
                      <li className="dropdown-submenu" role="none">
                        <button
                          type="button"
                          role="menuitem"
                          className="dropdown-item submenu-btn d-flex align-items-center justify-content-between"
                          aria-expanded={segOpen.funcionalidade}
                          aria-controls="submenu-funcionalidade"
                          onClick={(e) => { e.preventDefault(); toggleSeg('funcionalidade'); }}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSeg('funcionalidade'); } }}
                        >
                          <div className="d-flex align-items-center gap-2">
                            <span className="icon-circle bg-danger"><FaBuilding /></span>
                            <span className="submenu-title">Funcionalidade</span>
                          </div>
                          <span className={`menu-arrow small ${segOpen.funcionalidade ? 'open' : ''}`} aria-hidden>▸</span>
                        </button>

                        <ul
                          id="submenu-funcionalidade"
                          role="menu"
                          className={`dropdown-menu border-0 shadow-sm submenu-list ${segOpen.funcionalidade ? 'show' : ''}`}
                        >
                          <li role="none"><Link role="menuitem" className="dropdown-item" to="/seguranca/funcionalidade/cadastrar" onClick={closeAll}>➕ Cadastrar</Link></li>
                          <li role="none"><Link role="menuitem" className="dropdown-item" to="/seguranca/funcionalidade/listar" onClick={closeAll}>📋 Listar</Link></li>
                        </ul>
                      </li>

                      {/* PERFIS */}
                      <li className="dropdown-submenu" role="none">
                        <button
                          type="button"
                          role="menuitem"
                          className="dropdown-item submenu-btn d-flex align-items-center justify-content-between"
                          aria-expanded={segOpen.perfis}
                          aria-controls="submenu-perfis"
                          onClick={(e) => { e.preventDefault(); toggleSeg('perfis'); }}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSeg('perfis'); } }}
                        >
                          <div className="d-flex align-items-center gap-2">
                            <span className="icon-circle bg-success"><FaListAlt /></span>
                            <span className="submenu-title">Perfis</span>
                          </div>
                          <span className={`menu-arrow small ${segOpen.perfis ? 'open' : ''}`} aria-hidden>▸</span>
                        </button>

                        <ul
                          id="submenu-perfis"
                          role="menu"
                          className={`dropdown-menu border-0 shadow-sm submenu-list ${segOpen.perfis ? 'show' : ''}`}
                        >
                          <li role="none"><Link role="menuitem" className="dropdown-item" to="/seguranca/perfis/cadastrar" onClick={closeAll}>➕ Cadastrar</Link></li>
                          <li role="none"><Link role="menuitem" className="dropdown-item" to="/seguranca/perfis/listar" onClick={closeAll}>📋 Listar</Link></li>
                          <li role="none"><Link role="menuitem" className="dropdown-item" to="/seguranca/perfis/atribuir" onClick={closeAll}>⚙️ Atribuir Perfis</Link></li>
                          <li role="none"><Link role="menuitem" className="dropdown-item" to="/seguranca/perfis/atribuir_listar" onClick={closeAll}>📋 Listar Funcionalidades Atribuidas</Link></li>
                        </ul>
                      </li>

                      {/* CONTAS */}
                      <li className="dropdown-submenu" role="none">
                        <button
                          type="button"
                          role="menuitem"
                          className="dropdown-item submenu-btn d-flex align-items-center justify-content-between"
                          aria-expanded={segOpen.contas}
                          aria-controls="submenu-contas"
                          onClick={(e) => { e.preventDefault(); toggleSeg('contas'); }}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSeg('contas'); } }}
                        >
                          <div className="d-flex align-items-center gap-2">
                            <span className="icon-circle bg-info"><FaUser /></span>
                            <span className="submenu-title">Contas</span>
                          </div>
                          <span className={`menu-arrow small ${segOpen.contas ? 'open' : ''}`} aria-hidden>▸</span>
                        </button>

                        <ul
                          id="submenu-contas"
                          role="menu"
                          className={`dropdown-menu border-0 shadow-sm submenu-list ${segOpen.contas ? 'show' : ''}`}
                        >
                          <li role="none"><Link role="menuitem" className="dropdown-item" to="/seguranca/contas/cadastrar" onClick={closeAll}>➕ Cadastrar</Link></li>
                          <li role="none"><Link role="menuitem" className="dropdown-item" to="/seguranca/contas/listar" onClick={closeAll}>📋 Listar</Link></li> 
                          <li role="none"><Link role="menuitem" className="dropdown-item" to="/seguranca/contas/atribuir" onClick={closeAll}>⚙️ Atribuir Perfil as Contas</Link></li>
                           <li role="none"><Link role="menuitem" className="dropdown-item" to="/seguranca/contas/atribuir_listar" onClick={closeAll}>📋 Listar Perfil atribuidas as Contas</Link></li>
                        </ul>
                      </li>

                    </ul>
                  </li>

                </ul>

                <div className="d-flex ms-3">
                  <Link
                    to="/login"
                    className="btn btn-warning d-flex align-items-center fw-semibold"
                    onClick={() => { setLoggedIn(false); closeAll(); }}
                  >
                    <FaSignOutAlt className="me-1" /> Logout
                  </Link>
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
          <Route path="/seguranca/*" element={loggedIn ? <Seguranca /> : <Navigate to="/login" />} />

          <Route path="/seguranca/funcionalidade/cadastrar" element={loggedIn ? <FuncionalidadeCadastrar /> : <Navigate to="/login" />} />
          <Route path="/seguranca/funcionalidade/listar" element={loggedIn ? <FuncionalidadeListar /> : <Navigate to="/login" />} />
          <Route path="/seguranca/perfis/cadastrar" element={loggedIn ? <PerfilCadastrar /> : <Navigate to="/login" />} />
          <Route path="/seguranca/perfis/listar" element={loggedIn ? <PerfilListar /> : <Navigate to="/login" />} />
          <Route path="/seguranca/perfis/atribuir" element={loggedIn ? <FuncionalidadePerfilCadastrar /> : <Navigate to="/login" />} />
          <Route path="/seguranca/perfis/atribuir_listar" element={loggedIn ? <FuncionalidadePerfilListar /> : <Navigate to="/login" />} />
          <Route path="/seguranca/contas/cadastrar" element={loggedIn ? <ContaCadastrar /> : <Navigate to="/login" />} />
          <Route path="/seguranca/contas/listar" element={loggedIn ? <ContaListar /> : <Navigate to="/login" />} />
          <Route path="/seguranca/contas/atribuir" element={loggedIn ? <ContaPerfilCadastrar /> : <Navigate to="/login" />} />
          <Route path="/seguranca/contas/atribuir_listar" element={loggedIn ? <ContaPerfilListar /> : <Navigate to="/login" />} />

          <Route path="/login" element={<Login setLoggedIn={setLoggedIn} />} />
        </Routes>
      </main>

      {/* RODAPÉ */}
      {!isLoginPage && (
        <footer className="bg-black text-light mt-auto pt-5 pb-3 border-top shadow-sm">
          <div className="container px-4">
            <div className="row gy-4">
              <div className="col-md-3 text-center text-md-start">
                <div className="d-flex align-items-center justify-content-center justify-content-md-start mb-2">
                  <img src="/brasao-angola.png" alt="Governo de Angola" width="40" style={{ marginRight: 10 }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  <h5 className="fw-bold mb-0 text-uppercase">Plataforma Nacional de Denúncias</h5>
                </div>
                <p className="small text-muted mb-0">
                  Sistema oficial do Governo da República de Angola para monitorar e responder às denúncias
                  dos cidadãos sobre serviços públicos de <strong>Água</strong>, <strong>Saúde</strong> e <strong>Educação</strong>.
                </p>
              </div>

              <div className="col-md-3 text-center text-md-start">
                <h6 className="fw-bold text-uppercase mb-3">Institucional</h6>
                <ul className="list-unstyled small">
                  <li><Link className="text-light text-decoration-none" to="/sobre">Sobre a Plataforma</Link></li>
                  <li><a href="#" className="text-light text-decoration-none">Política de Privacidade</a></li>
                  <li><a href="#" className="text-light text-decoration-none">Termos de Uso</a></li>
                </ul>
              </div>

              <div className="col-md-3 mb-3 text-center text-md-start">
                <h6 className="fw-bold text-uppercase mb-3">Contacto</h6>
                <p className="small mb-1"><strong>Linha Verde:</strong> 111</p>
                <p className="small mb-1"><strong>Email:</strong> denuncias@gov.ao</p>
                <p className="small mb-0"><strong>Endereço:</strong> Largo da Independência, Luanda - Angola</p>
              </div>

              <div className="col-md-3 text-center text-md-end">
                <h6 className="fw-bold text-uppercase mb-3">Siga-nos</h6>
                <div className="d-flex justify-content-center justify-content-md-end gap-3 fs-4">
                  <a className="text-light" href="#" aria-label="Twitter"><FaTwitter /></a>
                  <a className="text-light" href="#" aria-label="LinkedIn"><FaLinkedin /></a>
                  <a className="text-light" href="#" aria-label="GitHub"><FaGithub /></a>
                </div>
              </div>
            </div>

            <hr className="border-secondary my-4" />
            <div className="text-center small text-muted">
              &copy; 2025 — República de Angola. Todos os direitos reservados. <br />

            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
