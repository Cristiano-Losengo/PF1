import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaSignInAlt } from 'react-icons/fa';

export default function Login({ setLoggedIn }) {
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

            // ✅ CORRETO: Salvar dados completos do usuário com menus e acessoTotal
            const userSession = {
                token: data.token || "no-jwt",
                email: data.email,
                perfil: data.perfil,
                nome: data.nome || username,
                username: username,
                menus: data.menus || [],        // ← LISTA COMPLETA de funcionalidades
                acessoTotal: data.acessoTotal || false,  // ← FLAG de acesso total (se tem ID=1)
                pkPerfil: data.pkPerfil,
                isLoggedIn: true
            };
            
            // ✅ REMOVER: Esta parte usa 'data.menu' que não existe mais no backend corrigido
            // const menuSession = {
            //     pkFuncionalidade: data.menu?.pkFuncionalidade,
            //     name: data.menu?.name,
            //     path: data.menu?.path
            // };
            // localStorage.setItem('menu', JSON.stringify(data.menu));
            
            // ✅ Apenas guardar o userSession (contém tudo que precisamos)
            sessionStorage.setItem('user', JSON.stringify(userSession));
            
            // Debug: Verificar o que foi guardado
            console.log('✅ Login realizado com sucesso!');
            console.log('Perfil:', data.perfil);
            console.log('Acesso Total:', data.acessoTotal);
            console.log('Quantidade de Menus:', data.menus?.length || 0);
            
            if (setLoggedIn) {
                setLoggedIn(true);
            }
            
            navigate('/home');

        } catch (err) {
            setError(err.message);
            console.error('❌ Erro no login:', err);
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
                    Login
                </h3>

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