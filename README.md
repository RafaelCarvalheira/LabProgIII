# RCP Data Imob

Grupo: Rafael Carvalheira, Marcell Parra, Ruan Pablo

Plataforma de gestao de locacoes de imoveis, composta por tres servicos orquestrados via Docker Compose.

## Servicos e portas

| Servico  | Descricao              | Porta |
|----------|------------------------|-------|
| db       | PostgreSQL 13 (Alpine) | 5432  |
| backend  | Node.js / Express      | 3000  |
| frontend | React / Vite           | 5173  |

---

## API REST — Endpoints

Base URL: `http://localhost:3000`

Todos os endpoints retornam e aceitam **JSON**.

### Status

| Metodo | Endpoint  | Descricao                              |
|--------|-----------|----------------------------------------|
| GET    | /status   | Verifica se a API e o banco estao ativos |

**Exemplo de resposta `GET /status`:**
```json
{
  "status": "ok",
  "servico": "RCP Data Imob API",
  "versao": "1.0.0",
  "banco": "conectado",
  "timestamp": "2026-03-08T20:00:00.000Z"
}
```

---

### Imoveis

| Metodo | Endpoint       | Descricao                  |
|--------|----------------|----------------------------|
| GET    | /imoveis       | Listar todos os imoveis     |
| GET    | /imoveis/:id   | Buscar imovel por ID        |
| POST   | /imoveis       | Cadastrar novo imovel       |
| PUT    | /imoveis/:id   | Atualizar imovel            |
| DELETE | /imoveis/:id   | Remover imovel              |

**Campos do imovel (POST/PUT):**
```json
{
  "titulo": "Apartamento Centro",
  "descricao": "Apto 2 quartos, reformado",
  "endereco": "Rua das Flores, 100",
  "cidade": "Sao Paulo",
  "estado": "SP",
  "cep": "01000-000",
  "valor_aluguel": 1500.00,
  "valor_venda": 250000.00,
  "area": 65.0,
  "quartos": 2,
  "banheiros": 1,
  "vagas_garagem": 1
}
```

---

### Clientes

| Metodo | Endpoint       | Descricao                  |
|--------|----------------|----------------------------|
| GET    | /clientes      | Listar todos os clientes    |
| GET    | /clientes/:id  | Buscar cliente por ID       |
| POST   | /clientes      | Cadastrar novo cliente      |
| PUT    | /clientes/:id  | Atualizar cliente           |
| DELETE | /clientes/:id  | Remover cliente             |

**Campos do cliente (POST/PUT):**
```json
{
  "nome": "Ana Souza",
  "cpf": "123.456.789-00",
  "email": "ana@email.com",
  "telefone": "(11) 99999-9999",
  "endereco": "Rua A, 10"
}
```

---

### Locacoes

| Metodo | Endpoint                  | Descricao                  |
|--------|---------------------------|----------------------------|
| GET    | /locacoes                 | Listar todas as locacoes    |
| GET    | /locacoes/:id             | Buscar locacao por ID       |
| POST   | /locacoes                 | Registrar nova locacao      |
| PATCH  | /locacoes/:id/encerrar    | Encerrar locacao ativa      |

**Campos da locacao (POST):**
```json
{
  "imovel_id": 1,
  "cliente_id": 1,
  "data_inicio": "2026-03-01",
  "data_fim": "2027-03-01",
  "valor_mensal": 1500.00
}
```

---

### Categorias de Imoveis

| Metodo | Endpoint         | Descricao                  |
|--------|------------------|----------------------------|
| GET    | /categorias      | Listar todas as categorias  |
| POST   | /categorias      | Criar nova categoria        |
| DELETE | /categorias/:id  | Remover categoria           |

**Campos da categoria (POST):**
```json
{
  "nome": "Apartamento",
  "descricao": "Imovel em condominio vertical"
}
```

---

### Financeiro

| Metodo | Endpoint                  | Descricao                       |
|--------|---------------------------|---------------------------------|
| GET    | /financeiro               | Listar registros financeiros     |
| POST   | /financeiro               | Registrar cobranca               |
| PATCH  | /financeiro/:id/pagar     | Marcar cobranca como paga        |

**Campos do registro financeiro (POST):**
```json
{
  "locacao_id": 1,
  "tipo": "aluguel",
  "valor": 1500.00,
  "data_vencimento": "2026-04-05"
}
```

---

## Como subir o ambiente

```bash
docker compose up --build -d
```

Para parar:

```bash
docker compose down
```

Para remover volumes (apaga dados do banco):

```bash
docker compose down -v
```

## Estrutura do projeto

```
.
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── index.js
│       ├── db/
│       │   └── pool.js
│       └── routes/
│           ├── status.js
│           ├── imoveis.js
│           ├── clientes.js
│           ├── locacoes.js
│           ├── categorias.js
│           └── financeiro.js
├── frontend/
│   └── ...
└── database/
    └── init.sql
```
