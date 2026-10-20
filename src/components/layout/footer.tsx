import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("Footer");
  return (
    <footer className="border-t border-border bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:justify-between sm:px-8">
        <p>
          © {new Date().getFullYear()} {t("rights")}
        </p>
        <p>{t("legal")}</p>
      </div>
    </footer>
  );
}
