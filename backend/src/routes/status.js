const { Router } = require('express');
const pool = require('../db/pool');

const router = Router();

router.get('/status', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() AS timestamp');
    res.json({
      status: 'ok',
      servico: 'Sistema de Imoveis API',
      versao: '1.0.0',
      banco: 'conectado',
      timestamp: result.rows[0].timestamp,
    });
  } catch (err) {
    res.status(503).json({
      status: 'erro',
      servico: 'Sistema de Imoveis API',
      versao: '1.0.0',
      banco: 'desconectado',
      erro: err.message,
    });
  }
});

module.exports = router;
