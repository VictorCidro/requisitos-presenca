const db = require('../models/db');
const bcrypt = require('bcrypt');

exports.register = async (req, res) => {
  const { nome, email, senha, RA } = req.body;
  const hash = await bcrypt.hash(senha, 10);
  const sql = 'INSERT INTO usuarios (nome, email, senha, RA) VALUES (?, ?, ?, ?)';
  db.query(sql, [nome, email, hash, RA], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'O RA e o e-mail já estão cadastrados no sistema.', error: err });
    }
    res.status(201).json({ message: 'Usuário cadastrado com sucesso' });
  });
};

exports.login = (req, res) => {
  const { RA, senha } = req.body;
  const sql = 'SELECT * FROM usuarios WHERE RA = ?';
  db.query(sql, [RA], async (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(401).json({ message: 'Usuário não encontrado' });

    const valid = await bcrypt.compare(senha, results[0].senha);
    if (!valid) return res.status(401).json({ message: 'Senha incorreta' });

    const usuarioSemSenha = { ...results[0] };
    delete usuarioSemSenha.senha;

    res.status(200).json({ message: 'Login realizado com sucesso', usuario: usuarioSemSenha });
  });
};

exports.criarOficina = (req, res) => {
  const { nomeOficina, codigo, professor } = req.body;

  if (!nomeOficina || !codigo || !professor) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  const checkSql = 'SELECT id FROM oficinas WHERE codigo = ?';
  db.query(checkSql, [codigo], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao verificar o código.', error: err });
    }

    if (results.length > 0) {
      return res.status(409).json({ message: 'Código da oficina já existe.' });
    }

    const insertSql = 'INSERT INTO oficinas (nome, codigo, professor) VALUES (?, ?, ?)';
    db.query(insertSql, [nomeOficina, codigo, professor], (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Erro ao criar oficina.', error: err });
      }

      res.status(201).json({ message: 'Oficina criada com sucesso', oficinaId: result.insertId });
    });
  });
};

exports.getOficinas = (req, res) => {
  const sql = 'SELECT * FROM oficinas';

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Erro ao buscar oficinas:', err);
      return res.status(500).json({ message: 'Erro ao buscar oficinas', error: err });
    }

    res.status(200).json(results);
  });
};

exports.matricular = (req, res) => {
  const { usuario_id, oficina_id } = req.body;

  if (!usuario_id || !oficina_id) {
    return res.status(400).json({ message: 'Usuário e oficina são obrigatórios.' });
  }

  const sql = `
    INSERT INTO matriculas (usuario_id, oficina_id)
    VALUES (?, ?)
  `;

  db.query(sql, [usuario_id, oficina_id], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Usuário já está matriculado nessa oficina.' });
      }
      return res.status(500).json({ message: 'Erro ao realizar matrícula.', error: err });
    }

    res.status(201).json({ message: 'Matrícula realizada com sucesso!' });
  });
};

exports.getOficinasMatriculadas = async (req, res) => {
  const { usuario_id } = req.query;

  try {
    const [rows] = await db.promise().query(`
      SELECT o.id, o.nome, o.codigo, o.professor
      FROM matriculas m
      JOIN oficinas o ON m.oficina_id = o.id
      WHERE m.usuario_id = ?
    `, [usuario_id]);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao buscar oficinas matriculadas.' });
  }
};
exports.registrarPresenca = (req, res) => {
  const { usuario_id, oficina_id } = req.body;

  if (!usuario_id || !oficina_id) {
    return res.status(400).json({ message: 'Usuário e oficina são obrigatórios.' });
  }

  const sql = `
    INSERT INTO presencas (usuario_id, oficina_id)
    VALUES (?, ?)
  `;

  db.query(sql, [usuario_id, oficina_id], (err, result) => {
    if (err) {
      console.error('Erro ao registrar presença:', err);
      return res.status(500).json({ message: 'Erro ao registrar presença.', error: err });
    }

    res.status(201).json({ message: 'Presença registrada com sucesso!' });
  });
};
exports.getHistoricoPresenca = async (req, res) => {
  const { usuario_id, oficina_id } = req.query;

  try {
    let sql = `
      SELECT p.id, p.data_presenca, o.nome AS oficina_nome, o.codigo AS oficina_codigo, u.nome AS usuario_nome
      FROM presencas p
      JOIN oficinas o ON p.oficina_id = o.id
      JOIN usuarios u ON p.usuario_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (usuario_id) {
      sql += ' AND p.usuario_id = ?';
      params.push(usuario_id);
    }

    if (oficina_id) {
      sql += ' AND p.oficina_id = ?';
      params.push(oficina_id);
    }

    sql += ' ORDER BY p.data_presenca DESC';

    const [rows] = await db.promise().query(sql, params);

    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao buscar histórico de presença.' });
  }
};

exports.getUsuariosPorOficina = async (req, res) => {
  const { oficina_id } = req.query;

  if (!oficina_id) {
    return res.status(400).json({ message: 'Parâmetro oficina_id é obrigatório.' });
  }

  try {
    const sql = `
      SELECT u.id, u.nome, u.email
      FROM usuarios u
      JOIN matriculas m ON u.id = m.usuario_id
      WHERE m.oficina_id = ?
    `;
    const [rows] = await db.promise().query(sql, [oficina_id]);
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao buscar usuários matriculados.' });
  }
};
exports.deletarPresenca = async (req, res) => {
  const { id } = req.params;

  try {
    await db.promise().query('DELETE FROM presencas WHERE id = ?', [id]);
    res.status(200).json({ message: 'Presença removida com sucesso.' });
  } catch (err) {
    console.error('Erro ao deletar presença:', err);
    res.status(500).json({ message: 'Erro ao deletar presença.' });
  }
};

