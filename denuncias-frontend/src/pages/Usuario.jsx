import React, { useState, useEffect } from 'react';

export default function Motorista() {
  const [motoristas, setMotoristas] = useState([]);
  const [motorista, setMotorista] = useState({
    nome: '',
    dataNascimento: '',
    identificacao: '',
    nivelAcesso: '',
    telefone: '',
    email: '',
  });
  const [editando, setEditando] = useState(false);
  const [motoristaId, setMotoristaId] = useState(null);

  useEffect(() => {
    carregarMotoristas();
  }, []);

  const carregarMotoristas = async () => {
    try {
      const response = await fetch('http://localhost:9090/api/usuarios');
      const data = await response.json();
      setMotoristas(data);
    } catch (error) {
      console.error('Erro ao carregar motoristas:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMotorista({
      ...motorista,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editando 
        ? `http://localhost:9090/api/usuarios/${motoristaId}`
        : 'http://localhost:9090/api/usuarios';
      
      const method = editando ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(motorista),
      });
      
      if (response.ok) {
        carregarMotoristas();
        limparFormulario();
      }
    } catch (error) {
      console.error('Erro ao salvar motorista:', error);
    }
  };

  const limparFormulario = () => {
    setMotorista({
      nome: '',
      dataNascimento: '',
      identificacao: '',
      nivelAcesso: '',
      telefone: '',
      email: ''
    });
    setEditando(false);
    setMotoristaId(null);
  };

  const editarMotorista = (motorista) => {
    setMotorista({
      nome: motorista.nome,
      dataNascimento: motorista.dataNascimento,
      identificacao: motorista.identificacao,
      nivelAcesso: motorista.nivelAcesso,
      telefone: motorista.telefone,
      email:motorista.email
    });
    setEditando(true);
    setMotoristaId(motorista.id);
  };

  const excluirMotorista = async (id) => {
    try {
      await fetch(`http://localhost:9090/api/usuarios/${id}`, {
        method: 'DELETE',
      });
      carregarMotoristas();
    } catch (error) {
      console.error('Erro ao excluir motorista:', error);
    }
  };

  return (
    <div className="page">
      <h1>Usuários</h1>

      <div className="mb-4">
        <form onSubmit={handleSubmit}>
          <div className="mb-3 row">
            <label htmlFor="nome" className="col-sm-2 col-md-2 col-form-label">Nome</label>
            <div className="col-sm-10 col-md-3">
              <input 
                type="text" 
                className="form-control" 
                id="nome" 
                name="nome"
                value={motorista.nome}
                onChange={handleChange}
                required
              />
            </div>

            <label htmlFor="dataNascimento" className="col-sm-2 col-md-2 col-form-label">Data Nascimento</label>
            <div className="col-sm-10 col-md-3">
              <input 
                type="date" 
                className="form-control" 
                id="dataNascimento" 
                name="dataNascimento"
                value={motorista.dataNascimento}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="mb-3 row">
            <label htmlFor="identificacao" className="col-sm-2 col-md-2 col-form-label">Identificação</label>
            <div className="col-sm-10 col-md-3">
              <input 
                type="text" 
                className="form-control" 
                id="identificacao" 
                name="identificacao"
                value={motorista.identificacao}
                onChange={handleChange}
                required
              />
            </div>

            <label htmlFor="nivelAcesso" className="col-sm-2 col-md-2 col-form-label">Função</label>
            <div className="col-sm-10 col-md-3">
              <select 
                className="form-select" 
                id="nivelAcesso"
                name="nivelAcesso"
                value={motorista.nivelAcesso}
                onChange={handleChange}
                required
              >
                <option value="MOTORISTA">MOTORISTA</option>
                <option value="AGENTE_REGULADOR">AGENTE REGULADOR</option>
                <option value="ADMIN_FULL">ADMIN FULL</option>
                <option value="ADMIN_MULTA">ADMIN MULTA</option>
                <option value="ADMIN_RECLAMACAO">ADMIN RECLAMACAO</option>
              </select>
            </div>
          </div>

           <div className="mb-3 row">
            <label htmlFor="email" className="col-sm-2 col-md-2 col-form-label">Email</label>
            <div className="col-sm-10 col-md-3">
              <input 
                type="text" 
                className="form-control" 
                id="email" 
                name="email"
                value={motorista.email}
                onChange={handleChange}
                required
              />
            </div>

            <label htmlFor="telefone" className="col-sm-2 col-md-2 col-form-label">Telefone</label>
            <div className="col-sm-10 col-md-3">
              <input 
                type="text" 
                className="form-control" 
                id="telefone" 
                name="telefone"
                value={motorista.telefone}
                onChange={handleChange}
                required
              />
            </div>
            
          </div>

          <div className="mb-3">
            <button type="submit" className="btn btn-primary me-2">
              {editando ? 'Atualizar' : 'Cadastrar'}
            </button>
            {editando && (
              <button type="button" className="btn btn-secondary" onClick={limparFormulario}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="mt-5">
        <h2>Lista de Motoristas</h2>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Data Nascimento</th>
              <th>Identificação</th>
              <th>Função</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {motoristas.map((motorista) => (
              <tr key={motorista.id}>
                <td>{motorista.nome}</td>
                <td>{motorista.dataNascimento}</td>
                <td>{motorista.identificacao}</td>
                <td>{motorista.nivelAcesso}</td>
                <td>
                  <button 
                    className="btn btn-sm btn-warning me-2"
                    onClick={() => editarMotorista(motorista)}
                  >
                    Editar
                  </button>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => excluirMotorista(motorista.id)}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}