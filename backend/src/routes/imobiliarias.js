const { Router } = require('express');
const pool = require('../db/pool');
const { requireAdmin, requireManager } = require('../middleware/auth');

const router = Router();

// GET /imobiliarias - admin vê todas; imobiliaria vê apenas a própria
router.get('/', requireManager, async (req, res) => {
  try {
    let result;
    if (req.user.papel === 'admin') {
      result = await pool.query('SELECT * FROM imobiliarias ORDER BY nome');
    } else {
      result = await pool.query('SELECT * FROM imobiliarias WHERE id = $1', [req.user.imobiliaria_id]);
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /imobiliarias/:id
router.get('/:id', requireManager, async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.papel !== 'admin' && parseInt(id, 10) !== req.user.imobiliaria_id) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }
    const result = await pool.query('SELECT * FROM imobiliarias WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Imobiliária não encontrada' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// Mutações: somente superadmin
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { nome, cnpj, email, telefone } = req.body;
    if (!nome) return res.status(400).json({ erro: 'Campo obrigatório: nome' });
    const result = await pool.query(
      `INSERT INTO imobiliarias (nome, cnpj, email, telefone)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [nome, cnpj || null, email || null, telefone || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, cnpj, email, telefone } = req.body;
    const result = await pool.query(
      `UPDATE imobiliarias SET nome=$1, cnpj=$2, email=$3, telefone=$4
       WHERE id=$5 RETURNING *`,
      [nome, cnpj || null, email || null, telefone || null, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Imobiliária não encontrada' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM imobiliarias WHERE id=$1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Imobiliária não encontrada' });
    }
    res.json({ mensagem: 'Imobiliária removida com sucesso' });
  } catch (err) {
    if (err.code === '23503') {
      return res.status(409).json({ erro: 'Imobiliária possui imóveis ou clientes vinculados' });
    }
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
