import { Link } from "@tanstack/react-router";
import { UtensilsCrossed } from "lucide-react";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="BiteRush home">
      <span className="gradient-brand flex size-9 items-center justify-center rounded-xl text-primary-foreground shadow-[var(--shadow-card)]">
        <UtensilsCrossed className="size-5" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-lg font-extrabold tracking-tight">BiteRush</span>
        {!compact && (
          <span className="text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
            Good food. Fast.
          </span>
        )}
      </span>
    </Link>
  );
}