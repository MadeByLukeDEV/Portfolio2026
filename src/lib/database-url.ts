export type DatabaseConnection = {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  search: string;
};

const URL_PATTERN =
  /^[a-z][a-z0-9+.-]*:\/\/(?:([^:@/]*)(?::(.*))?@)?([^@/?#:]+)(?::(\d+))?(\/[^?#]*)?(\?.*)?$/i;

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/**
 * Parses mysql:// and mariadb:// URLs, including ones whose password contains characters like
 * "/", "@", "+" or "=" that should have been percent-encoded. The credentials end at the last "@".
 *
 * prisma.config.ts carries a copy of this logic because the Docker image ships it on its own.
 */
export function parseDatabaseUrl(raw: string | undefined): DatabaseConnection {
  const match = URL_PATTERN.exec((raw ?? "").trim());
  if (!match) throw new Error("DATABASE_URL is missing or not a valid mysql:// or mariadb:// URL");

  const [, user = "", password = "", host, port, path = "", search = ""] = match;
  return {
    host,
    port: port ? Number(port) : 3306,
    user: safeDecode(user),
    password: safeDecode(password),
    database: safeDecode(path.replace(/^\//, "")),
    search,
  };
}
