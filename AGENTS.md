# AGENTS.md

Conventions for this repository. These are the decisions that are **not** recoverable by
reading the code — the reasoning behind them lives here so a later session does not
quietly undo them.

## Toolchain

Tool versions come from `mise.toml`. The package manager is **pnpm**.

```bash
mise install     # provisions Node and pnpm at the pinned versions
pnpm install     # never `npm install`
```

**Never run `npm install` or `yarn`.** They generate a competing lockfile and a
differently-shaped `node_modules`, and the Dockerfile and CI both assume
`pnpm-lock.yaml`. `package-lock.json` is gitignored specifically to catch this.

The one sanctioned use of npm is bootstrapping pnpm itself inside the Dockerfile, if
corepack proves unreliable.

## Commands

| Command | Purpose |
|---|---|
| `pnpm dev` | `tsc --watch` into `dist/` alongside `node --watch dist/index.js` |
| `pnpm build` | `prisma generate` then `tsc` |
| `pnpm start` | Run the compiled server from `dist/` |
| `pnpm test` | Vitest (`*.unit.test.ts` only) |
| `pnpm test:watch` | Vitest in watch mode |
| `pnpm generate` | `prisma generate` on its own |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm migrate:dev` | Create + apply a migration locally |
| `pnpm migrate:deploy` | Apply pending migrations (CI/production) |
| `pnpm db:init` | One-time Supabase project init |
| `pnpm db:start` | Start the local Supabase stack |
| `pnpm db:stop` | Stop it |
| `pnpm db:seed` | Seed the local database from `dist/` |

## Module system

The project is **ESM** (`"type": "module"`, `moduleResolution: nodenext`).

- Relative imports must carry an explicit `.js` extension, even from `.ts` sources:
  `import { ioc } from './ioc.js'`
- **All internal imports are relative.** No `tsconfig` path aliases and no `package.json`
  subpath imports (`#common/*`). `tsc` does not rewrite import specifiers, so anything
  that needs rewriting breaks at runtime, and any mapping scheme has to account for
  sources living in `src/` while the running code lives in `dist/`. Relative paths
  resolve identically in both.

## Project structure

Layered by role, not by feature. The GDS unified notification service is the reference for
this layout — its `@common/*` path aliases are the one part deliberately not copied, for
the reasons in "Module system".

```
src/index.ts                           entry point: listen (SIGTERM handling: Phase 2)
src/app.ts                             createApp(): middleware and mounting only
src/routes/<name>.ts                   router + its <name>RoutesDeps() container wiring
src/routes/<name>.schema.ts            Zod schemas for that router
src/controllers/<name>Controller.ts    create<Name>Controller(deps) → handlers
src/common/ioc.ts                      the container and every registration
src/common/middlewares/                reusable RequestHandlers
src/common/services/                   business logic, one class per service
src/common/repositories/               storage implementations
src/common/repositories/interfaces/    repository contracts and record shapes
```

Filenames are camelCase. Folders with several implementations of one role carry an
`index.ts` barrel — `repositories/`, `services/`, `repositories/interfaces/`. Folders
whose files are imported by name (`routes/`, `controllers/`) do not need one.

Rules:

- **Only `src/routes/*.ts` reads the container**, through a `<name>RoutesDeps()` function —
  a function, not a constant, so the container is read when the app is built rather than
  when the module is imported. `app.ts` mounts and `index.ts` starts; neither imports a
  service.
- **Controllers are factories returning handlers, not classes.** Each handler is a closure
  over `deps` and so is already bound — it drops into a route chain without `.bind(...)`.
- **Route chains read left to right:** `validateParams(schema)` then `controller.handler`.
  A controller only ever runs against input that already matched its schema, which is why
  its handlers type `req` as `Request<TheSchemaType>`.
- **Services, controllers and repositories never import `ioc.ts`.** They take their
  dependencies as constructor or factory arguments, which is what makes them testable
  without the container.

## Repository boundary

**Repositories return Prisma's generated `XModel`.** There is no hand-written record type
per entity and no mapping layer between the repository and the service — the generated
model is the shape, end to end, and `masjidController.ts` picks the response fields.

`UserRepository` / `InMemoryUserRepository` / `UserRecord` are the exception, and they are
**temporary scaffolding**: there is no `User` model in `schema.prisma`, and the route
exists so `/v1/users/1` responds before any real data does. Do not copy that shape for a
new repository. It goes away once identity work lands — Supabase Auth owns `auth.users`,
and `Masjid.adminUserId` points at a future `admin_users` table, which will be Prisma-backed
like everything else.

