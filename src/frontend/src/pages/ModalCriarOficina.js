import React, { useState } from 'react';

export default function ModalCriarOficina({ onClose }) {
  const [nomeOficina, setNomeOficina] = useState('');
  const [codigo, setCodigo] = useState('');
  const [professor, setProfessor] = useState('');
  const [closeHover, setCloseHover] = useState(false);

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/oficinas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nomeOficina, codigo, professor })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`Erro: ${data.message}`);
        return;
      }

      console.log('Oficina criada:', data);
      alert('Oficina criada com sucesso!');
      onClose();
    } catch (error) {
      alert('Erro ao se conectar com o servidor');
      console.error(error);
    }
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0 0 14px' }}>
          <h2 style={{ margin: '0' }}>Criar Oficina</h2>
          <button
            onClick={onClose}
            style={{ border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: closeHover ? '#6444af' : 'black', transition: 'color 0.3s ease' }}
            onMouseEnter={() => setCloseHover(true)}
            onMouseLeave={() => setCloseHover(false)}
          >
            <span className="material-symbols-outlined">
              close
            </span>
          </button>
        </div>
        <div style={{ gap: '8px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ marginBottom: '8px' }}>Nome da oficina:</span>
            <input
              type="text"
              placeholder="Digite o nome da oficina..."
              value={nomeOficina}
              onChange={(e) => setNomeOficina(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ marginBottom: '8px' }}>Código da oficina:</span>
            <input
              placeholder="Digite o código da oficina..."
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ marginBottom: '8px' }}>Nome do professor:</span>
            <input
              placeholder="Digite o nome do professor..."
              value={professor}
              onChange={(e) => setProfessor(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <button onClick={handleSubmit} style={buttonStyle}>Criar</button>
          </div>
        </div>

      </div>
    </div>
  );
}

const modalOverlayStyle = {
  position: 'fixed',
  top: 0, left: 0,
  width: '100vw', height: '100vh',
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 999
};

const modalStyle = {
  backgroundColor: 'white',
  padding: 20,
  borderRadius: 8,
  width: 400,
  boxShadow: '0 0 10px rgba(0,0,0,0.3)'
};

const inputStyle = {
  padding: 10,
  marginBottom: 10,
  borderRadius: 4,
  border: '1px solid #ccc',
  outline: 'none'
};

const buttonStyle = {
  width: '70%',
  padding: '10px 20px',
  fontSize: 16,
  cursor: 'pointer',
  borderRadius: 4,
  border: '1px solid #6444af',
  backgroundColor: '#6444af',
  color: 'white'
};
