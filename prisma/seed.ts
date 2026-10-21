import "dotenv/config";

async function seedProjects() {
  const { prisma } = await import("../src/lib/prisma");
  const { projects } = await import("../src/content/projects");
  const en = (await import("../messages/en.json")).default.Work.projects;
  const de = (await import("../messages/de.json")).default.Work.projects;

  for (const [index, p] of projects.entries()) {
    // `update: {}` keeps anything already edited in the admin dashboard.
    await prisma.project.upsert({
      where: { slug: p.id },
      update: {},
      create: {
        slug: p.id,
        status: p.status,
        nameEn: en[p.id].name,
        nameDe: de[p.id].name,
        taglineEn: en[p.id].tagline,
        taglineDe: de[p.id].tagline,
        bodyEn: en[p.id].body,
        bodyDe: de[p.id].body,
        stack: p.stack.join(", "),
        url: p.url ?? null,
        repo: p.repo ?? null,
        sortOrder: index,
      },
    });
  }
  console.log(`Projects ready (${projects.length}).`);
}

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env");

  // Imported after dotenv so lib/auth sees the environment.
  const { auth } = await import("../src/lib/auth");
  const ctx = await auth.$context;

  const existing = await ctx.internalAdapter.findUserByEmail(email);
  if (existing) {
    console.log(`Admin ${email} already exists, nothing to do.`);
    return;
  }

  const user = await ctx.internalAdapter.createUser(
    { email, name: "Lukas Graf", emailVerified: true, role: "admin" },
    { method: "admin" },
  );
  await ctx.internalAdapter.linkAccount({
    userId: user.id,
    providerId: "credential",
    accountId: user.id,
    password: await ctx.password.hash(password),
  });
  console.log(`Created admin ${email}. Sign in, then register a hardware key in /admin/security.`);
}

async function main() {
  await seedProjects();
  await seedAdmin();
  const { prisma } = await import("../src/lib/prisma");
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
