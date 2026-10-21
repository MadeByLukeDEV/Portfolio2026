#!/bin/sh
set -e

# Apply pending migrations before the server starts. Disable with RUN_MIGRATIONS=false
# if you prefer to run `prisma migrate deploy` yourself.
if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  if [ -z "$DATABASE_URL" ]; then
    echo "DATABASE_URL is not set, cannot run migrations." >&2
    exit 1
  fi
  echo "Running database migrations..."
  (cd /migrate && ./node_modules/.bin/prisma migrate deploy)
fi

exec "$@"
