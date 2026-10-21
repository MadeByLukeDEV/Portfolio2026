import "dotenv/config";
import { defineConfig } from "prisma/config";

const raw = process.env.DATABASE_URL;
if (!raw) throw new Error("DATABASE_URL is not set");

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Hosts like Dokploy hand out mariadb:// URLs; Prisma's MySQL provider only knows mysql://.
    url: raw.replace(/^mariadb:/i, "mysql:"),
  },
});
