# Deployment (Dokploy)

The app ships as one Docker image. It needs an external MariaDB and a handful of environment variables. No database container is part of the deployment.

## What the image does

- Builds Next.js in standalone mode and runs `node server.js` as an unprivileged user on port 3000.
- On start it runs `prisma migrate deploy` against `DATABASE_URL`, then starts the server. Set `RUN_MIGRATIONS=false` to skip this and migrate yourself.
- Exposes `GET /api/health` (does not touch the database) and a Docker `HEALTHCHECK` on it.
- Sends security headers on every response (HSTS, nosniff, frame deny, referrer and permissions policy).

## 1. Prepare the database

Create an empty database and a user with full rights on it (needed for migrations):

```sql
CREATE DATABASE madebyluke CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'luke'@'%' IDENTIFIED BY '<strong password>';
GRANT ALL PRIVILEGES ON madebyluke.* TO 'luke'@'%';
```

Connection string: `mysql://luke:<password>@<host>:3306/madebyluke` (URL-encode special characters in the password). A `mariadb://` URL, as Dokploy shows for its MariaDB service, works too, and so does a password containing characters like `/`, `+`, `=` or `@` without percent-encoding (the credentials end at the last `@`).

## 2. Create the application in Dokploy

1. Create an application with the GitHub provider, repository `MadeByLukeDEV/Portfolio2026`, branch `main`.
2. Build type: **Dockerfile**, Dockerfile path `./Dockerfile`, context `.`.
3. Enable auto deploy so every push to `main` redeploys.
4. Environment: copy `.env.production.example` and fill in every value (see the table below).
5. Domain: `madebyluke.dev`, container port `3000`, HTTPS with Let's Encrypt. Add `www.madebyluke.dev` as a second domain that redirects if you want it.
6. Deploy.

DNS: point an `A` record for `madebyluke.dev` (and `www`) at the Dokploy server.

## 3. Environment variables

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | Connection string of the external MariaDB, `mysql://` or `mariadb://` |
| `BETTER_AUTH_SECRET` | Random string, at least 32 characters (`openssl rand -base64 32`). Changing it signs everyone out |
| `BETTER_AUTH_URL` | `https://madebyluke.dev`, exact origin with no trailing slash |
| `PASSKEY_RP_ID` | `madebyluke.dev`, bare domain without scheme |
| `PASSWORD_LOGIN_ENABLED` | `true` until a hardware key is registered, then `false` |
| `RUN_MIGRATIONS` | Optional, defaults to `true` |

`BETTER_AUTH_URL` and `PASSKEY_RP_ID` must match the public domain, otherwise sign-in and hardware keys fail.

## 4. First admin and projects

The image has no seed tooling. Seed once from your machine against the production database, which must be reachable from it: expose the database port in Dokploy or use an SSH tunnel. An internal hostname such as `services-mariadb-xxxx` only resolves inside the Dokploy network.

PowerShell:

```powershell
$env:DATABASE_URL = "mariadb://luke:<password>@<reachable-host>:3306/madebyluke"
$env:ADMIN_EMAIL = "you@example.com"
$env:ADMIN_PASSWORD = "<long random password>"
pnpm db:seed
```

bash:

```bash
DATABASE_URL="mariadb://luke:<password>@<reachable-host>:3306/madebyluke" ADMIN_EMAIL="you@example.com" ADMIN_PASSWORD="<long random password>" pnpm db:seed
```

Variables set in the shell take priority over your local `.env`, so you do not need to edit it. The URL format is `scheme://user:password@host:port/database`: keep the `:` between user and password. The script prints the host and port it connects to and explains common failures. It is safe to repeat: it keeps projects you edited and skips an admin that already exists.

## 5. Register your hardware key

1. Open `https://madebyluke.dev/login` and sign in with the seeded password.
2. Go to **Security** and register your key. Keys registered on localhost do not carry over.
3. Register a second key as a backup.
4. Set `PASSWORD_LOGIN_ENABLED=false` in Dokploy and redeploy. Password sign-in is now off.

If you ever lose access to every key, set `PASSWORD_LOGIN_ENABLED=true` again and redeploy.

## Updating

Push to `main`. CI (lint, build, image build) runs in GitHub Actions, Dokploy rebuilds the image and starts it, and pending migrations are applied on start.

## Notes

- The contact form rate limit is held in memory, so run a single replica.
- Run a local smoke test of the image with:

  ```bash
  docker build -t madebyluke .
  docker run --rm -p 3000:3000 --env-file .env.production madebyluke
  ```

  On Docker Desktop, point `DATABASE_URL` at `host.docker.internal` to reach a database on your machine.
- Every page is served with a nonce-based Content-Security-Policy from `src/proxy.ts`. If you add a third-party script, font, image host or API, allow it there, otherwise the browser blocks it.

## Security notes

- **Secrets:** keep `DATABASE_URL`, `BETTER_AUTH_SECRET` and the seed password out of git and chats. Rotate any that were shared.
- **Sign-in:** register two hardware keys, then set `PASSWORD_LOGIN_ENABLED=false`. Sessions last three days. Failed sign-ins are rate limited.
- **Database user:** the container runs migrations on start, so its user needs schema rights. For least privilege, run migrations with `RUN_MIGRATIONS=false` from CI or your machine and give the app a user with only `SELECT, INSERT, UPDATE, DELETE`.
- **Proxy headers:** the contact form rate limit trusts `x-forwarded-for`. Keep the app behind Traefik (Dokploy's default), which sets it, and do not publish port 3000 directly.
- **Key checks:** `userVerification` is `required` in `src/lib/auth.ts`, so every sign-in needs the key's PIN or fingerprint. Set a PIN on each key before relying on it, and keep `PASSWORD_LOGIN_ENABLED=true` until you have signed in with the key once.
