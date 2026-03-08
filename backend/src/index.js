const express = require('express');
const cors = require('cors');

const statusRouter = require('./routes/status');
const imoveisRouter = require('./routes/imoveis');
const clientesRouter = require('./routes/clientes');
const locacoesRouter = require('./routes/locacoes');
const categoriasRouter = require('./routes/categorias');
const financeiroRouter = require('./routes/financeiro');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use(statusRouter);
app.use('/imoveis', imoveisRouter);
app.use('/clientes', clientesRouter);
app.use('/locacoes', locacoesRouter);
app.use('/categorias', categoriasRouter);
app.use('/financeiro', financeiroRouter);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend rodando na porta ${PORT}`);
});
