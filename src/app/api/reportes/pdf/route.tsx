import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { db } from "@/lib/db";
import {
  calcularSaldo,
  calcularTotalPagado,
  getMonthRange,
} from "@/lib/trabajos";
import { formatDate } from "@/lib/utils";
import { ReporteFacturacionPDF } from "@/components/pdf/reporte-facturacion";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const year = body.year || new Date().getFullYear();
  const month = body.month || new Date().getMonth() + 1;

  const { start, end } = getMonthRange(year, month);
  const trabajos = await db.getTrabajos({
    fechaIngresoGte: start,
    fechaIngresoLte: end,
  });

  const trabajosData = trabajos
    .sort((a, b) => a.codigo.localeCompare(b.codigo))
    .map((t) => {
      const precio = t.precio;
      const pagado = calcularTotalPagado(t.pagos ?? []);
      return {
        codigo: t.codigo,
        odontologo:
          t.tipo_cliente === "CLIENTE_DIRECTO"
            ? t.paciente
            : t.odontologo?.nombre ?? "",
        paciente: t.paciente,
        tipoTrabajo: t.tipo_trabajo?.nombre ?? "",
        precio,
        pagado,
        saldo: calcularSaldo(precio, t.pagos ?? []),
        estado: t.estado,
      };
    });

  const resumen = {
    totalFacturado: trabajosData.reduce((s, t) => s + t.precio, 0),
    totalCobrado: trabajosData.reduce((s, t) => s + t.pagado, 0),
    totalPendiente: trabajosData.reduce(
      (s, t) => s + (t.saldo > 0 ? t.saldo : 0),
      0
    ),
  };

  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];
  const periodo = `${meses[month - 1]} ${year}`;

  const buffer = await renderToBuffer(
    <ReporteFacturacionPDF
      trabajos={trabajosData}
      resumen={resumen}
      periodo={periodo}
      fechaGeneracion={formatDate(new Date())}
    />
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="tecnica-dental-${year}-${String(month).padStart(2, "0")}.pdf"`,
    },
  });
}
