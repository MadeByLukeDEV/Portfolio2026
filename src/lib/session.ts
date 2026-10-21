import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/** Redirects to /login unless the visitor is a signed-in admin. */
export async function requireAdmin() {
  const session = await getSession();
  if (!session || session.user.role !== "admin") redirect("/login");
  return session;
}
