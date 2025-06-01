import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <header style={{
      backgroundColor: '#6444af',
      padding: '8px 16px',
      color: 'white',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '16px',
      height: '50px'
    }}>
      <h1 style={{ margin: 0, fontSize: '20px' }}>Registro de Presença</h1>
      <nav style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link to="/home" style={{ color: 'white', textDecoration: 'none' }}>Home</Link>
        <button
          onClick={handleLogout}
          style={{
            background: 'transparent',
            border: '1px solid white',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Sair
        </button>
      </nav>
    </header>
  );
}
