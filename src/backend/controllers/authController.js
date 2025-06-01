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

