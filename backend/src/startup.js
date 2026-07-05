const bcrypt = require('bcryptjs');
const pool = require('./db/pool');
const { runMigrations } = require('./db/migrate');

async function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL || 'marcell.parra.2002@gmail.com').toLowerCase();
  const senha = process.env.ADMIN_PASSWORD || 'Admin@2026';
  const nome  = process.env.ADMIN_NOME    || 'Marcell Parra';

  try {
    const existing = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (existing.rows.length === 0) {
      const hash = await bcrypt.hash(senha, 10);
      await pool.query(
        `INSERT INTO usuarios (nome, email, senha, papel) VALUES ($1, $2, $3, 'admin')`,
        [nome, email, hash]
      );
      console.log(`✅ Admin criado: ${email}`);
    } else {
      console.log(`✅ Admin já existe: ${email}`);
    }
  } catch (err) {
    console.error('Erro ao criar admin:', err.message);
  }
}

async function initializeDatabase() {
  await runMigrations();
  await seedAdmin();
}

module.exports = { seedAdmin, initializeDatabase };
