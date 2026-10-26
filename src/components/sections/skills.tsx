import { useTranslations } from "next-intl";
import { Reveal } from "@/components/motion/reveal";
import { skillGroups, type SkillGroup } from "@/content/skills";
import { Section, surface } from "./section";

export function Skills() {
  const t = useTranslations("Skills");
  const groups = Object.keys(skillGroups) as SkillGroup[];

  return (
    <Section id="skills" title={t("title")} intro={t("intro")}>
      <dl className={`${surface} grid gap-x-12 gap-y-12 p-6 sm:grid-cols-2 sm:p-12 lg:grid-cols-3`}>
        {groups.map((g, i) => (
          <Reveal key={g} delay={(i % 3) * 0.07}>
            <dt className="font-heading text-2xl font-bold tracking-tight">{t(`groups.${g}`)}</dt>
            <dd className="mt-3 text-xl leading-snug text-muted-foreground">
              {skillGroups[g].join(", ")}
            </dd>
          </Reveal>
        ))}
      </dl>
    </Section>
  );
}
