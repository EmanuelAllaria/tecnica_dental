import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  actualizarEstadosVencidos,
  calcularSaldo,
  calcularTotalPagado,
  getMonthRange,
} from "@/lib/trabajos";
import { formatCurrency } from "@/lib/utils";

export async function GET(request: NextRequest) {
  await actualizarEstadosVencidos();

  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));
  const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));

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

  let totalFacturado = 0;
  let totalCobrado = 0;
  let totalPendiente = 0;
  let totalVencido = 0;

  const trabajosData = trabajos.map((t) => {
    const precio = t.precio;
    const pagado = calcularTotalPagado(t.pagos ?? []);
    const saldo = calcularSaldo(precio, t.pagos ?? []);

    totalFacturado += precio;
    totalCobrado += pagado;
    if (saldo > 0) {
      if (t.estado === "VENCIDO") totalVencido += saldo;
      else totalPendiente += saldo;
    }

    return {
      id: t.id,
      codigo: t.codigo,
      tipoCliente: t.tipo_cliente,
      odontologo:
        t.tipo_cliente === "CLIENTE_DIRECTO"
          ? t.paciente
          : t.odontologo?.nombre ?? "",
      paciente: t.paciente,
      tipoTrabajo: t.tipo_trabajo?.nombre ?? "",
      precio,
      pagado,
      saldo,
      estado: t.estado,
      fechaIngreso: t.fecha_ingreso,
    };
  });

  const prevFacturado = trabajosPrev.reduce((s, t) => s + t.precio, 0);
  const variacion =
    prevFacturado > 0
      ? ((totalFacturado - prevFacturado) / prevFacturado) * 100
      : 0;

  return NextResponse.json({
    year,
    month,
    resumen: {
      totalFacturado,
      totalCobrado,
      totalPendiente,
      totalVencido,
      cantidadTrabajos: trabajos.length,
      variacion: Math.round(variacion * 10) / 10,
      prevFacturado,
    },
    trabajos: trabajosData,
    formatted: {
      totalFacturado: formatCurrency(totalFacturado),
      totalCobrado: formatCurrency(totalCobrado),
      totalPendiente: formatCurrency(totalPendiente),
      totalVencido: formatCurrency(totalVencido),
    },
  });
}
