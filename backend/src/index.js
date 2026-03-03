const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'sistema_imoveis',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'admin123',
});

app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', timestamp: result.rows[0].now });
  } catch (err) {
    res.json({ status: 'ok', db: 'disconnected' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend rodando na porta ${PORT}`);
});
