#!/bin/bash
# Session Start Hook — nosho-crm
# Runs at the start of every Claude Code remote session.
# - Installs npm dependencies
# - Installs Doppler CLI if absent
# - Exports all Doppler secrets as environment variables for the session

set -euo pipefail

# Only run in remote (Claude Code on the web) environments
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

echo '{"async": true, "asyncTimeout": 300000}'

# ── 1. npm dependencies ────────────────────────────────────────────────────────
echo "📦 Installing npm dependencies..."
cd "${CLAUDE_PROJECT_DIR:-/home/user/nosho-crm}"
npm install --prefer-offline 2>&1 | tail -3

# ── 2. Doppler CLI ─────────────────────────────────────────────────────────────
if ! command -v doppler &>/dev/null; then
  echo "🔑 Installing Doppler CLI..."
  DOPPLER_VERSION=$(curl -s https://api.github.com/repos/DopplerHQ/cli/releases/latest \
    | grep '"tag_name"' | cut -d'"' -f4 | tr -d 'v')
  curl -sL "https://github.com/DopplerHQ/cli/releases/latest/download/doppler_${DOPPLER_VERSION}_linux_amd64.tar.gz" \
    -o /tmp/doppler.tar.gz
  tar -xzf /tmp/doppler.tar.gz -C /tmp
  sudo mv /tmp/doppler /usr/local/bin/doppler
  echo "✅ Doppler CLI installed"
fi

# ── 3. Doppler authentication ──────────────────────────────────────────────────
# Token stocké dans ~/.config/doppler/ par doppler configure set token
# Fallback sur DOPPLER_TOKEN env si configuré
if ! doppler secrets download --no-file --format env &>/dev/null; then
  echo "⚠️  Doppler auth failed — vérifier le token dans ~/.config/doppler/"
  exit 0
fi

# ── 4. Exporter les secrets Doppler dans l'environnement de la session ─────────
SECRETS_COUNT=$(doppler secrets --json 2>/dev/null | jq 'keys | length' 2>/dev/null || echo "?")
echo "🔐 Loading Doppler secrets ($SECRETS_COUNT vars)..."
if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  doppler secrets download --no-file --format env >> "$CLAUDE_ENV_FILE"
  echo "✅ Doppler secrets → \$CLAUDE_ENV_FILE"
else
  # Fallback: écrire dans /tmp pour référence manuelle
  doppler secrets download --no-file --format env > /tmp/.doppler-env
  echo "✅ Doppler secrets → /tmp/.doppler-env"
fi
