const { Router } = require('express');
const pool = require('../db/pool');

const router = Router();

// GET /clientes - listar todos os clientes
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clientes ORDER BY criado_em DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /clientes/:id - buscar cliente por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM clientes WHERE id=$1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// POST /clientes - cadastrar novo cliente
router.post('/', async (req, res) => {
  try {
    const { nome, cpf, email, telefone, endereco } = req.body;
    const result = await pool.query(
      `INSERT INTO clientes (nome, cpf, email, telefone, endereco)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [nome, cpf, email, telefone, endereco]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// PUT /clientes/:id - atualizar cliente
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, cpf, email, telefone, endereco } = req.body;
    const result = await pool.query(
      `UPDATE clientes SET nome=$1, cpf=$2, email=$3, telefone=$4, endereco=$5
       WHERE id=$6 RETURNING *`,
      [nome, cpf, email, telefone, endereco, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// DELETE /clientes/:id - remover cliente
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM clientes WHERE id=$1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }
    res.json({ mensagem: 'Cliente removido com sucesso' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
