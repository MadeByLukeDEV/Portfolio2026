import { useTranslations } from "next-intl";
import { skillGroups, type SkillGroup } from "@/content/skills";
import { Section } from "./section";

export function Skills() {
  const t = useTranslations("Skills");
  const groups = Object.keys(skillGroups) as SkillGroup[];

  return (
    <Section id="skills" title={t("title")} intro={t("intro")}>
      <dl className="grid gap-x-10 gap-y-10 sm:grid-cols-2">
        {groups.map((g) => (
          <div key={g} className="border-t border-border pt-4">
            <dt className="font-heading text-lg font-semibold">{t(`groups.${g}`)}</dt>
            <dd className="mt-2 text-[1.05rem] leading-relaxed text-muted-foreground">
              {skillGroups[g].join(", ")}
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
