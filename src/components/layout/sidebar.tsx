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

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-ivory/10 bg-charcoal-light/80 backdrop-blur-xl">
      <div className="flex h-20 items-center px-6 border-b border-ivory/10">
        <Link href="/dashboard" className="group">
          <h1 className="font-display text-2xl font-semibold tracking-wide">
            <span className="gold-gradient">Técnica</span>
            <span className="text-ivory"> Dental</span>
          </h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-ivory/40 mt-0.5">
            Laboratorio
          </p>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-all duration-200",
                  isActive
                    ? "bg-gold/15 text-gold border border-gold/20"
                    : "text-ivory/60 hover:text-ivory hover:bg-ivory/5"
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
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-ivory/50 hover:text-rose-300 hover:bg-rose-500/10 transition-all cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
