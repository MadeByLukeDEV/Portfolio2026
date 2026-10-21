import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { SignOutButton } from "./sign-out-button";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  const unread = await prisma.contactMessage.count({ where: { read: false } });

  const links = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/projects", label: "Projects" },
    { href: "/admin/messages", label: unread > 0 ? `Messages (${unread})` : "Messages" },
    { href: "/admin/security", label: "Security" },
  ];

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:py-14">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/" className="font-heading text-lg font-bold tracking-tight">
            MadeByLuke
          </Link>
          <p className="text-sm text-muted-foreground">{session.user.email}</p>
        </div>
        <SignOutButton />
      </header>
      <nav aria-label="Admin" className="mt-8 flex flex-wrap gap-1 border-b border-border pb-3">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-lg px-3 py-2 font-heading text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <main className="mt-10">{children}</main>
    </div>
  );
}
