import { useTranslations } from "next-intl";
import { Reveal } from "@/components/motion/reveal";
import { site } from "@/lib/site";
import { ContactForm } from "./contact-form";

export function Contact() {
  const t = useTranslations("Contact");

  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="relative scroll-mt-14"
    >
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="rounded-3xl border border-border/70 bg-card/55 p-6 shadow-[0_20px_60px_-30px_rgb(0_0_0/0.45)] backdrop-blur-xl sm:p-12">
        <Reveal as="h2" className="font-heading text-4xl font-bold tracking-tight sm:text-6xl">
          <span id="contact-title">{t("title")}</span>
        </Reveal>
        <Reveal as="p" delay={0.08} className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
          {t("body")}
        </Reveal>
        <Reveal delay={0.16} className="mt-10 max-w-2xl">
          <ContactForm />
        </Reveal>
        <p className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-base text-muted-foreground">
          <a
            href={site.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center underline-offset-4 hover:text-foreground hover:underline"
          >
            {t("github")}
          </a>
          <span className="inline-flex min-h-11 items-center">{t("location")}</span>
        </p>
        </div>
      </div>
    </section>
  );
}
