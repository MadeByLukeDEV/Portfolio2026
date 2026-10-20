export function Section({
  id,
  title,
  intro,
  children,
}: {
  id: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="relative scroll-mt-14 border-t border-border bg-background/80 backdrop-blur-sm"
    >
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)] lg:gap-16">
        <header className="lg:sticky lg:top-24 lg:self-start">
          <h2
            id={`${id}-title`}
            className="font-heading text-4xl font-bold tracking-tight sm:text-5xl"
          >
            {title}
          </h2>
          {intro && (
            <p className="mt-4 max-w-sm text-lg leading-relaxed text-muted-foreground">{intro}</p>
          )}
        </header>
        <div>{children}</div>
      </div>
    </section>
  );
}
