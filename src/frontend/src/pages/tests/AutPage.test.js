/* eslint-disable testing-library/no-wait-for-multiple-assertions */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AuthPage from '../AuthPage';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';

jest.mock('axios');
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('Componente AuthPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza o formulário de login por padrão', () => {
    renderWithRouter(<AuthPage />);
    expect(screen.getByPlaceholderText(/RA/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Senha/i)).toBeInTheDocument();
    expect(screen.getByText(/Entrar/i)).toBeInTheDocument();
  });

  it('troca para o formulário de cadastro', () => {
    renderWithRouter(<AuthPage />);
    fireEvent.click(screen.getByText(/Não tem conta\? Cadastre-se/i));
    expect(screen.getByPlaceholderText(/Nome/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
    expect(screen.getByText(/Cadastrar/i)).toBeInTheDocument();
  });

  it('exibe erro de validação de email quando email é inválido', () => {
    renderWithRouter(<AuthPage />);
    fireEvent.click(screen.getByText(/Cadastre-se/i));
    const emailInput = screen.getByPlaceholderText(/Email/i);
    fireEvent.change(emailInput, { target: { value: 'emailinvalido' } });
    expect(screen.getByText(/Email inválido/i)).toBeInTheDocument();
  });

  it('submete o login e navega em caso de sucesso', async () => {
    axios.post.mockResolvedValueOnce({
      data: { usuario: { RA: '12345', nome: 'Usuário Teste' } },
    });

    renderWithRouter(<AuthPage />);
    fireEvent.change(screen.getByPlaceholderText(/RA/i), { target: { value: '12345' } });
    fireEvent.change(screen.getByPlaceholderText(/Senha/i), { target: { value: 'senha123' } });
    fireEvent.click(screen.getByText(/Entrar/i));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('http://localhost:5000/api/login', {
        RA: '12345',
        senha: 'senha123',
      });
      expect(mockedNavigate).toHaveBeenCalledWith('/home');
    });
  });

  it('exibe alerta em caso de falha no login', async () => {
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    axios.post.mockRejectedValueOnce({
      response: { data: { message: 'Credenciais inválidas' } },
    });

    renderWithRouter(<AuthPage />);
    fireEvent.change(screen.getByPlaceholderText(/RA/i), { target: { value: '12345' } });
    fireEvent.change(screen.getByPlaceholderText(/Senha/i), { target: { value: 'senha123' } });
    fireEvent.click(screen.getByText(/Entrar/i));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Credenciais inválidas');
    });
  });
});
