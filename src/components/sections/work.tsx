import { useTranslations } from "next-intl";
import { ArrowUpRightIcon } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import type { PublicProject } from "@/lib/projects";
import { Section, surface } from "./section";

function Status({ project }: { project: PublicProject }) {
  const t = useTranslations("Work");

  // A project with a website shows whether that site answers right now; the others show their stage.
  if (project.online !== undefined) {
    return (
      <p className="inline-flex items-center gap-2 text-sm font-medium">
        <span
          aria-hidden
          className={`size-2.5 rounded-full ${project.online ? "bg-primary" : "bg-muted-foreground"}`}
        />
        {project.online ? t("online") : t("offline")}
      </p>
    );
  }
  return <p className="text-sm font-medium text-muted-foreground">{t(`status.${project.status}`)}</p>;
}

function Links({ project }: { project: PublicProject }) {
  const t = useTranslations("Work");
  if (!project.url && !project.repo) return null;

  return (
    <div className="mt-6 flex flex-wrap gap-6 font-heading text-base font-semibold">
      {project.url && (
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-1.5 text-primary underline-offset-4 hover:underline"
        >
          {t("visit")}
          <ArrowUpRightIcon className="size-4" aria-hidden />
        </a>
      )}
      {project.repo && (
        <a
          href={project.repo}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-1.5 underline-offset-4 hover:underline"
        >
          {t("code")}
          <ArrowUpRightIcon className="size-4" aria-hidden />
        </a>
      )}
    </div>
  );
}

export function Work({ projects }: { projects: PublicProject[] }) {
  const t = useTranslations("Work");

  if (projects.length === 0) return null;

  return (
    <Section id="work" title={t("title")} intro={t("intro")}>
      <ul className="space-y-8 sm:space-y-12">
        {projects.map((p, i) => (
          <Reveal as="li" key={p.id}>
            {p.image ? (
              // A project with a screenshot: picture and text side by side, alternating.
              <article className={`${surface} grid gap-6 p-4 sm:gap-10 sm:p-6 lg:grid-cols-12 lg:items-center`}>
                <div className={`lg:col-span-7 ${i % 2 === 1 ? "lg:order-2" : ""}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- static, pre-sized screenshots */}
                  <img
                    src={p.image}
                    alt={t("screenshot", { name: p.name })}
                    width={1440}
                    height={900}
                    loading={i === 0 ? "eager" : "lazy"}
                    className="aspect-[16/10] w-full rounded-2xl object-cover object-top"
                  />
                </div>
                <div className="px-1 pb-2 sm:px-0 lg:col-span-5">
                  <h3 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                    {p.name}
                  </h3>
                  <p className="mt-1 text-lg text-muted-foreground">{p.tagline}</p>
                  <div className="mt-3">
                    <Status project={p} />
                  </div>
                  <p className="mt-5 text-base leading-relaxed">{p.body}</p>
                  <p className="mt-5 text-base text-muted-foreground">{p.stack.join(", ")}</p>
                  <Links project={p} />
                </div>
              </article>
            ) : (
              // A project without one: name on the left, the text set larger on the right.
              <article className={`${surface} grid gap-4 p-6 sm:gap-10 sm:p-10 lg:grid-cols-12`}>
                <div className="lg:col-span-5">
                  <h3 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                    {p.name}
                  </h3>
                  <p className="mt-1 text-lg text-muted-foreground">{p.tagline}</p>
                  <div className="mt-3">
                    <Status project={p} />
                  </div>
                </div>
                <div className="lg:col-span-7">
                  <p className="text-xl leading-relaxed sm:text-2xl sm:leading-snug">{p.body}</p>
                  <p className="mt-5 text-base text-muted-foreground">{p.stack.join(", ")}</p>
                  <Links project={p} />
                </div>
              </article>
            )}
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
