import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = "https://backend-render02.onrender.com"; // <--- ATUALIZE AQUI

// A linha abaixo serve apenas para testes locais sem gravar as informações no arquivo do servidor remoto (render.com)
//const API_URL = "http://localhost:3001";

const AGENDA = [
  { dia: "Segunda", data: "06/04" }, { dia: "Terça", data: "07/04" },
  { dia: "Quarta", data: "08/04" }, { dia: "Quinta", data: "09/04" }, { dia: "Sexta", data: "10/04" }
];
const VAGAS_LISTA = ["Vaga 1", "Vaga 2", "Vaga 3", "Vaga 4", "Vaga 5", "Vaga 6"];
const TURNOS = ["Manhã", "Tarde"];

function App() {
  const [form, setForm] = useState({ nome: '', email: '', whats: '', cpf: '', data: '', turno: '', vaga: '' });
  const [db, setDb] = useState({ ocupados: [], totalGeral: 0 });
  const [showModal, setShowModal] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchStatus = () => {
    axios.get(`${API_URL}/status`).then(res => setDb(res.data)).catch(e => console.log("Erro"));
  };

  useEffect(() => { fetchStatus(); }, []);

  const handleCpf = (e) => {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length <= 11) {
      v = v.replace(/(\d{3})(\d)/, "$1.$2");
      v = v.replace(/(\d{3})(\d)/, "$1.$2");
      v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
      setForm({ ...form, cpf: v });
    }
  };

  const enviar = async (e) => {
    e.preventDefault();
    if (!form.vaga) return alert("Selecione uma vaga!");
    if (form.cpf.length !== 14) return alert("CPF Inválido!");
    try {
      await axios.post(`${API_URL}/inscrever`, form);
      setShowModal(true);
      setForm({ nome: '', email: '', whats: '', cpf: '', data: '', turno: '', vaga: '' });
      fetchStatus();
    } catch (err) { setMsg(err.response?.data?.message || 'Erro'); }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <header style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#1e3a8a', marginBottom: '8px' }}>Reserva de Vagas - Abril</h1>
          <p style={{ color: '#64748b' }}>Vagas disponíveis: <strong>{60 - db.totalGeral}</strong></p>
        </header>

        <form onSubmit={enviar}>
          {/* Grid de Inputs Preservado - Agora com 4 campos */}
          <div style={gridInputStyle}>
            <input style={inputStyle} type="text" placeholder="Nome Completo" required value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} />
            <input style={inputStyle} type="text" placeholder="CPF (000.000.000-00)" required value={form.cpf} onChange={handleCpf} />
            <input style={inputStyle} type="email" placeholder="E-mail" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            <input style={inputStyle} type="text" placeholder="WhatsApp" required value={form.whats} onChange={e => setForm({...form, whats: e.target.value})} />
          </div>

          <h3 style={{ color: '#334155', marginBottom: '20px' }}>Selecione o dia e uma das 6 vagas:</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            {AGENDA.map(item => (
              <div key={item.data} style={dayBoxStyle}>
                <div style={dayHeaderStyle}>{item.dia}, {item.data}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  {TURNOS.map(turno => (
                    <div key={turno}>
                      <div style={turnoTitleStyle}>{turno} ({turno === 'Manhã' ? '09h-11h' : '15h-17h'})</div>
                      <div style={vagasGridStyle}>
                        {VAGAS_LISTA.map(v => {
                          const ocupado = db.ocupados.includes(`${item.data}-${turno}-${v}`);
                          const selecionado = form.data === item.data && form.turno === turno && form.vaga === v;
                          return (
                            <button key={v} type="button" disabled={ocupado}
                              onClick={() => setForm({...form, data: item.data, turno, vaga: v})}
                              style={{
                                ...vagaButtonStyle,
                                backgroundColor: ocupado ? '#fee2e2' : (selecionado ? '#dbeafe' : '#f0fdf4'),
                                color: ocupado ? '#991b1b' : (selecionado ? '#1e40af' : '#166534'),
                                border: selecionado ? '2px solid #2563eb' : '1px solid #e2e8f0',
                                cursor: ocupado ? 'not-allowed' : 'pointer'
                              }}
                            > {v} {ocupado ? '✘' : ''} </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button type="submit" style={submitButtonStyle}>Confirmar Reserva</button>
        </form>
        {msg && <p style={{ textAlign: 'center', color: '#dc2626', marginTop: '15px' }}>{msg}</p>}
      </div>

      {showModal && (
        <div style={overlayStyle} onClick={() => setShowModal(false)}>
          <div style={modalStyle}>
            <div style={{ fontSize: '50px' }}>✅</div>
            <h2 style={{ margin: '15px 0' }}>Tudo certo!</h2>
            <p>Sua vaga foi reservada com sucesso.</p>
            <button style={btnModalStyle}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Estilos Originais Preservados
const containerStyle = { background: '#f1f5f9', minHeight: '100vh', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' };
const cardStyle = { maxWidth: '850px', margin: '0 auto', background: 'white', borderRadius: '20px', padding: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' };
const gridInputStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '40px' };
const inputStyle = { padding: '14px', border: '1px solid #cbd5e1', borderRadius: '10px', outline: 'none' };
const dayBoxStyle = { border: '1px solid #f1f5f9', background: '#f8fafc', borderRadius: '12px', padding: '20px' };
const dayHeaderStyle = { fontWeight: 'bold', color: '#1e293b', marginBottom: '15px', borderLeft: '4px solid #2563eb', paddingLeft: '10px' };
const turnoTitleStyle = { fontSize: '11px', color: '#64748b', marginBottom: '10px', fontWeight: '600', textTransform: 'uppercase' };
const vagasGridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' };
const vagaButtonStyle = { padding: '10px', borderRadius: '8px', fontSize: '13px', transition: 'all 0.2s' };
const submitButtonStyle = { width: '100%', marginTop: '40px', padding: '18px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' };
const overlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)', zIndex: 100 };
const modalStyle = { background: 'white', padding: '40px', borderRadius: '24px', textAlign: 'center', width: '90%', maxWidth: '400px' };
const btnModalStyle = { marginTop: '20px', padding: '12px 40px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold' };

export default App;