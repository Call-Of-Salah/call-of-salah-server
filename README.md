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
