import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { passwordLoginEnabled } from "@/lib/flags";
import { getSession } from "@/lib/session";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const session = await getSession();
  if (session?.user.role === "admin") redirect("/admin");

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-5 py-16">
      <h1 className="font-heading text-4xl font-bold tracking-tight">Admin</h1>
      <p className="mb-8 mt-2 text-muted-foreground">Sign in to manage MadeByLuke.</p>
      <LoginForm passwordLogin={passwordLoginEnabled} />
    </main>
  );
}
