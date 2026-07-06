const { Router } = require('express');
const pool = require('../db/pool');
const { requireManager } = require('../middleware/auth');

const router = Router();

// GET /clientes - admin vê todos (filtro opcional ?imobiliaria_id=); imobiliaria vê só os seus; cliente vê apenas a si mesmo
router.get('/', async (req, res) => {
  try {
    let result;
    if (req.user.papel === 'admin') {
      const { imobiliaria_id } = req.query;
      if (imobiliaria_id) {
        result = await pool.query(
          'SELECT * FROM clientes WHERE imobiliaria_id = $1 ORDER BY criado_em DESC',
          [imobiliaria_id]
        );
      } else {
        result = await pool.query('SELECT * FROM clientes ORDER BY criado_em DESC');
      }
    } else if (req.user.papel === 'imobiliaria') {
      result = await pool.query(
        'SELECT * FROM clientes WHERE imobiliaria_id = $1 ORDER BY criado_em DESC',
        [req.user.imobiliaria_id]
      );
    } else {
      if (!req.user.cliente_id) return res.json([]);
      result = await pool.query('SELECT * FROM clientes WHERE id = $1', [req.user.cliente_id]);
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /clientes/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.papel === 'usuario' && parseInt(id, 10) !== req.user.cliente_id) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }
    const result = await pool.query('SELECT * FROM clientes WHERE id=$1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }
    if (req.user.papel === 'imobiliaria' && result.rows[0].imobiliaria_id !== req.user.imobiliaria_id) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// Mutações: admin (qualquer imobiliária) ou imobiliaria (só a própria)
router.post('/', requireManager, async (req, res) => {
  try {
    const { nome, cpf, email, telefone, endereco } = req.body;

    const imobiliaria_id = req.user.papel === 'imobiliaria'
      ? req.user.imobiliaria_id
      : req.body.imobiliaria_id;
    if (!imobiliaria_id) {
      return res.status(400).json({ erro: 'Campo obrigatório: imobiliaria_id' });
    }

    const result = await pool.query(
      `INSERT INTO clientes (nome, cpf, email, telefone, endereco, imobiliaria_id)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [nome, cpf, email, telefone, endereco, imobiliaria_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

router.put('/:id', requireManager, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, cpf, email, telefone, endereco } = req.body;

    const atual = await pool.query('SELECT imobiliaria_id FROM clientes WHERE id = $1', [id]);
    if (atual.rows.length === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }
    if (req.user.papel === 'imobiliaria' && atual.rows[0].imobiliaria_id !== req.user.imobiliaria_id) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }
    const imobiliaria_id = req.user.papel === 'imobiliaria'
      ? req.user.imobiliaria_id
      : (req.body.imobiliaria_id || atual.rows[0].imobiliaria_id);

    const result = await pool.query(
      `UPDATE clientes SET nome=$1, cpf=$2, email=$3, telefone=$4, endereco=$5, imobiliaria_id=$6
       WHERE id=$7 RETURNING *`,
      [nome, cpf, email, telefone, endereco, imobiliaria_id, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

router.delete('/:id', requireManager, async (req, res) => {
  try {
    const { id } = req.params;
    const atual = await pool.query('SELECT imobiliaria_id FROM clientes WHERE id = $1', [id]);
    if (atual.rows.length === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }
    if (req.user.papel === 'imobiliaria' && atual.rows[0].imobiliaria_id !== req.user.imobiliaria_id) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }
    await pool.query('DELETE FROM clientes WHERE id=$1', [id]);
    res.json({ mensagem: 'Cliente removido com sucesso' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
