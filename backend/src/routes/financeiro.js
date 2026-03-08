const { Router } = require('express');
const pool = require('../db/pool');

const router = Router();

// GET /financeiro - listar registros financeiros
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT f.*, l.valor_mensal AS locacao_valor
       FROM financeiro f
       JOIN locacoes l ON l.id = f.locacao_id
       ORDER BY f.data_vencimento DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// POST /financeiro - registrar cobrança/pagamento
router.post('/', async (req, res) => {
  try {
    const { locacao_id, tipo, valor, data_vencimento } = req.body;
    const result = await pool.query(
      `INSERT INTO financeiro (locacao_id, tipo, valor, data_vencimento)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [locacao_id, tipo, valor, data_vencimento]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// PATCH /financeiro/:id/pagar - registrar pagamento
router.patch('/:id/pagar', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE financeiro SET status='pago', data_pagamento=CURRENT_DATE
       WHERE id=$1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Registro não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
