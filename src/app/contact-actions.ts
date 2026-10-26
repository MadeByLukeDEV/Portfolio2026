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
// Also cap the total, so many different addresses cannot flood the inbox.
const MAX_TOTAL_PER_WINDOW = 60;
const hits = new Map<string, number[]>();
let total: number[] = [];

/** In-memory limiter: good enough for a single-instance portfolio. */
function limited(key: string) {
  const now = Date.now();
  total = total.filter((t) => now - t < WINDOW_MS);
  if (total.length >= MAX_TOTAL_PER_WINDOW) return true;
  // Drop addresses that have gone quiet so the map cannot grow without bound.
  for (const [k, times] of hits) if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(key, recent);
    return true;
  }
  hits.set(key, [...recent, now]);
  total.push(now);
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
