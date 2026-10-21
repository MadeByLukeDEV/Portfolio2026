"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { KeyRoundIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function signInWithKey() {
    setError(null);
    startTransition(async () => {
      const { error } = await authClient.signIn.passkey();
      if (error) return setError(error.message ?? "Security key sign-in failed.");
      router.replace("/admin");
      router.refresh();
    });
  }

  function signInWithPassword(form: FormData) {
    setError(null);
    startTransition(async () => {
      const { error } = await authClient.signIn.email({
        email: String(form.get("email")),
        password: String(form.get("password")),
      });
      if (error) return setError(error.message ?? "Sign-in failed.");
      router.replace("/admin");
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <Button
        type="button"
        size="lg"
        className="h-12 w-full text-base"
        onClick={signInWithKey}
        disabled={pending}
      >
        <KeyRoundIcon aria-hidden /> Sign in with security key
      </Button>

      <div className="flex items-center gap-3 text-sm text-muted-foreground" aria-hidden>
        <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
      </div>

      <form action={signInWithPassword} className="space-y-4">
        <label className="block space-y-1.5 text-sm font-medium">
          Email
          <input
            name="email"
            type="email"
            autoComplete="username webauthn"
            required
            className="h-11 w-full rounded-lg border border-input bg-background px-3 text-base"
          />
        </label>
        <label className="block space-y-1.5 text-sm font-medium">
          Password
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="h-11 w-full rounded-lg border border-input bg-background px-3 text-base"
          />
        </label>
        <Button type="submit" variant="outline" className="h-11 w-full text-base" disabled={pending}>
          Sign in with password
        </Button>
      </form>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
