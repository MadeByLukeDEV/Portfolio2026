import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { PasskeyManager } from "./passkey-manager";

export const metadata = { title: "Security" };

export default async function SecurityPage() {
  const session = await requireAdmin();
  const passkeys = await prisma.passkey.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, createdAt: true },
  });

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-bold tracking-tight">Security</h1>
      <h2 className="font-heading text-xl font-semibold">Hardware keys</h2>
      <PasskeyManager
        passkeys={passkeys.map((p) => ({
          id: p.id,
          name: p.name,
          createdAt: p.createdAt?.toISOString() ?? null,
        }))}
      />
    </div>
  );
}
