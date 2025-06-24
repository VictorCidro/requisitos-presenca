import React, { useEffect, useState, useRef } from 'react';

export default function ModalRegistrarPresenca({ onClose }) {
  const [oficinas, setOficinas] = useState([]);
  const [busca, setBusca] = useState('');
  const [selecionada, setSelecionada] = useState(null);
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [closeHover, setCloseHover] = useState(false);

  const ref = useRef(null);
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?.id;

  useEffect(() => {
    async function fetchOficinas() {
      try {
        const res = await fetch(`http://localhost:5000/api/oficinas-matriculadas?usuario_id=${userId}`);
        const data = await res.json();
        setOficinas(data);
      } catch (error) {
        console.error('Erro ao buscar oficinas:', error);
      }
    }

    fetchOficinas();
  }, [userId]);

  useEffect(() => {
    const handleClickFora = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setDropdownAberto(false);
      }
    };
    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, []);

  const filtradas = oficinas.filter((oficina) =>
    oficina.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const handleSelecionar = (oficina) => {
    setSelecionada(oficina);
    setBusca(oficina.nome);
    setDropdownAberto(false);
  };

  const handleRegistrarPresenca = async () => {
    if (!selecionada) return;

    try {
      await fetch('http://localhost:5000/api/presenca', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: userId,
          oficina_id: selecionada.id
        })
      });
      alert('Presença registrada!');
      onClose();
    } catch (error) {
      console.error('Erro ao registrar presença:', error);
      alert('Erro ao registrar presença.');
    }
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ margin: 0 }}>Registrar Presença</h2>
          <button
            onClick={onClose}
            onMouseEnter={() => setCloseHover(true)}
            onMouseLeave={() => setCloseHover(false)}
            style={{
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              color: closeHover ? '#6444af' : 'black',
              transition: 'color 0.3s ease'
            }}
          >
            <span className="material-symbols-outlined">close</span>
          </button>

        </div>
        <div ref={ref} style={{ position: 'relative' }}>
          <div style={{ display: 'flex' }}>
            <input
              type="text"
              placeholder="Selecione a oficina"
              value={busca}
              onClick={() => setDropdownAberto(true)}
              onChange={(e) => {
                setBusca(e.target.value);
                setDropdownAberto(true);
              }}
              style={input}
            />
          </div>
          {dropdownAberto && (
            <div style={dropdown}>
              {filtradas.length ? (
                filtradas.map((oficina) => (
                  <div
                    key={oficina.id}
                    style={dropdownItem}
                    onClick={() => handleSelecionar(oficina)}
                  >
                    {oficina.nome} - {oficina.codigo}
                  </div>
                ))
              ) : (
                <div style={dropdownItem}>Nenhuma oficina encontrada</div>
              )}
            </div>
          )}
        </div>

        {selecionada && (
          <div style={{ marginTop: 20 }}>
            <strong>Selecionada:</strong> {selecionada.nome} - {selecionada.codigo}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '35px' }}>
          <button
            disabled={!selecionada}
            style={!selecionada ? buttonDisabledStyle : buttonStyle}
            onClick={handleRegistrarPresenca}
          >
            Confirmar Presença
          </button>
        </div>
      </div>
    </div>
  );
}

const overlay = {
  position: 'fixed',
  top: 0, left: 0,
  width: '100vw', height: '100vh',
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 999
};

const modal = {
  background: 'white',
  padding: 20,
  borderRadius: 8,
  width: 400
};

const input = {
  width: '100%',
  padding: 10,
  border: '1px solid #ccc',
  borderRadius: 4
};

const dropdown = {
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  maxHeight: 200,
  overflowY: 'auto',
  background: 'white',
  border: '1px solid #ccc',
  borderTop: 'none',
  zIndex: 1000
};

const dropdownItem = {
  padding: 10,
  cursor: 'pointer',
  borderBottom: '1px solid #eee'
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
const buttonDisabledStyle = {
  ...buttonStyle,
  cursor: 'not-allowed',
  opacity: 0.5,
};
