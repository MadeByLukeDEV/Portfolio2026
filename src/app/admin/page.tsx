import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminOverview() {
  const [projects, published, unread, latest] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { published: true } }),
    prisma.contactMessage.count({ where: { read: false } }),
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 3 }),
  ]);

  const stats = [
    { label: "Projects", value: `${published} of ${projects} published`, href: "/admin/projects" },
    { label: "Unread messages", value: String(unread), href: "/admin/messages" },
  ];

  return (
    <div className="space-y-12">
      <h1 className="font-heading text-3xl font-bold tracking-tight">Overview</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-xl border border-border bg-card p-5 transition-colors hover:bg-muted"
          >
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="mt-1 font-heading text-2xl font-semibold">{s.value}</p>
          </Link>
        ))}
      </div>

      <section aria-labelledby="latest">
        <h2 id="latest" className="mb-4 font-heading text-xl font-semibold">
          Latest messages
        </h2>
        {latest.length === 0 ? (
          <p className="text-muted-foreground">
            No messages yet. They show up here when someone uses the contact form.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-xl border border-border">
            {latest.map((m) => (
              <li key={m.id} className="px-4 py-3">
                <p className="font-medium">
                  {m.name} <span className="font-normal text-muted-foreground">({m.email})</span>
                </p>
                <p className="line-clamp-1 text-muted-foreground">{m.message}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
