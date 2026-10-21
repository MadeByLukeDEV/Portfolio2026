"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { sendMessage, type ContactState } from "@/app/contact-actions";

const initial: ContactState = { status: "idle" };

export function ContactForm() {
  const t = useTranslations("Contact.form");
  const [state, action, pending] = useActionState(sendMessage, initial);

  if (state.status === "success") {
    return (
      <p role="status" className="rounded-xl border border-border bg-card p-6 text-lg">
        {t("success")}
      </p>
    );
  }

  const error =
    state.status === "invalid"
      ? t("invalid")
      : state.status === "rate-limited"
        ? t("rateLimited")
        : state.status === "error"
          ? t("error")
          : null;

  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="cf-name">{t("name")}</Label>
          <Input id="cf-name" name="name" autoComplete="name" required maxLength={120} className="h-11" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cf-email">{t("email")}</Label>
          <Input
            id="cf-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={190}
            className="h-11"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="cf-message">{t("message")}</Label>
        <Textarea id="cf-message" name="message" required minLength={10} maxLength={4000} rows={6} />
      </div>
      {/* Honeypot, hidden from people and assistive tech. */}
      <div aria-hidden className="absolute -left-[9999px]">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={pending} className="h-12 rounded-full px-7 text-base">
          {pending ? t("sending") : t("send")}
        </Button>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
    </form>
  );
}
