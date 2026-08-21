# Call of Salah — Server

The backend API for Call of Salah.

## Stack

This is the confirmed pilot stack — application-level choices are unchanged from
the original spec (Flutter, Node/TypeScript, PostgreSQL, Prisma); the
infrastructure around them has been simplified for the pilot.

- **Runtime**: Node.js + TypeScript
- **API**: Express.js, plain REST over `/v1` (no GraphQL at Phase 1)
- **Hosting**: Google Cloud Run (containerised, scales to zero) — replaces
  Docker-on-AWS for the pilot
- **Database**: Supabase (managed PostgreSQL 15+) via Prisma — typed,
  parameterised queries
- **Auth**: Supabase Auth, passwordless phone OTP — issues a signed JWT this
  server verifies. Same provider as the database, on purpose.
- **File storage**: Supabase Storage — available if/when needed, not required
  at Phase 1
- **Push notifications**: Firebase Cloud Messaging — the one external service
  outside Supabase, delivers to both APNs and Android
- **Scheduled work**: in-process scheduler for the pilot (streak reset,
  weekly league reset, reminders) — a dedicated queue (BullMQ) is deferred
  until load actually requires async processing
- **Prayer times**: Khizra Masjid reference / admin upload — jama'ah times
  are admin-set per masjid

**Deferred until scale** (not in the pilot): Redis (caching/sessions/nonces),
a dedicated BullMQ job queue, an API gateway, and a multi-service split. The
architecture keeps interfaces abstract so these can be reintroduced later
without a rewrite.

## Getting started

```bash
cp .env.example .env   # fill in real values
npm install
npx prisma migrate dev
npm run dev
```

## Contributing

- Branch off `main`, open a pull request — direct pushes to `main` are blocked.
- PRs require at least 1 approval before merging.
- Keep your branch up to date by rebasing onto `main`, not merging `main` into your branch.

## License

MIT — see [LICENSE](./LICENSE).
