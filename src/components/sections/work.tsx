import { useTranslations } from "next-intl";
import { ArrowUpRightIcon } from "lucide-react";
import type { PublicProject } from "@/lib/projects";
import { Section } from "./section";

const statusStyle = {
  live: "bg-primary/10 text-primary",
  building: "bg-accent/30 text-foreground",
  rebuilding: "bg-muted text-muted-foreground",
} as const;

export function Work({ projects }: { projects: PublicProject[] }) {
  const t = useTranslations("Work");

  if (projects.length === 0) return null;

  return (
    <Section id="work" title={t("title")} intro={t("intro")}>
      <ul className="divide-y divide-border border-y border-border">
        {projects.map((p) => (
          <li key={p.id}>
            <article className="grid gap-4 py-8 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] sm:gap-8">
              <div>
                <h3 className="font-heading text-2xl font-semibold tracking-tight">
                  {p.name}
                </h3>
                <p className="mt-1 text-base text-muted-foreground">{p.tagline}</p>
                <span
                  className={`mt-3 inline-block rounded-full px-2.5 py-1 font-heading text-xs font-medium ${statusStyle[p.status]}`}
                >
                  {t(`status.${p.status}`)}
                </span>
              </div>
              <div>
                <p className="max-w-prose text-[1.05rem] leading-relaxed">{p.body}</p>
                <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 font-mono text-sm text-muted-foreground">
                  {p.stack.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
                {(p.url || p.repo) && (
                  <div className="mt-5 flex flex-wrap gap-5 font-heading text-sm font-semibold">
                    {p.url && (
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center gap-1 text-primary underline-offset-4 hover:underline"
                      >
                        {t("visit")}
                        <ArrowUpRightIcon className="size-4" aria-hidden />
                      </a>
                    )}
                    {p.repo && (
                      <a
                        href={p.repo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center gap-1 underline-offset-4 hover:underline"
                      >
                        {t("code")}
                        <ArrowUpRightIcon className="size-4" aria-hidden />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </article>
          </li>
        ))}
      </ul>
    </Section>
  );
}
