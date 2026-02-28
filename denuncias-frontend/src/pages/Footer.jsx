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
         return (
                    <footer className="bg-black text-light mt-auto pt-5 pb-3 border-top shadow-sm">
                        <div className="container px-4">
                            <div className="row gy-4">
                                <div className="col-md-3 text-center text-md-start">
                                    <div
                                        className="d-flex align-items-center justify-content-center justify-content-md-start mb-2">
                                        <img src="/brasao-angola.png" alt="Governo de Angola" width="40"
                                            style={{ marginRight: 10 }} onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                            }} />
                                        <h5 className="fw-bold mb-0 text-uppercase">Plataforma Nacional de
                                            Denúncias</h5>
                                    </div>
                                    <p className="small text-muted mb-0">
                                        Sistema oficial do Governo da República de Angola para monitorar e responder às
                                        denúncias
                                        dos cidadãos sobre serviços públicos
                                        de <strong>Água</strong>, <strong>Saúde</strong> e <strong>Educação</strong>.
                                    </p>
                                </div>

                                <div className="col-md-3 text-center text-md-start">
                                    <h6 className="fw-bold text-uppercase mb-3">Institucional</h6>
                                    <ul className="list-unstyled small">
                                        <li><Link className="text-light text-decoration-none" to="/sobre">Sobre a
                                            Plataforma</Link></li>
                                        <li><a href="#" className="text-light text-decoration-none">Política de
                                            Privacidade</a></li>
                                        <li><a href="#" className="text-light text-decoration-none">Termos de Uso</a>
                                        </li>
                                    </ul>
                                </div>

                                <div className="col-md-3 mb-3 text-center text-md-start">
                                    <h6 className="fw-bold text-uppercase mb-3">Contacto</h6>
                                    <p className="small mb-1"><strong>Linha Verde:</strong> 111</p>
                                    <p className="small mb-1"><strong>Email:</strong> denuncias@gov.ao</p>
                                    <p className="small mb-0"><strong>Endereço:</strong> Largo da Independência, Luanda
                                        - Angola</p>
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
                
            
        
    );
}
            export default App;