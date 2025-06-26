/* eslint-disable testing-library/no-node-access */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Home from '../Home';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Home', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('mostra mensagem quando não há usuário', () => {
    render(<Home />, { wrapper: MemoryRouter });
    expect(screen.getByText(/usuário não encontrado/i)).toBeInTheDocument();
  });

  test('renderiza botões para usuário aluno e abre modais', () => {
    localStorage.setItem('user', JSON.stringify({ nome: 'Victor', perfil: 'aluno' }));

    render(<Home />, { wrapper: MemoryRouter });

    expect(screen.getByText(/seja bem-vindo, victor/i)).toBeInTheDocument();

    const btnMatricula = screen.getByRole('button', { name: /inscreva-se na oficina/i });
    const btnPresenca = screen.getByRole('button', { name: /registrar presença/i });
    const btnHistorico = screen.getByRole('button', { name: /histórico de presença/i });

    expect(btnMatricula).toBeInTheDocument();
    expect(btnPresenca).toBeInTheDocument();
    expect(btnHistorico).toBeInTheDocument();

    fireEvent.click(btnMatricula);

    expect(screen.getByRole('heading', { name: /matricular-se em oficina/i })).toBeInTheDocument();

    fireEvent.click(screen.getByText('close').closest('button'));

    fireEvent.click(btnPresenca);

    expect(screen.getByRole('heading', { name: /registrar presença/i })).toBeInTheDocument();

    fireEvent.click(screen.getByText('close').closest('button'));
  });

  test('renderiza botão para usuário adm e abre modal criar oficina', () => {
    localStorage.setItem('user', JSON.stringify({ nome: 'Admin', perfil: 'adm' }));

    render(<Home />, { wrapper: MemoryRouter });

    expect(screen.getByText(/seja bem-vindo, admin/i)).toBeInTheDocument();

    const btnCriarOficina = screen.getByRole('button', { name: /criar oficina/i });
    const btnHistorico = screen.getByRole('button', { name: /histórico de presença/i });

    expect(btnCriarOficina).toBeInTheDocument();
    expect(btnHistorico).toBeInTheDocument();

    fireEvent.click(btnCriarOficina);

    expect(screen.getByRole('heading', { name: /criar oficina/i })).toBeInTheDocument();

    fireEvent.click(screen.getByText('close').closest('button'));
  });
});
