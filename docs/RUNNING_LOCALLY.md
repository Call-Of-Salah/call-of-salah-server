# Running locally

## Prerequisites

- [mise](https://mise.jdx.dev/) — provisions the pinned Node/pnpm versions
- [Docker](https://www.docker.com/) (daemon running) — the local Supabase stack runs in containers
- The Supabase CLI is a project devDependency, not a separate install

## 1. Install dependencies

```bash
mise install     # Node + pnpm at the versions pinned in mise.toml
pnpm install      # never npm install — see AGENTS.md
```

## 2. Start the local database

```bash
pnpm db:start
```

This runs `supabase start`, which brings up Postgres, the Supavisor pooler, and Supabase
Studio in Docker. First run pulls images and can take a few minutes. If it fails with a
Docker connection error, the daemon isn't running — start Docker Desktop (or
`sudo systemctl start docker` on Linux) and retry.

Useful local URLs once it's up:

| What | URL |
|---|---|
| Supabase Studio (table/data browser) | http://127.0.0.1:54323 |
| Postgres (direct) | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` |

## 3. Configure environment variables

```bash
cp .env.example .env
```

Then set `DATABASE_URL` and `DIRECT_URL` to point at the local stack:

```bash
DATABASE_URL="postgresql://postgres.pooler-dev:postgres@127.0.0.1:54329/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"
```

**Why the odd username on `DATABASE_URL`:** Supavisor (the pooler) is multi-tenant — the
connection username must be `postgres.<tenant-id>`, not plain `postgres`, or every
connection fails (`ENOIDENTIFIER`) or, worse, silently hangs. `pooler-dev` is the fixed
tenant id the local Supabase CLI always uses (confirmed via
`SELECT external_id FROM _supavisor.tenants` against the `_supabase` database). Production
uses the same pattern with the real project ref instead.

`DATABASE_URL` (port 54329, pooled) is what the running app uses. `DIRECT_URL` (port
54322, direct) is used only by `prisma migrate` — see AGENTS.md § Database for why the two
can't be interchanged.

## 4. Apply migrations

```bash
pnpm migrate:dev
```

Applies any migrations already committed under `prisma/migrations/`. If you've changed
`prisma/schema.prisma` yourself, this also generates a new migration file and prompts for
a name.

## 5. Seed some data

```bash
pnpm build   # the seed script runs from dist/, same as the app itself
pnpm db:seed
```

Inserts a handful of `masajid` rows if they don't already exist (matched by name, so it's
safe to re-run). `prisma migrate reset` also runs this automatically afterwards, once
`prisma.config.ts`'s `migrations.seed` command (`node dist/scripts/seed.js`) has something
built to run.

## 6. Run the server

```bash
pnpm dev
```

Compiles to `dist/` and runs it, rebuilding/restarting on file changes. (`pnpm build &&
pnpm start` runs it once, without the watcher.)

## 7. Verify it's working

```bash
curl http://localhost:3000/health
curl http://localhost:3000/v1/users/1
```

`/v1/users/1` should return `{"status":200,"body":{"id":"1","email":"someone@example.com"}}`
— that route is backed by an in-memory fixture, so it works even before any real data
exists. To check the real database path, grab an id from what you seeded in step 5:

```bash
pnpm exec supabase db query "SELECT id, name FROM masajid;"
curl http://localhost:3000/v1/masajid/<id-from-above>
```

## Stopping

```bash
pnpm db:stop
```

Stops the Docker containers. Data persists across `db:start`/`db:stop` cycles (backed by
a Docker volume), so you don't lose local rows by stopping it.

## Troubleshooting

- **`supabase: command not found`** — it's a devDependency, not a global install. Use
  `pnpm exec supabase ...` (or the `pnpm db:*` scripts), not `supabase` directly.
- **Request to `/v1/masajid/...` hangs forever** — almost always `DATABASE_URL` pointing
  at something nothing is listening on, or missing the `postgres.pooler-dev` tenant
  prefix. The Prisma/pg driver adapter doesn't fail fast on a bad connection string; it
  hangs. Sanity-check with `pnpm exec supabase status` (containers up?) and re-check the
  username against § 3 above.
- **`ERR_PNPM_IGNORED_BUILDS`** — pnpm is refusing to run a package's install script
  (e.g. Prisma fetching its engine binaries). Build-script approvals live in
  `pnpm-workspace.yaml`'s `allowBuilds`/`onlyBuiltDependencies` — check they're `true`
  there rather than running `pnpm approve-builds` by hand.
