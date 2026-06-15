import { db } from "@/lib/db";
import type { EstadoTrabajo } from "@/lib/types";

export function calcularSaldo(
  precio: number,
  pagos: { monto: number | { toString(): string } }[]
) {
  const totalPagado = pagos.reduce(
    (sum, p) => sum + parseFloat(String(p.monto)),
    0
  );
  return precio - totalPagado;
}

export function calcularTotalPagado(
  pagos: { monto: number | { toString(): string } }[]
) {
  return pagos.reduce((sum, p) => sum + parseFloat(String(p.monto)), 0);
}

export async function generarCodigoTrabajo(): Promise<string> {
  const ultimo = await db.getUltimoCodigo();
  let siguiente = 1;
  if (ultimo) {
    const match = ultimo.match(/TC-(\d+)/);
    if (match) siguiente = parseInt(match[1], 10) + 1;
  }
  return `TC-${String(siguiente).padStart(4, "0")}`;
}

export async function actualizarEstadosVencidos() {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const trabajos = await db.getTrabajos();
  const estadosActivos: EstadoTrabajo[] = [
    "PENDIENTE",
    "EN_PROCESO",
    "ENTREGADO",
  ];

  for (const trabajo of trabajos) {
    if (!estadosActivos.includes(trabajo.estado)) continue;
    if (!trabajo.fecha_entrega) continue;
    if (new Date(trabajo.fecha_entrega) >= hoy) continue;

    const saldo = calcularSaldo(trabajo.precio, trabajo.pagos ?? []);
    if (saldo > 0) {
      await db.updateTrabajo(trabajo.id, { estado: "VENCIDO" });
    }
  }
}

export async function sincronizarEstadoPago(trabajoId: string) {
  const trabajo = await db.getTrabajoById(trabajoId);
  if (!trabajo) return;

  const saldo = calcularSaldo(trabajo.precio, trabajo.pagos ?? []);

  if (saldo <= 0 && trabajo.estado !== "PAGADO") {
    await db.updateTrabajo(trabajoId, { estado: "PAGADO" });
  } else if (saldo > 0 && trabajo.estado === "PAGADO") {
    await db.updateTrabajo(trabajoId, { estado: "ENTREGADO" });
  }
}

export function getMonthRange(year: number, month: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
}

export function getPeriodoLabel(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}
