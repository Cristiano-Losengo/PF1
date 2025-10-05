import React from 'react';

export default function Contacto() {

  return (
    <div className="container py-5" style={{ maxWidth: '700px' }}>
      <h1 className="mb-4 text-primary">Contacto</h1>
      <p className="text-muted">
        Em caso de dúvidas, sugestões ou necessidade de suporte técnico, entre em contacto conosco utilizando os canais abaixo.
      </p>

      <ul className="list-unstyled text-muted mb-4">
        <li><strong>Email:</strong> apoio@denuncias.gov.ao</li>
        <li><strong>Telefone:</strong> +244 222 000 000</li>
        <li><strong>WhatsApp:</strong> +244 931 000 000</li>
        <li><strong>Horário:</strong> Segunda à Sexta, das 8h às 17h</li>
      </ul>

      <form>
        <h5 className="mb-3">Envie-nos uma mensagem:</h5>
        <div className="mb-3">
          <label htmlFor="nome" className="form-label">Seu Nome</label>
          <input type="text" className="form-control" id="nome" required />
        </div>

        <div className="mb-3">
          <label htmlFor="email" className="form-label">Seu Email</label>
          <input type="email" className="form-control" id="email" required />
        </div>

        <div className="mb-3">
          <label htmlFor="mensagem" className="form-label">Mensagem</label>
          <textarea className="form-control" id="mensagem" rows="4" required></textarea>
        </div>

        <button type="submit" className="btn btn-primary">Enviar</button>
      </form>
    </div>
  );
}

