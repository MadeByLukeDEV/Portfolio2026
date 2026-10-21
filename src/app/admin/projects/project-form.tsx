"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { FormState } from "../actions";

export type ProjectValues = {
  slug: string;
  status: string;
  nameEn: string;
  nameDe: string;
  taglineEn: string;
  taglineDe: string;
  bodyEn: string;
  bodyDe: string;
  stack: string;
  url: string;
  repo: string;
  published: boolean;
};

export const emptyProject: ProjectValues = {
  slug: "",
  status: "live",
  nameEn: "",
  nameDe: "",
  taglineEn: "",
  taglineDe: "",
  bodyEn: "",
  bodyDe: "",
  stack: "",
  url: "",
  repo: "",
  published: true,
};

function Field({
  name,
  label,
  error,
  hint,
  children,
}: {
  name: string;
  label: string;
  error?: string[];
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      {children}
      {hint && !error && <p className="text-sm text-muted-foreground">{hint}</p>}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error[0]}
        </p>
      )}
    </div>
  );
}

export function ProjectForm({
  action,
  values,
  submitLabel,
}: {
  action: (state: FormState, form: FormData) => Promise<FormState>;
  values: ProjectValues;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const e = state.errors ?? {};

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <Field name="slug" label="Slug" error={e.slug} hint="Lowercase, used as a stable identifier.">
          <Input id="slug" name="slug" defaultValue={values.slug} required className="h-11" />
        </Field>
        <Field name="status" label="Status" error={e.status}>
          <select
            id="status"
            name="status"
            defaultValue={values.status}
            className="h-11 w-full rounded-lg border border-input bg-background px-3 text-base"
          >
            <option value="live">Live</option>
            <option value="building">In progress</option>
            <option value="rebuilding">Being rebuilt</option>
          </select>
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field name="nameEn" label="Name (English)" error={e.nameEn}>
          <Input id="nameEn" name="nameEn" defaultValue={values.nameEn} required className="h-11" />
        </Field>
        <Field name="nameDe" label="Name (German)" error={e.nameDe}>
          <Input id="nameDe" name="nameDe" defaultValue={values.nameDe} required className="h-11" />
        </Field>
        <Field name="taglineEn" label="Tagline (English)" error={e.taglineEn}>
          <Input id="taglineEn" name="taglineEn" defaultValue={values.taglineEn} required className="h-11" />
        </Field>
        <Field name="taglineDe" label="Tagline (German)" error={e.taglineDe}>
          <Input id="taglineDe" name="taglineDe" defaultValue={values.taglineDe} required className="h-11" />
        </Field>
        <Field name="bodyEn" label="Description (English)" error={e.bodyEn}>
          <Textarea id="bodyEn" name="bodyEn" defaultValue={values.bodyEn} required rows={6} />
        </Field>
        <Field name="bodyDe" label="Description (German)" error={e.bodyDe}>
          <Textarea id="bodyDe" name="bodyDe" defaultValue={values.bodyDe} required rows={6} />
        </Field>
      </div>

      <Field name="stack" label="Tech stack" error={e.stack} hint="Comma separated, for example: Next.js, Prisma, MariaDB">
        <Input id="stack" name="stack" defaultValue={values.stack} className="h-11" />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field name="url" label="Website URL" error={e.url}>
          <Input id="url" name="url" type="url" defaultValue={values.url} placeholder="https://" className="h-11" />
        </Field>
        <Field name="repo" label="Source URL" error={e.repo}>
          <Input id="repo" name="repo" type="url" defaultValue={values.repo} placeholder="https://github.com/" className="h-11" />
        </Field>
      </div>

      <label className="flex items-center gap-3 text-base">
        <input
          type="checkbox"
          name="published"
          defaultChecked={values.published}
          className="size-5 accent-[var(--primary)]"
        />
        Show on the public site
      </label>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending} className="h-11 px-6 text-base">
          {pending ? "Saving…" : submitLabel}
        </Button>
        <Link href="/admin/projects" className={buttonVariants({ variant: "outline", className: "h-11 px-6 text-base" })}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
