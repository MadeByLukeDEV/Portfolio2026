import { useTranslations } from "next-intl";
import { Reveal } from "@/components/motion/reveal";
import { site } from "@/lib/site";
import { ContactForm } from "./contact-form";
import { surface } from "./section";

export function Contact() {
  const t = useTranslations("Contact");

  return (
    <section id="contact" aria-labelledby="contact-title" className="relative scroll-mt-14">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Reveal as="h2" className="font-heading text-5xl font-bold tracking-[-0.03em] sm:text-7xl">
              <span id="contact-title">{t("title")}</span>
            </Reveal>
            <Reveal as="p" delay={0.08} className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
              {t("body")}
            </Reveal>
            <Reveal delay={0.14} className="mt-8 flex flex-wrap gap-x-6 text-lg">
              <a
                href={site.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center font-semibold text-primary underline-offset-4 hover:underline"
              >
                {t("github")}
              </a>
              <span className="inline-flex min-h-11 items-center text-muted-foreground">{t("location")}</span>
            </Reveal>
          </div>
          <Reveal delay={0.1} className={`${surface} p-6 sm:p-10 lg:col-span-7`}>
            <ContactForm />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
