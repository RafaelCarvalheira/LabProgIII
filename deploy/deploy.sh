#!/bin/bash
# =============================================================
# deploy.sh — Script de deploy no servidor compartilhado
# Grupo 04 — Lab Prog III
# Servidor: 192.168.91.176 | User: grupo04
# Portas reservadas: 8031-8040
#   - Backend  → 8031
#   - Frontend → 8032
#   - DB       → 8039 (interno, não exposto ao público idealmente)
# =============================================================

set -e  # aborta em caso de erro

# ── Cores para output ────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log()  { echo -e "${BLUE}[INFO]${NC} $1"; }
ok()   { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
fail() { echo -e "${RED}[ERRO]${NC} $1"; exit 1; }

echo ""
echo "======================================================"
echo "  RCP Data Imob — Deploy — Grupo 04"
echo "  Servidor: 192.168.91.176"
echo "  Portas: backend=8031 | frontend=8032 | db=8039"
echo "======================================================"
echo ""

# ── 1. Verifica Docker ───────────────────────────────────────
log "Verificando Docker..."
docker info > /dev/null 2>&1 || fail "Docker não está acessível para este usuário."
ok "Docker disponível."

# ── 2. Para containers anteriores (se existirem) ─────────────
log "Parando containers anteriores (se houver)..."
docker compose down --remove-orphans 2>/dev/null || true
ok "Containers parados."

# ── 3. Build e start ─────────────────────────────────────────
log "Construindo imagens e subindo containers..."
docker compose up --build -d

ok "Containers iniciados. Aguardando banco de dados ficar pronto..."

# ── 4. Aguarda o banco ficar healthy ─────────────────────────
MAX_WAIT=60
WAITED=0
CONTAINER=$(docker compose ps -q db 2>/dev/null | head -1)

while [ $WAITED -lt $MAX_WAIT ]; do
  STATUS=$(docker inspect --format='{{.State.Health.Status}}' "$CONTAINER" 2>/dev/null || echo "unknown")
  if [ "$STATUS" = "healthy" ]; then
    ok "Banco de dados saudável!"
    break
  fi
  echo -n "."
  sleep 2
  WAITED=$((WAITED + 2))
done

if [ $WAITED -ge $MAX_WAIT ]; then
  warn "Timeout aguardando banco. Continuando mesmo assim..."
fi

echo ""

# ── 5. Executa seed de dados iniciais ────────────────────────
log "Executando carga de dados iniciais (seed.sql)..."
sleep 3  # garante que o postgres terminou de inicializar
DB_CONTAINER=$(docker compose ps -q db | head -1)

docker exec -i "$DB_CONTAINER" psql -U admin -d rcp_data_imob < seed.sql \
  && ok "Dados iniciais carregados com sucesso." \
  || warn "Seed falhou ou dados já existem — verifique manualmente."

# ── 6. Testa a API ───────────────────────────────────────────
log "Testando API (GET /status)..."
sleep 2
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8031/status 2>/dev/null || echo "000")

if [ "$HTTP_STATUS" = "200" ]; then
  ok "API respondendo em http://192.168.91.176:8031/status"
else
  warn "API ainda não responde (HTTP $HTTP_STATUS). Pode precisar de mais alguns segundos."
fi

# ── 7. Resumo ────────────────────────────────────────────────
echo ""
echo "======================================================"
echo -e "${GREEN}  Deploy concluído!${NC}"
echo "======================================================"
echo ""
echo "  Acesse o sistema:"
echo "  🌐 Frontend : http://192.168.91.176:8032"
echo "  🔌 API REST : http://192.168.91.176:8031"
echo "  🗄️  Banco    : localhost:8039 (interno)"
echo ""
echo "  Comandos úteis:"
echo "  docker compose ps              → status dos containers"
echo "  docker compose logs -f backend → logs do backend"
echo "  docker compose logs -f frontend→ logs do frontend"
echo "  docker compose down            → parar tudo"
echo "======================================================"