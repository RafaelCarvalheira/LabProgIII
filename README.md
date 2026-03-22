# RCP Data Imob

**Grupo:** Rafael Carvalheira, Marcell Parra, Ruan Pablo
**Disciplina:** Laboratório de Programação 3 — Prof. Matheus Vanzan

Plataforma de gestão de locações de imóveis, composta por três serviços orquestrados via Docker Compose.

![Dashboard](docs/screenshots/tela-dashboard.png)

---

## Serviços e Portas

| Serviço  | Tecnologia             | Porta |
|----------|------------------------|-------|
| db       | PostgreSQL 13 (Alpine) | 5432  |
| backend  | Node.js 18 / Express   | 3000  |
| frontend | React 18 / Vite 6      | 5173  |

---

## Como Subir o Ambiente

```bash
# Build e start de todos os serviços
docker compose up --build -d

# Verificar status dos containers
docker compose ps

# Parar os serviços
docker compose down

# Remover volumes (apaga dados do banco)
docker compose down -v
```

Após subir, acesse:

| Serviço  | URL                    |
|----------|------------------------|
| Frontend | http://localhost:5173   |
| API REST | http://localhost:3000   |

---

## Telas do Frontend

| Rota          | Tela        | Descrição                                                          |
|---------------|-------------|--------------------------------------------------------------------|
| `/`           | Dashboard   | KPIs (imóveis, clientes, locações ativas, receita), gráfico financeiro, últimas locações |
| `/imoveis`    | Imóveis     | Cards com filtros por cidade/status/busca, CRUD completo via modal |
| `/clientes`   | Clientes    | Tabela com busca por nome, CRUD completo via modal                 |
| `/locacoes`   | Locações    | Tabela com selects de imóvel/cliente, encerramento de locação      |
| `/financeiro` | Financeiro  | Cards receitas/despesas, filtro por status, ação de pagamento      |

<details>
<summary>Screenshots das telas</summary>

**Imóveis**
![Imóveis](docs/screenshots/tela-imoveis.png)

**Clientes**
![Clientes](docs/screenshots/tela-clientes.png)

**Locações**
![Locações](docs/screenshots/tela-locacoes.png)

**Financeiro**
![Financeiro](docs/screenshots/tela-financeiro.png)

</details>

---

## Stack Tecnológica

**Backend:** Node.js, Express 4.18, PostgreSQL 13, pg 8.11
**Frontend:** React 18, Vite 6, React Router DOM 7, Tailwind CSS 3.4, Recharts 2.12, Lucide React, Axios
**Infra:** Docker, Docker Compose

---

## API REST — Endpoints

Base URL: `http://localhost:3000`

Todos os endpoints retornam e aceitam **JSON**.

### Status

| Método | Endpoint  | Descrição                                |
|--------|-----------|------------------------------------------|
| GET    | /status   | Verifica se a API e o banco estão ativos |

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

### Imóveis

| Método | Endpoint       | Descrição                |
|--------|----------------|--------------------------|
| GET    | /imoveis       | Listar todos os imóveis  |
| GET    | /imoveis/:id   | Buscar imóvel por ID     |
| POST   | /imoveis       | Cadastrar novo imóvel    |
| PUT    | /imoveis/:id   | Atualizar imóvel         |
| DELETE | /imoveis/:id   | Remover imóvel           |

**Campos do imóvel (POST/PUT):**
```json
{
  "titulo": "Apartamento Centro",
  "descricao": "Apto 2 quartos, reformado",
  "endereco": "Rua das Flores, 100",
  "cidade": "São Paulo",
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

| Método | Endpoint       | Descrição                |
|--------|----------------|--------------------------|
| GET    | /clientes      | Listar todos os clientes |
| GET    | /clientes/:id  | Buscar cliente por ID    |
| POST   | /clientes      | Cadastrar novo cliente   |
| PUT    | /clientes/:id  | Atualizar cliente        |
| DELETE | /clientes/:id  | Remover cliente          |

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

### Locações

| Método | Endpoint                  | Descrição                  |
|--------|---------------------------|----------------------------|
| GET    | /locacoes                 | Listar todas as locações   |
| GET    | /locacoes/:id             | Buscar locação por ID      |
| POST   | /locacoes                 | Registrar nova locação     |
| PATCH  | /locacoes/:id/encerrar    | Encerrar locação ativa     |

**Campos da locação (POST):**
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

### Categorias de Imóveis

| Método | Endpoint         | Descrição                |
|--------|------------------|--------------------------|
| GET    | /categorias      | Listar todas as categorias |
| POST   | /categorias      | Criar nova categoria     |
| DELETE | /categorias/:id  | Remover categoria        |

**Campos da categoria (POST):**
```json
{
  "nome": "Apartamento",
  "descricao": "Imóvel em condomínio vertical"
}
```

---

### Financeiro

| Método | Endpoint                  | Descrição                     |
|--------|---------------------------|-------------------------------|
| GET    | /financeiro               | Listar registros financeiros  |
| POST   | /financeiro               | Registrar cobrança            |
| PATCH  | /financeiro/:id/pagar     | Marcar cobrança como paga     |

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

## Estrutura do Projeto

```
.
├── docker-compose.yml
├── database/
│   └── init.sql
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── index.js
│       ├── db/pool.js
│       └── routes/
│           ├── status.js
│           ├── imoveis.js
│           ├── clientes.js
│           ├── locacoes.js
│           ├── categorias.js
│           └── financeiro.js
├── frontend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── api/axios.js
│       ├── components/
│       │   ├── Layout.jsx
│       │   ├── Modal.jsx
│       │   ├── StatusBadge.jsx
│       │   ├── Skeleton.jsx
│       │   └── EmptyState.jsx
│       └── pages/
│           ├── Dashboard.jsx
│           ├── Imoveis.jsx
│           ├── Clientes.jsx
│           ├── Locacoes.jsx
│           └── Financeiro.jsx
├── postman/
│   └── RCP_Data_Imob.postman_collection.json
└── docs/
    ├── Documentacao_Completa_RCP_Data_Imob.md
    └── screenshots/
```

---

## Documentação

A documentação completa do projeto (todos os entregáveis unificados) está em [`docs/Documentacao_Completa_RCP_Data_Imob.md`](docs/Documentacao_Completa_RCP_Data_Imob.md).
