"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";

interface HeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function Header({ title, subtitle, children }: HeaderProps) {
  const today = format(new Date(), "EEEE d 'de' MMMM", { locale: es });

  return (
    <header className="mb-8 flex items-start justify-between">
      <div>
        <p className="text-sm text-ivory/40 capitalize mb-1">{today}</p>
        <h1 className="font-display text-3xl font-semibold text-ivory tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-ivory/50 mt-1 text-sm">{subtitle}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </header>
  );
}
