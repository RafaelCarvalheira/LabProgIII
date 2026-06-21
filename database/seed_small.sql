-- =============================================================
-- Seed REDUZIDO e coerente para apresentação.
-- 5 imóveis, 25 clientes, algumas locações e financeiro.
-- Zera as tabelas e recria os dados de forma determinística.
-- Data de referência da apresentação: ~2026-06.
-- =============================================================

BEGIN;

TRUNCATE financeiro, locacoes, imovel_categorias, imoveis, clientes, categorias_imoveis, usuarios
  RESTART IDENTITY CASCADE;

-- ---------- Usuários ----------
INSERT INTO usuarios (nome, email, senha, papel) VALUES
  ('Admin Geral',    'admin@rcp.com',     '$2a$10$abcdefghijklmnopqrstuv', 'admin'),
  ('Gestor Locação', 'gestor@rcp.com',    '$2a$10$abcdefghijklmnopqrstuv', 'gestor'),
  ('Corretor Um',    'corretor@rcp.com',  '$2a$10$abcdefghijklmnopqrstuv', 'corretor');

-- ---------- Categorias ----------
INSERT INTO categorias_imoveis (id, nome, descricao) VALUES
  (1, 'Apartamento',    'Imóvel em condomínio vertical'),
  (2, 'Casa',           'Imóvel residencial horizontal'),
  (3, 'Studio',         'Unidade compacta de ambiente integrado'),
  (4, 'Cobertura',      'Unidade no último andar com terraço'),
  (5, 'Sala Comercial', 'Espaço para uso comercial');

-- ---------- Imóveis (5) ----------
INSERT INTO imoveis (id, titulo, descricao, endereco, cidade, estado, cep, valor_aluguel, valor_venda, area, quartos, banheiros, vagas_garagem, disponivel) VALUES
  (1, 'Apartamento Centro',    'Apto 2 quartos reformado, próximo ao metrô', 'Rua das Flores, 100', 'São Paulo',  'SP', '01000-000', 1500.00,  480000.00, 65.00,  2, 1, 1, FALSE),
  (2, 'Casa Jardins',          'Casa 3 quartos com piscina e quintal',       'Av. Paulista, 200',   'São Paulo',  'SP', '01310-000', 3500.00, 1250000.00, 180.00, 3, 2, 2, FALSE),
  (3, 'Studio Vila Madalena',  'Studio compacto, mobiliado',                 'Rua Harmonia, 50',    'São Paulo',  'SP', '05435-000', 2200.00,  390000.00, 35.00,  1, 1, 0, FALSE),
  (4, 'Cobertura Boa Viagem',  'Cobertura com vista para o mar',             'Av. Beira Mar, 1500', 'Recife',     'PE', '51020-000', 4800.00, 1850000.00, 210.00, 4, 3, 2, FALSE),
  (5, 'Sala Comercial Batel',  'Sala comercial em prédio corporativo',       'Av. do Batel, 1800',  'Curitiba',   'PR', '80420-000', 2800.00,  720000.00, 80.00,  0, 2, 1, TRUE);

INSERT INTO imovel_categorias (imovel_id, categoria_id) VALUES
  (1, 1), (2, 2), (3, 3), (4, 4), (5, 5);

