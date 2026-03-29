const { Router } = require('express');
const pool = require('../db/pool');

const router = Router();

// GET /imoveis - listar todos os imóveis
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM imoveis ORDER BY criado_em DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /imoveis/disponibilidade - buscar imóveis disponíveis em um período
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

// GET /imoveis/:id - buscar imóvel por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM imoveis WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Imóvel não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// POST /imoveis - cadastrar novo imóvel
router.post('/', async (req, res) => {
  try {
    const {
      titulo, descricao, endereco, cidade, estado, cep,
      valor_aluguel, valor_venda, area, quartos, banheiros, vagas_garagem,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO imoveis
        (titulo, descricao, endereco, cidade, estado, cep,
         valor_aluguel, valor_venda, area, quartos, banheiros, vagas_garagem)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [titulo, descricao, endereco, cidade, estado, cep,
       valor_aluguel, valor_venda, area, quartos, banheiros, vagas_garagem]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// PUT /imoveis/:id - atualizar imóvel
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      titulo, descricao, endereco, cidade, estado, cep,
      valor_aluguel, valor_venda, area, quartos, banheiros, vagas_garagem, disponivel,
    } = req.body;

    const result = await pool.query(
      `UPDATE imoveis SET
        titulo=$1, descricao=$2, endereco=$3, cidade=$4, estado=$5, cep=$6,
        valor_aluguel=$7, valor_venda=$8, area=$9, quartos=$10,
        banheiros=$11, vagas_garagem=$12, disponivel=$13
       WHERE id=$14
       RETURNING *`,
      [titulo, descricao, endereco, cidade, estado, cep,
       valor_aluguel, valor_venda, area, quartos, banheiros, vagas_garagem, disponivel, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Imóvel não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// DELETE /imoveis/:id - remover imóvel
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM imoveis WHERE id=$1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Imóvel não encontrado' });
    }
    res.json({ mensagem: 'Imóvel removido com sucesso' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
