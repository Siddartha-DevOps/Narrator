#!/usr/bin/env bash
# Deploys the Narrator frontend to Vercel.
# Requires the Vercel CLI: npm i -g vercel
set -euo pipefail

if ! command -v vercel &> /dev/null; then
  echo "Vercel CLI not found. Install it: npm i -g vercel" >&2
  exit 1
fi

cd "$(dirname "$0")/../frontend"

echo "Deploying Narrator frontend to Vercel..."
vercel --prod

echo "Done."
