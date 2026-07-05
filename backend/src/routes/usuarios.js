const { Router } = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db/pool');
const { requireAdmin } = require('../middleware/auth');

const router = Router();

// GET /usuarios — lista todos (sem senha)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.nome, u.email, u.papel, u.criado_em,
             c.id   AS cliente_id,
             c.nome AS cliente_nome
      FROM   usuarios u
      LEFT   JOIN clientes c ON c.usuario_id = u.id
      ORDER  BY u.criado_em DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// POST /usuarios — cria usuário
router.post('/', requireAdmin, async (req, res) => {
  const { nome, email, senha, papel = 'usuario', cliente_id } = req.body;
  if (!nome || !email || !senha)
    return res.status(400).json({ erro: 'nome, email e senha são obrigatórios' });

  try {
    const hash = await bcrypt.hash(senha, 10);
    const { rows } = await pool.query(
      `INSERT INTO usuarios (nome, email, senha, papel)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nome, email, papel, criado_em`,
      [nome, email.toLowerCase().trim(), hash, papel]
    );
    const user = rows[0];

    if (cliente_id) {
      await pool.query(
        'UPDATE clientes SET usuario_id = $1 WHERE id = $2',
        [user.id, cliente_id]
      );
    }

    res.status(201).json(user);
  } catch (err) {
    if (err.code === '23505')
      return res.status(400).json({ erro: 'E-mail já cadastrado' });
    res.status(500).json({ erro: err.message });
  }
});

// PUT /usuarios/:id — atualiza usuário
router.put('/:id', requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { nome, email, senha, papel, cliente_id } = req.body;

  try {
    let query, params;
    if (senha) {
      const hash = await bcrypt.hash(senha, 10);
      query = `UPDATE usuarios SET nome=$1, email=$2, senha=$3, papel=$4
               WHERE id=$5 RETURNING id, nome, email, papel`;
      params = [nome, email.toLowerCase().trim(), hash, papel, id];
    } else {
      query = `UPDATE usuarios SET nome=$1, email=$2, papel=$3
               WHERE id=$4 RETURNING id, nome, email, papel`;
      params = [nome, email.toLowerCase().trim(), papel, id];
    }

    const { rows } = await pool.query(query, params);
    if (!rows.length) return res.status(404).json({ erro: 'Usuário não encontrado' });

    // Atualiza vínculo com cliente
    await pool.query('UPDATE clientes SET usuario_id = NULL WHERE usuario_id = $1', [id]);
    if (cliente_id) {
      await pool.query('UPDATE clientes SET usuario_id = $1 WHERE id = $2', [id, cliente_id]);
    }

    res.json(rows[0]);
  } catch (err) {
    if (err.code === '23505')
      return res.status(400).json({ erro: 'E-mail já cadastrado' });
    res.status(500).json({ erro: err.message });
  }
});

// DELETE /usuarios/:id — remove usuário
router.delete('/:id', requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (req.user.id === id)
    return res.status(400).json({ erro: 'Não é possível excluir sua própria conta' });

  try {
    await pool.query('UPDATE clientes SET usuario_id = NULL WHERE usuario_id = $1', [id]);
    await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
