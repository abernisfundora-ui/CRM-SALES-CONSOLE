#!/usr/bin/env bash
set -euo pipefail

echo "== npm config =="
npm config get registry
npm config get proxy
npm config get https-proxy
npm config list

echo "== npm cache verify =="
npm cache verify

echo "== proxy env =="
env | rg -i 'proxy|npm_config_.*proxy' || true

echo "== registry reachability (via current env/proxy) =="
curl -I https://registry.npmjs.org/@tanstack/react-query --max-time 20 || true
