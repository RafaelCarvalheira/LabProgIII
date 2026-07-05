const { Router } = require('express');
const pool = require('../db/pool');
const { requireAdmin } = require('../middleware/auth');

const router = Router();

async function atualizarAtrasados() {
  await pool.query(
    `UPDATE financeiro SET status = 'atrasado'
     WHERE status = 'pendente' AND data_vencimento < CURRENT_DATE`
  );
}

// Helper: cláusula WHERE de RLS para cliente
function rlsCliente(clienteId, params) {
  params.push(clienteId);
  return `f.locacao_id IN (
    SELECT l.id FROM locacoes l
    INNER JOIN clientes c ON c.id = l.cliente_id
    WHERE c.id = $${params.length}
  )`;
}

// GET /financeiro/resumo
router.get('/resumo', async (req, res) => {
  try {
    await atualizarAtrasados();
    const params = [];
    let whereClause = '';

    if (req.user.papel !== 'admin') {
      if (!req.user.cliente_id) {
        return res.json({
          total_receitas: 0, total_despesas: 0, receitas_recebidas: 0,
          despesas_pagas: 0, total_pendente: 0, total_atrasado: 0,
          saldo: 0, qtd_pendente: 0, qtd_atrasado: 0, qtd_pago: 0, qtd_total: 0,
        });
      }
      whereClause = `WHERE f.locacao_id IN (
        SELECT id FROM locacoes WHERE cliente_id = $1
      )`;
      params.push(req.user.cliente_id);
    }

    const result = await pool.query(`
      SELECT
        COALESCE(SUM(CASE WHEN tipo = 'receita' THEN valor END), 0) AS total_receitas,
        COALESCE(SUM(CASE WHEN tipo = 'despesa' THEN valor END), 0) AS total_despesas,
        COALESCE(SUM(CASE WHEN tipo = 'receita' AND status = 'pago' THEN valor END), 0) AS receitas_recebidas,
        COALESCE(SUM(CASE WHEN tipo = 'despesa' AND status = 'pago' THEN valor END), 0) AS despesas_pagas,
        COALESCE(SUM(CASE WHEN status = 'pendente' THEN valor END), 0) AS total_pendente,
        COALESCE(SUM(CASE WHEN status = 'atrasado' THEN valor END), 0) AS total_atrasado,
        COUNT(*) FILTER (WHERE status = 'pendente') AS qtd_pendente,
        COUNT(*) FILTER (WHERE status = 'atrasado') AS qtd_atrasado,
        COUNT(*) FILTER (WHERE status = 'pago')     AS qtd_pago,
        COUNT(*)                                     AS qtd_total
      FROM financeiro f
      ${whereClause}
    `, params);

    const r = result.rows[0];
    res.json({
      total_receitas:     parseFloat(r.total_receitas),
      total_despesas:     parseFloat(r.total_despesas),
      receitas_recebidas: parseFloat(r.receitas_recebidas),
      despesas_pagas:     parseFloat(r.despesas_pagas),
      total_pendente:     parseFloat(r.total_pendente),
      total_atrasado:     parseFloat(r.total_atrasado),
      saldo: parseFloat(r.total_receitas) - parseFloat(r.total_despesas),
      qtd_pendente: parseInt(r.qtd_pendente, 10),
      qtd_atrasado: parseInt(r.qtd_atrasado, 10),
      qtd_pago:     parseInt(r.qtd_pago, 10),
      qtd_total:    parseInt(r.qtd_total, 10),
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /financeiro/por-mes
router.get('/por-mes', async (req, res) => {
  try {
    const meses = Math.max(1, Math.min(parseInt(req.query.meses, 10) || 6, 24));
    const params = [meses];
    let whereClause = '';

    if (req.user.papel !== 'admin') {
      if (!req.user.cliente_id) return res.json([]);
      params.push(req.user.cliente_id);
      whereClause = `AND f.locacao_id IN (SELECT id FROM locacoes WHERE cliente_id = $${params.length})`;
    }

    const result = await pool.query(
      `SELECT
         to_char(date_trunc('month', data_vencimento), 'YYYY-MM') AS mes,
         COALESCE(SUM(CASE WHEN tipo = 'receita' THEN valor END), 0) AS receita,
         COALESCE(SUM(CASE WHEN tipo = 'despesa' THEN valor END), 0) AS despesa
       FROM financeiro f
       WHERE data_vencimento >= date_trunc('month', CURRENT_DATE) - ($1::int - 1) * INTERVAL '1 month'
       ${whereClause}
       GROUP BY 1 ORDER BY 1`,
      params
    );
    res.json(result.rows.map((r) => ({
      mes:     r.mes,
      receita: parseFloat(r.receita),
      despesa: parseFloat(r.despesa),
    })));
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /financeiro
router.get('/', async (req, res) => {
  try {
    await atualizarAtrasados();
    const { tipo, status, locacao_id, data_inicio, data_fim } = req.query;
    const where = [];
    const params = [];

    if (req.user.papel !== 'admin') {
      if (!req.user.cliente_id) return res.json([]);
      params.push(req.user.cliente_id);
      where.push(`f.locacao_id IN (SELECT id FROM locacoes WHERE cliente_id = $${params.length})`);
    }

    if (tipo)        { params.push(tipo);        where.push(`f.tipo = $${params.length}`); }
    if (status)      { params.push(status);      where.push(`f.status = $${params.length}`); }
    if (locacao_id)  { params.push(locacao_id);  where.push(`f.locacao_id = $${params.length}`); }
    if (data_inicio) { params.push(data_inicio); where.push(`f.data_vencimento >= $${params.length}`); }
    if (data_fim)    { params.push(data_fim);    where.push(`f.data_vencimento <= $${params.length}`); }

    const sql = `
      SELECT f.*,
             l.valor_mensal AS locacao_valor,
             i.titulo       AS imovel_titulo,
             c.nome         AS cliente_nome
        FROM financeiro f
        LEFT JOIN locacoes l ON l.id = f.locacao_id
        LEFT JOIN imoveis  i ON i.id = l.imovel_id
        LEFT JOIN clientes c ON c.id = l.cliente_id
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY f.data_vencimento DESC, f.id DESC
    `;
    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /financeiro/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT f.*, i.titulo AS imovel_titulo, c.nome AS cliente_nome
         FROM financeiro f
         LEFT JOIN locacoes l ON l.id = f.locacao_id
         LEFT JOIN imoveis  i ON i.id = l.imovel_id
         LEFT JOIN clientes c ON c.id = l.cliente_id
        WHERE f.id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Lançamento não encontrado' });
    }
    const reg = result.rows[0];
    // Cliente só vê seu próprio
    if (req.user.papel !== 'admin' && reg.locacao_id) {
      const check = await pool.query(
        'SELECT 1 FROM locacoes WHERE id = $1 AND cliente_id = $2',
        [reg.locacao_id, req.user.cliente_id]
      );
      if (check.rows.length === 0) return res.status(403).json({ erro: 'Acesso negado' });
    }
    res.json(reg);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// Mutações: somente admin
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { locacao_id, tipo, valor, data_vencimento, descricao, status } = req.body;
    if (!locacao_id || !tipo || valor == null || !data_vencimento) {
      return res.status(400).json({ erro: 'Campos obrigatórios: locacao_id, tipo, valor, data_vencimento' });
    }
    let statusInicial = status || 'pendente';
    if (!status && new Date(data_vencimento) < new Date(new Date().toDateString())) {
      statusInicial = 'atrasado';
    }
    const result = await pool.query(
      `INSERT INTO financeiro (locacao_id, tipo, valor, data_vencimento, descricao, status)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [locacao_id, tipo, valor, data_vencimento, descricao || null, statusInicial]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { locacao_id, tipo, valor, data_vencimento, descricao, status, data_pagamento } = req.body;
    const exist = await pool.query('SELECT * FROM financeiro WHERE id = $1', [id]);
    if (exist.rows.length === 0) {
      return res.status(404).json({ erro: 'Lançamento não encontrado' });
    }
    const novoStatus  = status || exist.rows[0].status;
    const novaDataPag = novoStatus === 'pago'
      ? (data_pagamento || exist.rows[0].data_pagamento || new Date().toISOString().slice(0, 10))
      : null;
    const result = await pool.query(
      `UPDATE financeiro
          SET locacao_id=$1, tipo=$2, valor=$3, data_vencimento=$4,
              descricao=$5, status=$6, data_pagamento=$7
        WHERE id=$8 RETURNING *`,
      [locacao_id, tipo, valor, data_vencimento, descricao ?? null, novoStatus, novaDataPag, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

router.patch('/:id/pagar', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE financeiro SET status='pago', data_pagamento=CURRENT_DATE WHERE id=$1 RETURNING *`,
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

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM financeiro WHERE id=$1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Lançamento não encontrado' });
    }
    res.json({ mensagem: 'Lançamento removido', registro: result.rows[0] });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
