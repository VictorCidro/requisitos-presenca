/* eslint-disable testing-library/no-wait-for-multiple-assertions */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ModalMatricularOficina from '../ModalMatricularOficina';

beforeAll(() => {
  jest.spyOn(window, 'alert').mockImplementation(() => {});
});

afterAll(() => {
  window.alert.mockRestore();
});

beforeEach(() => {
  const user = { id: 1, nome: 'Teste' };
  window.localStorage.setItem('user', JSON.stringify(user));
});

afterEach(() => {
  window.localStorage.clear();
  jest.resetAllMocks();
});

global.fetch = jest.fn();

const oficinasMock = [
  { codigo: 'OF001', nome: 'Oficina React', professor: 'Prof. A' },
  { codigo: 'OF002', nome: 'Oficina Vue', professor: 'Prof. B' },
];

test('modal funciona com busca, seleção e matrícula', async () => {
  const onCloseMock = jest.fn();

  fetch.mockImplementation((url, options) => {
    if (url.endsWith('/api/oficinas')) {
      return Promise.resolve({
        json: () => Promise.resolve(oficinasMock),
      });
    }
    if (url.endsWith('/api/matriculas')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Sucesso' }),
      });
    }
  });

  render(<ModalMatricularOficina onClose={onCloseMock} />);

  expect(screen.getByText(/Matricular-se em Oficina/i)).toBeInTheDocument();

  const input = screen.getByPlaceholderText(/Digite o nome da oficina/i);
  expect(input).toBeInTheDocument();
  expect(input.value).toBe('');

  fireEvent.click(input);
  await waitFor(() => {
    expect(screen.getByText(/Oficina React - OF001/i)).toBeInTheDocument();
    expect(screen.getByText(/Oficina Vue - OF002/i)).toBeInTheDocument();
  });

  fireEvent.change(input, { target: { value: 'Vue' } });
  await waitFor(() => {
    expect(screen.queryByText(/Oficina React - OF001/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Oficina Vue - OF002/i)).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText(/Oficina Vue - OF002/i));
  expect(input.value).toBe('Oficina Vue');

  expect(screen.getByText('Prof. B')).toBeInTheDocument();

  const btnMatricular = screen.getByRole('button', { name: /Matricular-se/i });
  expect(btnMatricular).toBeEnabled();

  fireEvent.click(btnMatricular);

  await waitFor(() => expect(onCloseMock).toHaveBeenCalled());

  const btnFechar = screen.getByRole('button', { name: /close/i, hidden: true }) || screen.getByText('close');
  fireEvent.click(btnFechar);
  expect(onCloseMock).toHaveBeenCalledTimes(2);
});
