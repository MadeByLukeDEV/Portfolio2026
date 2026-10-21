# MadeByLuke

Portfolio of Lukas Graf, fullstack web developer from Vienna. Live at madebyluke.dev.

## Stack

Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Motion, Three.js (React Three Fiber), next-intl, next-themes, Prisma 7 with MariaDB, BetterAuth with passkeys.

- One-page site in English and German. The language comes from a cookie, then the browser's Accept-Language header, so URLs have no `/en` or `/de`.
- Light, dark and system theme.
- Admin area at `/admin` for projects, contact messages and hardware keys. Sign-in uses a hardware key (WebAuthn) and optionally a password.

## Local setup

```bash
pnpm install
cp .env.example .env        # fill in the secrets, see comments in the file
docker compose up -d        # MariaDB on 127.0.0.1:3307
pnpm exec prisma migrate deploy
pnpm db:seed                # creates the admin from ADMIN_EMAIL / ADMIN_PASSWORD and seeds projects
pnpm dev
```

Then open `http://localhost:3000/login`, sign in, and register a hardware key under `/admin/security`. Once that works, set `PASSWORD_LOGIN_ENABLED=false` to turn password sign-in off.

Use `localhost`, not `127.0.0.1`: passkeys are bound to `PASSKEY_RP_ID`.

## Production notes

- `BETTER_AUTH_URL=https://madebyluke.dev` and `PASSKEY_RP_ID=madebyluke.dev`. Keys registered on localhost do not carry over, register them again.
- Run `prisma migrate deploy` on every release.
- The contact form rate limit is in memory, so it assumes a single instance.

## Branches

Every feature, fix and chore lives on its own branch (`feat/…`, `fix/…`, `chore/…`) and is merged into `main`.
