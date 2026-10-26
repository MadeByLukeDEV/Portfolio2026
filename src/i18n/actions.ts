"use server";

import { cookies } from "next/headers";
import { LOCALE_COOKIE, isLocale } from "./config";

export async function setLocale(locale: string) {
  if (!isLocale(locale)) return;
  (await cookies()).set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.BETTER_AUTH_URL?.startsWith("https://") ?? false,
  });
}
