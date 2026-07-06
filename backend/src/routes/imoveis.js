const { Router } = require('express');
const pool = require('../db/pool');
const { requireManager } = require('../middleware/auth');

const router = Router();

// GET /imoveis - admin vê todos (filtro opcional ?imobiliaria_id=); imobiliaria vê só os seus; cliente vê apenas os de suas locações
router.get('/', async (req, res) => {
  try {
    let result;
    if (req.user.papel === 'admin') {
      const { imobiliaria_id } = req.query;
      if (imobiliaria_id) {
        result = await pool.query(
          'SELECT * FROM imoveis WHERE imobiliaria_id = $1 ORDER BY criado_em DESC',
          [imobiliaria_id]
        );
      } else {
        result = await pool.query('SELECT * FROM imoveis ORDER BY criado_em DESC');
      }
    } else if (req.user.papel === 'imobiliaria') {
      result = await pool.query(
        'SELECT * FROM imoveis WHERE imobiliaria_id = $1 ORDER BY criado_em DESC',
        [req.user.imobiliaria_id]
      );
    } else {
      if (!req.user.cliente_id) {
        return res.json([]);
      }
      result = await pool.query(
        `SELECT DISTINCT i.*
         FROM imoveis i
         INNER JOIN locacoes l ON l.imovel_id = i.id
         WHERE l.cliente_id = $1
         ORDER BY i.criado_em DESC`,
        [req.user.cliente_id]
      );
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /imoveis/disponibilidade - público dentro da sessão autenticada
router.get('/disponibilidade', async (req, res) => {
  try {
    const { data_inicio, data_fim } = req.query;
    if (!data_inicio || !data_fim) {
      return res.status(400).json({ erro: 'Parâmetros data_inicio e data_fim são obrigatórios' });
    }
    const result = await pool.query(
      `SELECT i.*,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT('id', ci.id, 'nome', ci.nome)
          ) FILTER (WHERE ci.id IS NOT NULL),
          '[]'::json
        ) AS categorias
       FROM imoveis i
       LEFT JOIN imovel_categorias ic ON ic.imovel_id = i.id
       LEFT JOIN categorias_imoveis ci ON ci.id = ic.categoria_id
       WHERE i.disponivel = true
         AND NOT EXISTS (
           SELECT 1 FROM locacoes l
           WHERE l.imovel_id = i.id
             AND l.ativa = true
             AND l.data_inicio <= $2
             AND (l.data_fim IS NULL OR l.data_fim >= $1)
         )
       GROUP BY i.id
       ORDER BY i.criado_em DESC`,
      [data_inicio, data_fim]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /imoveis/:id - admin vê qualquer; imobiliaria vê só o seu; cliente vê apenas o seu
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let result;
    if (req.user.papel === 'admin') {
      result = await pool.query('SELECT * FROM imoveis WHERE id = $1', [id]);
    } else if (req.user.papel === 'imobiliaria') {
      result = await pool.query(
        'SELECT * FROM imoveis WHERE id = $1 AND imobiliaria_id = $2',
        [id, req.user.imobiliaria_id]
      );
    } else {
      if (!req.user.cliente_id) return res.status(403).json({ erro: 'Acesso negado' });
      result = await pool.query(
        `SELECT DISTINCT i.* FROM imoveis i
         INNER JOIN locacoes l ON l.imovel_id = i.id
         WHERE i.id = $1 AND l.cliente_id = $2`,
        [id, req.user.cliente_id]
      );
    }
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Imóvel não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// Mutações: admin (qualquer imobiliária) ou imobiliaria (só a própria)
router.post('/', requireManager, async (req, res) => {
  try {
    const {
      titulo, descricao, endereco, cidade, estado, cep,
      valor_aluguel, valor_venda, area, quartos, banheiros, vagas_garagem,
    } = req.body;

    const imobiliaria_id = req.user.papel === 'imobiliaria'
      ? req.user.imobiliaria_id
      : req.body.imobiliaria_id;
    if (!imobiliaria_id) {
      return res.status(400).json({ erro: 'Campo obrigatório: imobiliaria_id' });
    }

    const result = await pool.query(
      `INSERT INTO imoveis
        (titulo, descricao, endereco, cidade, estado, cep,
         valor_aluguel, valor_venda, area, quartos, banheiros, vagas_garagem, imobiliaria_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [titulo, descricao, endereco, cidade, estado, cep,
       valor_aluguel, valor_venda, area, quartos, banheiros, vagas_garagem, imobiliaria_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

router.put('/:id', requireManager, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      titulo, descricao, endereco, cidade, estado, cep,
      valor_aluguel, valor_venda, area, quartos, banheiros, vagas_garagem, disponivel,
    } = req.body;

    const atual = await pool.query('SELECT imobiliaria_id FROM imoveis WHERE id = $1', [id]);
    if (atual.rows.length === 0) {
      return res.status(404).json({ erro: 'Imóvel não encontrado' });
    }
    if (req.user.papel === 'imobiliaria' && atual.rows[0].imobiliaria_id !== req.user.imobiliaria_id) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }
    const imobiliaria_id = req.user.papel === 'imobiliaria'
      ? req.user.imobiliaria_id
      : (req.body.imobiliaria_id || atual.rows[0].imobiliaria_id);

    const result = await pool.query(
      `UPDATE imoveis SET
        titulo=$1, descricao=$2, endereco=$3, cidade=$4, estado=$5, cep=$6,
        valor_aluguel=$7, valor_venda=$8, area=$9, quartos=$10,
        banheiros=$11, vagas_garagem=$12, disponivel=$13, imobiliaria_id=$14
       WHERE id=$15 RETURNING *`,
      [titulo, descricao, endereco, cidade, estado, cep,
       valor_aluguel, valor_venda, area, quartos, banheiros, vagas_garagem, disponivel, imobiliaria_id, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

router.delete('/:id', requireManager, async (req, res) => {
  try {
    const { id } = req.params;
    const atual = await pool.query('SELECT imobiliaria_id FROM imoveis WHERE id = $1', [id]);
    if (atual.rows.length === 0) {
      return res.status(404).json({ erro: 'Imóvel não encontrado' });
    }
    if (req.user.papel === 'imobiliaria' && atual.rows[0].imobiliaria_id !== req.user.imobiliaria_id) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }
    const result = await pool.query('DELETE FROM imoveis WHERE id=$1 RETURNING id', [id]);
    res.json({ mensagem: 'Imóvel removido com sucesso' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
