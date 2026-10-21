import { useTranslations } from "next-intl";
import { MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { site } from "@/lib/site";
import { LanguageToggle } from "./language-toggle";
import { ThemeToggle } from "./theme-toggle";

const allLinks = ["work", "skills", "path", "contact"] as const;

export function Header({ showWork = true }: { showWork?: boolean }) {
  const t = useTranslations("Nav");
  const links = allLinks.filter((id) => showWork || id !== "work");

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-md">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        {t("skip")}
      </a>
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:px-8">
        <a href="#top" className="font-heading text-lg font-bold tracking-tight">
          {site.name}
        </a>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {links.map((id) => (
            <a
              key={id}
              href={`#${id}`}
              className="rounded-md px-3 py-2 font-heading text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {t(id)}
            </a>
          ))}
          <span className="mx-2 h-5 w-px bg-border" aria-hidden />
          <LanguageToggle />
          <ThemeToggle />
        </nav>

        <div className="flex items-center gap-1 md:hidden">
          <LanguageToggle />
          <ThemeToggle />
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" aria-label={t("menu")}>
                  <MenuIcon className="size-4" />
                </Button>
              }
            />
            <SheetContent side="right" className="w-64">
              <SheetTitle className="sr-only">{t("menu")}</SheetTitle>
              <nav aria-label="Mobile" className="mt-12 flex flex-col px-4">
                {links.map((id) => (
                  <SheetClose
                    key={id}
                    render={
                      <a
                        href={`#${id}`}
                        className="border-b border-border py-4 font-heading text-2xl font-semibold"
                      >
                        {t(id)}
                      </a>
                    }
                  />
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
