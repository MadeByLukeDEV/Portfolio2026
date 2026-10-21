import Link from "next/link";
import { ArrowDownIcon, ArrowUpIcon, EyeIcon, EyeOffIcon, PlusIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { deleteProject, moveProject, togglePublished } from "../actions";
import { ConfirmButton } from "./confirm-button";

export const metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-3xl font-bold tracking-tight">Projects</h1>
        <Link href="/admin/projects/new" className={buttonVariants({ className: "h-10 px-4" })}>
          <PlusIcon aria-hidden /> New project
        </Link>
      </div>

      {projects.length === 0 ? (
        <p className="text-muted-foreground">No projects yet. Add your first one.</p>
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border">
          {projects.map((p, i) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <Link href={`/admin/projects/${p.id}`} className="font-medium hover:underline">
                  {p.nameEn}
                </Link>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="secondary">{p.status}</Badge>
                  {!p.published && <Badge variant="outline">Hidden</Badge>}
                  <span className="truncate">{p.taglineEn}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <form action={moveProject}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="direction" value="up" />
                  <Button type="submit" variant="ghost" size="icon" aria-label={`Move ${p.nameEn} up`} disabled={i === 0}>
                    <ArrowUpIcon className="size-4" />
                  </Button>
                </form>
                <form action={moveProject}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="direction" value="down" />
                  <Button type="submit"
                    variant="ghost"
                    size="icon"
                    aria-label={`Move ${p.nameEn} down`}
                    disabled={i === projects.length - 1}
                  >
                    <ArrowDownIcon className="size-4" />
                  </Button>
                </form>
                <form action={togglePublished}>
                  <input type="hidden" name="id" value={p.id} />
                  <Button type="submit"
                    variant="ghost"
                    size="icon"
                    aria-label={p.published ? `Hide ${p.nameEn}` : `Publish ${p.nameEn}`}
                  >
                    {p.published ? <EyeIcon className="size-4" /> : <EyeOffIcon className="size-4" />}
                  </Button>
                </form>
                <form action={deleteProject}>
                  <input type="hidden" name="id" value={p.id} />
                  <ConfirmButton
                    message={`Delete "${p.nameEn}"? This cannot be undone.`}
                    label={`Delete ${p.nameEn}`}
                  />
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
