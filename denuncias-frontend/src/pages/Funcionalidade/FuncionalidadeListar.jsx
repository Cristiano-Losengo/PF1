import { useState, useEffect } from "react";

export default function FuncionalidadeListar() {
  const [funcionalidades, setFuncionalidades] = useState([]);
  const [openRows, setOpenRows] = useState({});

  const carregarFuncionalidades = async () => {
    try {
      const response = await fetch(
          "http://localhost:9898/api/seguranca/funcionalidade_perfil_listar"
      );
      const data = await response.json();
      setFuncionalidades(data);
    } catch (error) {
      console.error("Erro ao carregar funcionalidades:", error);
    }
  };

  useEffect(() => {
    carregarFuncionalidades();
  }, []);

  const toggleRow = (key) => {
    setOpenRows((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const agrupado = funcionalidades.reduce((acc, item) => {
    if (!acc[item.paiFuncionalidade]) {
      acc[item.paiFuncionalidade] = {};
    }
    if (!acc[item.paiFuncionalidade][item.nomePerfil]) {
      acc[item.paiFuncionalidade][item.nomePerfil] = [];
    }
    acc[item.paiFuncionalidade][item.nomePerfil].push(item);
    return acc;
  }, {});

  return (
      <div className="container mt-4">

        <table className="table table-bordered table-striped align-middle">
          <thead className="table-dark">
          <tr>
            <th style={{ width: "50px" }}>#</th>
            <th style={{ width: "50px" }}>✔</th>
            <th>Nome</th>
            <th>Tipo</th>
            <th>Pai</th>
          </tr>
          </thead>

          <tbody>

          {/* NÍVEL 1 - PAI */}
          {Object.entries(agrupado).map(([pai, perfis], indexPai) => {
            const isOpenPai = openRows[pai] || false;

            return (
                <>
                  <tr key={pai} className="table-primary">
                    <td>{indexPai + 1}</td>
                    <td><input type="checkbox" /></td>

                    {/* Tabulação Pai */}
                    <td style={{ paddingLeft: "0px" }}>
                      <button
                          className="btn btn-sm btn-link p-0 me-2"
                          onClick={() => toggleRow(pai)}
                      >
                        {isOpenPai ? "▼" : "▶"}
                      </button>

                      <b>{pai}</b>
                    </td>

                    <td colSpan={2}></td>
                  </tr>

                  {/* NÍVEL 2 - PERFIL */}
                  {isOpenPai &&
                  Object.entries(perfis).map(([perfil, funcs]) => {
                    const keyPerfil = `${pai}-${perfil}`;
                    const isOpenPerfil = openRows[keyPerfil] || false;

                    return (
                        <>
                          <tr key={keyPerfil} className="table-info">
                            <td></td>
                            <td><input type="checkbox" /></td>

                            {/* Tabulação Perfil */}
                            <td style={{ paddingLeft: "20px" }}>
                              <button
                                  className="btn btn-sm btn-link p-0 me-2"
                                  onClick={() => toggleRow(keyPerfil)}
                              >
                                {isOpenPerfil ? "▼" : "▶"}
                              </button>

                              {perfil}
                            </td>

                            <td colSpan={2}></td>
                          </tr>

                          {/* NÍVEL 3 - FUNCIONALIDADE */}
                          {isOpenPerfil &&
                          funcs.map((f, idx) => (
                              <tr
                                  key={`${f.fkFuncionalidade}-${f.fkPerfil}-${idx}`}
                                  className="table-secondary"
                              >
                                <td></td>
                                <td><input type="checkbox" /></td>

                                {/* Tabulação Funcionalidade */}
                                <td style={{ paddingLeft: "40px" }}>
                                  {f.nomeFuncionalidade}
                                </td>

                                <td>{f.tipoFuncionalidade}</td>
                                <td>{f.paiFuncionalidade}</td>
                              </tr>
                          ))}
                        </>
                    );
                  })}

                </>
            );
          })}

          </tbody>
        </table>
      </div>
  );
}
