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

Connection string: `mysql://luke:<password>@<host>:3306/madebyluke` (URL-encode special characters in the password).

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
| `DATABASE_URL` | Connection string of the external MariaDB |
| `BETTER_AUTH_SECRET` | Random string, at least 32 characters (`openssl rand -base64 32`). Changing it signs everyone out |
| `BETTER_AUTH_URL` | `https://madebyluke.dev`, exact origin with no trailing slash |
| `PASSKEY_RP_ID` | `madebyluke.dev`, bare domain without scheme |
| `PASSWORD_LOGIN_ENABLED` | `true` until a hardware key is registered, then `false` |
| `RUN_MIGRATIONS` | Optional, defaults to `true` |

`BETTER_AUTH_URL` and `PASSKEY_RP_ID` must match the public domain, otherwise sign-in and hardware keys fail.

## 4. First admin and projects

The image has no seed tooling. Seed once from your machine against the production database, reachable through an SSH tunnel or an exposed port:

```bash
DATABASE_URL="mysql://luke:<password>@127.0.0.1:3306/madebyluke" \
ADMIN_EMAIL="you@example.com" \
ADMIN_PASSWORD="<long random password>" \
pnpm db:seed
```

Variables set in the shell take priority over your local `.env`. The seed is safe to repeat: it keeps projects you edited and skips an admin that already exists.

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
- A strict Content-Security-Policy is not set yet. The site uses inline styles and scripts from Next.js, so a nonce-based policy needs its own pass.
