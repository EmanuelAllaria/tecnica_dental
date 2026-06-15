import { db } from "@/lib/db";
import {
  actualizarEstadosVencidos,
  calcularSaldo,
  calcularTotalPagado,
  getMonthRange,
} from "@/lib/trabajos";
import { formatCurrency } from "@/lib/utils";
import { obtenerUltimoResumen } from "@/lib/ai";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  await actualizarEstadosVencidos();

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const { start, end } = getMonthRange(year, month);

  const trabajosMes = await db.getTrabajos({
    fechaIngresoGte: start,
    fechaIngresoLte: end,
  });

  const todosTrabajos = await db.getTrabajos();

  const activos = todosTrabajos.filter(
    (t) => !["PAGADO"].includes(t.estado)
  ).length;

  const ingresosMes = trabajosMes.reduce(
    (sum, t) => sum + calcularTotalPagado(t.pagos ?? []),
    0
  );

  const pendienteCobro = todosTrabajos.reduce((sum, t) => {
    const saldo = calcularSaldo(t.precio, t.pagos ?? []);
    return saldo > 0 ? sum + saldo : sum;
  }, 0);

  const vencidos = todosTrabajos.filter((t) => t.estado === "VENCIDO").length;

  const ingresos6Meses = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(year, month - 1 - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const range = getMonthRange(y, m);
    const trabajos = await db.getTrabajos({
      fechaIngresoGte: range.start,
      fechaIngresoLte: range.end,
    });
    const total = trabajos.reduce(
      (sum, t) => sum + calcularTotalPagado(t.pagos ?? []),
      0
    );
    ingresos6Meses.push({
      mes: d.toLocaleDateString("es-AR", { month: "short" }),
      ingresos: total,
    });
  }

  const estadosCount: Record<string, number> = {};
  todosTrabajos.forEach((t) => {
    estadosCount[t.estado] = (estadosCount[t.estado] || 0) + 1;
  });
  const estadosData = Object.entries(estadosCount).map(([estado, count]) => ({
    estado,
    count,
  }));

  const odontologoFacturacion: Record<string, { nombre: string; total: number }> = {};
  for (const t of trabajosMes) {
    if (t.tipo_cliente !== "ODONTOLOGO" || !t.odontologo_id) continue;
    const oid = t.odontologo_id;
    if (!odontologoFacturacion[oid]) {
      odontologoFacturacion[oid] = {
        nombre: t.odontologo?.nombre ?? "",
        total: 0,
      };
    }
    odontologoFacturacion[oid].total += t.precio;
  }
  const topOdontologos = Object.values(odontologoFacturacion)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const periodo = `${year}-${String(month).padStart(2, "0")}`;
  const resumenIA = await obtenerUltimoResumen("dashboard", periodo);

  return (
    <DashboardClient
      metrics={{
        activos,
        ingresosMes: formatCurrency(ingresosMes),
        ingresosMesNum: ingresosMes,
        pendienteCobro: formatCurrency(pendienteCobro),
        pendienteCobroNum: pendienteCobro,
        vencidos,
        trabajosMes: trabajosMes.length,
      }}
      ingresos6Meses={ingresos6Meses}
      estadosData={estadosData}
      topOdontologos={topOdontologos}
      resumenIA={resumenIA?.contenido || null}
      periodo={periodo}
    />
  );
}
