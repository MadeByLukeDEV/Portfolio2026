import "dotenv/config";

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env");

  // Imported after dotenv so lib/auth sees the environment.
  const { auth } = await import("../src/lib/auth");
  const { prisma } = await import("../src/lib/prisma");
  const ctx = await auth.$context;

  const existing = await ctx.internalAdapter.findUserByEmail(email);
  if (existing) {
    console.log(`Admin ${email} already exists, nothing to do.`);
    return;
  }

  const user = await ctx.internalAdapter.createUser({
    email,
    name: "Lukas Graf",
    emailVerified: true,
    role: "admin",
  }, { method: "admin" });
  await ctx.internalAdapter.linkAccount({
    userId: user.id,
    providerId: "credential",
    accountId: user.id,
    password: await ctx.password.hash(password),
  });
  console.log(`Created admin ${email}. Sign in, then register a hardware key in /admin.`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
