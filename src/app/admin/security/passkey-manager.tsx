"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { KeyRoundIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export type PasskeyRow = { id: string; name: string | null; createdAt: string | null };

export function PasskeyManager({ passkeys }: { passkeys: PasskeyRow[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function add(form: FormData) {
    setError(null);
    startTransition(async () => {
      const { error } = await authClient.passkey.addPasskey({
        name: String(form.get("name") || "Security key"),
        authenticatorAttachment: "cross-platform",
      });
      if (error) return setError(error.message ?? "Could not register the key.");
      router.refresh();
    });
  }

  function remove(id: string) {
    setError(null);
    startTransition(async () => {
      const { error } = await authClient.passkey.deletePasskey({ id });
      if (error) return setError(error.message ?? "Could not remove the key.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {passkeys.length === 0 ? (
        <p className="text-muted-foreground">
          No security key registered yet. Add one so you can sign in without a password.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border">
          {passkeys.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="flex items-center gap-3">
                <KeyRoundIcon className="size-4 text-primary" aria-hidden />
                <div>
                  <p className="font-medium">{p.name ?? "Security key"}</p>
                  {p.createdAt && (
                    <p className="text-sm text-muted-foreground">
                      Added {new Date(p.createdAt).toLocaleDateString("en-GB")}
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Remove ${p.name ?? "security key"}`}
                onClick={() => remove(p.id)}
                disabled={pending}
              >
                <Trash2Icon className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <form action={add} className="flex flex-wrap items-end gap-3">
        <label className="space-y-1.5 text-sm font-medium">
          Key name
          <input
            name="name"
            placeholder="YubiKey 5C"
            className="block h-11 w-56 rounded-lg border border-input bg-background px-3 text-base"
          />
        </label>
        <Button type="submit" className="h-11 px-4 text-base" disabled={pending}>
          Register hardware key
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
