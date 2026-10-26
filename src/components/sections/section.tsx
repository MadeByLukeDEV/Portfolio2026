import { Reveal } from "@/components/motion/reveal";

/** A titled block: the heading runs large across the top and the content gets the full width below. */
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
    <section id={id} aria-labelledby={`${id}-title`} className="relative scroll-mt-14">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
        <Reveal as="header" className="max-w-3xl">
          <h2
            id={`${id}-title`}
            className="font-heading text-5xl font-bold tracking-[-0.03em] sm:text-7xl"
          >
            {title}
          </h2>
          {intro && (
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">{intro}</p>
          )}
        </Reveal>
        <div className="mt-14 sm:mt-20">{children}</div>
      </div>
    </section>
  );
}

/** The one surface that text sits on where it crosses the 3D scene. */
export const surface = "rounded-3xl bg-card/70 backdrop-blur-xl";
