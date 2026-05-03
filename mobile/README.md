# RCP Data Imob Mobile

MVP mobile do Entregável 8, criado com React Native + Expo.

## Funcionalidade

Fluxo implementado: **F1 — Busca de Disponibilidade e Criação de Reserva**.

- `GET /status`: valida conexão com backend e banco.
- `GET /imoveis/disponibilidade`: busca imóveis disponíveis por período.
- `GET /clientes`: lista clientes para seleção.
- `POST /locacoes`: cria a reserva.
- `GET /locacoes`: lista reservas recentes.

## Configuração da API

O fallback do projeto é `http://10.0.2.2:3000`, adequado para emulador Android.

Para celular físico na mesma rede local, crie um `.env`:

```bash
copy .env.example .env
```

Edite:

```bash
EXPO_PUBLIC_API_URL=http://SEU_IP_LOCAL:3000
```

## Execução

```bash
npm install
npm start
```

Com o backend rodando:

```bash
docker compose up --build -d
```
