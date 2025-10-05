import React from 'react';

export default function Sobre() {

  return (
    <div className="container py-5" style={{ maxWidth: '800px' }}>
      <h1 className="mb-4 text-primary">Sobre a Plataforma de Denúncias</h1>
      <p className="text-muted">
        A <strong>Plataforma de Denúncias</strong>  é uma iniciativa digital que tem como missão garantir que
        todos os cidadãos possam relatar irregularidades, abusos, corrupção, má gestão ou quaisquer condutas inapropriadas
        nos serviços públicos (Água, Saúde, Educação)de forma segura, confidencial e acessível.
      </p>

      <p className="text-muted">
        Com foco na transparência e no fortalecimento da cidadania, atua como um canal direto entre a população e
        os órgãos responsáveis pela fiscalização e melhoria dos serviços nas áreas de Saúde, Educação, Água, entre outros.
      </p>

      <h5 className="mt-4">Nossos valores</h5>
      <ul className="text-muted">
        <li>💡 Transparência e ética</li>
        <li>🔒 Confidencialidade das informações</li>
        <li>🤝 Compromisso com o cidadão</li>
        <li>📈 Melhoria contínua dos serviços públicos</li>
      </ul>

      <p className="mt-4 text-muted">
        Esta plataforma é mantida com o apoio de instituições públicas e civis comprometidas com a integridade e o
        desenvolvimento social.
      </p>
    </div>
  );
}

