import React, {useState, useEffect, useRef} from 'react';
import {Routes, Route, Navigate, Link, NavLink, useLocation} from 'react-router-dom';
import {
    FaClipboard, FaListAlt, FaHome, FaTint, FaGraduationCap, FaUserMd,
    FaSignOutAlt, FaHospital, FaBuilding, FaUser, FaBullhorn, FaTwitter, FaLinkedin, FaGithub
} from 'react-icons/fa';

{/*}
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Agua from './pages/Agua';
import Saude from './pages/Saude';
import Educacao from './pages/Educacao';
import Sobre from './pages/Sobre';
import Contacto from './pages/Contacto';
import Seguranca from './pages/Seguranca';
import FuncionalidadeCadastrar from './pages/Funcionalidade/FuncionalidadeCadastrar';
import FuncionalidadeListar from './pages/Funcionalidade/FuncionalidadeListar';

import TipoFuncionalidadeCadastrar from './pages/Funcionalidade/TipoFuncionalidadeCadastrar';
import TipoFuncionalidadeListar from './pages/Funcionalidade/TipoFuncionalidadeListar';

import FuncionalidadePerfilCadastrar from './pages/Funcionalidade/FuncionalidadePerfilCadastrar';
import FuncionalidadePerfilListar from './pages/Funcionalidade/FuncionalidadePerfilListar';
import PerfilCadastrar from './pages/Perfil/PerfilCadastrar';
import PerfilListar from './pages/Perfil/PerfilListar';
import ContaCadastrar from './pages/Conta/ContaCadastrar';
import ContaListar from './pages/Conta/ContaListar';
import ContaPerfilCadastrar from './pages/Conta/ContaPerfilCadastrar';
import ContaPerfilListar from './pages/Conta/ContaPerfilListar';
*/}
function App() {

   // const [loggedIn, setLoggedIn] = useState(true);
    const [navOpen, setNavOpen] = useState(false);
    const [loggedIn, setLoggedIn] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userString = sessionStorage.getItem('user');

        if (userString) {
            const parsedUser = JSON.parse(userString);
            setUser(parsedUser);
            setLoggedIn(parsedUser.isLoggedIn);
        }
    }, sessionStorage.getItem('user'));


    console.log(user)
    console.log("User: " + user?.perfil)
    console.log("User storage: " + sessionStorage.getItem('user'))

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
            const next = {agua: false, saude: false, educacao: false, seguranca: false};
            next[key] = !prev[key];
            return next;
        });
        if (key !== 'seguranca') {
            setSegOpen({funcionalidade: false, perfis: false, contas: false});
        }
    };

    const toggleSeg = (key) => {
        setSegOpen(prev => {
            const next = {funcionalidade: false, perfis: false, contas: false};
            next[key] = !prev[key];
            return next;
        });
    };

    const closeAll = () => {
        setNavOpen(false);
        setOpenTop({agua: false, saude: false, educacao: false, seguranca: false});
        setSegOpen({funcionalidade: false, perfis: false, contas: false});

    };

    useEffect(() => {
        closeAll();
    }, [location.pathname]);

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
                    <nav ref={navRef}
                         className="navbar navbar-expand-lg navbar-dark bg-black border-bottom py-3 shadow-sm">
                        <div className="container px-4">
                            <Link className="navbar-brand d-flex align-items-center me-auto" to="/">

                                <img src="/brasao-angola5.png" alt="República de Angola" width="200"
                                     style={{marginRight: -5}} onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}/>
                            </Link>
                            <button
                                className="navbar-toggler"
                                type="button"
                                aria-controls="navbarSupportedContent"
                                aria-expanded={navOpen}
                                aria-label="Alternar navegação"
                                onClick={() => setNavOpen(o => !o)}
                            >
                                <span className="navbar-toggler-icon"/>
                            </button>

                            <div id="navbarSupportedContent"
                                 className={`collapse navbar-collapse justify-content-end ${navOpen ? 'show' : ''}`}>
                                <ul className="navbar-nav d-flex flex-row flex-wrap align-items-center gap-3">

                                    {/* HOME */}
                                    <li className="nav-item">
                                        <NavLink
                                            to="/"
                                            className={({isActive}) =>
                                                `nav-link ${isActive ? 'fw-bold border-3' : 'text-light'}`
                                            }
                                            style={({isActive}) => ({
                                                color: isActive ? '#D4AF37' : '',
                                                borderColor: isActive ? '' : '',
                                            })}
                                            onClick={closeAll}
                                        >
                                            <FaHome className="me-1"/> Home
                                        </NavLink>
                                    </li>


                                    {/* ÁGUA */}
                                    <li className="nav-item dropdown">
                                        <button
                                            type="button"
                                            className={`nav-link btn btn-link dropdown-toggle text-start 
      ${startsWith('/agua') ? 'pnd-gold fw-bold pnd-gold-border border-3' : 'text-light'}`}
                                            aria-expanded={openTop.agua}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                toggleTop('agua');
                                            }}
                                        >
                                            <FaTint
                                                className={`me-1 ${startsWith('/agua') ? 'pnd-gold' : 'text-light'}`}/> Água
                                        </button>


                                        <ul className={`dropdown-menu shadow-sm border-0 ${openTop.agua ? 'show' : ''}`}>
                                            <li>
                                                <Link className="dropdown-item d-flex align-items-center"
                                                      to="/agua/registrar" onClick={closeAll}>
                                                    <FaClipboard className="me-2 text-primary"/> Registrar Denúncia
                                                </Link>
                                            </li>
                                            <li>
                                                <Link className="dropdown-item d-flex align-items-center"
                                                      to="/agua/minhas" onClick={closeAll}>
                                                    <FaListAlt className="me-2 text-success"/> Minhas Denúncias
                                                </Link>
                                            </li>
                                        </ul>
                                    </li>


                                    {/* SAÚDE */}
                                    <li className="nav-item dropdown">
                                        <button
                                            type="button"
                                            className={`nav-link btn btn-link dropdown-toggle text-start 
      ${startsWith('/saude') ? 'pnd-gold fw-bold pnd-gold-border border-3' : 'text-light'}`}
                                            aria-expanded={openTop.saude}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                toggleTop('saude');
                                            }}
                                        >
                                            <FaUserMd
                                                className={`me-1 ${startsWith('/saude') ? 'pnd-gold' : 'text-light'}`}/> Saúde
                                        </button>
                                        <ul className={`dropdown-menu shadow-sm border-0 ${openTop.saude ? 'show' : ''}`}>
                                            <li>
                                                <Link className="dropdown-item d-flex align-items-center"
                                                      to="/saude/registrar" onClick={closeAll}>
                                                    <FaHospital className="me-2 text-primary"/> Registrar Denúncia
                                                </Link>
                                            </li>
                                            <li>
                                                <Link className="dropdown-item d-flex align-items-center"
                                                      to="/saude/minhas" onClick={closeAll}>
                                                    <FaHospital className="me-2 text-success"/> Minhas Denúncias
                                                </Link>
                                            </li>
                                        </ul>
                                    </li>

                                    {/* EDUCAÇÃO */}
                                    <li className="nav-item dropdown">
                                        <button
                                            type="button"
                                            className={`nav-link btn btn-link dropdown-toggle text-start 
                                ${startsWith('/educacao') ? 'pnd-gold fw-bold pnd-gold-border border-3' : 'text-light'}`}
                                            aria-expanded={openTop.educacao}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                toggleTop('educacao');
                                            }}
                                        >
                                            <FaGraduationCap
                                                className={`me-1 ${startsWith('/educacao') ? 'pnd-gold' : 'text-light'}`}/> Educação
                                        </button>
                                        <ul className={`dropdown-menu shadow-sm border-0 ${openTop.educacao ? 'show' : ''}`}>
                                            <li>
                                                <Link className="dropdown-item d-flex align-items-center"
                                                      to="/educacao/registrar" onClick={closeAll}>
                                                    <FaBuilding className="me-2 text-danger"/> Registrar Denúncia
                                                </Link>
                                            </li>
                                            <li>
                                                <Link className="dropdown-item d-flex align-items-center"
                                                      to="/educacao/minhas" onClick={closeAll}>
                                                    <FaListAlt className="me-2 text-success"/> Minhas Denúncias
                                                </Link>
                                            </li>
                                        </ul>
                                    </li>

                                    {/* SEGURANÇA */}
                                    
                             
                                    {user?.perfil == "ADMIN" && (
                                        <li className="nav-item dropdown">
                                        <button
                                            type="button"
                                            className={`nav-link btn btn-link dropdown-toggle d-flex align-items-center gap-2 py-2 px-3 
                                    ${startsWith('/seguranca') ? 'pnd-gold fw-bold pnd-gold-border border-3' : 'text-light'}`}
                                            aria-expanded={openTop.seguranca}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                toggleTop('seguranca');
                                            }}
                                            aria-controls="seguranca-menu"
                                        >
                                            <FaBuilding
                                                className={`me-1 fs-5 ${startsWith('/seguranca') ? 'pnd-gold' : 'text-light'}`}/>
                                            <span className="me-auto">Segurança</span>
                                            <span
                                                className={`menu-arrow ${startsWith('/seguranca') ? 'pnd-gold' : 'text-light'}`}
                                                aria-hidden>▸</span>
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
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        toggleSeg('funcionalidade');
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' || e.key === ' ') {
                                                            e.preventDefault();
                                                            toggleSeg('funcionalidade');
                                                        }
                                                    }}
                                                >
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span className="icon-circle bg-danger"><FaBuilding/></span>
                                                        <span className="submenu-title">Funcionalidade</span>
                                                    </div>
                                                    <span
                                                        className={`menu-arrow small ${segOpen.funcionalidade ? 'open' : ''}`}
                                                        aria-hidden>▸</span>
                                                </button>

                                                <ul
                                                    id="submenu-funcionalidade"
                                                    role="menu"
                                                    className={`dropdown-menu border-0 shadow-sm submenu-list ${segOpen.funcionalidade ? 'show' : ''}`}
                                                >
                                                    <li role="none"><Link role="menuitem" className="dropdown-item"
                                                                          to="/seguranca/funcionalidade/cadastrar"
                                                                          onClick={closeAll}>➕ Cadastrar
                                                        funcionalidade</Link></li>
                                                    <li role="none"><Link role="menuitem" className="dropdown-item"
                                                                          to="/seguranca/funcionalidade/listar"
                                                                          onClick={closeAll}>📋 Listar
                                                        funcionalidade</Link></li>
                                                    <li role="none"><Link role="menuitem" className="dropdown-item"
                                                                          to="/seguranca/funcionalidade/tipo_cadastrar"
                                                                          onClick={closeAll}>➕ Cadastrar tipo
                                                        funcionalidade</Link></li>
                                                    <li role="none"><Link role="menuitem" className="dropdown-item"
                                                                          to="/seguranca/funcionalidade/tipo_listar"
                                                                          onClick={closeAll}>📋 Listar tipo
                                                        funcionalidade</Link></li>


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
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        toggleSeg('perfis');
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' || e.key === ' ') {
                                                            e.preventDefault();
                                                            toggleSeg('perfis');
                                                        }
                                                    }}
                                                >
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span className="icon-circle bg-success"><FaListAlt/></span>
                                                        <span className="submenu-title">Perfis</span>
                                                    </div>
                                                    <span className={`menu-arrow small ${segOpen.perfis ? 'open' : ''}`}
                                                          aria-hidden>▸</span>
                                                </button>

                                                <ul
                                                    id="submenu-perfis"
                                                    role="menu"
                                                    className={`dropdown-menu border-0 shadow-sm submenu-list ${segOpen.perfis ? 'show' : ''}`}
                                                >
                                                    <li role="none"><Link role="menuitem" className="dropdown-item"
                                                                          to="/seguranca/perfis/cadastrar"
                                                                          onClick={closeAll}>➕ Cadastrar</Link></li>
                                                    <li role="none"><Link role="menuitem" className="dropdown-item"
                                                                          to="/seguranca/perfis/listar"
                                                                          onClick={closeAll}>📋 Listar</Link></li>
                                                    <li role="none"><Link role="menuitem" className="dropdown-item"
                                                                          to="/seguranca/perfis/atribuir"
                                                                          onClick={closeAll}>⚙️ Atribuir Perfis</Link>
                                                    </li>
                                                    <li role="none"><Link role="menuitem" className="dropdown-item"
                                                                          to="/seguranca/perfis/atribuir_listar"
                                                                          onClick={closeAll}>📋 Listar Funcionalidades
                                                        Atribuidas</Link></li>
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
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        toggleSeg('contas');
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' || e.key === ' ') {
                                                            e.preventDefault();
                                                            toggleSeg('contas');
                                                        }
                                                    }}
                                                >
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span className="icon-circle bg-info"><FaUser/></span>
                                                        <span className="submenu-title">Contas</span>
                                                    </div>
                                                    <span className={`menu-arrow small ${segOpen.contas ? 'open' : ''}`}
                                                          aria-hidden>▸</span>
                                                </button>

                                                <ul
                                                    id="submenu-contas"
                                                    role="menu"
                                                    className={`dropdown-menu border-0 shadow-sm submenu-list ${segOpen.contas ? 'show' : ''}`}
                                                >
                                                    <li role="none"><Link role="menuitem" className="dropdown-item"
                                                                          to="/seguranca/contas/cadastrar"
                                                                          onClick={closeAll}>➕ Cadastrar</Link></li>
                                                    <li role="none"><Link role="menuitem" className="dropdown-item"
                                                                          to="/seguranca/contas/listar"
                                                                          onClick={closeAll}>📋 Listar</Link></li>

                                                </ul>
                                            </li>

                                        </ul>
                                    </li>
                                    )}
                                </ul>

                                <div className="d-flex ms-3">
                                    <Link
                                        to="/login"
                                        className="btn pnd-gold-btn d-flex align-items-center fw-semibold"
                                        onClick={() => {
                                            sessionStorage.removeItem('user');
                                            setLoggedIn(false);
                                            closeAll();
                                        }}
                                    >
                                        <FaSignOutAlt className="me-1 pnd-gold"/> Logout
                                    </Link>
                                </div>

                                <div className="d-flex ms-3">

                                </div>

                            </div>
                        </div>
                    </nav>
                )}

               
            </main>

            
        </div>
    );
}

export default App;