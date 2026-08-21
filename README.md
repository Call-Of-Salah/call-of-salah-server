# Call of Salah — Server

Backend API for Call of Salah: gamified masjid prayer attendance for young Muslims (13–17).

## Pilot stack (Architecture Overview v2)

| Layer | Choice |
| --- | --- |
| Runtime | Node.js 20+ / TypeScript |
| API | Express REST under `/v1` |
| Hosting | Google Cloud Run (Docker) |
| Database | Supabase managed PostgreSQL + Prisma |
| Auth | Supabase Auth (phone OTP → JWT) |
| Push | Firebase Cloud Messaging only |
| Jobs | In-process scheduler (`node-cron`) |
| Deferred | Redis, BullMQ, API gateway |

Business rules live server-side (Part 5). Clients never touch the database.

## Project layout

```
src/
  app.ts / server.ts / routes.ts
  config/                 # env + constants
  middleware/             # auth, rate limit, masjid scope, errors
  modules/                # domain modules (Part 7 endpoints)
    auth|users|checkins|streaks|leagues|badges|quests|…
    admin/                # masjid-scoped admin API
  providers/              # pluggable interfaces (§7.1)
    auth|push|scheduler|cache|sms|database
  jobs/                   # streak reset, league reset, GDPR, reminders
  lib/ types/ errors/
prisma/
  schema.prisma           # Part 6 — 27+ tables
  seed/
tests/
```

Product specs live outside this repo (see local `docs/` if present; not committed).

## Getting started

```bash
cp .env.example .env   # fill Supabase + FCM values
npm install
npx prisma migrate dev
npm run dev
```

Health: `GET http://localhost:3000/v1/health`

## Spec map

Architecture Overview v2, Parts 5–9 (logic, schema, API, security, admin) — kept outside git.

## Contributing

- Branch off `main`, open a pull request — direct pushes to `main` are blocked.
- PRs require at least 1 approval before merging.
- Keep your branch up to date by rebasing onto `main`.

## License

MIT — see [LICENSE](./LICENSE).
