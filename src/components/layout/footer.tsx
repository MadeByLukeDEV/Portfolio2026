import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("Footer");
  return (
    <footer className="bg-card/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-8 text-base text-muted-foreground sm:flex-row sm:justify-between sm:px-8">
        <p>
          © {new Date().getFullYear()} {t("rights")}
        </p>
        <p>{t("legal")}</p>
      </div>
    </footer>
  );
}
