/* eslint-disable testing-library/no-wait-for-multiple-assertions */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ModalCriarOficina from '../ModalCriarOficina';

global.fetch = jest.fn();

describe('ModalCriarOficina', () => {
  const onCloseMock = jest.fn();
  const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

  beforeEach(() => {
    fetch.mockClear();
    onCloseMock.mockClear();
    alertMock.mockClear();
  });

  it('deve renderizar os campos e permitir criar oficina', async () => {
    render(<ModalCriarOficina onClose={onCloseMock} />);

    const inputNome = screen.getByPlaceholderText(/digite o nome da oficina/i);
    const inputCodigo = screen.getByPlaceholderText(/digite o código da oficina/i);
    const inputProfessor = screen.getByPlaceholderText(/digite o nome do professor/i);
    const btnCriar = screen.getByRole('button', { name: /criar/i });

    fireEvent.change(inputNome, { target: { value: 'Oficina Teste' } });
    fireEvent.change(inputCodigo, { target: { value: 'OF123' } });
    fireEvent.change(inputProfessor, { target: { value: 'Prof. Teste' } });

    expect(inputNome.value).toBe('Oficina Teste');
    expect(inputCodigo.value).toBe('OF123');
    expect(inputProfessor.value).toBe('Prof. Teste');

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, nome: 'Oficina Teste', codigo: 'OF123', professor: 'Prof. Teste' }),
    });

    fireEvent.click(btnCriar);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/oficinas',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nomeOficina: 'Oficina Teste',
            codigo: 'OF123',
            professor: 'Prof. Teste',
          }),
        })
      );

      expect(alertMock).toHaveBeenCalledWith('Oficina criada com sucesso!');
      expect(onCloseMock).toHaveBeenCalled();
    });
  });

  it('deve mostrar alerta de erro quando API falhar', async () => {
    render(<ModalCriarOficina onClose={onCloseMock} />);

    fireEvent.change(screen.getByPlaceholderText(/digite o nome da oficina/i), { target: { value: 'Teste' } });
    fireEvent.change(screen.getByPlaceholderText(/digite o código da oficina/i), { target: { value: 'OF999' } });
    fireEvent.change(screen.getByPlaceholderText(/digite o nome do professor/i), { target: { value: 'Prof. Error' } });

    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Erro ao criar' }),
    });

    fireEvent.click(screen.getByRole('button', { name: /criar/i }));

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Erro: Erro ao criar');
      expect(onCloseMock).not.toHaveBeenCalled();
    });
  });
});
