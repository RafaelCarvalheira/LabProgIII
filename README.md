# Sistema de Imoveis

Grupo: Rafael Carvalheira, Marcell Parra, Ruan Pablo

Sistema composto por tres servicos orquestrados via Docker Compose: banco de dados, backend e frontend.

## Servicos e portas

| Servico  | Descricao              | Porta |
|----------|------------------------|-------|
| db       | PostgreSQL 13 (Alpine) | 5432  |
| backend  | Node.js / Express      | 3000  |
| frontend | React / Vite           | 5173  |

## Como subir o ambiente

```bash
docker compose up
```

Para subir em segundo plano:

```bash
docker compose up -d
```

Na primeira execucao ou apos alteracoes nos arquivos, adicione `--build`:

```bash
docker compose up --build -d
```

## Como derrubar o ambiente

```bash
docker compose down
```

Para remover tambem os volumes (apaga os dados do banco):

```bash
docker compose down -v
```
