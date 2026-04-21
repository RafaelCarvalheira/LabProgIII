-- Migração F2: adiciona status e valor_total à tabela locacoes
-- Execute dentro do container: docker exec -i labprogiii-db-1 psql -U admin -d rcp_data_imob < migration_f2.sql
 
ALTER TABLE locacoes 
  ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pendente',
  ADD COLUMN IF NOT EXISTS valor_total NUMERIC(12,2);
 
-- Atualiza registros existentes
UPDATE locacoes SET status = CASE WHEN ativa = true THEN 'confirmada' ELSE 'cancelada' END WHERE status IS NULL OR status = 'pendente';
 
-- Confirma
SELECT id, status, ativa, valor_mensal, valor_total FROM locacoes LIMIT 10;