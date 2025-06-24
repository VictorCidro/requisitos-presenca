import React, { useState } from 'react';
import ModalCriarOficina from './ModalCriarOficina';
import ModalMatricularOficina from './ModalMatricularOficina';
import ModalRegistrarPresenca from './ModalRegistrarPresenca';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const [showModalCriarOficina, setShowModalCriarOficina] = useState(false);
  const [showModalMatricula, setShowModalMatricula] = useState(false);
  const [showModalRegistrarPresenca, setShowModalRegistrarPresenca] = useState(false);
  const navigate = useNavigate();

  if (!user) {
    return <h1>Usuário não encontrado. Por favor, faça login.</h1>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Seja bem-vindo, {user.nome.toUpperCase()}</h1>
      <div style={{
        marginTop: 60,
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        alignItems: 'center'
      }}>

        {user.perfil === 'aluno' && (
          <>
            <button style={buttonStyle} onClick={() => setShowModalMatricula(true)}>Inscreva-se na Oficina</button>
            <button style={buttonStyle} onClick={() => setShowModalRegistrarPresenca(true)}>Registrar Presença</button>
          </>
        )}

        {user.perfil === 'adm' && (
          <>
            <button style={buttonStyle} onClick={() => setShowModalCriarOficina(true)}>Criar Oficina</button>
          </>
        )}
        <button style={buttonStyle} onClick={() => navigate('/historic')}>Histórico de Presença</button>
      </div>
      {showModalCriarOficina && <ModalCriarOficina onClose={() => setShowModalCriarOficina(false)} />}
      {showModalMatricula && (<ModalMatricularOficina onClose={() => setShowModalMatricula(false)} />)}
      {showModalRegistrarPresenca && (<ModalRegistrarPresenca onClose={() => setShowModalRegistrarPresenca(false)} />)}

    </div>
  );
}

const buttonStyle = {
  padding: '10px 20px',
  marginRight: 10,
  marginBottom: 10,
  fontSize: 16,
  cursor: 'pointer',
  borderRadius: 4,
  border: '1px solid #6444af',
  backgroundColor: '#6444af',
  color: 'white',
  width: '50%'
};
