import { useTranslations } from "next-intl";
import { Reveal } from "@/components/motion/reveal";
import { Section } from "./section";

const items = ["self", "poppies", "codefactory", "learning", "apprenticeship"] as const;

export function Path() {
  const t = useTranslations("Path");

  return (
    <Section id="path" title={t("title")} intro={t("intro")}>
      <ol className="relative ml-2 border-l border-border">
        {items.map((id, i) => (
          <Reveal as="li" key={id} className="relative pb-10 pl-8 last:pb-0">
            <span
              aria-hidden
              className={`absolute -left-[5px] top-2 size-2.5 rounded-full ${i === 0 ? "bg-primary ring-4 ring-primary/20" : "bg-border"}`}
            />
            <p className="font-mono text-sm text-muted-foreground">{t(`items.${id}.when`)}</p>
            <h3 className="mt-1 font-heading text-xl font-semibold tracking-tight">
              {t(`items.${id}.title`)}
            </h3>
            <p className="text-base text-muted-foreground">{t(`items.${id}.where`)}</p>
            <p className="mt-3 max-w-prose text-[1.05rem] leading-relaxed">
              {t(`items.${id}.body`)}
            </p>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
