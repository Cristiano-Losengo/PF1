import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
    FaClipboard, FaListAlt, FaHome, FaTint, FaGraduationCap, FaUserMd,
    FaSignOutAlt, FaHospital, FaBuilding, FaUser, FaUserCircle,
    FaCogs, FaUsers, FaUserLock, FaChartBar, FaFileAlt
} from 'react-icons/fa';

function Header() {
    const [navOpen, setNavOpen] = useState(false);
    const [loggedIn, setLoggedIn] = useState(true);
    const [user, setUser] = useState(null);
    const [menus, setMenus] = useState([]);
    const [acessoTotal, setAcessoTotal] = useState(false);
    const [isRoot, setIsRoot] = useState(false);

    const location = useLocation();
    const isLoginPage = location.pathname === '/login';
    const navRef = useRef(null);

    const [openTop, setOpenTop] = useState({
        agua: false,
        saude: false,
        educacao: false,
        seguranca: false,
        servicos: false,
        administracao: false,
        relatorios: false
    });

    const [segOpen, setSegOpen] = useState({
        funcionalidade: false,
        perfis: false,
        contas: false,
    });

    useEffect(() => {
        const userString = sessionStorage.getItem('user');
        if (userString) {
            const parsedUser = JSON.parse(userString);
            setUser(parsedUser);
            setMenus(parsedUser.menus || []);
            setAcessoTotal(parsedUser.acessoTotal || false);
            setIsRoot(parsedUser.isRoot || false);
            
            console.log(' Header carregado!');
            console.log('É ROOT?', parsedUser.isRoot);
            console.log('Acesso Total:', parsedUser.acessoTotal);
            console.log('Menus:', parsedUser.menus?.length || 0);
        }
    }, []);

    // Função para verificar se tem acesso a uma funcionalidade
    const temAcesso = (path) => {
        if (acessoTotal || isRoot) return true;
        return menus.some(menu => menu.path === path);
    };

    const toggleTop = (key) => {
        setOpenTop(prev => {
            const next = { 
                agua: false, saude: false, educacao: false, 
                seguranca: false, servicos: false, administracao: false,
                relatorios: false 
            };
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
        setOpenTop({ 
            agua: false, saude: false, educacao: false, 
            seguranca: false, servicos: false, administracao: false,
            relatorios: false 
        });
        setSegOpen({ funcionalidade: false, perfis: false, contas: false });
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

    const handleLogout = () => {
        sessionStorage.removeItem('user');
        localStorage.removeItem('menu');
        setLoggedIn(false);
        setUser(null);
        closeAll();
        window.location.href = '/login';
    };

    // Se for ROOT ou tiver acesso total.
    const mostrarMenuCompleto = acessoTotal || isRoot;

    return (
        <>
            {!isLoginPage && (
                <div className="bg-black text-light text-center py-1 small fw-semibold"></div>
            )}

            <main className="flex-shrink-0">
                {!isLoginPage && (
                    <nav ref={navRef}
                        className="navbar navbar-expand-lg navbar-dark bg-black border-bottom py-3 shadow-sm">
                        <div className="container px-4">
                            <Link className="navbar-brand d-flex align-items-center me-auto" to={user ? '/home' : '/'}>
                                <img src="/brasao-angola5.png" alt="República de Angola" width="200"
                                    style={{ marginRight: -5 }} onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }} />
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

                            <div id="navbarSupportedContent"
                                className={`collapse navbar-collapse justify-content-end ${navOpen ? 'show' : ''}`}>
                                <ul className="navbar-nav d-flex flex-row flex-wrap align-items-center gap-3">

                                    {/* HOME */}
                                    {user != null && (
                                        <li className="nav-item">
                                            <NavLink
                                                to='/home'
                                                className={({ isActive }) =>
                                                    `nav-link ${isActive ? 'fw-bold border-3' : 'text-light'}`
                                                }
                                                style={({ isActive }) => ({
                                                    color: isActive ? '#D4AF37' : '',
                                                })}
                                                onClick={closeAll}
                                            >
                                                <FaHome className="me-1" /> Home
                                            </NavLink>
                                        </li>
                                    )}

                                    {/* ========== SERVIÇOS PÚBLICOS ========== */}
                                    {(mostrarMenuCompleto || temAcesso('/servicos')) && (
                                        <li className="nav-item dropdown">
                                            <button
                                                type="button"
                                                className={`nav-link btn btn-link dropdown-toggle text-start text-light`}
                                                aria-expanded={openTop.servicos}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    toggleTop('servicos');
                                                }}
                                            >
                                                <FaCogs className="me-1" /> Serviços Públicos
                                            </button>
                                            <ul className={`dropdown-menu shadow-sm border-0 ${openTop.servicos ? 'show' : ''}`}>
                                                
                                                {/* ÁGUA */}
                                                <li className="dropdown-submenu">
                                                    <button type="button"
                                                        className="dropdown-item submenu-btn d-flex align-items-center justify-content-between"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            toggleTop('agua');
                                                        }}
                                                    >
                                                        <div className="d-flex align-items-center gap-2">
                                                            <FaTint className="text-info" />
                                                            <span>Água</span>
                                                        </div>
                                                        <span className="menu-arrow small">▸</span>
                                                    </button>
                                                    <ul className={`dropdown-menu border-0 shadow-sm submenu-list ${openTop.agua ? 'show' : ''}`}>
                                                        <li><Link className="dropdown-item" to="/servicos/agua/registrar" onClick={closeAll}>📝 Registrar Denúncia</Link></li>
                                                        <li><Link className="dropdown-item" to="/servicos/agua/listar" onClick={closeAll}>📋 Listar Denúncias</Link></li>
                                                    </ul>
                                                </li>

                                                {/* SAÚDE */}
                                                <li className="dropdown-submenu">
                                                    <button type="button"
                                                        className="dropdown-item submenu-btn d-flex align-items-center justify-content-between"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            toggleTop('saude');
                                                        }}
                                                    >
                                                        <div className="d-flex align-items-center gap-2">
                                                            <FaUserMd className="text-danger" />
                                                            <span>Saúde</span>
                                                        </div>
                                                        <span className="menu-arrow small">▸</span>
                                                    </button>
                                                    <ul className={`dropdown-menu border-0 shadow-sm submenu-list ${openTop.saude ? 'show' : ''}`}>
                                                        <li><Link className="dropdown-item" to="/servicos/saude/registrar" onClick={closeAll}>📝 Registrar Denúncia</Link></li>
                                                        <li><Link className="dropdown-item" to="/servicos/saude/listar" onClick={closeAll}>📋 Listar Denúncias</Link></li>
                                                    </ul>
                                                </li>

                                                {/* EDUCAÇÃO */}
                                                <li className="dropdown-submenu">
                                                    <button type="button"
                                                        className="dropdown-item submenu-btn d-flex align-items-center justify-content-between"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            toggleTop('educacao');
                                                        }}
                                                    >
                                                        <div className="d-flex align-items-center gap-2">
                                                            <FaGraduationCap className="text-primary" />
                                                            <span>Educação</span>
                                                        </div>
                                                        <span className="menu-arrow small">▸</span>
                                                    </button>
                                                    <ul className={`dropdown-menu border-0 shadow-sm submenu-list ${openTop.educacao ? 'show' : ''}`}>
                                                        <li><Link className="dropdown-item" to="/servicos/educacao/registrar" onClick={closeAll}>📝 Registrar Denúncia</Link></li>
                                                        <li><Link className="dropdown-item" to="/servicos/educacao/listar" onClick={closeAll}>📋 Listar Denúncias</Link></li>
                                                    </ul>
                                                </li>
                                            </ul>
                                        </li>
                                    )}

                                    {/* ========== SEGURANÇA ========== */}
                                    {(mostrarMenuCompleto || temAcesso('/seguranca')) && (
                                        <li className="nav-item dropdown">
                                            <button
                                                type="button"
                                                className={`nav-link btn btn-link dropdown-toggle d-flex align-items-center gap-2 py-2 px-3 text-light`}
                                                aria-expanded={openTop.seguranca}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    toggleTop('seguranca');
                                                }}
                                            >
                                                <FaUserLock className="me-1 fs-5" />
                                                <span className="me-auto">Segurança</span>
                                                <span className="menu-arrow" aria-hidden>▸</span>
                                            </button>
                                            <ul id="seguranca-menu" role="menu" className={`dropdown-menu shadow-lg border-0 seguranca-menu ${openTop.seguranca ? 'show' : ''}`}>
                                                
                                                {/* FUNCIONALIDADES */}
                                                <li className="dropdown-submenu" role="none">
                                                    <button type="button" role="menuitem"
                                                        className="dropdown-item submenu-btn d-flex align-items-center justify-content-between"
                                                        aria-expanded={segOpen.funcionalidade}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            toggleSeg('funcionalidade');
                                                        }}
                                                    >
                                                        <div className="d-flex align-items-center gap-2">
                                                            <span className="icon-circle bg-danger"><FaCogs /></span>
                                                            <span className="submenu-title">Funcionalidades</span>
                                                        </div>
                                                        <span className={`menu-arrow small ${segOpen.funcionalidade ? 'open' : ''}`} aria-hidden>▸</span>
                                                    </button>
                                                    <ul className={`dropdown-menu border-0 shadow-sm submenu-list ${segOpen.funcionalidade ? 'show' : ''}`}>
                                                        <li><Link className="dropdown-item" to="/seguranca/funcionalidade/cadastrar" onClick={closeAll}>➕ Cadastrar</Link></li>
                                                        <li><Link className="dropdown-item" to="/seguranca/funcionalidade/listar" onClick={closeAll}>📋 Listar</Link></li>
                                                        <li><Link className="dropdown-item" to="/seguranca/funcionalidade/tipo_cadastrar" onClick={closeAll}>➕ Cadastrar Tipo</Link></li>
                                                        <li><Link className="dropdown-item" to="/seguranca/funcionalidade/tipo_listar" onClick={closeAll}>📋 Listar Tipos</Link></li>
                                                    </ul>
                                                </li>

                                                {/* PERFIS */}
                                                <li className="dropdown-submenu" role="none">
                                                    <button type="button" role="menuitem"
                                                        className="dropdown-item submenu-btn d-flex align-items-center justify-content-between"
                                                        aria-expanded={segOpen.perfis}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            toggleSeg('perfis');
                                                        }}
                                                    >
                                                        <div className="d-flex align-items-center gap-2">
                                                            <span className="icon-circle bg-success"><FaUsers /></span>
                                                            <span className="submenu-title">Perfis</span>
                                                        </div>
                                                        <span className={`menu-arrow small ${segOpen.perfis ? 'open' : ''}`} aria-hidden>▸</span>
                                                    </button>
                                                    <ul className={`dropdown-menu border-0 shadow-sm submenu-list ${segOpen.perfis ? 'show' : ''}`}>
                                                        <li><Link className="dropdown-item" to="/seguranca/perfis/cadastrar" onClick={closeAll}>➕ Cadastrar</Link></li>
                                                        <li><Link className="dropdown-item" to="/seguranca/perfis/listar" onClick={closeAll}>📋 Listar</Link></li>
                                                        <li><Link className="dropdown-item" to="/seguranca/perfis/atribuir" onClick={closeAll}>⚙️ Atribuir Funcionalidades</Link></li>
                                                        <li><Link className="dropdown-item" to="/seguranca/perfis/atribuir_listar" onClick={closeAll}>📋 Listar Atribuições</Link></li>
                                                    </ul>
                                                </li>

                                                {/* CONTAS */}
                                                <li className="dropdown-submenu" role="none">
                                                    <button type="button" role="menuitem"
                                                        className="dropdown-item submenu-btn d-flex align-items-center justify-content-between"
                                                        aria-expanded={segOpen.contas}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            toggleSeg('contas');
                                                        }}
                                                    >
                                                        <div className="d-flex align-items-center gap-2">
                                                            <span className="icon-circle bg-info"><FaUser /></span>
                                                            <span className="submenu-title">Contas</span>
                                                        </div>
                                                        <span className={`menu-arrow small ${segOpen.contas ? 'open' : ''}`} aria-hidden>▸</span>
                                                    </button>
                                                    <ul className={`dropdown-menu border-0 shadow-sm submenu-list ${segOpen.contas ? 'show' : ''}`}>
                                                        <li><Link className="dropdown-item" to="/seguranca/contas/cadastrar" onClick={closeAll}>➕ Cadastrar</Link></li>
                                                        <li><Link className="dropdown-item" to="/seguranca/contas/listar" onClick={closeAll}>📋 Listar</Link></li>
                                                    </ul>
                                                </li>
                                            </ul>
                                        </li>
                                    )}

                                    {/* ========== RELATÓRIOS ========== */}
                                    {(mostrarMenuCompleto || temAcesso('/relatorios')) && (
                                        <li className="nav-item">
                                            <NavLink
                                                to="/relatorios"
                                                className={({ isActive }) =>
                                                    `nav-link ${isActive ? 'fw-bold' : 'text-light'}`
                                                }
                                                onClick={closeAll}
                                            >
                                                <FaChartBar className="me-1" /> Relatórios
                                            </NavLink>
                                        </li>
                                    )}

                                </ul>

                                {/* Área do Usuário e Logout */}
                                <div className="d-flex align-items-center gap-3 ms-3">
                                    {user && (
                                        <div className="d-flex align-items-center border-start ps-3" style={{ borderColor: '#D4AF37' }}>
                                            <FaUserCircle className="me-2" size={24} style={{ color: '#D4AF37' }} />
                                            <div className="text-start">
                                                <small className="d-block" style={{ color: '#D4AF37', fontSize: '0.7rem' }}>
                                                    {isRoot ? '🔴 ADMINISTRADOR ROOT' : (acessoTotal ? 'Administrador' : 'Administrador')}
                                                </small>
                                                <span className="fw-semibold" style={{ color: '#D4AF37' }}>
                                                    {user?.nome || user?.username || 'Admin'}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Logout */}
                                    {user ? (
                                        <button
                                            onClick={handleLogout}
                                            className="btn pnd-gold-btn d-flex align-items-center fw-semibold"
                                            style={{
                                                backgroundColor: 'transparent',
                                                border: '1px solid #D4AF37',
                                                color: '#D4AF37',
                                                borderRadius: '8px',
                                                padding: '8px 16px'
                                            }}
                                        >
                                            <FaSignOutAlt className="me-1" style={{ color: '#D4AF37' }} /> Logout
                                        </button>
                                    ) : (
                                        <Link
                                            to="/login"
                                            className="btn pnd-gold-btn d-flex align-items-center fw-semibold"
                                            style={{
                                                backgroundColor: 'transparent',
                                                border: '1px solid #D4AF37',
                                                color: '#D4AF37',
                                                borderRadius: '8px',
                                                padding: '8px 16px'
                                            }}
                                        >
                                            <FaSignOutAlt className="me-1" style={{ color: '#D4AF37' }} /> Login
                                        </Link>
                                    )}
                                </div>

                            </div>
                        </div>
                    </nav>
                )}
            </main>

            <style>{`
                .dropdown-submenu {
                    position: relative;
                }
                .dropdown-submenu .dropdown-menu {
                    top: 0;
                    left: 100%;
                    margin-top: -1px;
                    display: none;
                }
                .dropdown-submenu:hover > .dropdown-menu {
                    display: block;
                }
                .dropdown-submenu:hover .submenu-btn {
                    background-color: rgba(212, 175, 55, 0.1);
                }
                .menu-arrow {
                    transition: transform 0.2s;
                }
                .menu-arrow.open {
                    transform: rotate(90deg);
                }
                .icon-circle {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                }
                .submenu-list {
                    position: absolute;
                    left: 100%;
                    top: 0;
                }
            `}</style>
        </>
    );
}

export default Header;