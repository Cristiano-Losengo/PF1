import React, { useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';

export default function FuncionalidadesTree() {
    const [data, setData] = useState([]);
    const [abertos, setAbertos] = useState(new Set());
    const [loading, setLoading] = useState(true);

    const toggle = (id) => {
        const nova = new Set(abertos);
        nova.has(id) ? nova.delete(id) : nova.add(id);
        setAbertos(nova);
    };

    useEffect(() => {
        const load = async () => {
            try {
                const resp = await fetch("http://localhost:9090/api/seguranca/funcionalidade_listar");
                const json = await resp.json();
                setData(json);
            } catch (e) {
                console.error("Erro ao carregar:", e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <div className="p-3">A carregar...</div>;

    const map = {};
    data.forEach(item => map[item.pkFuncionalidade] = { ...item, filhos: [] });

    const raiz = [];

    data.forEach(item => {
        if (item.fkFuncionalidade === null) {
            raiz.push(map[item.pkFuncionalidade]);
        } else if (map[item.fkFuncionalidade]) {
            map[item.fkFuncionalidade].filhos.push(map[item.pkFuncionalidade]);
        }
    });


    const renderNode = (node) => {
        const temFilhos = node.filhos && node.filhos.length > 0;
        const aberto = abertos.has(node.pkFuncionalidade);

        return (
            <li key={node.pkFuncionalidade} className="list-group-item">

                <div className="d-flex align-items-center justify-content-between">

                    <span>
                        <strong>{node.designacao}</strong>
                        <div style={{ fontSize: "12px", color: "#555" }}>
                            {node.descricao}
                        </div>
                    </span>

                    {temFilhos && (
                        <button
                            className="btn btn-sm btn-primary"
                            onClick={() => toggle(node.pkFuncionalidade)}
                        >
                            {aberto ? "−" : "+"}
                        </button>
                    )}
                </div>
                {temFilhos && aberto && (
                    <ul className="list-group mt-2 ms-4">
                        {node.filhos.map(renderNode)}
                    </ul>
                )}

            </li>
        );
    };

    return (
        <div className="container mt-4">
            <h3 className="mb-4">Lista de Funcionalidades</h3>
            <ul className="list-group">
                {raiz.map(renderNode)}
            </ul>
        </div>
    );
}
