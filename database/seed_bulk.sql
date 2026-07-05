-- =============================================================
-- Seed em massa (dados realistas) — idempotente o bastante para
-- rodar sobre a base já existente. Usa inserts SEM id explícito,
-- aproveitando as sequences. Pode ser re-executado (vai gerar
-- mais dados a cada execução).
-- =============================================================

BEGIN;

-- ---------- Categorias extras ----------
INSERT INTO categorias_imoveis (nome, descricao) VALUES
  ('Cobertura',      'Unidade no último andar com terraço'),
  ('Kitnet',         'Unidade compacta de baixo custo'),
  ('Sobrado',        'Casa de dois pavimentos'),
  ('Comercial',      'Sala ou loja para uso comercial'),
  ('Galpão',         'Espaço amplo para logística/indústria'),
  ('Terreno',        'Lote sem construção'),
  ('Chácara',        'Imóvel rural de lazer')
ON CONFLICT (nome) DO NOTHING;

-- ---------- Usuários ----------
INSERT INTO usuarios (nome, email, senha, papel) VALUES
  ('Admin Geral',     'admin@rcp.com',     '$2a$10$abcdefghijklmnopqrstuv', 'admin'),
  ('Gestor Locação',  'gestor@rcp.com',    '$2a$10$abcdefghijklmnopqrstuv', 'gestor'),
  ('Corretor Um',     'corretor1@rcp.com', '$2a$10$abcdefghijklmnopqrstuv', 'corretor'),
  ('Corretor Dois',   'corretor2@rcp.com', '$2a$10$abcdefghijklmnopqrstuv', 'corretor'),
  ('Financeiro RCP',  'financeiro@rcp.com','$2a$10$abcdefghijklmnopqrstuv', 'financeiro')
ON CONFLICT (email) DO NOTHING;

-- ---------- Imóveis (200) ----------
DO $$
DECLARE
  cidades  text[] := ARRAY['São Paulo','Campinas','Santos','Rio de Janeiro','Niterói','Belo Horizonte','Curitiba','Porto Alegre','Florianópolis','Salvador','Recife','Fortaleza','Brasília','Goiânia','Vitória'];
  estados  text[] := ARRAY['SP','SP','SP','RJ','RJ','MG','PR','RS','SC','BA','PE','CE','DF','GO','ES'];
  ruas     text[] := ARRAY['Rua das Acácias','Av. Brasil','Rua XV de Novembro','Av. Atlântica','Rua dos Andradas','Av. Afonso Pena','Rua Voluntários','Av. Beira Mar','Rua Augusta','Av. Paulista','Rua Oscar Freire','Av. Goiás','Rua da Praia','Av. das Nações','Rua Sete de Setembro'];
  titulos  text[] := ARRAY['Apartamento','Casa','Studio','Cobertura','Kitnet','Sobrado','Sala Comercial','Loft','Flat','Duplex'];
  bairros  text[] := ARRAY['Centro','Jardins','Vila Nova','Bela Vista','Boa Viagem','Savassi','Batel','Moinhos','Centro Histórico','Praia Grande'];
  i        int;
  ci       int;
  q        int;
  area_v   numeric;
  alug     numeric;
  vend     numeric;
BEGIN
  FOR i IN 1..200 LOOP
    ci := 1 + floor(random()*15)::int;
    q  := floor(random()*5)::int;                 -- 0..4 quartos
    area_v := round((25 + random()*275)::numeric, 2);
    alug := round((800 + random()*8000)::numeric, 2);
    -- ~40% também têm valor de venda
    vend := CASE WHEN random() < 0.4 THEN round((150000 + random()*1850000)::numeric, 2) ELSE NULL END;

    INSERT INTO imoveis
      (titulo, descricao, endereco, cidade, estado, cep, valor_aluguel, valor_venda, area, quartos, banheiros, vagas_garagem, disponivel)
    VALUES (
      titulos[1 + floor(random()*array_length(titulos,1))::int] || ' ' || bairros[1 + floor(random()*array_length(bairros,1))::int],
      'Imóvel gerado automaticamente para testes — ' || q || ' quarto(s), área ' || area_v || ' m².',
      ruas[1 + floor(random()*array_length(ruas,1))::int] || ', ' || (10 + floor(random()*1990)::int),
      cidades[ci],
      estados[ci],
      lpad((floor(random()*99999))::text, 5, '0') || '-' || lpad((floor(random()*999))::text, 3, '0'),
      alug,
      vend,
      area_v,
      q,
      1 + floor(random()*3)::int,                  -- 1..3 banheiros
      floor(random()*4)::int,                      -- 0..3 vagas
      random() < 0.7                               -- 70% disponíveis
    );
  END LOOP;
END $$;

-- ---------- Vínculo imóvel<->categoria (1 a 2 por imóvel) ----------
INSERT INTO imovel_categorias (imovel_id, categoria_id)
SELECT im.id, c.id
FROM imoveis im
CROSS JOIN LATERAL (
  SELECT id FROM categorias_imoveis ORDER BY random() LIMIT 1
) c
ON CONFLICT DO NOTHING;

INSERT INTO imovel_categorias (imovel_id, categoria_id)
SELECT im.id, c.id
FROM imoveis im
CROSS JOIN LATERAL (
  SELECT id FROM categorias_imoveis ORDER BY random() LIMIT 1
) c
WHERE random() < 0.35
ON CONFLICT DO NOTHING;

