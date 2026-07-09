#!/usr/bin/env bash
# Deploys the Narrator backend (API + worker) to Render using render.yaml.
# Requires the Render CLI: https://render.com/docs/cli
set -euo pipefail

if ! command -v render &> /dev/null; then
  echo "Render CLI not found. Install it: https://render.com/docs/cli" >&2
  exit 1
fi

echo "Deploying Narrator backend to Render..."
render blueprint launch --file render.yaml

echo "Done. Check the Render dashboard for build/deploy logs."
