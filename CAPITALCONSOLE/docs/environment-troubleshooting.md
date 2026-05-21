# Environment troubleshooting for package installation

This repo expects a normal npmjs network path. In restricted CI/container environments, package install can fail even with a correct npm config.

## Baseline local config

- Registry should be: `https://registry.npmjs.org/`
- Proxy values should be unset in npm config unless required by your network policy.

This repository now includes a minimal `.npmrc` to pin registry and common defaults.

## Quick diagnostics

Run:

```bash
./scripts/diagnose-npm-env.sh
```

## If install still fails with 403

A 403 during `npm install` with an Envoy/proxy header usually indicates an upstream corporate policy restriction outside of this repository.

Typical signals:

- `CONNECT tunnel failed, response 403`
- npm registry URL is correct, but specific package fetch is denied by proxy

In that case, request network policy access for npm registry package endpoints from your platform/network team.
