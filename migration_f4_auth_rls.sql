-- =============================================================
-- Migration F4 — Autenticação JWT + Row Level Security
-- =============================================================
-- Execute com:
--   docker exec -i labprogiii-db-1 psql -U admin -d rcp_data_imob < migration_f4_auth_rls.sql
-- =============================================================

-- 1. Garante que a tabela usuarios tem a coluna 'senha' (pode já existir)
ALTER TABLE usuarios
  ALTER COLUMN senha SET NOT NULL;

-- 2. Vincula clientes a contas de usuário
ALTER TABLE clientes
  ADD COLUMN IF NOT EXISTS usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_clientes_usuario_id ON clientes(usuario_id);

-- 3. Índice para buscas por email (login)
CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);

-- =============================================================
-- NOTA: O usuário administrador é criado automaticamente pelo
-- backend na inicialização, via variáveis de ambiente:
--   ADMIN_EMAIL    (padrão: marcell.parra.2002@gmail.com)
--   ADMIN_PASSWORD (padrão: Admin@2026)
--   ADMIN_NOME     (padrão: Administrador)
-- Para adicionar futuros admins:
--   UPDATE usuarios SET papel = 'admin' WHERE email = 'novo@email.com';
-- =============================================================

-- 4. Row Level Security no PostgreSQL (defense in depth)
--    As políticas abaixo complementam os filtros da aplicação.

-- Habilita RLS nas tabelas de dados
ALTER TABLE imoveis   ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE locacoes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE financeiro ENABLE ROW LEVEL SECURITY;

-- Remove policies antigas se existirem (re-execução segura)
DROP POLICY IF EXISTS rls_imoveis_admin    ON imoveis;
DROP POLICY IF EXISTS rls_imoveis_cliente  ON imoveis;
DROP POLICY IF EXISTS rls_clientes_admin   ON clientes;
DROP POLICY IF EXISTS rls_clientes_proprio ON clientes;
DROP POLICY IF EXISTS rls_locacoes_admin   ON locacoes;
DROP POLICY IF EXISTS rls_locacoes_cliente ON locacoes;
DROP POLICY IF EXISTS rls_financeiro_admin   ON financeiro;
DROP POLICY IF EXISTS rls_financeiro_cliente ON financeiro;

-- imoveis: admin vê tudo; cliente vê apenas os de suas locações
CREATE POLICY rls_imoveis_admin ON imoveis
  USING (current_setting('app.user_role', TRUE) = 'admin');

CREATE POLICY rls_imoveis_cliente ON imoveis
  FOR SELECT
  USING (
    current_setting('app.user_role', TRUE) = 'admin'
    OR id IN (
      SELECT l.imovel_id FROM locacoes l
      INNER JOIN clientes c ON c.id = l.cliente_id
      WHERE c.usuario_id = NULLIF(current_setting('app.user_id', TRUE), '')::integer
    )
  );

-- clientes: admin vê todos; cliente vê apenas a si mesmo
CREATE POLICY rls_clientes_admin ON clientes
  USING (current_setting('app.user_role', TRUE) = 'admin');

CREATE POLICY rls_clientes_proprio ON clientes
  FOR SELECT
  USING (
    current_setting('app.user_role', TRUE) = 'admin'
    OR usuario_id = NULLIF(current_setting('app.user_id', TRUE), '')::integer
  );

-- locacoes: admin vê todas; cliente vê apenas as suas
CREATE POLICY rls_locacoes_admin ON locacoes
  USING (current_setting('app.user_role', TRUE) = 'admin');

CREATE POLICY rls_locacoes_cliente ON locacoes
  FOR SELECT
  USING (
    current_setting('app.user_role', TRUE) = 'admin'
    OR cliente_id IN (
      SELECT id FROM clientes
      WHERE usuario_id = NULLIF(current_setting('app.user_id', TRUE), '')::integer
    )
  );

-- financeiro: admin vê tudo; cliente vê apenas de suas locações
CREATE POLICY rls_financeiro_admin ON financeiro
  USING (current_setting('app.user_role', TRUE) = 'admin');

CREATE POLICY rls_financeiro_cliente ON financeiro
  FOR SELECT
  USING (
    current_setting('app.user_role', TRUE) = 'admin'
    OR locacao_id IN (
      SELECT l.id FROM locacoes l
      INNER JOIN clientes c ON c.id = l.cliente_id
      WHERE c.usuario_id = NULLIF(current_setting('app.user_id', TRUE), '')::integer
    )
  );
