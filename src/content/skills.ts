export const skillGroups = {
  frontend: ["Next.js", "React", "TypeScript", "Tailwind CSS", "shadcn/ui", "Vite", "Vitest"],
  backend: ["Node.js", "REST", "Webhooks", "OAuth 2.0", "BetterAuth", "Prisma", "PostgreSQL", "MariaDB", "Redis"],
  ops: ["Docker", "Dokploy", "Coolify", "GitHub Actions", "Linux", "Caddy"],
  tools: ["Git", "Streamer.bot", "n8n", "Figma"],
  basics: ["PHP", "Symfony", "Laravel", "Vue.js", "Angular"],
} as const;

export type SkillGroup = keyof typeof skillGroups;
