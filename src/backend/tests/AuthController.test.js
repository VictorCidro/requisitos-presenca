const authController = require('../controllers/authController');
const db = require('../models/db');
const bcrypt = require('bcrypt');

jest.mock('mysql2', () => ({
  createConnection: jest.fn(() => ({
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
  })),
}));

jest.mock('../models/db');
jest.mock('bcrypt');

describe('AuthController', () => {
  let req, res;

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    console.error.mockRestore();
  });

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('deve cadastrar usuário com sucesso', async () => {
      req.body = { nome: 'Teste', email: 'teste@email.com', senha: '123456', RA: '123' };
      bcrypt.hash.mockResolvedValue('hashSenha');
      db.query.mockImplementation((sql, params, callback) => callback(null, { insertId: 1 }));

      await authController.register(req, res);

      expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10);
      expect(db.query).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Usuário cadastrado com sucesso' });
    });

    it('deve retornar erro se houver problema no banco', async () => {
      req.body = { nome: 'Teste', email: 'teste@email.com', senha: '123456', RA: '123' };
      bcrypt.hash.mockResolvedValue('hashSenha');
      db.query.mockImplementation((sql, params, callback) => callback(new Error('Erro'), null));

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'O RA e o e-mail já estão cadastrados no sistema.' })
      );
    });
  });

  describe('login', () => {
    it('deve realizar login com sucesso', async () => {
      req.body = { RA: '123', senha: '123456' };
      const hashedSenha = 'hashedSenha';
      db.query.mockImplementation((sql, params, callback) =>
        callback(null, [{ id: 1, RA: '123', senha: hashedSenha, nome: 'Teste' }])
      );
      bcrypt.compare.mockResolvedValue(true);

      await authController.login(req, res);

      expect(db.query).toHaveBeenCalled();
      expect(bcrypt.compare).toHaveBeenCalledWith('123456', hashedSenha);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Login realizado com sucesso',
          usuario: expect.objectContaining({ RA: '123', nome: 'Teste' }),
        })
      );
    });

    it('deve retornar erro 401 se usuário não encontrado', async () => {
      req.body = { RA: '123', senha: '123456' };
      db.query.mockImplementation((sql, params, callback) => callback(null, []));

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Usuário não encontrado' });
    });

    it('deve retornar erro 401 se senha incorreta', async () => {
      req.body = { RA: '123', senha: '123456' };
      db.query.mockImplementation((sql, params, callback) =>
        callback(null, [{ id: 1, RA: '123', senha: 'hash', nome: 'Teste' }])
      );
      bcrypt.compare.mockResolvedValue(false);

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Senha incorreta' });
    });

    it('deve retornar erro 500 em caso de erro no banco', async () => {
      req.body = { RA: '123', senha: '123456' };
      db.query.mockImplementation((sql, params, callback) => callback(new Error('Erro'), null));

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(Error) }));
    });
  });

  describe('getOficinas', () => {
    it('deve retornar lista de oficinas', async () => {
      const mockResults = [{ id: 1, nome: 'Oficina 1' }];
      db.query.mockImplementation((sql, callback) => callback(null, mockResults));

      await authController.getOficinas(req, res);

      expect(db.query).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResults);
    });

    it('deve retornar erro 500 se banco falhar', async () => {
      db.query.mockImplementation((sql, callback) => callback(new Error('Erro'), null));

      await authController.getOficinas(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Erro ao buscar oficinas' }));
    });
  });

  describe('criarOficina', () => {
    it('deve retornar 400 se faltar algum campo', async () => {
      req.body = { nomeOficina: '', codigo: 'C1', professor: 'Prof' };

      await authController.criarOficina(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Todos os campos são obrigatórios.' });
    });

    it('deve retornar 409 se código da oficina já existir', async () => {
      req.body = { nomeOficina: 'Oficina X', codigo: 'C1', professor: 'Prof' };
      db.query.mockImplementationOnce((sql, params, callback) => callback(null, [{ id: 1 }]));

      await authController.criarOficina(req, res);

      expect(db.query).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: 'Código da oficina já existe.' });
    });

    it('deve criar oficina com sucesso', async () => {
      req.body = { nomeOficina: 'Oficina X', codigo: 'C1', professor: 'Prof' };
      db.query
        .mockImplementationOnce((sql, params, callback) => callback(null, [])) // verificação de código
        .mockImplementationOnce((sql, params, callback) => callback(null, { insertId: 123 })); // inserção

      await authController.criarOficina(req, res);

      expect(db.query).toHaveBeenCalledTimes(2);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Oficina criada com sucesso', oficinaId: 123 });
    });

    it('deve retornar erro 500 se erro ao verificar código', async () => {
      req.body = { nomeOficina: 'Oficina X', codigo: 'C1', professor: 'Prof' };
      db.query.mockImplementationOnce((sql, params, callback) => callback(new Error('Erro'), null));

      await authController.criarOficina(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Erro ao verificar o código.' }));
    });

    it('deve retornar erro 500 se erro ao criar oficina', async () => {
      req.body = { nomeOficina: 'Oficina X', codigo: 'C1', professor: 'Prof' };
      db.query
        .mockImplementationOnce((sql, params, callback) => callback(null, []))
        .mockImplementationOnce((sql, params, callback) => callback(new Error('Erro'), null));

      await authController.criarOficina(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Erro ao criar oficina.' }));
    });
  });
});
