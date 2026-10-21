"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { projectSchema } from "@/lib/validation";

export type FormState = {
  errors?: Record<string, string[] | undefined>;
  message?: string;
};

function readProject(form: FormData) {
  const text = (key: string) => String(form.get(key) ?? "");
  return projectSchema.safeParse({
    slug: text("slug"),
    status: text("status"),
    nameEn: text("nameEn"),
    nameDe: text("nameDe"),
    taglineEn: text("taglineEn"),
    taglineDe: text("taglineDe"),
    bodyEn: text("bodyEn"),
    bodyDe: text("bodyDe"),
    stack: text("stack"),
    url: text("url"),
    repo: text("repo"),
    published: form.get("published") === "on",
  });
}

function refreshSite() {
  revalidatePath("/");
  revalidatePath("/admin/projects");
}

export async function createProject(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = readProject(form);
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const taken = await prisma.project.findUnique({ where: { slug: parsed.data.slug } });
  if (taken) return { errors: { slug: ["This slug is already used"] } };

  const last = await prisma.project.findFirst({ orderBy: { sortOrder: "desc" } });
  await prisma.project.create({
    data: { ...parsed.data, sortOrder: (last?.sortOrder ?? -1) + 1 },
  });
  refreshSite();
  redirect("/admin/projects");
}

export async function updateProject(id: string, _: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = readProject(form);
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const clash = await prisma.project.findFirst({
    where: { slug: parsed.data.slug, NOT: { id } },
  });
  if (clash) return { errors: { slug: ["This slug is already used"] } };

  await prisma.project.update({ where: { id }, data: parsed.data });
  refreshSite();
  redirect("/admin/projects");
}

export async function deleteProject(form: FormData) {
  await requireAdmin();
  await prisma.project.delete({ where: { id: String(form.get("id")) } });
  refreshSite();
}

export async function togglePublished(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id"));
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) return;
  await prisma.project.update({ where: { id }, data: { published: !project.published } });
  refreshSite();
}

export async function moveProject(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id"));
  const direction = form.get("direction") === "up" ? -1 : 1;

  const all = await prisma.project.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true },
  });
  const from = all.findIndex((p) => p.id === id);
  const to = from + direction;
  if (from < 0 || to < 0 || to >= all.length) return;

  const order = all.map((p) => p.id);
  [order[from], order[to]] = [order[to], order[from]];
  await prisma.$transaction(
    order.map((projectId, index) =>
      prisma.project.update({ where: { id: projectId }, data: { sortOrder: index } }),
    ),
  );
  refreshSite();
}

export async function setMessageRead(form: FormData) {
  await requireAdmin();
  await prisma.contactMessage.update({
    where: { id: String(form.get("id")) },
    data: { read: form.get("read") === "true" },
  });
  revalidatePath("/admin", "layout");
}

export async function deleteMessage(form: FormData) {
  await requireAdmin();
  await prisma.contactMessage.delete({ where: { id: String(form.get("id")) } });
  revalidatePath("/admin", "layout");
}
