This project now uses MySQL as its local development database.

The previous PostgreSQL migration history was archived to:

- `prisma/migrations-postgresql-archive/`

For local XAMPP development, use Prisma schema sync instead of replaying the archived PostgreSQL SQL files:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```
