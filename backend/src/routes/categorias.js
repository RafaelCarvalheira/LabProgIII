const { Router } = require('express');
const pool = require('../db/pool');
const { requireAdmin } = require('../middleware/auth');

const router = Router();

// GET /categorias - listar todas as categorias
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categorias_imoveis ORDER BY nome');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// POST /categorias - criar nova categoria (admin)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { nome, descricao } = req.body;
    const result = await pool.query(
      'INSERT INTO categorias_imoveis (nome, descricao) VALUES ($1,$2) RETURNING *',
      [nome, descricao]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// DELETE /categorias/:id - remover categoria (admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM categorias_imoveis WHERE id=$1 RETURNING id',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Categoria não encontrada' });
    }
    res.json({ mensagem: 'Categoria removida com sucesso' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
