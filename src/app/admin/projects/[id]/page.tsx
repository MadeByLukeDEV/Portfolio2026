import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateProject } from "../../actions";
import { ProjectForm } from "../project-form";

export const metadata = { title: "Edit project" };

export default async function EditProjectPage({ params }: PageProps<"/admin/projects/[id]">) {
  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) notFound();

  return (
    <div className="space-y-8">
      <h1 className="font-heading text-3xl font-bold tracking-tight">Edit {project.nameEn}</h1>
      <ProjectForm
        action={updateProject.bind(null, project.id)}
        submitLabel="Save changes"
        values={{
          slug: project.slug,
          status: project.status,
          nameEn: project.nameEn,
          nameDe: project.nameDe,
          taglineEn: project.taglineEn,
          taglineDe: project.taglineDe,
          bodyEn: project.bodyEn,
          bodyDe: project.bodyDe,
          stack: project.stack,
          url: project.url ?? "",
          repo: project.repo ?? "",
          published: project.published,
        }}
      />
    </div>
  );
}
