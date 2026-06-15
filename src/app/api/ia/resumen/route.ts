import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generarResumenIA } from "@/lib/ai";
import {
  calcularSaldo,
  calcularTotalPagado,
  getMonthRange,
} from "@/lib/trabajos";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { tipo, periodo } = body;

  const [year, month] = periodo.split("-").map(Number);
  const { start, end } = getMonthRange(year, month);
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const prevRange = getMonthRange(prevYear, prevMonth);

  const trabajos = await db.getTrabajos({
    fechaIngresoGte: start,
    fechaIngresoLte: end,
  });

  const trabajosPrev = await db.getTrabajos({
    fechaIngresoGte: prevRange.start,
    fechaIngresoLte: prevRange.end,
  });

  const totalFacturado = trabajos.reduce((s, t) => s + t.precio, 0);
  const totalCobrado = trabajos.reduce(
    (s, t) => s + calcularTotalPagado(t.pagos ?? []),
    0
  );
  const prevFacturado = trabajosPrev.reduce((s, t) => s + t.precio, 0);

  const odontologoTotals: Record<string, number> = {};
  const tipoTotals: Record<string, number> = {};
  let vencidos = 0;
  let pendiente = 0;

  trabajos.forEach((t) => {
    const nombreOdonto = t.odontologo?.nombre ?? "Desconocido";
    const nombreTipo = t.tipo_trabajo?.nombre ?? "Desconocido";
    odontologoTotals[nombreOdonto] =
      (odontologoTotals[nombreOdonto] || 0) + t.precio;
    tipoTotals[nombreTipo] = (tipoTotals[nombreTipo] || 0) + t.precio;
    const saldo = calcularSaldo(t.precio, t.pagos ?? []);
    if (saldo > 0) {
      if (t.estado === "VENCIDO") vencidos += saldo;
      else pendiente += saldo;
    }
  });

  const topOdontologos = Object.entries(odontologoTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([nombre, total]) => ({ nombre, total }));

  const topTipos = Object.entries(tipoTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([nombre, total]) => ({ nombre, total }));

  const datos: Record<string, unknown> = {
    periodo,
    totalFacturado,
    totalCobrado,
    pendiente,
    vencidos,
    cantidadTrabajos: trabajos.length,
    variacionMesAnterior:
      prevFacturado > 0
        ? Math.round(((totalFacturado - prevFacturado) / prevFacturado) * 1000) / 10
        : 0,
    prevFacturado,
    topOdontologos,
    topTipos,
    estados: trabajos.reduce(
      (acc, t) => {
        acc[t.estado] = (acc[t.estado] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),
  };

  if (tipo === "estadisticas") {
    const allTrabajos = await db.getTrabajos();
    const ingresosAnual: Record<string, number> = {};
    allTrabajos.forEach((t) => {
      const y = new Date(t.fecha_ingreso).getFullYear().toString();
      ingresosAnual[y] =
        (ingresosAnual[y] || 0) + calcularTotalPagado(t.pagos ?? []);
    });
    datos.ingresosAnual = ingresosAnual;
    datos.totalTrabajosHistorico = allTrabajos.length;
  }

  const result = await generarResumenIA(
    tipo as "facturacion" | "dashboard" | "estadisticas",
    periodo,
    datos
  );

  return NextResponse.json(result);
}
