"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Briefcase,
  Receipt,
  Tags,
  Users,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/trabajos", label: "Trabajos", icon: Briefcase },
  { href: "/facturacion", label: "Facturación", icon: Receipt },
  { href: "/precios", label: "Lista de precios", icon: Tags },
  { href: "/odontologos", label: "Odontólogos", icon: Users },
  { href: "/reportes", label: "Reportes", icon: FileText },
  { href: "/estadisticas", label: "Estadísticas", icon: BarChart3 },
  { href: "/configuracion", label: "Configuración", icon: Settings },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ open = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-50 flex h-screen w-64 max-w-[85vw] flex-col border-r border-ivory/10 bg-charcoal-light/95 backdrop-blur-xl transition-transform duration-300 ease-in-out lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex h-14 items-center justify-between border-b border-ivory/10 px-4 lg:h-20 lg:px-6">
        <Link href="/dashboard" className="group min-w-0" onClick={onClose}>
          <h1 className="truncate font-display text-xl font-semibold tracking-wide lg:text-2xl">
            <span className="gold-gradient">Técnica</span>
            <span className="text-ivory"> Dental</span>
          </h1>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-ivory/40">
            Laboratorio
          </p>
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ivory/50 transition-colors hover:bg-ivory/10 hover:text-ivory lg:hidden"
          aria-label="Cerrar menú"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} onClick={onClose}>
              <motion.div
                whileHover={{ x: 4 }}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-200 lg:py-2.5",
                  isActive
                    ? "border border-gold/20 bg-gold/15 text-gold"
                    : "text-ivory/60 hover:bg-ivory/5 hover:text-ivory"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-ivory/10 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm text-ivory/50 transition-all hover:bg-rose-100 hover:text-rose-700 lg:py-2.5"
        >
          <LogOut className="h-4 w-4" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
