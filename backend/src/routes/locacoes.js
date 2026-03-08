const { Router } = require('express');
const pool = require('../db/pool');

const router = Router();

// GET /locacoes - listar todas as locações
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT l.*, i.titulo AS imovel_titulo, c.nome AS cliente_nome
       FROM locacoes l
       JOIN imoveis i ON i.id = l.imovel_id
       JOIN clientes c ON c.id = l.cliente_id
       ORDER BY l.criado_em DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /locacoes/:id - buscar locação por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT l.*, i.titulo AS imovel_titulo, c.nome AS cliente_nome
       FROM locacoes l
       JOIN imoveis i ON i.id = l.imovel_id
       JOIN clientes c ON c.id = l.cliente_id
       WHERE l.id=$1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Locação não encontrada' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// POST /locacoes - registrar nova locação
router.post('/', async (req, res) => {
  try {
    const { imovel_id, cliente_id, data_inicio, data_fim, valor_mensal } = req.body;
    const result = await pool.query(
      `INSERT INTO locacoes (imovel_id, cliente_id, data_inicio, data_fim, valor_mensal)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [imovel_id, cliente_id, data_inicio, data_fim, valor_mensal]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// PATCH /locacoes/:id/encerrar - encerrar locação
router.patch('/:id/encerrar', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE locacoes SET ativa=false, data_fim=CURRENT_DATE
       WHERE id=$1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Locação não encontrada' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