**Prisma's `Decimal` must not reach application code.** It is a decimal.js instance, not a
data shape: `` `${row.latitude}` `` and `JSON.stringify(row)` produce plausible-looking
output through `valueOf()`, `a.latitude === b.latitude` is always false with no compile
error, and arithmetic silently operates on an object. Coordinates are therefore
`Float @db.DoublePrecision` — ~15–17 significant digits against the 9 that `Decimal(9,6)`
needed, so nothing is lost. Money is stored and carried as integer minor units or a string.
Prisma's generator has no option to change how a scalar is emitted, so keeping generated
models usable is a schema decision, not a code one.

The only mapping is **domain → transport**, in the controller: `Date → ISO string`, field
selection, envelope.

Revisit this rule if a column exists that must never reach a client. Returning table rows up
the stack is then a disclosure risk, and the controller's explicit field list is only a
manual guard.

## Generated client

**`src/generated/` is committed.** It is 9 files for one model, every file carries
`@ts-nocheck` so it contributes no type errors, and its imports already use explicit `.js`
extensions. Committing it means a fresh clone compiles, and `pnpm test` and
`pnpm typecheck` do not have to run a generator first.

- A schema change is `prisma migrate dev`, then `pnpm generate`, then
  `git add src/generated` — in the same commit as `schema.prisma`.
- On a merge conflict inside `src/generated/` (`models.ts`, `commonInputTypes.ts`,
  `internal/prismaNamespace.ts` are the ones that collide), **never hand-merge**. Resolve
  `prisma/schema.prisma`, then `pnpm generate && git add src/generated`.
- `.gitattributes` marks the tree `linguist-generated=true -diff` so it collapses in review.
- **`prisma` and `@prisma/client` must stay exact-pinned** (`7.10.0`, no caret). Output is a
  pure function of schema + generator version, which is what makes
  `pnpm generate && git diff --exit-code -- src/generated` a valid freshness check in CI.
  A caret makes that check fail on patch bumps.

## Running the code

