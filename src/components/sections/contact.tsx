import { useTranslations } from "next-intl";
import { site } from "@/lib/site";
import { ContactForm } from "./contact-form";

export function Contact() {
  const t = useTranslations("Contact");

  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="relative scroll-mt-14 border-t border-border bg-background/80 backdrop-blur-sm"
    >
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
        <h2 id="contact-title" className="font-heading text-4xl font-bold tracking-tight sm:text-6xl">
          {t("title")}
        </h2>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">{t("body")}</p>
        <div className="mt-10 max-w-2xl">
          <ContactForm />
        </div>
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
    </section>
  );
}
