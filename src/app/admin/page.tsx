import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { PasskeyManager } from "./passkey-manager";
import { SignOutButton } from "./sign-out-button";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const session = await requireAdmin();

  const [passkeys, users] = await Promise.all([
    prisma.passkey.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, createdAt: true },
    }),
    prisma.user.count(),
  ]);

  return (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-4xl font-bold tracking-tight">Admin</h1>
          <p className="mt-1 text-muted-foreground">Signed in as {session.user.email}</p>
        </div>
        <SignOutButton />
      </header>

      <section aria-labelledby="keys" className="mt-12">
        <h2 id="keys" className="mb-4 font-heading text-2xl font-semibold">
          Hardware keys
        </h2>
        <PasskeyManager
          passkeys={passkeys.map((p) => ({
            id: p.id,
            name: p.name,
            createdAt: p.createdAt?.toISOString() ?? null,
          }))}
        />
      </section>

      <section aria-labelledby="overview" className="mt-12">
        <h2 id="overview" className="mb-4 font-heading text-2xl font-semibold">
          Overview
        </h2>
        <p className="text-muted-foreground">{users} registered account(s).</p>
      </section>
    </main>
  );
}
