const pool = require('./pool');

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  papel VARCHAR(50) DEFAULT 'usuario',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categorias_imoveis (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL UNIQUE,
  descricao TEXT
);

CREATE TABLE IF NOT EXISTS imoveis (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  endereco VARCHAR(500) NOT NULL,
  cidade VARCHAR(100),
  estado VARCHAR(2),
  cep VARCHAR(10),
  valor_aluguel NUMERIC(12, 2),
  valor_venda NUMERIC(12, 2),
  area NUMERIC(10, 2),
  quartos INTEGER DEFAULT 0,
  banheiros INTEGER DEFAULT 0,
  vagas_garagem INTEGER DEFAULT 0,
  disponivel BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS imovel_categorias (
  imovel_id INTEGER REFERENCES imoveis(id) ON DELETE CASCADE,
  categoria_id INTEGER REFERENCES categorias_imoveis(id) ON DELETE CASCADE,
  PRIMARY KEY (imovel_id, categoria_id)
);

CREATE TABLE IF NOT EXISTS clientes (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) UNIQUE,
  email VARCHAR(255),
  telefone VARCHAR(20),
  endereco VARCHAR(500),
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS locacoes (
  id SERIAL PRIMARY KEY,
  imovel_id INTEGER REFERENCES imoveis(id) ON DELETE CASCADE,
  cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
  data_inicio DATE NOT NULL,
  data_fim DATE,
  valor_mensal NUMERIC(12, 2) NOT NULL,
  ativa BOOLEAN DEFAULT TRUE,
  status VARCHAR(50) DEFAULT 'pendente',
  valor_total NUMERIC(12, 2),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS financeiro (
  id SERIAL PRIMARY KEY,
  locacao_id INTEGER REFERENCES locacoes(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL,
  valor NUMERIC(12, 2) NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  status VARCHAR(50) DEFAULT 'pendente',
  descricao TEXT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_financeiro_status     ON financeiro(status);
CREATE INDEX IF NOT EXISTS idx_financeiro_tipo       ON financeiro(tipo);
CREATE INDEX IF NOT EXISTS idx_financeiro_vencimento ON financeiro(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_financeiro_locacao    ON financeiro(locacao_id);
CREATE INDEX IF NOT EXISTS idx_clientes_usuario_id   ON clientes(usuario_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);

-- Multi-tenant: cada imobiliária é um cliente da plataforma (não confundir com
-- a tabela "clientes", que são os clientes DA imobiliária).
CREATE TABLE IF NOT EXISTS imobiliarias (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18),
  email VARCHAR(255),
  telefone VARCHAR(20),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NULL em usuarios.imobiliaria_id = superadmin (papel 'admin'), enxerga todas.
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS imobiliaria_id INTEGER REFERENCES imobiliarias(id) ON DELETE SET NULL;
ALTER TABLE imoveis  ADD COLUMN IF NOT EXISTS imobiliaria_id INTEGER REFERENCES imobiliarias(id) ON DELETE CASCADE;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS imobiliaria_id INTEGER REFERENCES imobiliarias(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_imoveis_imobiliaria  ON imoveis(imobiliaria_id);
CREATE INDEX IF NOT EXISTS idx_clientes_imobiliaria ON clientes(imobiliaria_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_imobiliaria ON usuarios(imobiliaria_id);
`;

const SEED_SQL = `
-- Backfill: dados pré-existentes (antes do multi-tenant) pertencem a uma
-- imobiliária padrão, que pode ser renomeada depois na tela de Imobiliárias.
-- Precisa existir antes dos INSERTs de imoveis/clientes abaixo (FK).
INSERT INTO imobiliarias (id, nome) VALUES
  (1, 'Imobiliária Padrão')
ON CONFLICT DO NOTHING;
SELECT setval('imobiliarias_id_seq', (SELECT MAX(id) FROM imobiliarias));

INSERT INTO categorias_imoveis (id, nome, descricao) VALUES
  (1, 'Apartamento', 'Imóvel em condomínio vertical'),
  (2, 'Casa',        'Imóvel residencial horizontal'),
  (3, 'Studio',      'Unidade compacta de ambiente integrado')
ON CONFLICT DO NOTHING;

INSERT INTO imoveis (id, titulo, descricao, endereco, cidade, estado, cep, valor_aluguel, valor_venda, area, quartos, banheiros, vagas_garagem, disponivel, imobiliaria_id) VALUES
  (1, 'Apartamento Centro',   'Apto 2 quartos reformado',   'Rua das Flores, 100', 'São Paulo', 'SP', '01000-000', 1500.00, NULL, 65.00,  2, 1, 1, TRUE, 1),
  (2, 'Casa Jardins',         'Casa 3 quartos com piscina', 'Av. Paulista, 200',   'São Paulo', 'SP', '01310-000', 3500.00, NULL, 180.00, 3, 2, 2, TRUE, 1),
  (3, 'Studio Vila Madalena', 'Studio compacto',            'Rua Harmonia, 50',    'São Paulo', 'SP', '05435-000', 2200.00, NULL, 35.00,  1, 1, 0, TRUE, 1)
ON CONFLICT DO NOTHING;

INSERT INTO imovel_categorias (imovel_id, categoria_id) VALUES
  (1, 1), (2, 2), (3, 3)
ON CONFLICT DO NOTHING;

INSERT INTO clientes (id, nome, cpf, email, telefone, endereco, imobiliaria_id) VALUES
  (1, 'Ana Souza',     '123.456.789-00', 'ana@email.com',    '(11) 99999-9999', 'Rua A, 10', 1),
  (2, 'Carlos Mendes', '987.654.321-00', 'carlos@email.com', '(11) 98888-8888', 'Rua B, 20', 1),
  (3, 'Marina Lima',   '456.789.123-00', 'marina@email.com', '(11) 97777-7777', 'Rua C, 30', 1)
ON CONFLICT DO NOTHING;

INSERT INTO locacoes (id, imovel_id, cliente_id, data_inicio, data_fim, valor_mensal, ativa, status, valor_total) VALUES
  (1, 1, 1, '2026-01-01', '2027-01-01', 1500.00, TRUE, 'confirmada', 18250.00),
  (2, 2, 2, '2026-02-01', '2026-08-01', 3500.00, TRUE, 'confirmada', 21116.67),
  (3, 3, 3, '2026-03-01', '2026-09-01', 2200.00, TRUE, 'confirmada', 13493.33)
ON CONFLICT DO NOTHING;

INSERT INTO financeiro (id, locacao_id, tipo, valor, data_vencimento, data_pagamento, status, descricao) VALUES
  (1,  1, 'receita', 1500.00, '2026-01-05', '2026-04-27', 'pago',     'Aluguel janeiro/2026'),
  (2,  1, 'receita', 1500.00, '2026-02-05', '2026-04-27', 'pago',     'Aluguel fevereiro/2026'),
  (3,  1, 'receita', 1500.00, '2026-03-05', '2026-04-27', 'pago',     'Aluguel março/2026'),
  (4,  1, 'receita', 1500.00, '2026-04-05', NULL,         'atrasado', 'Aluguel abril/2026'),
  (5,  2, 'receita', 3500.00, '2026-02-10', '2026-04-27', 'pago',     'Aluguel fevereiro Casa Jardins'),
  (6,  2, 'receita', 3500.00, '2026-03-10', '2026-04-27', 'pago',     'Aluguel março Casa Jardins'),
  (7,  2, 'receita', 3500.00, '2026-04-10', NULL,         'atrasado', 'Aluguel abril Casa Jardins'),
  (8,  3, 'receita', 2200.00, '2026-03-15', '2026-04-27', 'pago',     'Aluguel março Studio'),
  (9,  3, 'receita', 2200.00, '2026-04-15', NULL,         'atrasado', 'Aluguel abril Studio'),
  (10, 1, 'despesa',  250.00, '2026-02-20', '2026-04-27', 'pago',     'Conta de luz'),
  (11, 2, 'despesa',  850.00, '2026-03-25', NULL,         'atrasado', 'Reparo de hidráulica'),
  (12, 3, 'despesa',  420.00, '2026-04-20', NULL,         'atrasado', 'IPTU mensal')
ON CONFLICT DO NOTHING;

SELECT setval('categorias_imoveis_id_seq', (SELECT MAX(id) FROM categorias_imoveis));
SELECT setval('imoveis_id_seq',            (SELECT MAX(id) FROM imoveis));
SELECT setval('clientes_id_seq',           (SELECT MAX(id) FROM clientes));
SELECT setval('locacoes_id_seq',           (SELECT MAX(id) FROM locacoes));
SELECT setval('financeiro_id_seq',         (SELECT MAX(id) FROM financeiro));

-- Cobre imóveis/clientes inseridos antes desta migration existir (produção).
UPDATE imoveis  SET imobiliaria_id = 1 WHERE imobiliaria_id IS NULL;
UPDATE clientes SET imobiliaria_id = 1 WHERE imobiliaria_id IS NULL;

ALTER TABLE imoveis  ALTER COLUMN imobiliaria_id SET NOT NULL;
ALTER TABLE clientes ALTER COLUMN imobiliaria_id SET NOT NULL;
`;

async function runMigrations() {
  try {
    await pool.query(SCHEMA_SQL);
    await pool.query(SEED_SQL);
    console.log('✅ Schema e seed aplicados');
  } catch (err) {
    console.error('Erro na migração:', err.message);
  }
}

module.exports = { runMigrations };
