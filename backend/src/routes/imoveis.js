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
