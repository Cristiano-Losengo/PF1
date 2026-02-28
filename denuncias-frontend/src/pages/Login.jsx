import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaSignInAlt } from 'react-icons/fa';

export default function Login() {
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {

            const response = await fetch('http://localhost:9090/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    password
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.mensagem || 'Credenciais inválidas');
            }


            const userSession = {
                token: data.token,
                email: data.email,
                perfil: data.perfil,
                isLoggedIn: true
            };

            sessionStorage.setItem('user', JSON.stringify(userSession));

           // setLoggedIn(true);
          navigate('/home');

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

return (
    <div
        className="d-flex justify-content-center align-items-center vh-100"
        style={{
            backgroundColor: "#0B0B0B"
        }}
    >
        <div
            className="card shadow-lg p-4"
            style={{
                maxWidth: 420,
                width: "100%",
                backgroundColor: "#111111",
                border: "1px solid #D4AF37",
                borderRadius: "12px"
            }}
        >
            <h3
                className="text-center mb-4"
                style={{
                    color: "#D4AF37",
                    fontWeight: "bold"
                }}
            >
                <FaSignInAlt className="me-2" />
Login            </h3>

            {error && (
                <div className="alert alert-danger text-center">
                    {error}
                </div>
            )}

            <form onSubmit={handleLogin}>
                <div className="mb-3">
                    <label
                        className="form-label"
                        style={{ color: "#F5F5F5" }}
                    >
                        <FaUser className="me-2" /> Usuário
                    </label>

                    <input
                        type="text"
                        className="form-control"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        style={{
                            backgroundColor: "#1a1a1a",
                            color: "#fff",
                            border: "1px solid #D4AF37"
                        }}
                    />
                </div>

                <div className="mb-4">
                    <label
                        className="form-label"
                        style={{ color: "#F5F5F5" }}
                    >
                        <FaLock className="me-2" /> Senha
                    </label>

                    <input
                        type="password"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{
                            backgroundColor: "#1a1a1a",
                            color: "#fff",
                            border: "1px solid #D4AF37"
                        }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="btn w-100"
                    style={{
                        backgroundColor: "#D4AF37",
                        color: "#000",
                        fontWeight: "bold",
                        border: "none"
                    }}
                >
                    {loading ? "Entrando..." : "Entrar"}
                </button>
            </form>
        </div>
    </div>
);

}
