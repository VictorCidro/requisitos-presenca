const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/oficinas', authController.criarOficina);
router.get('/oficinas', authController.getOficinas);
router.post('/matriculas', authController.matricular);
router.get('/oficinas-matriculadas', authController.getOficinasMatriculadas);
router.post('/presenca', authController.registrarPresenca);
router.get('/historico-presenca', authController.getHistoricoPresenca);
router.get('/usuarios-por-oficina', authController.getUsuariosPorOficina);
router.delete('/presenca/:id', authController.deletarPresenca);



module.exports = router;
