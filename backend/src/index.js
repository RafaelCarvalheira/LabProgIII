const express = require('express');
const cors = require('cors');
const { seedAdmin } = require('./startup');

const statusRouter    = require('./routes/status');
const authRouter      = require('./routes/auth');
const imoveisRouter   = require('./routes/imoveis');
const clientesRouter  = require('./routes/clientes');
const locacoesRouter  = require('./routes/locacoes');
const categoriasRouter = require('./routes/categorias');
const financeiroRouter = require('./routes/financeiro');
const { requireAuth } = require('./middleware/auth');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rota pública
app.use(statusRouter);
app.use('/auth', authRouter);

// Rotas protegidas — exigem JWT válido
app.use('/imoveis',    requireAuth, imoveisRouter);
app.use('/clientes',   requireAuth, clientesRouter);
app.use('/locacoes',   requireAuth, locacoesRouter);
app.use('/categorias', requireAuth, categoriasRouter);
app.use('/financeiro', requireAuth, financeiroRouter);

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Backend rodando na porta ${PORT}`);
  await seedAdmin();
});
