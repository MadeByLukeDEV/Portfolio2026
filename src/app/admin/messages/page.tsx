import { MailCheckIcon, MailIcon, Trash2Icon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { deleteMessage, setMessageRead } from "../actions";

export const metadata = { title: "Messages" };

export default async function MessagesPage() {
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-8">
      <h1 className="font-heading text-3xl font-bold tracking-tight">Messages</h1>

      {messages.length === 0 ? (
        <p className="text-muted-foreground">
          No messages yet. They show up here when someone uses the contact form.
        </p>
      ) : (
        <ul className="space-y-4">
          {messages.map((m) => (
            <li
              key={m.id}
              className={`rounded-xl border p-5 ${m.read ? "border-border" : "border-primary/50 bg-primary/5"}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">
                    {m.name}{" "}
                    <a href={`mailto:${m.email}`} className="font-normal text-primary hover:underline">
                      {m.email}
                    </a>
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <time dateTime={m.createdAt.toISOString()}>
                      {m.createdAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                    </time>
                    <Badge variant="outline">{m.locale.toUpperCase()}</Badge>
                    {!m.read && <Badge>New</Badge>}
                  </p>
                </div>
                <div className="flex gap-1">
                  <form action={setMessageRead}>
                    <input type="hidden" name="id" value={m.id} />
                    <input type="hidden" name="read" value={String(!m.read)} />
                    <Button type="submit"
                      variant="ghost"
                      size="icon"
                      aria-label={m.read ? "Mark as unread" : "Mark as read"}
                    >
                      {m.read ? <MailIcon className="size-4" /> : <MailCheckIcon className="size-4" />}
                    </Button>
                  </form>
                  <form action={deleteMessage}>
                    <input type="hidden" name="id" value={m.id} />
                    <Button type="submit" variant="ghost" size="icon" aria-label="Delete message">
                      <Trash2Icon className="size-4" />
                    </Button>
                  </form>
                </div>
              </div>
              <p className="mt-4 max-w-prose whitespace-pre-wrap leading-relaxed">{m.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
