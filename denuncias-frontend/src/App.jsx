import  { useState, useEffect, useRef } from 'react';
import { Link,  useLocation, Routes, Route, Navigate } from 'react-router-dom';
import {    FaTwitter, FaLinkedin, FaGithub
} from 'react-icons/fa';

import './App.css';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Header from './pages/Header';
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

function App() {

    const [user, setUser] = useState(null);
 //const [logged, setLogged] = useState(false);
    useEffect(() => {
        const userString = sessionStorage.getItem('user');
       // setLogged(false);
        if (userString) {
            const parsedUser = JSON.parse(userString);
            setUser(parsedUser);
            //setLogged(parsedUser.isLoggedIn);
        }
    }, sessionStorage.getItem('user'));

    console.log(user)
    console.log("User: " + user?.perfil)
    console.log("User storage: " + sessionStorage.getItem('user'))

    const location = useLocation();
    const isLoginPage = location.pathname === '/login';
    const navRef = useRef(null);

    const closeAll = () => {
        setNavOpen(false);
        setOpenTop({ agua: false, saude: false, educacao: false, seguranca: false });
        setSegOpen({ funcionalidade: false, perfis: false, contas: false });
    };

    useEffect(() => {

    }, [location.pathname]);

    useEffect(() => {
        const handler = (e) => {
            if (navRef.current && !navRef.current.contains(e.target)) closeAll();
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        
       /* ROTAS */
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/home" element={<Dashboard/>}/>
                     <Route path="/agua/:tipo" element={<Agua/> }/>
                    <Route path="/saude/:tipo"  element={<Saude/>  }/>
                    <Route path="/educacao/:tipo"  element={<Educacao/>  }/>
                    <Route path="/sobre"  element={<Sobre/>  }/>
                    <Route path="/contacto"  element={<Contacto/>  }/>
                    <Route path="/seguranca/*"  element={<Seguranca/>  }/>
{/*
                    <Route path="/seguranca/funcionalidade/cadastrar"
                           element={ <FuncionalidadeCadastrar/> }/>
                    <Route path="/seguranca/funcionalidade/listar"
                           element={logged ? <FuncionalidadeListar/> : <Navigate to="/login"/>}/>
                    <Route path="/seguranca/funcionalidade/tipo_cadastrar"
                           element={logged ? <TipoFuncionalidadeCadastrar/> : <Navigate to="/login"/>}/>
                    <Route path="/seguranca/funcionalidade/tipo_listar"
                           element={logged ? <TipoFuncionalidadeListar/> : <Navigate to="/login"/>}/>

                    <Route path="/seguranca/perfis/cadastrar"
                           element={logged ? <PerfilCadastrar/> : <Navigate to="/login"/>}/>
                    <Route path="/seguranca/perfis/listar"
                           element={logged ? <PerfilListar/> : <Navigate to="/login"/>}/>
                    <Route path="/seguranca/perfis/atribuir"
                           element={logged ? <FuncionalidadePerfilCadastrar/> : <Navigate to="/login"/>}/>
                    <Route path="/seguranca/perfis/atribuir_listar"
                           element={logged ? <FuncionalidadePerfilListar/> : <Navigate to="/login"/>}/>
                    <Route path="/seguranca/contas/cadastrar"
                           element={logged ? <ContaCadastrar/> : <Navigate to="/login"/>}/>
                    <Route path="/seguranca/contas/listar"
                           element={logged ? <ContaListar/> : <Navigate to="/login"/>}/>
                    <Route path="/seguranca/contas/atribuir"
                           element={logged ? <ContaPerfilCadastrar/> : <Navigate to="/login"/>}/>
                    <Route path="/seguranca/contas/atribuir_listar"
                           element={logged ? <ContaPerfilListar/> : <Navigate to="/login"/>}/>

                    <Route path="/conta/cadastrar/:id?" element={<ContaCadastrar/>}/>
                    <Route path="/conta/listar" element={<ContaListar/>}/>
                   /<Route path="/" element={<Navigate to="/conta/listar" replace />} />
*/}
                    <Route path="/login" element={<Login/>}/>
                </Routes>
    );
}
 
export default App;
