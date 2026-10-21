"use client";

import { Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ConfirmButton({ message, label }: { message: string; label: string }) {
  return (
    <Button type="submit"
      variant="ghost"
      size="icon"
      aria-label={label}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      <Trash2Icon className="size-4" />
    </Button>
  );
}
