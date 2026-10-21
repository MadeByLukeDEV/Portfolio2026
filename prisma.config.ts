import "dotenv/config";
import { defineConfig } from "prisma/config";

// Same parsing as src/lib/database-url.ts, duplicated because the Docker image ships this file alone.
// Accepts mariadb:// and mysql:// URLs, and passwords with unescaped characters such as "/" or "+".
const URL_PATTERN =
  /^[a-z][a-z0-9+.-]*:\/\/(?:([^:@/]*)(?::(.*))?@)?([^@/?#:]+)(?::(\d+))?(\/[^?#]*)?(\?.*)?$/i;

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function toPrismaUrl(raw: string | undefined) {
  const match = URL_PATTERN.exec((raw ?? "").trim());
  if (!match) throw new Error("DATABASE_URL is missing or not a valid mysql:// or mariadb:// URL");
  if ((raw ?? "").includes("@") && match[1] === undefined) throw new Error("DATABASE_URL has an @ but no user:password before it. Check there is a colon between the user name and the password: scheme://user:password@host:port/database");
  const [, user = "", password = "", host, port = "3306", path = "", search = ""] = match;
  const enc = (value: string) => encodeURIComponent(safeDecode(value));
  return `mysql://${enc(user)}:${enc(password)}@${host}:${port}${path}${search}`;
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: toPrismaUrl(process.env.DATABASE_URL),
  },
});
