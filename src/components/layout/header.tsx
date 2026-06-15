"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
}

export function Header({ title, subtitle, children, className }: HeaderProps) {
  const today = format(new Date(), "EEEE d 'de' MMMM", { locale: es });

  return (
    <header
      className={cn(
        "mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between",
        className
      )}
    >
      <div className="min-w-0">
        <p className="mb-1 text-xs text-ivory/40 capitalize sm:text-sm">{today}</p>
        <h1 className="truncate font-display text-2xl font-semibold tracking-tight text-ivory sm:text-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-ivory/50">{subtitle}</p>
        )}
      </div>
      {children && (
        <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end sm:gap-3">
          {children}
        </div>
      )}
    </header>
  );
}
