/* eslint-disable testing-library/no-unnecessary-act */
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import HistoricoPresenca from '../HistoricoPresenca';
import { BrowserRouter } from 'react-router-dom';

beforeEach(() => {
  Storage.prototype.getItem = jest.fn(() =>
    JSON.stringify({ id: 1, perfil: 'adm' })
  );

  global.fetch = jest.fn((url) => {
    if (url.includes('/api/oficinas')) {
      return Promise.resolve({
        json: () => Promise.resolve([]),
      });
    }
    if (url.includes('/api/presencas')) {
      return Promise.resolve({
        json: () => Promise.resolve([]),
      });
    }
    return Promise.resolve({
      json: () => Promise.resolve([]),
    });
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

const renderComponent = async () => {
  await act(async () => {
    render(
      <BrowserRouter>
        <HistoricoPresenca />
      </BrowserRouter>
    );
  });
};

test('renderiza título e campo de busca', async () => {
  await renderComponent();

  expect(screen.getByText('Histórico de Presenças')).toBeInTheDocument();

  const input = screen.getByPlaceholderText('Selecione a oficina');
  expect(input).toBeInTheDocument();
});

test('exibe mensagem de nenhuma presença encontrada', async () => {
  await renderComponent();

  await waitFor(() => {
    expect(screen.getByText('Nenhuma presença encontrada.')).toBeInTheDocument();
  });
});
