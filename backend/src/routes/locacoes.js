const { Router } = require('express');
const pool = require('../db/pool');
const { requireAdmin } = require('../middleware/auth');

const router = Router();

// GET /locacoes - admin vê todas; cliente vê apenas as suas
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const params = [];
    const where = [];

    if (req.user.papel !== 'admin') {
      if (!req.user.cliente_id) return res.json([]);
      params.push(req.user.cliente_id);
      where.push(`l.cliente_id = $${params.length}`);
    }

    if (status) {
      params.push(status);
      where.push(`l.status = $${params.length}`);
    }

    const query = `
      SELECT l.*, i.titulo AS imovel_titulo, c.nome AS cliente_nome
      FROM locacoes l
      JOIN imoveis i ON i.id = l.imovel_id
      JOIN clientes c ON c.id = l.cliente_id
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY l.criado_em DESC
    `;
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /locacoes/:id
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
    const loc = result.rows[0];
    if (req.user.papel !== 'admin' && loc.cliente_id !== req.user.cliente_id) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }
    res.json(loc);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// Mutações: somente admin
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { imovel_id, cliente_id, data_inicio, data_fim, valor_mensal, status } = req.body;
    const statusFinal = status || 'pendente';

    if (statusFinal === 'confirmada') {
      const conflito = await pool.query(
        `SELECT 1 FROM locacoes
         WHERE imovel_id = $1 AND status = 'confirmada'
           AND data_inicio <= $3
           AND (data_fim IS NULL OR data_fim >= $2)`,
        [imovel_id, data_inicio, data_fim || '9999-12-31']
      );
      if (conflito.rows.length > 0) {
        return res.status(409).json({ erro: 'Conflito de datas: imóvel já possui reserva confirmada neste período.' });
      }
    }

    let valor_total = null;
    if (data_inicio && data_fim && valor_mensal) {
      const dias = Math.max(1, Math.ceil((new Date(data_fim) - new Date(data_inicio)) / 86400000));
      valor_total = parseFloat(valor_mensal) * (dias / 30);
    }

    const result = await pool.query(
      `INSERT INTO locacoes (imovel_id, cliente_id, data_inicio, data_fim, valor_mensal, status, valor_total)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [imovel_id, cliente_id, data_inicio, data_fim, valor_mensal, statusFinal, valor_total]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { imovel_id, cliente_id, data_inicio, data_fim, valor_mensal, status } = req.body;

    const atual = await pool.query('SELECT * FROM locacoes WHERE id=$1', [id]);
    if (atual.rows.length === 0) {
      return res.status(404).json({ erro: 'Locação não encontrada' });
    }

    if (status === 'confirmada') {
      const conflito = await pool.query(
        `SELECT 1 FROM locacoes
         WHERE imovel_id = $1 AND id != $2 AND status = 'confirmada'
           AND data_inicio <= $4
           AND (data_fim IS NULL OR data_fim >= $3)`,
        [imovel_id, id, data_inicio, data_fim || '9999-12-31']
      );
      if (conflito.rows.length > 0) {
        return res.status(409).json({ erro: 'Conflito de datas: imóvel já possui reserva confirmada neste período.' });
      }
    }

    let valor_total = null;
    if (data_inicio && data_fim && valor_mensal) {
      const dias = Math.max(1, Math.ceil((new Date(data_fim) - new Date(data_inicio)) / 86400000));
      valor_total = parseFloat(valor_mensal) * (dias / 30);
    }

    const ativa = status !== 'cancelada';
    const result = await pool.query(
      `UPDATE locacoes SET
         imovel_id=$1, cliente_id=$2, data_inicio=$3, data_fim=$4,
         valor_mensal=$5, status=$6, valor_total=$7, ativa=$8
       WHERE id=$9 RETURNING *`,
      [imovel_id, cliente_id, data_inicio, data_fim, valor_mensal, status, valor_total, ativa, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

router.patch('/:id/status', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pendente', 'confirmada', 'cancelada'].includes(status)) {
      return res.status(400).json({ erro: 'Status inválido. Use: pendente, confirmada ou cancelada.' });
    }

    if (status === 'confirmada') {
      const loc = await pool.query('SELECT * FROM locacoes WHERE id=$1', [id]);
      if (loc.rows.length === 0) return res.status(404).json({ erro: 'Locação não encontrada' });
      const { imovel_id, data_inicio, data_fim } = loc.rows[0];
      const conflito = await pool.query(
        `SELECT 1 FROM locacoes
         WHERE imovel_id=$1 AND id!=$2 AND status='confirmada'
           AND data_inicio<=$4 AND (data_fim IS NULL OR data_fim>=$3)`,
        [imovel_id, id, data_inicio, data_fim || '9999-12-31']
      );
      if (conflito.rows.length > 0) {
        return res.status(409).json({ erro: 'Conflito de datas: imóvel já possui reserva confirmada neste período.' });
      }
    }

    const ativa = status !== 'cancelada';
    const result = await pool.query(
      `UPDATE locacoes SET status=$1, ativa=$2 WHERE id=$3 RETURNING *`,
      [status, ativa, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ erro: 'Locação não encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

router.patch('/:id/encerrar', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE locacoes SET ativa=false, status='cancelada', data_fim=CURRENT_DATE
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