-- ---------- Clientes (25) ----------
INSERT INTO clientes (id, nome, cpf, email, telefone, endereco) VALUES
  (1,  'Ana Souza',          '123.456.789-00', 'ana.souza@email.com',        '(11) 99999-1001', 'Rua A, 10 - São Paulo/SP'),
  (2,  'Carlos Mendes',      '987.654.321-00', 'carlos.mendes@email.com',    '(11) 98888-1002', 'Rua B, 20 - São Paulo/SP'),
  (3,  'Marina Lima',        '456.789.123-00', 'marina.lima@email.com',      '(11) 97777-1003', 'Rua C, 30 - São Paulo/SP'),
  (4,  'Bruno Carvalho',     '321.654.987-11', 'bruno.carvalho@email.com',   '(11) 96666-1004', 'Rua D, 40 - São Paulo/SP'),
  (5,  'Eduarda Ferreira',   '741.852.963-22', 'eduarda.ferreira@email.com', '(11) 95555-1005', 'Rua E, 50 - São Paulo/SP'),
  (6,  'Felipe Almeida',     '159.357.486-33', 'felipe.almeida@email.com',   '(21) 94444-1006', 'Rua F, 60 - Rio de Janeiro/RJ'),
  (7,  'Gabriela Costa',     '258.456.789-44', 'gabriela.costa@email.com',   '(21) 93333-1007', 'Rua G, 70 - Rio de Janeiro/RJ'),
  (8,  'Henrique Gomes',     '369.258.147-55', 'henrique.gomes@email.com',   '(81) 92222-1008', 'Rua H, 80 - Recife/PE'),
  (9,  'Isabela Martins',    '147.369.258-66', 'isabela.martins@email.com',  '(81) 91111-1009', 'Rua I, 90 - Recife/PE'),
  (10, 'João Pereira',       '951.753.852-77', 'joao.pereira@email.com',     '(41) 90000-1010', 'Rua J, 100 - Curitiba/PR'),
  (11, 'Karina Ribeiro',     '852.963.741-88', 'karina.ribeiro@email.com',   '(41) 99888-1011', 'Rua K, 110 - Curitiba/PR'),
  (12, 'Lucas Nunes',        '753.159.456-99', 'lucas.nunes@email.com',      '(41) 99777-1012', 'Rua L, 120 - Curitiba/PR'),
  (13, 'Mariana Cardoso',    '456.123.789-01', 'mariana.cardoso@email.com',  '(11) 99666-1013', 'Rua M, 130 - São Paulo/SP'),
  (14, 'Nicolas Teixeira',   '789.456.123-02', 'nicolas.teixeira@email.com', '(11) 99555-1014', 'Rua N, 140 - São Paulo/SP'),
  (15, 'Olívia Barbosa',     '123.789.456-03', 'olivia.barbosa@email.com',   '(11) 99444-1015', 'Rua O, 150 - São Paulo/SP'),
  (16, 'Paulo Moraes',       '321.987.654-04', 'paulo.moraes@email.com',     '(21) 99333-1016', 'Rua P, 160 - Rio de Janeiro/RJ'),
  (17, 'Quésia Araújo',      '654.321.987-05', 'quesia.araujo@email.com',    '(21) 99222-1017', 'Rua Q, 170 - Rio de Janeiro/RJ'),
  (18, 'Rafael Oliveira',    '987.123.654-06', 'rafael.oliveira@email.com',  '(81) 99111-1018', 'Rua R, 180 - Recife/PE'),
  (19, 'Sofia Rodrigues',    '147.258.369-07', 'sofia.rodrigues@email.com',  '(81) 99000-1019', 'Rua S, 190 - Recife/PE'),
  (20, 'Thiago Santos',      '258.369.147-08', 'thiago.santos@email.com',    '(41) 98999-1020', 'Rua T, 200 - Curitiba/PR'),
  (21, 'Úrsula Silva',       '369.147.258-09', 'ursula.silva@email.com',     '(41) 98888-1021', 'Rua U, 210 - Curitiba/PR'),
  (22, 'Vinícius Lima',      '741.963.852-10', 'vinicius.lima@email.com',    '(11) 98777-1022', 'Rua V, 220 - São Paulo/SP'),
  (23, 'Wesley Gomes',       '852.741.963-12', 'wesley.gomes@email.com',     '(11) 98666-1023', 'Rua W, 230 - São Paulo/SP'),
  (24, 'Yara Costa',         '963.852.741-13', 'yara.costa@email.com',       '(11) 98555-1024', 'Rua X, 240 - São Paulo/SP'),
  (25, 'Zeca Pereira',       '159.753.486-14', 'zeca.pereira@email.com',     '(11) 98444-1025', 'Rua Y, 250 - São Paulo/SP');

