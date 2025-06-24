import React, { useState, useEffect, useRef } from 'react';

export default function ModalMatricularOficina({ onClose }) {
  const [busca, setBusca] = useState('');
  const [oficinas, setOficinas] = useState([]);
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [selecionada, setSelecionada] = useState(null);
  const [loading, setLoading] = useState(false);
  const [closeHover, setCloseHover] = useState(false);
  const containerRef = useRef(null);
  const user = localStorage.getItem('user');
  const usuarioId = user ? JSON.parse(user) : null;

  useEffect(() => {
    const fetchOficinas = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/oficinas');
        const data = await response.json();
        setOficinas(data);
      } catch (error) {
        console.error('Erro ao buscar oficinas:', error);
      }
    };
    fetchOficinas();
  }, []);

  useEffect(() => {
    function handleClickFora(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setDropdownAberto(false);
      }
    }
    document.addEventListener('mousedown', handleClickFora);
    return () => {
      document.removeEventListener('mousedown', handleClickFora);
    };
  }, []);

  const oficinasFiltradas = oficinas.filter(oficina =>
    (oficina?.nome || '').toLowerCase().includes(busca.toLowerCase())
  );

  const handleSelecionar = (oficina) => {
    setSelecionada(oficina);
    setBusca(oficina.nome);
    setDropdownAberto(false);
  };

  const handleMatricular = async () => {
    if (!selecionada) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/matriculas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: usuarioId?.id,
          oficina_id: selecionada.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`Erro: ${data.message || 'Não foi possível matricular.'}`);
      } else {
        alert('Matrícula realizada com sucesso!');
        onClose();
      }
    } catch (error) {
      alert('Erro ao conectar com o servidor.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ margin: 0 }}>Matricular-se em Oficina</h2>
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

        <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
          <input
            type="text"
            placeholder="Digite o nome da oficina..."
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              setDropdownAberto(true);
              setSelecionada(null);
            }}
            onClick={() => setDropdownAberto(true)}
            style={inputStyle}
            disabled={loading}
          />

          {dropdownAberto && (
            <div style={dropdownStyle}>
              {oficinasFiltradas.length > 0 ? (
                oficinasFiltradas.map((oficina) => (
                  <div
                    key={oficina.codigo}
                    onClick={() => handleSelecionar(oficina)}
                    style={dropdownItemStyle}
                  >
                    {oficina.nome} - {oficina.codigo}
                  </div>
                ))
              ) : (
                <div style={{ padding: 10, color: '#999' }}>Nenhuma oficina encontrada</div>
              )}
            </div>
          )}
        </div>

        {selecionada && (
          <div style={{ marginTop: 20 }}>
            <div>
              <strong>Oficina:</strong> {selecionada.nome} - {selecionada.codigo}
            </div>
            <div>
              <strong>Professor:</strong> {selecionada.professor}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '35px' }}>
          <button
            disabled={!selecionada || loading}
            style={!selecionada || loading ? buttonDisabledStyle : buttonStyle}
            onClick={handleMatricular}
          >
            {loading ? 'Matriculando...' : 'Matricular-se'}
          </button>
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
  boxShadow: '0 0 10px rgba(0,0,0,0.3)',
  maxHeight: '90vh',
  overflow: 'hidden',
};

const inputStyle = {
  padding: 10,
  borderRadius: 4,
  border: '1px solid #ccc',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box'
};

const dropdownStyle = {
  top: '100%',
  left: 0,
  right: 0,
  backgroundColor: 'white',
  border: '1px solid #ccc',
  borderTop: 'none',
  maxHeight: 200,
  overflowY: 'auto',
  zIndex: 1000,
  borderRadius: '0 0 4px 4px',
};

const dropdownItemStyle = {
  padding: 10,
  cursor: 'pointer',
  borderBottom: '1px solid #eee',
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
