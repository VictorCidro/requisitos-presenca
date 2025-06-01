import React from 'react';

export default function Home() {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

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
            <button style={buttonStyle}>Inscreva-se na Oficina</button>
            <button style={buttonStyle}>Registrar Presença</button>
          </>
        )}

        {user.perfil === 'adm' && (
          <>
            <button style={buttonStyle}>Criar Oficina</button>
          </>
        )}
        <button style={buttonStyle}>Histórico de Presença</button>
      </div>
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
