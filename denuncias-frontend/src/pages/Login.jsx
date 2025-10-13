import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaSignInAlt } from 'react-icons/fa';

export default function Login({ setLoggedIn }) {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();


        try {

            const response = await fetch('http://localhost:9090/api/auth/login', {

                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),

            });


            if (response.ok) {

                const data = await response.json();


                console.log(data)
                // Se a API retornar token ou algo assim, pode armazenar:
                if (data.token) {
                    localStorage.setItem('token', data.token);
                }

                setLoggedIn(true);
                navigate('/'); // Vai para home
            } else {
                setError('Usuário ou senha inválidos');
            }
        } catch (error) {
            setError('Erro ao conectar ao servidor');
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="card shadow p-4" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 className="text-center mb-4">
                    <FaSignInAlt className="me-2" /> Login
                </h2>

                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label className="form-label"><FaUser className="me-2" />Usuário</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Digite seu usuário"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="form-label"><FaLock className="me-2" />Senha</label>
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Digite sua senha"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">
                        <FaSignInAlt className="me-2" /> Entrar
                    </button>
                </form>
            </div>
        </div>
    );
}
