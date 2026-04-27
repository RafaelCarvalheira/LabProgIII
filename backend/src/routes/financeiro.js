const { Router } = require('express');
const pool = require('../db/pool');

const router = Router();

// Helper: marca como atrasado todo lancamento pendente vencido
async function atualizarAtrasados() {
  await pool.query(
    `UPDATE financeiro
        SET status = 'atrasado'
      WHERE status = 'pendente'
        AND data_vencimento < CURRENT_DATE`
  );
}

// GET /financeiro/resumo - KPIs analiticos (Entregavel 7 / F3)
// Tem que vir ANTES de "/:id" para nao ser interpretado como ID
router.get('/resumo', async (req, res) => {
  try {
    await atualizarAtrasados();
    const result = await pool.query(`
      SELECT
        COALESCE(SUM(CASE WHEN tipo = 'receita'                                THEN valor END), 0) AS total_receitas,
        COALESCE(SUM(CASE WHEN tipo = 'despesa'                                THEN valor END), 0) AS total_despesas,
        COALESCE(SUM(CASE WHEN tipo = 'receita' AND status = 'pago'            THEN valor END), 0) AS receitas_recebidas,
        COALESCE(SUM(CASE WHEN tipo = 'despesa' AND status = 'pago'            THEN valor END), 0) AS despesas_pagas,
        COALESCE(SUM(CASE WHEN status = 'pendente'                             THEN valor END), 0) AS total_pendente,
        COALESCE(SUM(CASE WHEN status = 'atrasado'                             THEN valor END), 0) AS total_atrasado,
        COUNT(*) FILTER (WHERE status = 'pendente')                              AS qtd_pendente,
        COUNT(*) FILTER (WHERE status = 'atrasado')                              AS qtd_atrasado,
        COUNT(*) FILTER (WHERE status = 'pago')                                  AS qtd_pago,
        COUNT(*)                                                                 AS qtd_total
      FROM financeiro
    `);
    const r = result.rows[0];
    const saldo = parseFloat(r.total_receitas) - parseFloat(r.total_despesas);
    res.json({
      total_receitas:    parseFloat(r.total_receitas),
      total_despesas:    parseFloat(r.total_despesas),
      receitas_recebidas: parseFloat(r.receitas_recebidas),
      despesas_pagas:    parseFloat(r.despesas_pagas),
      total_pendente:    parseFloat(r.total_pendente),
      total_atrasado:    parseFloat(r.total_atrasado),
      saldo,
      qtd_pendente: parseInt(r.qtd_pendente, 10),
      qtd_atrasado: parseInt(r.qtd_atrasado, 10),
      qtd_pago:     parseInt(r.qtd_pago, 10),
      qtd_total:    parseInt(r.qtd_total, 10),
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /financeiro/por-mes?meses=6 - serie temporal agregada (F3)
router.get('/por-mes', async (req, res) => {
  try {
    const meses = Math.max(1, Math.min(parseInt(req.query.meses, 10) || 6, 24));
    const result = await pool.query(
      `SELECT
         to_char(date_trunc('month', data_vencimento), 'YYYY-MM') AS mes,
         COALESCE(SUM(CASE WHEN tipo = 'receita' THEN valor END), 0) AS receita,
         COALESCE(SUM(CASE WHEN tipo = 'despesa' THEN valor END), 0) AS despesa
       FROM financeiro
       WHERE data_vencimento >= date_trunc('month', CURRENT_DATE) - ($1::int - 1) * INTERVAL '1 month'
       GROUP BY 1
       ORDER BY 1`,
      [meses]
    );
    res.json(result.rows.map((r) => ({
      mes: r.mes,
      receita: parseFloat(r.receita),
      despesa: parseFloat(r.despesa),
    })));
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /financeiro - lista com filtros via query params (F3)
//   ?tipo=receita|despesa
//   ?status=pendente|pago|atrasado
//   ?locacao_id=N
//   ?data_inicio=YYYY-MM-DD&data_fim=YYYY-MM-DD
router.get('/', async (req, res) => {
  try {
    await atualizarAtrasados();
    const { tipo, status, locacao_id, data_inicio, data_fim } = req.query;
    const where = [];
    const params = [];

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

// GET /financeiro/:id - detalhe (F3)
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
      return res.status(404).json({ erro: 'Lancamento nao encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// POST /financeiro - cria lancamento (aceita descricao, F3)
router.post('/', async (req, res) => {
  try {
    const { locacao_id, tipo, valor, data_vencimento, descricao, status } = req.body;
    if (!locacao_id || !tipo || valor == null || !data_vencimento) {
      return res.status(400).json({ erro: 'Campos obrigatorios: locacao_id, tipo, valor, data_vencimento' });
    }
    // Define status inicial: respeita o enviado ou calcula a partir da data de vencimento
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

// PUT /financeiro/:id - edicao completa (NOVO, F3)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { locacao_id, tipo, valor, data_vencimento, descricao, status, data_pagamento } = req.body;

    const exist = await pool.query('SELECT * FROM financeiro WHERE id = $1', [id]);
    if (exist.rows.length === 0) {
      return res.status(404).json({ erro: 'Lancamento nao encontrado' });
    }

    const novoStatus = status || exist.rows[0].status;
    const novaDataPag = novoStatus === 'pago'
      ? (data_pagamento || exist.rows[0].data_pagamento || new Date().toISOString().slice(0, 10))
      : null;

    const result = await pool.query(
      `UPDATE financeiro
          SET locacao_id      = COALESCE($1, locacao_id),
              tipo            = COALESCE($2, tipo),
              valor           = COALESCE($3, valor),
              data_vencimento = COALESCE($4, data_vencimento),
              descricao       = $5,
              status          = $6,
              data_pagamento  = $7
        WHERE id = $8
        RETURNING *`,
      [locacao_id, tipo, valor, data_vencimento, descricao ?? null, novoStatus, novaDataPag, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// PATCH /financeiro/:id/pagar - registrar pagamento
router.patch('/:id/pagar', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE financeiro
          SET status = 'pago',
              data_pagamento = CURRENT_DATE
        WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Registro nao encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// DELETE /financeiro/:id - excluir lancamento (NOVO, F3)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM financeiro WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Lancamento nao encontrado' });
    }
    res.json({ mensagem: 'Lancamento removido', registro: result.rows[0] });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
