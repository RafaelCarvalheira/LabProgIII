-- Migracao F3: Controle Financeiro com Dashboard Analitico (Entregavel 7)
-- Execute dentro do container: docker exec -i labprogiii-db-1 psql -U admin -d rcp_data_imob < migration_f3.sql

-- 1) Adiciona campo opcional de descricao em financeiro
ALTER TABLE financeiro
  ADD COLUMN IF NOT EXISTS descricao TEXT;

-- 2) Atualiza lancamentos vencidos nao pagos para status 'atrasado'
UPDATE financeiro
   SET status = 'atrasado'
 WHERE status = 'pendente'
   AND data_vencimento < CURRENT_DATE;

-- 3) Indices para acelerar filtros analiticos
CREATE INDEX IF NOT EXISTS idx_financeiro_status         ON financeiro(status);
CREATE INDEX IF NOT EXISTS idx_financeiro_tipo           ON financeiro(tipo);
CREATE INDEX IF NOT EXISTS idx_financeiro_vencimento     ON financeiro(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_financeiro_locacao        ON financeiro(locacao_id);

-- 4) Confirmacao
SELECT id, locacao_id, tipo, valor, status, descricao, data_vencimento
  FROM financeiro
 ORDER BY data_vencimento DESC
 LIMIT 10;