-- ---------- Locações (8) — só alguns clientes têm contrato ----------
-- imóvel 1: contrato anterior (encerrado) + contrato atual (ativo)
-- imóvel 2,3,4: ativos; imóvel 5: proposta pendente; um cancelado.
INSERT INTO locacoes (id, imovel_id, cliente_id, data_inicio, data_fim, valor_mensal, ativa, status, valor_total) VALUES
  (1, 1, 2, '2024-01-01', '2025-01-01', 1450.00, FALSE, 'encerrada',  17400.00),  -- histórico
  (2, 1, 1, '2025-09-01', '2026-09-01', 1500.00, TRUE,  'confirmada', 18000.00),  -- atual
  (3, 2, 3, '2026-01-01', '2027-01-01', 3500.00, TRUE,  'confirmada', 42000.00),
  (4, 3, 5, '2025-07-01', '2026-07-01', 2200.00, TRUE,  'confirmada', 26400.00),
  (5, 4, 8, '2026-03-01', '2027-03-01', 4800.00, TRUE,  'confirmada', 57600.00),
  (6, 3, 4, '2024-03-01', '2025-03-01', 2100.00, FALSE, 'encerrada',  25200.00),  -- histórico
  (7, 5,12, '2026-07-01', '2027-07-01', 2800.00, FALSE, 'pendente',   33600.00),  -- proposta futura
  (8, 2,15, '2025-11-01', '2026-11-01', 3500.00, FALSE, 'cancelada',  42000.00);  -- desistência

-- ---------- Financeiro: parcelas mensais por locação ----------
-- Gera as parcelas do período de cada locação até no máx. hoje+2 meses,
-- com status coerente à data de referência.
DO $$
DECLARE
  loc     record;
  venc    date;
  pago_em date;
  st      text;
  i       int;
BEGIN
  FOR loc IN SELECT id, data_inicio, data_fim, valor_mensal, status FROM locacoes LOOP
    -- proposta pendente (futura) ainda não gera financeiro
    CONTINUE WHEN loc.status = 'pendente';

    i := 0;
    venc := loc.data_inicio;
    WHILE venc <= LEAST(loc.data_fim, CURRENT_DATE + INTERVAL '2 months')::date LOOP
      -- contratos cancelados só geram a 1ª cobrança
      EXIT WHEN loc.status = 'cancelada' AND i > 0;

      IF venc < CURRENT_DATE THEN
        IF i % 7 = 5 THEN          -- ~1 em cada 7 fica atrasado
          st := 'atrasado'; pago_em := NULL;
        ELSE
          st := 'pago';            pago_em := venc + 3;
        END IF;
      ELSE
        st := 'pendente';          pago_em := NULL;
      END IF;

      INSERT INTO financeiro (locacao_id, tipo, valor, data_vencimento, data_pagamento, status, descricao)
      VALUES (loc.id, 'receita', loc.valor_mensal, venc, pago_em, st,
              'Aluguel ' || to_char(venc, 'MM/YYYY'));

      i := i + 1;
      venc := loc.data_inicio + (i * INTERVAL '1 month');
    END LOOP;
  END LOOP;
END $$;

-- ---------- Algumas despesas avulsas (coerentes) ----------
INSERT INTO financeiro (locacao_id, tipo, valor, data_vencimento, data_pagamento, status, descricao) VALUES
  (2, 'despesa', 250.00,  '2026-02-20', '2026-02-22', 'pago',     'Conta de luz - Apto Centro'),
  (2, 'despesa', 180.00,  '2026-05-20', NULL,         'atrasado', 'Conta de água - Apto Centro'),
  (3, 'despesa', 850.00,  '2026-03-25', NULL,         'atrasado', 'Reparo hidráulico - Casa Jardins'),
  (4, 'despesa', 420.00,  '2026-04-15', '2026-04-18', 'pago',     'IPTU - Studio Vila Madalena'),
  (5, 'despesa', 1200.00, '2026-06-10', NULL,         'pendente', 'Manutenção predial - Cobertura');

-- Ressincroniza sequences após inserts com id explícito
SELECT setval('usuarios_id_seq',           (SELECT MAX(id) FROM usuarios));
SELECT setval('categorias_imoveis_id_seq', (SELECT MAX(id) FROM categorias_imoveis));
SELECT setval('imoveis_id_seq',            (SELECT MAX(id) FROM imoveis));
SELECT setval('clientes_id_seq',           (SELECT MAX(id) FROM clientes));
SELECT setval('locacoes_id_seq',           (SELECT MAX(id) FROM locacoes));
SELECT setval('financeiro_id_seq',         (SELECT MAX(id) FROM financeiro));

COMMIT;
