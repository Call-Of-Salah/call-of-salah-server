# Implementation Plan

Build order for the initial server scaffold. Each phase should be verifiable before the
next begins.

Conventions and the reasoning behind the decisions below live in [AGENTS.md](../AGENTS.md).

## Context

The repository started as documentation only — `README.md`, `LICENSE`, `.env.example`,
and a PR template. This plan takes it to a working TypeScript API server running on
**GCP Cloud Run** against **Supabase Postgres**, exposing an **OpenAPI document**, with
dependencies wired through a hand-rolled **IoC container**.

### Decisions

| Area | Decision |
|---|---|
| Toolchain | mise for tool versions, pnpm as package manager |
| Framework | Express 5, hand-rolled controller / service / repository layers |
| DI | `ioc(key, mode, factory)` thunk container with explicit lifetimes |
| Database | Supabase Postgres via Supavisor pooler; Prisma 7 + `@prisma/adapter-pg` |
| OpenAPI | Generated from Zod schemas via `@asteasolutions/zod-to-openapi` |
| Auth | Supabase Auth, asymmetric JWT verified against the project JWKS |
| Local dev | `docker-compose` Postgres 17 |
| CI/CD | GitHub Actions → Artifact Registry → Cloud Run, via Workload Identity Federation |

### Deferred

- **Redis / BullMQ.** A BullMQ worker needs an always-on process, which on Cloud Run
  means a second service pinned at `min-instances=1`. Revisit with Cloud Tasks, which
  fits the request-driven model better.
- **FCM push.** Follows whatever the notification design turns out to be.

---

## Phase 1 — Toolchain and project foundation

- [x] `mise.toml` pinning Node and pnpm
- [x] `.npmrc` with `engine-strict=true`
- [x] `package.json` — `type: module`, `packageManager`, `engines`, scripts
- [x] `tsconfig.json` — `nodenext`, `strict`, `outDir: dist`
- [x] `pnpm install` produces `pnpm-lock.yaml` and no `package-lock.json`

Dependencies are installed **in the phase that first needs them**, not up front. Phase 1
installs `typescript` and `@types/node` only.

Later phases pull in: `express`, `@prisma/client`, `@prisma/adapter-pg`, `pg`, `zod`,
`@asteasolutions/zod-to-openapi`, `swagger-ui-express`, `jose`, `pino`, `pino-http`,
`helmet`, `cors`, `dotenv`, and dev-side `prisma`, `vitest`, `supertest` with the
matching `@types/*`.

Scripts appear with their tooling too — `package.json` currently has `build`, `dev`,
`start`, `typecheck`; `test`, `migrate:*` and `openapi:write` land in Phases 7, 3 and 5.

## Phase 2 — IoC container

- [ ] `src/common/ioc.ts` — `Mode` enum and the `ioc()` thunk factory
- [ ] `SINGLETON` and `NEW_INSTANCE`
- [ ] `TIMEBOUND_SINGLETON` backed by a TTL cache
- [ ] `REQUEST_SCOPED` backed by `AsyncLocalStorage`, plus `requestContextMiddleware`
- [ ] Disposer registry and `disposeContainer()`
- [ ] `resetContainer()` for test isolation
- [ ] Async factories cache the promise rather than the resolved value

## Phase 3 — Config, errors, database

- [ ] `src/common/config.ts` — Zod schema over `process.env`, parsed once at boot
- [ ] `src/common/errors.ts` — typed error classes
- [ ] `prisma/schema.prisma` — `url` + `directUrl`, one `User` model
- [ ] Prisma client as a lazy `SINGLETON` with a `$disconnect` disposer
- [ ] First migration applied against local compose Postgres

## Phase 4 — HTTP layer and user module

- [ ] `src/app.ts` — `createApp()` factory, mounting only
- [ ] Middleware: `helmet`, `cors`, `pino-http`, request context, terminal error handler
- [ ] `GET /healthz` (no DB) and `GET /readyz` (`SELECT 1`)
- [ ] User endpoints, layered across the shared folders: `src/routes/users.ts`,
      `src/controllers/userController.ts`, `src/common/services/userService.ts`,
      `src/common/repositories/interfaces/userRepository.ts` + Prisma impl
