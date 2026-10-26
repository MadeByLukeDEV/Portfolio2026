import { useTranslations } from "next-intl";
import { ArrowDownIcon } from "lucide-react";
import { HeroHeadline } from "./hero-headline";

export function Hero({ showWork = true }: { showWork?: boolean }) {
  const t = useTranslations("Hero");

  return (
    <section
      id="top"
      className="mx-auto flex min-h-dvh max-w-6xl flex-col justify-end px-5 pb-16 pt-28 sm:px-8 sm:pb-24"
    >
      <HeroHeadline text={t("headline")} />
      <p className="mt-8 max-w-[34rem] text-lg leading-relaxed sm:text-xl">{t("lead")}</p>
      <div className="mt-10 flex flex-wrap items-center gap-3">
        {showWork && (
          <a
            href="#work"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 font-heading text-base font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {t("ctaWork")}
            <ArrowDownIcon className="size-4" aria-hidden />
          </a>
        )}
        <a
          href="#contact"
          className="inline-flex h-12 items-center rounded-full bg-secondary px-6 font-heading text-base font-semibold transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {t("ctaContact")}
        </a>
      </div>
    </section>
  );
}
