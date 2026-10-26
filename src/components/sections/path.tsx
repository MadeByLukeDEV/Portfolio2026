import { useTranslations } from "next-intl";
import { Reveal } from "@/components/motion/reveal";
import { Section, surface } from "./section";

const items = ["self", "poppies", "codefactory", "learning", "apprenticeship"] as const;

export function Path() {
  const t = useTranslations("Path");

  return (
    <Section id="path" title={t("title")} intro={t("intro")}>
      <ol className={`${surface} space-y-12 p-6 sm:p-12`}>
        {items.map((id, i) => (
          <Reveal as="li" key={id} className="grid gap-2 lg:grid-cols-12 lg:gap-10">
            <p
              className={`text-lg font-semibold lg:col-span-3 ${i === 0 ? "text-primary" : "text-muted-foreground"}`}
            >
              {t(`items.${id}.when`)}
            </p>
            <div className="lg:col-span-9">
              <h3 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
                {t(`items.${id}.title`)}
              </h3>
              <p className="mt-1 text-lg text-muted-foreground">{t(`items.${id}.where`)}</p>
              <p className="mt-4 max-w-prose text-lg leading-relaxed">{t(`items.${id}.body`)}</p>
            </div>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
