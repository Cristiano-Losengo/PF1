import { useParams } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import html2canvas from "html2canvas";
import {
  FaMapMarkerAlt, FaCalendarAlt, FaUser, FaPhoneAlt, FaEnvelope,
  FaFileAlt, FaHeartbeat, FaListAlt, FaPaperclip, FaCheckCircle,
  FaHourglassHalf, FaCheck, FaTimes, FaArrowLeft
} from 'react-icons/fa';

export default function Saude() {
  const { tipo } = useParams();
  const [showPreview, setShowPreview] = useState(false);
  const [denunciaFinal, setDenunciaFinal] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitErrors, setSubmitErrors] = useState([]);
  const [touched, setTouched] = useState({});
  const [anonimo, setAnonimo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [denuncias, setDenuncias] = useState([]);
  const comprovativoRef = useRef(null);

  const [formData, setFormData] = useState({
    municipio: 'Cazenga', bairro: 'Hoji-ya-Henda', nomeRua: '', localEspecificoDaOcorrencia: '',
    dataOcorrecia: '', subtipo: 'nao-atendido', descricaoDetalhada: '', nome: '', contacto: '', email: '', anexo: null
  });
  const [errors, setErrors] = useState({});

  const municipios = ["Belas", "Cacuaco", "Cazenga", "Ícolo_e_Bengo", "Luanda", "KilambaKiaxi", "Quiçama", "Talatona", "Viana"];
  const bairrosPorMunicipio = {
    Luanda: ["Ingombota", "Maianga", "Sambizanga", "Rangel", "Kinaxixi", "Mutamba"],
    Viana: ["Zango 1", "Zango 2", "Zango 3", "Zango 4", "Estalagem", "Vila de Viana"],
    Cazenga: ["Hoji-ya-Henda", "Mabor", "Tala Hady", "Cazenga Popular"],
    Belas: ["Benfica", "Morro Bento", "Camama", "Kilamba", "Talismã"],
    Cacuaco: ["Sequele", "Ngola Kiluanje", "Kikolo", "Mulenvos"],
    Talatona: ["Patriota", "Futungo", "Cidade Universitária", "Morro Bento II"],
    KilambaKiaxi: ["Golfe 1", "Golfe 2", "Palanca", "Sapú", "Terra Nova"],
    "Ícolo_e_Bengo": ["Catete", "Cabiri", "Cassoneca", "Bom Jesus"],
    Quiçama: ["Mumbondo", "Demba Chio", "Muxima"]
  };

  const tiposProblema = [
    { value: 'nao-atendido', label: 'Paciente não foi atendido', icon: '🚑' },
    { value: 'diagnostico-errado', label: 'Diagnóstico incorreto', icon: '🩺' },
    { value: 'espera', label: 'Tempo de Espera Excessivo', icon: '⏰' },
    { value: 'Corrupção', label: 'Corrupção ou Pagamento Indevido', icon: '💰' },
    { value: 'sem-medicamentos', label: 'Medicamentos em Falta', icon: '💊' },
    { value: 'negligencia', label: 'Negligência Médica', icon: '⚠️' },
    { value: 'sem-enfermeiros', label: 'Falta de Enfermeiros', icon: '👩‍⚕️' },
    { value: 'sem-medicos', label: 'Falta de Médicos', icon: '👨‍⚕️' },
    { value: 'abandono', label: 'Abandono durante o atendimento', icon: '🏃' }
  ];

  const validarCampo = (name, value) => {
    const v = value?.toString().trim() || '';
    switch (name) {
      case 'municipio': return !v ? 'Selecione o município' : null;
      case 'bairro': return !v ? 'Selecione o bairro' : null;
      case 'nomeRua': return !v ? 'Nome da Rua é obrigatório' : null;
      case 'localEspecificoDaOcorrencia': return !v ? 'Local é obrigatório' : null;
      case 'dataOcorrecia': return !v ? 'Data é obrigatória' : null;
      case 'subtipo': return !v ? 'Selecione o tipo de problema' : null;
      case 'descricaoDetalhada': return v.length < 10 ? 'Mínimo 10 caracteres' : null;
      case 'nome': return !anonimo && !v ? 'Nome é obrigatório' : (!anonimo && v.length < 3 ? 'Mínimo 3 caracteres' : null);
      case 'contacto': return !anonimo && !v ? 'Contacto é obrigatório' : (!anonimo && !/^9\d{8}$/.test(v) ? 'Contacto inválido (9XXXXXXXX)' : null);
      case 'email': return !anonimo && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'Email inválido' : null;
      default: return null;
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    let valor = value;
    if (name === 'nome') valor = value.replace(/[0-9]/g, '');
    if (name === 'contacto') valor = value.replace(/\D/g, '').slice(0, 9);
    setFormData(prev => ({ ...prev, [name]: files?.[0] || valor }));
    const error = validarCampo(name, valor);
    if (error) setErrors(prev => ({ ...prev, [name]: error }));
    else { const newErrors = { ...errors }; delete newErrors[name]; setErrors(newErrors); }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validarCampo(name, value);
    if (error) setErrors(prev => ({ ...prev, [name]: error }));
  };

  const uploadArquivo = async (file) => {
    if (!file) return null;
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    const res = await fetch("http://localhost:9090/api/denuncias/upload", { method: "POST", body: formDataUpload });
    if (res.ok) return await res.text();
    throw new Error("Falha no upload");
  };

  const handleSubmit = async () => {
    setLoading(true);
    setSubmitErrors([]);
    try {
      let nomeArquivo = null;
      if (formData.anexo) nomeArquivo = await uploadArquivo(formData.anexo);

      const payload = {
        nome: anonimo ? null : formData.nome.trim(),
        email: anonimo ? null : formData.email?.trim(),
        contacto: anonimo ? null : formData.contacto,
        descricaoDetalhada: formData.descricaoDetalhada.trim(),
        subtipo: formData.subtipo,
        anonima: anonimo,
        dataOcorrecia: formData.dataOcorrecia,
        municipio: formData.municipio,
        bairro: formData.bairro,
        nomeRua: formData.nomeRua.trim(),
        localEspecificoDaOcorrencia: formData.localEspecificoDaOcorrencia.trim(),
        anexo: nomeArquivo,
        categoriaNome: "Saúde"
      };

      const res = await fetch("http://localhost:9090/api/denuncias", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
      });

      if (res.ok) {
        const nova = await res.json();
        const dadosCompletos = { ...nova, ...payload, codigo: nova.codigo };
        setDenunciaFinal(dadosCompletos);
        setSubmitSuccess(true);
        setFormData({
          municipio: 'Cazenga', bairro: 'Hoji-ya-Henda', nomeRua: '', localEspecificoDaOcorrencia: '',
          dataOcorrecia: '', subtipo: 'nao-atendido', descricaoDetalhada: '', nome: '', contacto: '', email: '', anexo: null
        });
        setTimeout(() => setSubmitSuccess(false), 5000);
      } else {
        const errorText = await res.text();
        setSubmitErrors([errorText]);
      }
    } catch (err) { 
      setSubmitErrors([err.message]); 
    } finally { 
      setLoading(false); 
    }
  };

 const gerarImagem = async () => {
  try {
    if (!comprovativoRef.current || !denunciaFinal) {
      console.error('Referência ou dados não disponíveis');
      alert('Aguardando dados do comprovativo...');
      return;
    }
    
    // DIAGNÓSTICO: Verifica o conteúdo do elemento
    console.log('Conteúdo HTML do elemento:', comprovativoRef.current.innerHTML);
    console.log('Dimensões:', {
      width: comprovativoRef.current.offsetWidth,
      height: comprovativoRef.current.offsetHeight,
      scrollWidth: comprovativoRef.current.scrollWidth,
      scrollHeight: comprovativoRef.current.scrollHeight
    });
    
    // Verifica se tem o código
    console.log('Código da denúncia:', denunciaFinal.codigo);
    
    // Aguarda a renderização
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Força o reflow do DOM
    comprovativoRef.current.offsetHeight;
    
    const canvas = await html2canvas(comprovativoRef.current, { 
      scale: 2, 
      backgroundColor: '#ffffff'
    });
    
    // Verifica se o canvas tem conteúdo
    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error('Canvas gerado com dimensões zero');
    }
    
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `comprovativo_${denunciaFinal.codigo}.png`;
    link.click();
    
  } catch (error) {
    console.error('ERRO AO GERAR IMAGEM:', error);
    alert('Erro ao gerar o comprovativo: ' + error.message + '\n\nVerifique o console para mais detalhes.');
  }
};

  const getTipoLabel = (subtipo) => tiposProblema.find(t => t.value === subtipo)?.label || subtipo;

  useEffect(() => {
    fetch("http://localhost:9090/api/denuncias")
      .then(res => res.json())
      .then(data => setDenuncias(data.filter(d => d.categoriaNome === "Saúde") || []))
      .catch(console.error);
  }, []);

  if (tipo === "registrar") {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: "'Inter', sans-serif" }}>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

        {/* Hero Section */}
        <div style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)', padding: '3rem 1rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', background: 'rgba(212,175,55,0.15)', marginBottom: '1rem' }}>
            <FaHeartbeat style={{ fontSize: '2rem', color: '#D4AF37' }} />
          </div>
          <h1 style={{ color: '#D4AF37', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>Registrar Denúncia - Saúde</h1>
          <p style={{ color: '#aaa', marginTop: '0.5rem' }}>Preencha os dados abaixo para registrar sua denúncia</p>
        </div>

        {/* Formulário */}
        <div style={{ maxWidth: '800px', margin: '-40px auto 0', padding: '2rem', background: 'white', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
          {submitSuccess && <div style={{ background: '#10b981', color: 'white', padding: '1rem', borderRadius: '12px', marginBottom: '1rem' }}>✅ Denúncia registrada com sucesso!</div>}
          {submitErrors.map((e, i) => <div key={i} style={{ background: '#ef4444', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', marginBottom: '0.5rem' }}>❌ {e}</div>)}

          {/* Formulário - todos os campos */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}><FaListAlt style={{ color: '#D4AF37' }} /> Tipo de Problema *</label>
            <select name="subtipo" value={formData.subtipo} onChange={handleChange} onBlur={handleBlur} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: `2px solid ${errors.subtipo ? '#ef4444' : '#e5e7eb'}` }}>
              {tiposProblema.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
            </select>
            {errors.subtipo && <small style={{ color: '#ef4444' }}>{errors.subtipo}</small>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}><FaMapMarkerAlt style={{ color: '#D4AF37' }} /> Município *</label>
              <select name="municipio" value={formData.municipio} onChange={handleChange} onBlur={handleBlur} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: `2px solid ${errors.municipio ? '#ef4444' : '#e5e7eb'}` }}>
                {municipios.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              {errors.municipio && <small style={{ color: '#ef4444' }}>{errors.municipio}</small>}
            </div>
            <div>
              <label style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}><FaMapMarkerAlt style={{ color: '#D4AF37' }} /> Bairro *</label>
              <select name="bairro" value={formData.bairro} onChange={handleChange} onBlur={handleBlur} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: `2px solid ${errors.bairro ? '#ef4444' : '#e5e7eb'}` }}>
                {(bairrosPorMunicipio[formData.municipio] || []).map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              {errors.bairro && <small style={{ color: '#ef4444' }}>{errors.bairro}</small>}
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}><FaMapMarkerAlt style={{ color: '#D4AF37' }} /> Nome da Rua / Número *</label>
            <input type="text" name="nomeRua" value={formData.nomeRua} onChange={handleChange} onBlur={handleBlur} placeholder="Ex: Rua 12 de Julho, nº 45" style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: `2px solid ${errors.nomeRua ? '#ef4444' : '#e5e7eb'}` }} />
            {errors.nomeRua && <small style={{ color: '#ef4444' }}>{errors.nomeRua}</small>}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}><FaMapMarkerAlt style={{ color: '#D4AF37' }} />  Local Específico / Unidade de Saúde *</label>
            <input type="text" name="localEspecificoDaOcorrencia" value={formData.localEspecificoDaOcorrencia} onChange={handleChange} onBlur={handleBlur} placeholder="Ex: Urgência  / Hospital, Centro Médico..." style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: `2px solid ${errors.localEspecificoDaOcorrencia ? '#ef4444' : '#e5e7eb'}` }} />
            {errors.localEspecificoDaOcorrencia && <small style={{ color: '#ef4444' }}>{errors.localEspecificoDaOcorrencia}</small>}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}><FaCalendarAlt style={{ color: '#D4AF37' }} /> Data da Ocorrência *</label>
            <input type="date" name="dataOcorrecia" value={formData.dataOcorrecia} onChange={handleChange} onBlur={handleBlur} max={new Date().toISOString().split('T')[0]} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: `2px solid ${errors.dataOcorrecia ? '#ef4444' : '#e5e7eb'}` }} />
            {errors.dataOcorrecia && <small style={{ color: '#ef4444' }}>{errors.dataOcorrecia}</small>}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}><FaFileAlt style={{ color: '#D4AF37' }} /> Descrição Detalhada *</label>
            <textarea name="descricaoDetalhada" value={formData.descricaoDetalhada} onChange={handleChange} onBlur={handleBlur} rows="4" placeholder="Descreva detalhadamente o problema..." style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: `2px solid ${errors.descricaoDetalhada ? '#ef4444' : '#e5e7eb'}`, resize: 'vertical' }} />
            {errors.descricaoDetalhada && <small style={{ color: '#ef4444' }}>{errors.descricaoDetalhada}</small>}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}><FaPaperclip style={{ color: '#D4AF37' }} /> Anexo (opcional)</label>
            <input type="file" name="anexo" onChange={(e) => setFormData(prev => ({ ...prev, anexo: e.target.files[0] }))} accept=".pdf,.jpg,.jpeg,.png" style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '2px solid #e5e7eb' }} />
            {formData.anexo && <small style={{ color: '#10b981', display: 'block', marginTop: '0.5rem' }}>✅ Arquivo selecionado: {formData.anexo.name}</small>}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={anonimo} onChange={(e) => setAnonimo(e.target.checked)} />
              <span>Deseja permanecer anônimo?</span>
            </label>
          </div>

          {!anonimo && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div><input type="text" name="nome" value={formData.nome} onChange={handleChange} onBlur={handleBlur} placeholder="Nome completo" style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: `2px solid ${errors.nome ? '#ef4444' : '#e5e7eb'}` }} /><small style={{ color: '#ef4444' }}>{errors.nome}</small></div>
              <div><input type="tel" name="contacto" value={formData.contacto} onChange={handleChange} onBlur={handleBlur} placeholder="Contacto (9XXXXXXXX)" style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: `2px solid ${errors.contacto ? '#ef4444' : '#e5e7eb'}` }} /><small style={{ color: '#ef4444' }}>{errors.contacto}</small></div>
              <div style={{ gridColumn: 'span 2' }}><input type="email" name="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} placeholder="Email (opcional)" style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: `2px solid ${errors.email ? '#ef4444' : '#e5e7eb'}` }} /><small style={{ color: '#ef4444' }}>{errors.email}</small></div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button onClick={() => window.history.back()} style={{ padding: '0.75rem 1.5rem', borderRadius: '50px', border: '2px solid #D4AF37', background: 'transparent', color: '#D4AF37', fontWeight: 'bold', cursor: 'pointer' }}><FaArrowLeft /> Voltar</button>
            <button onClick={() => { const newErrors = {}; Object.keys(formData).forEach(k => { const err = validarCampo(k, formData[k]); if (err) newErrors[k] = err; }); setErrors(newErrors); if (Object.keys(newErrors).length === 0) setShowPreview(true); }} style={{ flex: 1, padding: '0.75rem', borderRadius: '50px', border: 'none', background: 'linear-gradient(135deg, #D4AF37, #FFE55C)', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}>Enviar Denúncia</button>
          </div>
        </div>

        {/* Modal Preview */}
        {showPreview && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', borderRadius: '20px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflow: 'auto', padding: '2rem' }}>
              <h3 style={{ color: '#D4AF37' }}>Revisar Denúncia</h3>
              <hr />
              <p><strong>Tipo:</strong> {tiposProblema.find(t => t.value === formData.subtipo)?.label}</p>
              <p><strong>Local:</strong> {formData.municipio}, {formData.bairro}, {formData.nomeRua}</p>
              <p><strong>Data:</strong> {formData.dataOcorrecia}</p>
              <p><strong>Descrição:</strong> {formData.descricaoDetalhada}</p>
              {!anonimo && <><p><strong>Nome:</strong> {formData.nome}</p><p><strong>Contacto:</strong> {formData.contacto}</p><p><strong>Email:</strong> {formData.email}</p></>}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button onClick={() => setShowPreview(false)} style={{ padding: '0.75rem 1.5rem', borderRadius: '50px', border: '2px solid #ccc', background: 'white', cursor: 'pointer' }}>Editar</button>
                <button onClick={async () => { setShowPreview(false); await handleSubmit(); }} style={{ flex: 1, padding: '0.75rem', borderRadius: '50px', border: 'none', background: 'linear-gradient(135deg, #D4AF37, #FFE55C)', fontWeight: 'bold', cursor: 'pointer' }}>{loading ? 'Enviando...' : 'Confirmar'}</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Comprovativo */}
        {denunciaFinal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', borderRadius: '20px', maxWidth: '600px', width: '90%', padding: '2rem' }}>
              <h3 style={{ color: '#10b981' }}>✅ Denúncia Registada!</h3>
              <p><strong>Código:</strong> <span style={{ fontFamily: 'monospace', fontSize: '1.2rem' }}>{denunciaFinal.codigo}</span></p>
              <hr />
              <p><strong>Tipo:</strong> {getTipoLabel(denunciaFinal.subtipo)}</p>
              <p><strong>Local:</strong> {denunciaFinal.municipio}, {denunciaFinal.bairro}</p>
              <p><strong>Data:</strong> {new Date(denunciaFinal.dataOcorrecia).toLocaleDateString('pt-AO')}</p>
              <p><strong>Descrição:</strong> {denunciaFinal.descricaoDetalhada}</p>
              <p><strong>Nome:</strong> {denunciaFinal.nome || 'Anónimo'}</p>
              <p><strong>Contacto:</strong> {denunciaFinal.contacto || 'Não informado'}</p>
              <p><strong>Email:</strong> {denunciaFinal.email || 'Não informado'}</p>
              <p><strong>Anexo:</strong> {denunciaFinal.anexo || 'Nenhum anexo'}</p>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button onClick={() => setDenunciaFinal(null)} style={{ padding: '0.75rem 1.5rem', borderRadius: '50px', border: '2px solid #ccc', background: 'white', cursor: 'pointer' }}>Fechar</button>
                <button onClick={gerarImagem} style={{ flex: 1, padding: '0.75rem', borderRadius: '50px', border: 'none', background: 'linear-gradient(135deg, #D4AF37, #FFE55C)', fontWeight: 'bold', cursor: 'pointer' }}>📥 Baixar Comprovativo</button>
              </div>
            </div>
          </div>
        )}

        {/* Comprovativo para impressão */}
        
        <div ref={comprovativoRef} style={{ position: 'fixed', top: '-9999px', left: 0,  width: '800px', padding: '20px', background: 'white' }}>
          {denunciaFinal && (
            <div style={{ padding: '20px', border: '1px solid #D4AF37', borderRadius: '10px' }}>
              <h2 style={{ textAlign: 'center', color: '#D4AF37' }}>REPÚBLICA DE ANGOLA</h2>
              <h4 style={{ textAlign: 'center' }}>COMPROVATIVO DE DENÚNCIA - SAÚDE</h4>
              <hr />
              <p><strong>Código:</strong> {denunciaFinal.codigo}</p>
              <p><strong>Tipo:</strong> {getTipoLabel(denunciaFinal.subtipo)}</p>
              <p><strong>Local:</strong> {denunciaFinal.municipio}, {denunciaFinal.bairro}</p>
              <p><strong>Data da ocorrência:</strong> {new Date(denunciaFinal.dataOcorrecia).toLocaleDateString('pt-AO')}</p>
              <p><strong>Descrição:</strong> {denunciaFinal.descricaoDetalhada}</p>
              <p><strong>Nome:</strong> {denunciaFinal.nome || 'Anónimo'}</p>
              <p><strong>Contacto:</strong> {denunciaFinal.contacto || 'Anónimo'}</p>
              <p><strong>Email:</strong> {denunciaFinal.email || 'Anónimo'}</p>
              <p><strong>Anexo:</strong> {denunciaFinal.anexo}</p>

              <hr />
              <p style={{ textAlign: 'center', fontSize: '12px' }}>Guarde este código para acompanhar sua denúncia</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==================== LISTAGEM CORRIGIDA ====================
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <FaHeartbeat style={{ color: '#D4AF37', fontSize: '2rem' }} />
        <h2 style={{ color: '#D4AF37', margin: 0, fontWeight: 'bold' }}>Denúncias - Saúde</h2>
      </div>

      {denuncias.length === 0 ? (
        <div style={{ background: '#f0fdf4', color: '#166534', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
          Ainda não existem denúncias registadas para o setor de saúde.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <thead>
              <tr style={{ background: '#1a1a1a', color: '#D4AF37' }}>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Problema</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Descrição</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Localização</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Data</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Denunciante</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Contacto</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Comentário</th>
              </tr>
            </thead>
            <tbody>
              {denuncias.map(d => (
                <tr key={d.pkDenuncia} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '1rem' }}><strong>{getTipoLabel(d.subtipo)}</strong></td>
                  <td style={{ padding: '1rem' }}>{d.descricaoDetalhada?.substring(0, 60)}...</td>
                  <td style={{ padding: '1rem' }}>{d.municipio}, {d.bairro}</td>
                  <td style={{ padding: '1rem' }}>{new Date(d.dataOcorrecia).toLocaleDateString('pt-AO')}</td>
                  <td style={{ padding: '1rem' }}>{d.nome || 'Anónimo'}</td>
                  <td style={{ padding: '1rem' }}>{d.contacto || '—'}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      background: d.status === 'Resolvido' ? '#10b981' : '#f59e0b',
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '50px',
                      fontSize: '0.75rem'
                    }}>
                      {d.status || 'Pendente'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <em>{d.comentario || 'Aguardando resposta...'}</em>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button onClick={() => window.history.back()} style={{ padding: '0.75rem 2rem', borderRadius: '50px', border: '2px solid #D4AF37', background: 'transparent', color: '#D4AF37', fontWeight: 'bold', cursor: 'pointer' }}>
          <FaArrowLeft /> Voltar
        </button>
      </div>
    </div>
  );
}