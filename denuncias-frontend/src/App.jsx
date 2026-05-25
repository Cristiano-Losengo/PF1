import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';


import Header from './pages/Header';
import Footer from './pages/Footer';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import PoliticaPrivacidade from './pages/Politica_privacidade';
import AcompanharDenuncia from './pages/Acompanhar_denuncia';
import TermosUso from './pages/Termos_uso';
import Agua from './pages/Agua';
import Saude from './pages/Saude';
import Educacao from './pages/Educacao';
import Sobre from './pages/Sobre';
import Contacto from './pages/Contacto';
// Segurança
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


const rotasSeguranca = [
  { path: "/seguranca/funcionalidade/cadastrar", element: <FuncionalidadeCadastrar /> },
  { path: "/seguranca/funcionalidade/listar", element: <FuncionalidadeListar /> },
  { path: "/seguranca/funcionalidade/tipo_cadastrar", element: <TipoFuncionalidadeCadastrar /> },
  { path: "/seguranca/funcionalidade/tipo_listar", element: <TipoFuncionalidadeListar /> },
  { path: "/seguranca/perfis/cadastrar", element: <PerfilCadastrar /> },
  { path: "/seguranca/perfis/listar", element: <PerfilListar /> },
  { path: "/seguranca/perfis/atribuir", element: <FuncionalidadePerfilCadastrar /> },
  { path: "/seguranca/perfis/atribuir_listar", element: <FuncionalidadePerfilListar /> },
  { path: "/seguranca/contas/cadastrar", element: <ContaCadastrar /> },
  { path: "/seguranca/contas/listar", element: <ContaListar /> },
  { path: "/seguranca/contas/atribuir", element: <ContaPerfilCadastrar /> },
  { path: "/seguranca/contas/atribuir_listar", element: <ContaPerfilListar /> },
];

function App() {
  const location = useLocation();
  const [user, setUser] = useState(null);

  // Carregar usuário do sessionStorage
  useEffect(() => {
    const userString = sessionStorage.getItem('user');
    if (userString) {
      setUser(JSON.parse(userString));
    }
  }, []);

  const isLoginPage = location.pathname === '/login';

  return (
    <>
      {!isLoginPage && <Header />}
      
      <Routes>
     
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/acompanhar" element={<AcompanharDenuncia />} />
        <Route path="/servicos/agua/:tipo" element={<Agua />} />
        <Route path="/servicos/saude/:tipo" element={<Saude />} />
        <Route path="/servicos/educacao/:tipo" element={<Educacao />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/contacto" element={<Contacto />} />
         <Route path="/Politica_privacidade" element={<PoliticaPrivacidade />} />
         <Route path="/Termos_uso" element={<TermosUso />} />
        
        {/* Segurança */}
        <Route path="/seguranca/*" element={<Seguranca />} />
   
        {rotasSeguranca.map((rota, index) => (
          <Route key={index} path={rota.path} element={rota.element} />
        ))}

        <Route path="/conta/cadastrar/:id?" element={<ContaCadastrar />} />
        <Route path="/conta/listar" element={<ContaListar />} />
          {/* <Route path="/" element={<Navigate to="/conta/listar" replace />} />
        <Route path="*" element={<Navigate to="/conta/listar" replace />} />*/}
      </Routes>
      
      {!isLoginPage && <Footer />}
    </>
  );
}

export default App;