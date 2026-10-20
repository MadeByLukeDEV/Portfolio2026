import { useTranslations } from "next-intl";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function Home() {
  const t = useTranslations("Hero");
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-6 px-6">
      <div className="flex gap-2">
        <LanguageToggle />
        <ThemeToggle />
      </div>
      <h1 className="text-5xl font-semibold tracking-tight">{t("headline")}</h1>
      <p className="max-w-prose text-lg text-muted-foreground">{t("lead")}</p>
    </main>
  );
}
