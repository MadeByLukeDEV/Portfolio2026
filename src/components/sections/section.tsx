import { Reveal } from "@/components/motion/reveal";

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
      className="relative scroll-mt-14"
    >
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)] lg:gap-16">
        <Reveal as="header" className="lg:sticky lg:top-24 lg:self-start">
          <h2
            id={`${id}-title`}
            className="font-heading text-4xl font-bold tracking-tight sm:text-5xl"
          >
            {title}
          </h2>
          {intro && (
            <p className="mt-4 max-w-sm text-lg leading-relaxed text-muted-foreground">{intro}</p>
          )}
        </Reveal>
        <div className="rounded-3xl border border-border/70 bg-card/55 p-5 shadow-[0_20px_60px_-30px_rgb(0_0_0/0.45)] backdrop-blur-xl sm:p-8">
          {children}
        </div>
      </div>
    </section>
  );
}
