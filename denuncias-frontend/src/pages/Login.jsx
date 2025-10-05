import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaSignInAlt } from 'react-icons/fa';

export default function Login({ setLoggedIn }) {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setLoggedIn(true);
    navigate('/');
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow p-4" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 className="text-center mb-4">
          <FaSignInAlt className="me-2" /> Login
        </h2>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label"><FaUser className="me-2" />Usuário</label>
            <input type="text" className="form-control" placeholder="Digite seu usuário" required />
          </div>
          <div className="mb-4">
            <label className="form-label"><FaLock className="me-2" />Senha</label>
            <input type="password" className="form-control" placeholder="Digite sua senha" required />
          </div>
          <button type="submit" className="btn btn-primary w-100">
            <FaSignInAlt className="me-2" /> Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

