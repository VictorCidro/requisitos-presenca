import React, { useEffect, useState, useRef } from 'react';

export default function HistoricoPresenca() {
  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = user?.perfil === 'adm';

  const [oficinas, setOficinas] = useState([]);
  const [oficinaSelecionada, setOficinaSelecionada] = useState(null);
  const [buscaOficina, setBuscaOficina] = useState('');
  const [dropdownAbertoOficina, setDropdownAbertoOficina] = useState(false);

  const [alunos, setAlunos] = useState([]);
  const [filtroAluno, setFiltroAluno] = useState('');
  const [alunoSelecionado, setAlunoSelecionado] = useState('');
  const [presencas, setPresencas] = useState([]);

  const refDropdown = useRef(null);

  useEffect(() => {
    async function fetchOficinas() {
      try {
        const res = await fetch(`http://localhost:5000/api/oficinas`);
        const data = await res.json();
        setOficinas(data);
      } catch (error) {
        console.error('Erro ao buscar oficinas:', error);
      }
    }
    fetchOficinas();
  }, []);

  useEffect(() => {
    function handleClickFora(event) {
      if (refDropdown.current && !refDropdown.current.contains(event.target)) {
        setDropdownAbertoOficina(false);
      }
    }
    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, []);

  useEffect(() => {
    async function fetchAlunos() {
      if (!oficinaSelecionada) return;
      try {
        const res = await fetch(`http://localhost:5000/api/usuarios-por-oficina?oficina_id=${oficinaSelecionada.id}`);
        const data = await res.json();
        setAlunos(data);
      } catch (error) {
        console.error('Erro ao buscar alunos:', error);
      }
    }
    if (isAdmin && oficinaSelecionada) fetchAlunos();
  }, [oficinaSelecionada, isAdmin]);

  useEffect(() => {
    async function fetchPresencas() {
      try {
        let url = `http://localhost:5000/api/historico-presenca?`;

        if (isAdmin) {
          if (alunoSelecionado) url += `usuario_id=${alunoSelecionado}&`;
          if (oficinaSelecionada) url += `oficina_id=${oficinaSelecionada.id}&`;
        } else {
          url += `usuario_id=${user.id}`;
          if (oficinaSelecionada) url += `&oficina_id=${oficinaSelecionada.id}`;
        }

        const res = await fetch(url);
        const data = await res.json();
        setPresencas(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Erro ao buscar histórico de presença:', error);
      }
    }
    fetchPresencas();
  }, [alunoSelecionado, oficinaSelecionada, user.id, isAdmin]);

  const handleSelecionarOficina = (oficina) => {
    setOficinaSelecionada(oficina);
    if (oficina) {
      setBuscaOficina(`${oficina.nome} - ${oficina.codigo}`);
    } else {
      setBuscaOficina('Todas');
    }
    setDropdownAbertoOficina(false);
    setAlunoSelecionado('');
  };

  const oficinasFiltradas = oficinas.filter((o) =>
    `${o.nome} - ${o.codigo}`.toLowerCase().includes(buscaOficina.toLowerCase())
  );

  const alunosFiltrados = alunos.filter((a) =>
    a.nome.toLowerCase().includes(filtroAluno.toLowerCase())
  );

  async function handleRemoverPresenca(presencaId) {
    if (!window.confirm('Tem certeza que deseja remover esta presença?')) return;

    try {
      const res = await fetch(`http://localhost:5000/api/presenca/${presencaId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setPresencas(prev => prev.filter(p => p.id !== presencaId));
      } else {
        alert('Erro ao remover presença.');
      }
    } catch (err) {
      console.error('Erro ao remover presença:', err);
      alert('Erro ao remover presença.');
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: 'auto', padding: 20 }}>
      <h1>Histórico de Presenças</h1>

      <div ref={refDropdown} style={{ position: 'relative', marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Selecione a oficina"
          value={buscaOficina}
          onClick={() => setDropdownAbertoOficina(true)}
          onChange={(e) => {
            setBuscaOficina(e.target.value);
            setDropdownAbertoOficina(true);
          }}
          style={{ width: '100%', padding: 10, borderRadius: 4, border: '1px solid #ccc' }}
        />
        {dropdownAbertoOficina && (
          <div style={{
            position: 'absolute',
            width: '100%',
            background: 'white',
            border: '1px solid #ccc',
            maxHeight: 200,
            overflowY: 'auto',
            zIndex: 10
          }}>
            <div
              style={dropdownItemStyle}
              onClick={() => handleSelecionarOficina(null)}
            >
              Todas
            </div>
            {oficinasFiltradas.map((oficina) => (
              <div
                key={oficina.id}
                style={dropdownItemStyle}
                onClick={() => handleSelecionarOficina(oficina)}
              >
                {oficina.nome} - {oficina.codigo}
              </div>
            ))}
          </div>
        )}
      </div>

      {isAdmin && oficinaSelecionada && (
        <>
          <input
            type="text"
            list="alunos"
            value={filtroAluno}
            onChange={e => {
              const valor = e.target.value;
              setFiltroAluno(valor);
              const aluno = alunos.find(a => a.nome === valor);
              if (aluno) {
                setAlunoSelecionado(aluno.id);
              } else {
                setAlunoSelecionado('');
              }
            }}
            placeholder="Filtrar e selecionar aluno"
            style={{ width: '100%', padding: 8, marginBottom: 10 }}
          />

          <datalist id="alunos">
            {alunosFiltrados.map(aluno => (
              <option key={aluno.id} value={aluno.nome}>
                {aluno.nome} ({aluno.email})
              </option>
            ))}
          </datalist>
        </>
      )}


      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 30 }}>
        <thead>
          <tr>
            {isAdmin && <th style={thStyle}>Aluno</th>}
            <th style={thStyle}>Oficina</th>
            <th style={thStyle}>Código</th>
            <th style={thStyle}>Data</th>
            {isAdmin && <th style={thStyle}>Ações</th>}
          </tr>
        </thead>
        <tbody>
          {presencas.length === 0 ? (
            <tr>
              <td colSpan={isAdmin ? 5 : 4} style={{ textAlign: 'center', padding: 20 }}>
                Nenhuma presença encontrada.
              </td>
            </tr>
          ) : (
            presencas.map(p => (
              <tr key={p.id}>
                {isAdmin && <td style={tdStyle}>{p.usuario_nome}</td>}
                <td style={tdStyle}>{p.oficina_nome}</td>
                <td style={tdStyle}>{p.oficina_codigo}</td>
                <td style={tdStyle}>{new Date(p.data_presenca).toLocaleString()}</td>
                {isAdmin && (
                  <td style={tdStyle}>
                    <button
                      onClick={() => handleRemoverPresenca(p.id)}
                      style={{
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      <span className="material-symbols-outlined">
                        delete
                      </span>
                    </button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = {
  borderBottom: '2px solid #ccc',
  padding: 10,
  textAlign: 'left',
  backgroundColor: '#f8f8f8'
};

const tdStyle = {
  borderBottom: '1px solid #ddd',
  padding: 10
};

const dropdownItemStyle = {
  padding: '10px',
  borderBottom: '1px solid #eee',
  cursor: 'pointer'
};
