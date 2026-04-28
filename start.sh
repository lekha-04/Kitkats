#!/bin/bash

set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND="$ROOT/backend"
FRONTEND="$ROOT/frontend"
LOG_DIR="$ROOT/logs"

mkdir -p "$LOG_DIR"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()  { echo -e "${GREEN}[✓]${NC} $1"; }
info() { echo -e "${BLUE}[→]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; }

cleanup() {
    echo ""
    warn "Shutting down all services..."
    kill "$BACKEND_PID" 2>/dev/null || true
    kill "$FRONTEND_PID" 2>/dev/null || true
    log "All services stopped."
}
trap cleanup EXIT INT TERM

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "        CompanionAI — Local Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ── 1. Backend ───────────────────────────────
info "Setting up Python backend..."

if [ ! -d "$BACKEND/venv" ]; then
    info "Creating virtualenv..."
    python3 -m venv "$BACKEND/venv"
fi

source "$BACKEND/venv/bin/activate"

info "Installing Python dependencies..."
pip install -q -r "$BACKEND/requirements.txt"

# Check .env exists and has Mistral key
if [ ! -f "$BACKEND/.env" ]; then
    warn ".env not found — creating default one."
    cat > "$BACKEND/.env" <<'EOF'
SECRET_KEY=change-me-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
CHROMA_PERSIST_DIR=./chroma_data
MISTRAL_API_KEY=your-mistral-api-key-here
EOF
    warn "Set MISTRAL_API_KEY in backend/.env before using chat."
fi

info "Starting FastAPI backend on http://localhost:9000 ..."
cd "$BACKEND"
uvicorn app.main:app --host 0.0.0.0 --port 9000 --reload > "$LOG_DIR/backend.log" 2>&1 &
BACKEND_PID=$!
cd "$ROOT"

for i in $(seq 1 15); do
    curl -s http://localhost:9000/health &>/dev/null && break
    sleep 1
done
log "Backend running (pid $BACKEND_PID)."

# ── 2. Frontend ──────────────────────────────
info "Setting up frontend..."
cd "$FRONTEND"

if [ ! -d "node_modules" ]; then
    info "Installing npm dependencies..."
    npm install
fi

info "Starting Vite dev server on http://localhost:5173 ..."
npm run dev > "$LOG_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!
cd "$ROOT"

for i in $(seq 1 15); do
    curl -s http://localhost:5173 &>/dev/null && break
    sleep 1
done
log "Frontend running (pid $FRONTEND_PID)."

# ── Summary ──────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  ${GREEN}All services are up!${NC}"
echo ""
echo "  Frontend  →  http://localhost:5173"
echo "  Backend   →  http://localhost:9000"
echo "  API docs  →  http://localhost:9000/docs"
echo ""
echo "  Logs → $LOG_DIR/"
echo "  Press Ctrl+C to stop everything."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

wait
