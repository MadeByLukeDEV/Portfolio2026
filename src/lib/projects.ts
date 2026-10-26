import "server-only";
import { prisma } from "./prisma";
import { getOnlineStatus } from "./site-status";
import { projects as staticProjects, type ProjectStatus } from "@/content/projects";
import en from "../../messages/en.json";
import de from "../../messages/de.json";

/** Screenshots of the live sites, keyed by project slug. */
const IMAGES: Record<string, string> = {
  aboutselphy: "/projects/aboutselphy.jpg",
  auth: "/projects/auth.jpg",
  social: "/projects/social.jpg",
};

export type PublicProject = {
  id: string;
  image?: string;
  /** Result of a live check of `url`; undefined when the project has no website. */
  online?: boolean;
  status: ProjectStatus;
  name: string;
  tagline: string;
  body: string;
  stack: string[];
  url?: string;
  repo?: string;
};

const catalogs = { en, de } as const;

export function parseStack(value: string) {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function fromStatic(locale: "en" | "de"): PublicProject[] {
  const texts = catalogs[locale].Work.projects;
  return staticProjects.map((p) => ({
    id: p.id,
    image: IMAGES[p.id],
    status: p.status,
    name: texts[p.id].name,
    tagline: texts[p.id].tagline,
    body: texts[p.id].body,
    stack: p.stack,
    url: p.url,
    repo: p.repo,
  }));
}

/** Published projects from the database; falls back to the bundled list if it is unreachable. */
async function loadProjects(locale: string): Promise<PublicProject[]> {
  const lang = locale === "de" ? "de" : "en";
  try {
    const rows = await prisma.project.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    // A database that was never seeded shows the bundled list instead of an empty site.
    // Once projects exist, hiding all of them in the admin is respected.
    if (rows.length === 0 && (await prisma.project.count()) === 0) return fromStatic(lang);
    return rows.map((r) => ({
      id: r.id,
      image: IMAGES[r.slug],
      status: (["live", "building", "rebuilding"].includes(r.status) ? r.status : "live") as ProjectStatus,
      name: lang === "de" ? r.nameDe : r.nameEn,
      tagline: lang === "de" ? r.taglineDe : r.taglineEn,
      body: lang === "de" ? r.bodyDe : r.bodyEn,
      stack: parseStack(r.stack),
      url: r.url ?? undefined,
      repo: r.repo ?? undefined,
    }));
  } catch (error) {
    console.error("Falling back to bundled projects:", error);
    return fromStatic(lang);
  }
}

/** Published projects with a live online check for those that have a website. */
export async function getPublicProjects(locale: string): Promise<PublicProject[]> {
  const projects = await loadProjects(locale);
  const urls = projects.flatMap((p) => (p.url ? [p.url] : []));
  const status = await getOnlineStatus(urls);
  return projects.map((p) => (p.url ? { ...p, online: status.get(p.url) } : p));
}
