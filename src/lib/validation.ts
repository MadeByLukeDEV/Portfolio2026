import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === "" || /^https?:\/\//i.test(v), "Must start with http:// or https://")
  .transform((v) => (v === "" ? null : v));

export const projectSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes")
    .max(60),
  status: z.enum(["live", "building", "rebuilding"]),
  nameEn: z.string().trim().min(1).max(120),
  nameDe: z.string().trim().min(1).max(120),
  taglineEn: z.string().trim().min(1).max(160),
  taglineDe: z.string().trim().min(1).max(160),
  bodyEn: z.string().trim().min(1).max(2000),
  bodyDe: z.string().trim().min(1).max(2000),
  stack: z.string().trim().max(500),
  url: optionalUrl,
  repo: optionalUrl,
  published: z.boolean(),
});

export const contactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.email().max(190),
  message: z.string().trim().min(10).max(4000),
});
