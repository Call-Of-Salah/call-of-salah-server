# Call of Salah — Server

The backend API for Call of Salah.

## Stack

- Node.js + TypeScript
- Express
- Prisma + PostgreSQL
- Redis + BullMQ
- Firebase (auth + FCM push)
- Docker, deployed on AWS

## Getting started

See [docs/RUNNING_LOCALLY.md](./docs/RUNNING_LOCALLY.md) for full setup, including the
local Supabase/Postgres stack.

```bash
mise install && pnpm install
pnpm db:start
cp .env.example .env   # then fill in DATABASE_URL / DIRECT_URL — see the doc above
pnpm migrate:dev
pnpm dev
```

## Contributing

- Branch off `main`, open a pull request — direct pushes to `main` are blocked.
- PRs require at least 1 approval before merging.
- Keep your branch up to date by rebasing onto `main`, not merging `main` into your branch.

## License

MIT — see [LICENSE](./LICENSE).
