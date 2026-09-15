# Contributing

## Setup

Node and pnpm versions are pinned in [`.nvmrc`](.nvmrc) and
`package.json` (`engines`/`volta`). Use whichever version manager you have
(`nvm use`, `volta`, or just match the versions manually), then:

```bash
pnpm install
cp .dev.vars.example .dev.vars   # fill in real values, never commit this file
```

## Running locally

```bash
pnpm dev
```

Runs the Worker via `wrangler dev`, reading secrets/vars from `.dev.vars`.
To exercise the scheduled handler without waiting for the cron, either:

- call `POST /trigger` with header `X-Trigger-Secret: <TRIGGER_SECRET>`, or
- use `wrangler dev --test-scheduled` and hit `/cdn-cgi/handler/scheduled`.

## Tests

```bash
pnpm test          # run once
pnpm test:watch    # watch mode
```

Tests cover the pure logic (`channel-name.ts`, `update-channel.ts` with
`fetch`/KV mocked) — no live network or Discord calls.

## Linting and type checking

```bash
pnpm lint          # eslint (neostandard, 4-space indent)
pnpm lint:fix
pnpm typecheck     # tsc --noEmit
```

All three must pass before merging. A pre-commit hook (`simple-git-hooks` +
`lint-staged`) runs `eslint --fix` on staged `.ts`/`.js` files automatically;
`pnpm install` sets it up via the `prepare` script.

## Commits, branches, releases

- **Commits**: [Conventional Commits](https://www.conventionalcommits.org/)
  (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `ci:`). Subject
  in the imperative, no trailing period.
- **Branches**: `<type>/<short-description>`, e.g. `fix/offline-label`,
  `feat/kv-dedupe`.
- **Releases**: tag `vX.Y.Z` following [Semantic Versioning](https://semver.org/).
  Bump the version in `package.json` in the same commit as the tag.
- **CHANGELOG.md**: follows [Keep a Changelog](https://keepachangelog.com/).
  Unlike the Keep a Changelog template, this project does **not** keep an
  "Unreleased" section — add a new dated version section only once you're
  actually cutting that release, with entries grouped under `Added`,
  `Changed`, `Fixed`, `Removed` as needed.

## CI

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs on every push
and pull request against `main`: install with pnpm (using the pinned
versions from `.nvmrc`/`package.json`), then `pnpm lint`, `pnpm typecheck`,
`pnpm test`.

To reproduce the exact CI checks locally:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
```

There is no separate deploy pipeline yet — deploying is a manual
`pnpm deploy` (`wrangler deploy`) once secrets are configured with
`wrangler secret put`.
