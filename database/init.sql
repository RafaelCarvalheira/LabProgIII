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
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
