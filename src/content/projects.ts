export type ProjectStatus = "live" | "building" | "rebuilding";

export type Project = {
  id: "aboutselphy" | "auth" | "social" | "twitch" | "widgets" | "plunderclips";
  status: ProjectStatus;
  stack: string[];
  url?: string;
  repo?: string;
};

export const projects: Project[] = [
  {
    id: "aboutselphy",
    status: "live",
    stack: ["Next.js 16", "TypeScript", "Tailwind v4", "Prisma 7", "PostgreSQL"],
    url: "https://aboutselphy.com",
  },
  {
    id: "auth",
    status: "live",
    stack: ["Next.js", "BetterAuth", "PostgreSQL", "OAuth 2.0"],
    url: "https://auth.aboutselphy.com",
  },
  {
    id: "social",
    status: "live",
    stack: ["Next.js 16", "Prisma", "MariaDB", "Redis"],
    url: "https://social.aboutselphy.com",
  },
  {
    id: "twitch",
    status: "building",
    stack: ["TypeScript", "Vite", "Vitest"],
  },
  {
    id: "widgets",
    status: "live",
    stack: ["HTML", "CSS", "JavaScript", "WebSocket", "Streamer.bot"],
  },
  {
    id: "plunderclips",
    status: "rebuilding",
    stack: ["Next.js 15", "Prisma", "MariaDB", "Docker", "GitHub Actions"],
  },
];