- [ ] `src/index.ts` — listen on `0.0.0.0:${PORT}`, SIGTERM → `server.close()` →
      `disposeContainer()` (the placeholder entry point from Phase 1 becomes this)

## Phase 5 — OpenAPI

- [ ] `src/openapi/registry.ts` — shared `OpenAPIRegistry`
- [ ] `src/routes/*.schema.ts` registers its Zod schemas and paths
- [ ] `src/openapi/document.ts` — build via `OpenApiGeneratorV31`, `bearerAuth` scheme
- [ ] `GET /openapi.json` and `GET /docs`
- [ ] `scripts/write-openapi.ts` + `pnpm openapi:write`

## Phase 6 — Auth

- [ ] JWKS singleton against `${SUPABASE_URL}/auth/v1/.well-known/jwks.json`
- [ ] `requireAuth()` middleware verifying with `jose`
- [ ] Verified user registered into the request scope
- [ ] One protected route, marked as secured in the spec

## Phase 7 — Tests

- [ ] `SINGLETON` builds once; `NEW_INSTANCE` builds per resolve
- [ ] `REQUEST_SCOPED` stable within a request, distinct across requests, throws outside
- [ ] `resetContainer()` isolates tests
- [ ] Supertest: health endpoints, user create/read against a fake repository registered
      in the container
- [ ] Invalid payload returns a 400 shaped by the error handler

## Phase 8 — Docker and local dev

- [ ] `Dockerfile` — multi-stage, pnpm-aware, fresh prod install in the runner stage,
      non-root user
- [ ] `.dockerignore`
- [ ] `docker-compose.yml` — `postgres:17-alpine` for local development only

## Phase 9 — Deployment

- [ ] `scripts/gcp-bootstrap.sh` — Artifact Registry, deploy service account, Workload
      Identity Federation pool and provider, Secret Manager entries
- [ ] `.github/workflows/ci.yml` — typecheck, lint, test on PRs
- [ ] `.github/workflows/deploy.yml` — build, push, `migrate deploy`, `run deploy`
- [ ] One manual `gcloud run deploy --source .` to validate connectivity before CI runs

## Phase 10 — Documentation

- [ ] `AGENTS.md` and `CLAUDE.md`
- [ ] This file
- [ ] `README.md` — Cloud Run rather than AWS, mise/pnpm setup, Supabase URL formats
- [ ] `.env.example` — pooler URLs, `SUPABASE_URL`, Firebase removed, Redis marked
      deferred
- [ ] `.gitignore` — generated Prisma client, `package-lock.json`

---

## Verification

**Toolchain**

1. `mise install` resolves Node and pnpm from `mise.toml`
2. `pnpm install` creates `pnpm-lock.yaml`; no `package-lock.json` appears

**Local**

3. `docker compose up -d`, then `pnpm migrate:dev` creates the schema
4. `pnpm dev` starts; logs are structured JSON
5. `GET /healthz` → 200 without touching the database
6. `GET /readyz` → 200; stop the compose database and confirm `/readyz` fails while
   `/healthz` stays 200
7. `GET /openapi.json | jq .paths` lists the user routes
8. `/docs` renders and "Try it out" reaches the running server
9. Create a user, then read it back
10. An invalid payload returns 400 from Zod via the error handler

**IoC**

11. A `SINGLETON` factory runs exactly once across many resolves; `NEW_INSTANCE` runs
    each time
12. A `REQUEST_SCOPED` value is stable within one request, differs across two, and
    throws when resolved outside a request
13. A supertest run with a fake repository registered in the container — no module
    mocking needed
14. `resetContainer()` in `beforeEach` gives clean state between tests

**Container**

15. `docker build` succeeds; the image runs against the compose database
16. The image contains no Prisma engine binaries (Prisma 7 is Rust-free)

**Deploy**

17. A manual `gcloud run deploy --source .` validates service, secrets, and Supabase
    connectivity
18. `/readyz` passes in Cloud Run — this is what proves IPv4 pooler connectivity, the
    single most likely thing to break
19. Merging a PR builds, migrates, and deploys
20. Cloud Run logs show a clean SIGTERM shutdown when a revision is replaced
