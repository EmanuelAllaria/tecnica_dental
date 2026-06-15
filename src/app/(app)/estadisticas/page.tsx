import { db } from "@/lib/db";
import { calcularTotalPagado, getMonthRange } from "@/lib/trabajos";
import { obtenerHistorialResumenes } from "@/lib/ai";
import { EstadisticasClient } from "./estadisticas-client";

export default async function EstadisticasPage() {
  const now = new Date();
  const year = now.getFullYear();

  const ingresosMensuales = [];
  for (let m = 1; m <= 12; m++) {
    const range = getMonthRange(year, m);
    const trabajos = await db.getTrabajos({
      fechaIngresoGte: range.start,
      fechaIngresoLte: range.end,
    });
    const ingresos = trabajos.reduce(
      (s, t) => s + calcularTotalPagado(t.pagos ?? []),
      0
    );
    const facturado = trabajos.reduce((s, t) => s + t.precio, 0);
    ingresosMensuales.push({
      mes: new Date(year, m - 1).toLocaleDateString("es-AR", { month: "short" }),
      ingresos,
      facturado,
      trabajos: trabajos.length,
    });
  }

  const tipos = await db.getTiposTrabajo();
  const distribucionTipos = tipos
    .map((t) => ({
      nombre: t.nombre,
      cantidad: (t.trabajos as { count: number }[])?.[0]?.count ?? 0,
      precio: parseFloat(String(t.precio)),
    }))
    .filter((t) => t.cantidad > 0);

  const odontologos = await db.getOdontologos();
  const topOdontologos = odontologos
    .map((o) => {
      const trabajos = (o.trabajos ?? []) as { precio: number }[];
      return {
        nombre: o.nombre,
        total: trabajos.reduce(
          (s, t) => s + parseFloat(String(t.precio)),
          0
        ),
        trabajos: trabajos.length,
      };
    })
    .filter((o) => o.trabajos > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  const historialIA = await obtenerHistorialResumenes(10);
  const periodo = `${year}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  return (
    <EstadisticasClient
      ingresosMensuales={ingresosMensuales}
      distribucionTipos={distribucionTipos}
      topOdontologos={topOdontologos}
      historialIA={historialIA.map((r) => ({
        id: r.id,
        tipo: r.tipo,
        periodo: r.periodo,
        contenido: r.contenido,
        createdAt: r.created_at,
      }))}
      periodo={periodo}
      year={year}
    />
  );
}