**The application always runs from `dist/`.** No tsx, no loader, no register hook — the
server never executes `.ts`. (Tooling does: Vitest runs the tests from source, and the
Prisma CLI executes `prisma.config.ts`. Neither is in the server's path.)

`pnpm dev` compiles first, then watches: `tsc --watch` rebuilds into `dist/` while
`node --watch` restarts on the output.

This is why dev and production cannot diverge: both run the same compiled artifacts, so a
compile error surfaces in dev rather than at deploy time.

## Dependency injection

Everything is wired through the container in `src/common/ioc.ts`. It is a small
hand-rolled IoC — `ioc({ key, mode, factory })` returns a thunk, and nothing is
constructed until that thunk is called. Registrations are named `iocGet<Thing>` and the
keys are PascalCase.

Only `SINGLETON` exists so far. The rest of this section describes the intended design;
`TIMEBOUND_SINGLETON`, `REQUEST_SCOPED` and the disposer registry are still outstanding
from Phase 2.

Rules:

- **Register dependencies in the container.** Do not `new` a service or repository
  inside a controller.
- **Choose the lifetime deliberately:**
  - `SINGLETON` — stateless services, clients, the config object. Built once.
  - `TIMEBOUND_SINGLETON` — rebuilt after a TTL. For values that can change underneath
    a long-lived container. Nothing uses it yet; do not reach for it without a reason.
  - `REQUEST_SCOPED` — one instance per HTTP request (request id, the authenticated
    user, a transaction-bound client). Backed by `AsyncLocalStorage`; resolving one
    outside a request throws by design.
  - `NEW_INSTANCE` — fresh every resolve. Rarely correct for services.
- **A singleton that holds a connection must register a disposer.** `disposeContainer()`
  runs them on SIGTERM, and Cloud Run only grants ~10 seconds of shutdown grace.
- **Async factories cache the promise**, not the resolved value, so concurrent callers
  share one initialization. Consumers `await` the thunk.
- Do not wrap `createRemoteJWKSet` in a TTL. `jose` already handles JWKS caching and
  key rotation internally; a second layer of caching fights it.

## Database

Postgres is hosted on **Supabase** and reached through the **Supavisor pooler**. The
direct connection endpoint (`db.<ref>.supabase.co`) is IPv6-only and Cloud Run egresses
IPv4, so direct connections fail in production. This is a hard constraint, not a
preference.

Two URLs, and they are **not** interchangeable:

- `DATABASE_URL` — transaction pooler, port **6543**, with
  `?pgbouncer=true&connection_limit=1`. Used by the running application.
- `DIRECT_URL` — session pooler, port **5432**. Used **only** by `prisma migrate`, which
  needs advisory locks and prepared statements that the transaction pooler does not
  support.

Other rules:

- **Never edit a migration that has already been applied.** Write a new one.
- **Keep migrations backward compatible.** They run *before* the new Cloud Run revision
  deploys, so the previous revision is still serving against the new schema.
- Keep `connection_limit=1` and cap `--max-instances`. Each instance holds its own pool,
  so `max-instances × connection_limit` must stay under the Supabase connection cap.

## OpenAPI — not built yet

**Nothing in this section exists in the code.** It is the intended design, recorded so the
first implementation follows it: no `OpenAPIRegistry`, no `openapi.json`, no
`@asteasolutions/zod-to-openapi` dependency and no `openapi:write` script today.

**Zod schemas are the source of truth.** Each module's `*.schema.ts` defines schemas with
`.openapi(...)` and registers its routes on the shared `OpenAPIRegistry`. The same schema
object validates the request at runtime and generates the spec entry, so the docs cannot
drift from actual behaviour.

Never hand-edit `openapi.json` — regenerate it with `pnpm openapi:write`.

The document is built once at boot (a container singleton), not per request.

## Auth — not built yet

**No auth code exists.** There is no `requireAuth()`, no request scope to put a user in,
and `jose` is only present as a transitive dependency of the Supabase CLI. The rule below
is binding on whoever builds it.

Supabase access tokens are verified **asymmetrically against the project JWKS endpoint**
using `jose`:

```
${SUPABASE_URL}/auth/v1/.well-known/jwks.json
```

Do **not** reintroduce `SUPABASE_JWT_SECRET` or HS256 shared-secret verification.
Supabase discourages it — a leaked shared secret allows user impersonation, and it cannot
be rotated without downtime.

`requireAuth()` puts the verified user into the request scope. Read it from the container
rather than threading it through every function signature.

## Testing

Vitest, with supertest for HTTP.

**Naming is the contract.** `vitest.config.ts` only collects `src/**/*.unit.test.ts`, and
a `.unit.` test must run with no database, no network and no environment variables — so
`pnpm test` is safe on any machine. Integration tests get `.int.test.ts` and their own
script when there are any; a file that needs a real Postgres must not be named `.unit.`.

**Every test goes through `createTestApp()`** (`src/testing/testConfig.ts`):

```ts
const { app, repositories } = createTestApp({ masajid: [buildFakeMasjid()] });
const res = await request(app).get(`/v1/masajid/${id}`);
expect(repositories.masjidRepository.findById).toHaveBeenCalledWith(id);
```

It calls `resetTestContainer()` with a mock for every repository, then the real
`createApp()`. Everything above the repository layer is exercised for real: `express.json()`,
mount paths, middleware order, Zod request and response validation, the services, the
error handler and the response envelope. Only storage is fake.

How the substitution works, because it is not obvious:

- `ioc()` resolves from `serviceCache` and only calls a factory when the key is **missing**.
  `resetTestContainer()` writes the mocks into that cache, so those factories never run —
  `iocGetMasjidService()` still builds a real `MasjidService`, just around a mock
  repository, and `iocGetPrismaClient()` is never reached. The container does the wiring,
  so a test never restates it.
- **Do not reach for `vi.spyOn(ioc, 'iocGet…')`.** A spy replaces a property on the module's
  exports object, and `ioc.ts`'s own factories call those getters by their module-local
  name — the spy is invisible to them, and the test silently gets the real dependency.
- Clearing and seeding are a single call because order matters: a SINGLETON resolved
  before its mock is in place stays cached with the real instance. For the same reason,
  seed before `createApp()` — handlers capture their service at build time.
- Adding a repository to `ioc.ts` means adding it to `TestRepositories` and
  `createTestApp()`. That is the point: the compiler stops a test from quietly resolving
  the real, Prisma-backed one.
- `IocRegistry` maps every key to what it resolves to, and both `ioc()` and
  `resetTestContainer()` are typed against it. A mock seeded under the wrong key, an
  unknown key, and a mock whose method signature has drifted from the interface are all
  compile errors.

`pnpm test` needs no `prisma generate` step: `ioc.ts` value-imports `PrismaClient`, so
`createApp()` loads the generated client even with every repository mocked — but the
generated tree is committed, so it is always there. See "Generated client".

## Health endpoints

`src/app.ts` currently serves a single `GET /health` returning `{ status: 'ok' }`. It
predates this rule and does not satisfy it; splitting it is outstanding work.

- `GET /healthz` — liveness. **Must not touch the database.** If it does, a transient
  database problem will cause Cloud Run to restart otherwise-healthy containers.
- `GET /readyz` — readiness. Runs `SELECT 1`.

## Secrets

Never commit `.env`. `.env.example` documents the shape with placeholder values only.
Production values live in **GCP Secret Manager** and are injected by Cloud Run via
`--set-secrets`.

CI authenticates to GCP with **Workload Identity Federation**. Do not add a
service-account JSON key to the repository or to GitHub secrets.

## Git

- Branch off `main` and open a pull request. Direct pushes to `main` are blocked.
- PRs need at least one approval.
- Keep branches current by **rebasing onto `main`**, not by merging `main` into them.
