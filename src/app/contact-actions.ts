"use server";

import { headers } from "next/headers";
import { getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { contactSchema } from "@/lib/validation";

export type ContactState = {
  status: "idle" | "success" | "invalid" | "rate-limited" | "error";
};

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

/** In-memory limiter: good enough for a single-instance portfolio. */
function limited(key: string) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(key, recent);
    return true;
  }
  hits.set(key, [...recent, now]);
  return false;
}

export async function sendMessage(_: ContactState, form: FormData): Promise<ContactState> {
  // Honeypot: real visitors never fill this hidden field.
  if (form.get("website")) return { status: "success" };

  const parsed = contactSchema.safeParse({
    name: form.get("name"),
    email: form.get("email"),
    message: form.get("message"),
  });
  if (!parsed.success) return { status: "invalid" };

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (limited(ip)) return { status: "rate-limited" };

  try {
    await prisma.contactMessage.create({
      data: { ...parsed.data, locale: await getLocale() },
    });
    return { status: "success" };
  } catch (error) {
    console.error("Could not store contact message:", error);
    return { status: "error" };
  }
}
