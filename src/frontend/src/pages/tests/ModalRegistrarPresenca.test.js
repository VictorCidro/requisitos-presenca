/* eslint-disable testing-library/no-wait-for-multiple-assertions */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ModalRegistrarPresenca from '../ModalRegistrarPresenca';

beforeAll(() => {
  jest.spyOn(window, 'alert').mockImplementation(() => {});
});

afterAll(() => {
  window.alert.mockRestore();
});

beforeEach(() => {
  const user = { id: 1, nome: 'Usuário Teste' };
  window.localStorage.setItem('user', JSON.stringify(user));
});

afterEach(() => {
  window.localStorage.clear();
  jest.resetAllMocks();
});

global.fetch = jest.fn();

const oficinasMock = [
  { id: 1, nome: 'Oficina de React', codigo: 'OF001' },
  { id: 2, nome: 'Oficina de Vue', codigo: 'OF002' },
];

test('renderiza o modal e interage com input, dropdown e botão', async () => {
  const onCloseMock = jest.fn();

  fetch.mockImplementation((url) => {
    if (url.includes('/api/oficinas-matriculadas')) {
      return Promise.resolve({
        json: () => Promise.resolve(oficinasMock),
      });
    }
    if (url.includes('/api/presenca')) {
      return Promise.resolve({ ok: true });
    }
  });

  render(<ModalRegistrarPresenca onClose={onCloseMock} />);

  expect(screen.getByText(/Registrar Presença/i)).toBeInTheDocument();

  const input = screen.getByPlaceholderText(/Selecione a oficina/i);
  expect(input).toBeInTheDocument();
  expect(input.value).toBe('');

  fireEvent.click(input);

  await waitFor(() => {
    expect(screen.getByText(/Oficina de React - OF001/i)).toBeInTheDocument();
    expect(screen.getByText(/Oficina de Vue - OF002/i)).toBeInTheDocument();
  });

  fireEvent.change(input, { target: { value: 'Vue' } });

  await waitFor(() => {
    expect(screen.queryByText(/Oficina de React - OF001/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Oficina de Vue - OF002/i)).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText(/Oficina de Vue - OF002/i));

  expect(input.value).toBe('Oficina de Vue');

  const btnConfirmar = screen.getByRole('button', { name: /Confirmar Presença/i });
  expect(btnConfirmar).toBeEnabled();

  fireEvent.click(btnConfirmar);

  await waitFor(() => expect(onCloseMock).toHaveBeenCalled());

  const btnFechar = screen.getByRole('button', { name: /close/i, hidden: true }) || screen.getByText('close');
  fireEvent.click(btnFechar);
  expect(onCloseMock).toHaveBeenCalledTimes(2);
});
