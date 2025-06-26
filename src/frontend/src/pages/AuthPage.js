import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import registrarImg from '../../src/assets/registrar.png';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [RA, setRa] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      if (isLogin) {
        const response = await axios.post('http://localhost:5000/api/login', { RA, senha });
        
        localStorage.setItem('user', JSON.stringify(response.data.usuario));
        navigate('/home');
      } else {
        await axios.post('http://localhost:5000/api/register', { RA, senha, nome, email });

        setNome('');
        setEmail('');
        setSenha('');
        setRa('');
        alert('Cadastro realizado com sucesso!');
        setIsLogin(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Erro na operação');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <div style={{
        flex: 1,
        backgroundColor: '#f0f4f8',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '40px'
      }}>
        <h2 style={{ marginBottom: 20 }}>{isLogin ? 'Login' : 'Cadastro'}</h2>

        <input
          placeholder="RA"
          value={RA}
          onChange={(e) => setRa(e.target.value)}
          style={{ display: 'block', margin: '10px 0', padding: 10, fontSize: 16, outline: 'none' }}
        />

        {!isLogin && (
          <>
            <input
              placeholder="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              style={{ display: 'block', margin: '10px 0', padding: 10, fontSize: 16, outline: 'none' }}
            />
            <input
              placeholder="Email"
              value={email}
              onChange={(e) => {
                const val = e.target.value;
                setEmail(val);
                setEmailError(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) ? 'Email inválido' : '');
              }}
              style={{ display: 'block', margin: '10px 0', padding: 10, fontSize: 16, outline: 'none' }}
            />
            {emailError && <span style={{ color: 'red' }}>{emailError}</span>}
          </>
        )}

        <input
          placeholder="Senha"
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          style={{ display: 'block', margin: '10px 0', padding: 10, fontSize: 16, outline: 'none' }}
        />

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={handleSubmit}
            style={{
              width: '90%',
              padding: 12,
              marginTop: 20,
              marginBottom: 10,
              backgroundColor: '#6444af',
              color: 'white',
              fontSize: 16,
              border: 'none',
              cursor: 'pointer',
              borderRadius: 4,
              fontWeight: 'bold'
            }}
          >
            {isLogin ? 'Entrar' : 'Cadastrar'}
          </button>
        </div>

        <button
          onClick={() => setIsLogin(!isLogin)}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            color: '#28137d',
            cursor: 'pointer',
            fontSize: 14,
            textDecoration: 'underline'
          }}
        >
          {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
        </button>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '50%',
      }}>
        <img
          src={registrarImg}
          alt="Registrar"
          style={{
            maxWidth: '80%',
            maxHeight: '80%',
            objectFit: 'contain'
          }}
        />
      </div>
    </div>
  );
}
