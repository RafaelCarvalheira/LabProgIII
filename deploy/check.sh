#!/bin/bash
# =============================================================
# check.sh — Verifica se todos os serviços estão funcionando
# Grupo 04 — Lab Prog III
# =============================================================

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

ok()   { echo -e "${GREEN}  ✓${NC} $1"; }
fail() { echo -e "${RED}  ✗${NC} $1"; }
warn() { echo -e "${YELLOW}  !${NC} $1"; }

echo ""
echo "======================================================"
echo "  Verificação do Ambiente — Grupo 04"
echo "======================================================"
echo ""

# ── Containers ───────────────────────────────────────────────
echo "[ Containers ]"
for svc in db backend frontend; do
  STATE=$(docker compose ps --format json 2>/dev/null | \
    python3 -c "import sys,json; data=sys.stdin.read()
lines=[l for l in data.strip().split('\n') if l]
for l in lines:
    d=json.loads(l)
    if '$svc' in d.get('Service',''):
        print(d.get('State','unknown'))
" 2>/dev/null || echo "unknown")

  if [ "$STATE" = "running" ]; then
    ok "$svc está RUNNING"
  else
    fail "$svc — estado: $STATE"
  fi
done

echo ""

# ── Portas ───────────────────────────────────────────────────
echo "[ Portas ]"
for porta in 8031 8032 8039; do
  if ss -tlnp 2>/dev/null | grep -q ":$porta " || \
     netstat -tlnp 2>/dev/null | grep -q ":$porta "; then
    ok "Porta $porta está em uso (OK)"
  else
    warn "Porta $porta não detectada (pode ser normal se usando bridge)"
  fi
done

echo ""

# ── API REST ─────────────────────────────────────────────────
echo "[ API REST — http://localhost:8031 ]"

check_endpoint() {
  local desc="$1"
  local url="$2"
  local expected_code="${3:-200}"
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url" 2>/dev/null || echo "000")
  if [ "$code" = "$expected_code" ]; then
    ok "$desc → HTTP $code"
  else
    fail "$desc → HTTP $code (esperado $expected_code)"
  fi
}

check_endpoint "GET /status"     "http://localhost:8031/status"
check_endpoint "GET /imoveis"    "http://localhost:8031/imoveis"
check_endpoint "GET /clientes"   "http://localhost:8031/clientes"
check_endpoint "GET /locacoes"   "http://localhost:8031/locacoes"
check_endpoint "GET /financeiro" "http://localhost:8031/financeiro"
check_endpoint "GET /categorias" "http://localhost:8031/categorias"
check_endpoint "GET /financeiro/resumo" "http://localhost:8031/financeiro/resumo"

echo ""

# ── Frontend ─────────────────────────────────────────────────
echo "[ Frontend — http://localhost:8032 ]"
code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "http://localhost:8032" 2>/dev/null || echo "000")
if [ "$code" = "200" ]; then
  ok "Frontend respondendo → HTTP $code"
else
  warn "Frontend → HTTP $code (pode estar inicializando, aguarde)"
fi

echo ""

# ── Banco de dados ───────────────────────────────────────────
echo "[ Banco de Dados ]"
DB_CONTAINER=$(docker compose ps -q db 2>/dev/null | head -1)
if [ -n "$DB_CONTAINER" ]; then
  RESULT=$(docker exec "$DB_CONTAINER" psql -U admin -d rcp_data_imob -t -c \
    "SELECT 'imoveis:'||COUNT(*) FROM imoveis UNION ALL
     SELECT 'clientes:'||COUNT(*) FROM clientes UNION ALL
     SELECT 'locacoes:'||COUNT(*) FROM locacoes UNION ALL
     SELECT 'financeiro:'||COUNT(*) FROM financeiro;" 2>/dev/null || echo "erro")
  if echo "$RESULT" | grep -q "imoveis:"; then
    ok "Conexão com banco OK"
    echo "$RESULT" | while IFS= read -r line; do
      [ -n "$(echo $line | tr -d ' ')" ] && echo "     → $line"
    done
  else
    fail "Não foi possível consultar o banco"
  fi
else
  fail "Container do banco não encontrado"
fi

echo ""
echo "======================================================"
echo "  URLs de acesso externo:"
echo "  🌐 http://192.168.91.176:8032  (Frontend)"
echo "  🔌 http://192.168.91.176:8031  (API)"
echo "======================================================"
echo ""
