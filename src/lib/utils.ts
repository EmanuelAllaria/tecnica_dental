import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string) {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function formatDate(date: Date | string) {
  return format(new Date(date), "dd/MM/yyyy", { locale: es });
}

export function formatMonthYear(date: Date) {
  return format(date, "MMMM yyyy", { locale: es });
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const TIPO_CLIENTE_LABELS: Record<string, string> = {
  ODONTOLOGO: "Odontólogo",
  CLIENTE_DIRECTO: "Cliente directo",
};

export const ESTADO_LABELS: Record<string, string> = {
  PENDIENTE: "Pendiente",
  EN_PROCESO: "En proceso",
  ENTREGADO: "Entregado",
  PAGADO: "Pagado",
  VENCIDO: "Vencido",
};

export const ESTADO_COLORS: Record<string, string> = {
  PENDIENTE: "bg-amber-100 text-amber-800 border-amber-200",
  EN_PROCESO: "bg-blue-100 text-blue-800 border-blue-200",
  ENTREGADO: "bg-teal-100 text-teal-800 border-teal-200",
  PAGADO: "bg-emerald-100 text-emerald-800 border-emerald-200",
  VENCIDO: "bg-rose-100 text-rose-800 border-rose-200",
};
