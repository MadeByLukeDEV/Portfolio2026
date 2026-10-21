import { createProject } from "../../actions";
import { emptyProject, ProjectForm } from "../project-form";

export const metadata = { title: "New project" };

export default function NewProjectPage() {
  return (
    <div className="space-y-8">
      <h1 className="font-heading text-3xl font-bold tracking-tight">New project</h1>
      <ProjectForm action={createProject} values={emptyProject} submitLabel="Create project" />
    </div>
  );
}