-- ---------- Clientes (150) ----------
DO $$
DECLARE
  nomes  text[] := ARRAY['Ana','Bruno','Carla','Daniel','Eduarda','Felipe','Gabriela','Henrique','Isabela','João','Karina','Lucas','Mariana','Nicolas','Olívia','Paulo','Quiteria','Rafael','Sofia','Thiago','Ursula','Vinícius','Wesley','Xênia','Yara','Zeca','Beatriz','Caio','Débora','Enzo'];
  sobre  text[] := ARRAY['Silva','Souza','Oliveira','Santos','Pereira','Lima','Carvalho','Ferreira','Rodrigues','Almeida','Costa','Gomes','Martins','Araújo','Barbosa','Ribeiro','Nunes','Cardoso','Teixeira','Moraes'];
  i      int;
  nm     text;
  cpf_d  text;   -- 11 dígitos crus
  cpf_v  text;   -- formatado XXX.XXX.XXX-XX
BEGIN
  FOR i IN 1..150 LOOP
    nm := nomes[1 + floor(random()*array_length(nomes,1))::int] || ' ' ||
          sobre[1 + floor(random()*array_length(sobre,1))::int];
    -- 11 dígitos: base aleatória + i garante variedade; colisão tratada abaixo
    cpf_d := lpad(((floor(random()*89999999999)::bigint + 10000000000 + i))::text, 11, '0');
    cpf_d := left(cpf_d, 11);
    cpf_v := substr(cpf_d,1,3) || '.' || substr(cpf_d,4,3) || '.' ||
             substr(cpf_d,7,3) || '-' || substr(cpf_d,10,2);

    BEGIN
      INSERT INTO clientes (nome, cpf, email, telefone, endereco) VALUES (
        nm,
        cpf_v,
        lower(replace(nm,' ','.')) || i || '@email.com',
        '(' || (11 + floor(random()*88)::int) || ') 9' || lpad((floor(random()*9999))::text,4,'0') || '-' || lpad((floor(random()*9999))::text,4,'0'),
        'Rua ' || chr(65 + floor(random()*26)::int) || ', ' || (10 + floor(random()*990)::int)
      );
    EXCEPTION WHEN unique_violation THEN
      -- ignora colisão eventual de CPF
      NULL;
    END;
  END LOOP;
END $$;

-- ---------- Locações (300) ----------
DO $$
DECLARE
  rec        record;
  cli_id     int;
  ini        date;
  meses      int;
  fim        date;
  mensal     numeric;
  st         text;
  status_arr text[] := ARRAY['confirmada','pendente','encerrada','cancelada'];
  k          int;
BEGIN
  FOR k IN 1..300 LOOP
    SELECT id, valor_aluguel INTO rec FROM imoveis ORDER BY random() LIMIT 1;
    SELECT id INTO cli_id FROM clientes ORDER BY random() LIMIT 1;
    CONTINUE WHEN cli_id IS NULL OR rec.id IS NULL;

    ini   := DATE '2024-01-01' + (floor(random()*730)::int);  -- 2024-2025
    meses := 6 + floor(random()*30)::int;                     -- 6..36 meses
    fim   := ini + (meses * 30);
    mensal := COALESCE(rec.valor_aluguel, round((900 + random()*5000)::numeric,2));
    st := status_arr[1 + floor(random()*array_length(status_arr,1))::int];

    INSERT INTO locacoes (imovel_id, cliente_id, data_inicio, data_fim, valor_mensal, ativa, status, valor_total)
    VALUES (
      rec.id, cli_id, ini, fim, mensal,
      (st = 'confirmada'),
      st,
      round((mensal * meses)::numeric, 2)
    );
  END LOOP;
END $$;

-- ---------- Financeiro (parcelas mensais por locação) ----------
-- Para cada locação gera ~12 parcelas de receita + algumas despesas.
DO $$
DECLARE
  loc       record;
  n_meses   int;
  m         int;
  venc      date;
  pago_em   date;
  st        text;
BEGIN
  FOR loc IN SELECT id, data_inicio, valor_mensal FROM locacoes WHERE id > 3 LOOP
    n_meses := 6 + floor(random()*12)::int;     -- 6..17 parcelas

    FOR m IN 0..(n_meses-1) LOOP
      venc := loc.data_inicio + (m * 30);
      -- decide status: pago / pendente / atrasado
      IF venc < CURRENT_DATE THEN
        IF random() < 0.8 THEN
          st := 'pago';
          pago_em := venc + (floor(random()*10)::int);
        ELSE
          st := 'atrasado';
          pago_em := NULL;
        END IF;
      ELSE
        st := 'pendente';
        pago_em := NULL;
      END IF;

      INSERT INTO financeiro (locacao_id, tipo, valor, data_vencimento, data_pagamento, status, descricao)
      VALUES (
        loc.id, 'receita', loc.valor_mensal, venc, pago_em, st,
        'Aluguel parcela ' || (m+1) || '/' || n_meses
      );
    END LOOP;

    -- 0..2 despesas avulsas por locação
    FOR m IN 1..(floor(random()*3)::int) LOOP
      venc := loc.data_inicio + (floor(random()*360)::int);
      IF venc < CURRENT_DATE AND random() < 0.7 THEN
        st := 'pago'; pago_em := venc + floor(random()*15)::int;
      ELSIF venc < CURRENT_DATE THEN
        st := 'atrasado'; pago_em := NULL;
      ELSE
        st := 'pendente'; pago_em := NULL;
      END IF;

      INSERT INTO financeiro (locacao_id, tipo, valor, data_vencimento, data_pagamento, status, descricao)
      VALUES (
        loc.id, 'despesa', round((100 + random()*1500)::numeric,2), venc, pago_em, st,
        (ARRAY['Manutenção predial','Conta de água','Conta de luz','IPTU','Reparo hidráulico','Pintura','Taxa de condomínio'])[1 + floor(random()*7)::int]
      );
    END LOOP;
  END LOOP;
END $$;

COMMIT;
