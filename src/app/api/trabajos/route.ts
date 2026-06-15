import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  actualizarEstadosVencidos,
  calcularSaldo,
  calcularTotalPagado,
  generarCodigoTrabajo,
} from "@/lib/trabajos";
import { toApiTrabajo } from "@/lib/mappers";
import type { EstadoTrabajo } from "@/lib/types";

export async function GET(request: NextRequest) {
  await actualizarEstadosVencidos();

  const { searchParams } = new URL(request.url);

  const trabajos = await db.getTrabajos({
    estado: searchParams.get("estado") || undefined,
    odontologoId: searchParams.get("odontologoId") || undefined,
    tipoCliente: searchParams.get("tipoCliente") || undefined,
    busqueda: searchParams.get("busqueda") || undefined,
    desde: searchParams.get("desde") || undefined,
    hasta: searchParams.get("hasta") || undefined,
  });

  const result = trabajos.map((t) => ({
    ...toApiTrabajo(t),
    totalPagado: calcularTotalPagado(t.pagos ?? []),
    saldo: calcularSaldo(t.precio, t.pagos ?? []),
  }));

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const codigo = await generarCodigoTrabajo();

  const trabajo = await db.createTrabajo({
    codigo,
    tipoCliente: body.tipoCliente || "ODONTOLOGO",
    odontologoId: body.odontologoId || null,
    paciente: body.paciente,
    tipoTrabajoId: body.tipoTrabajoId,
    precio: body.precio,
    estado: (body.estado as EstadoTrabajo) || "PENDIENTE",
    fechaEntrega: body.fechaEntrega || null,
    notas: body.notas || null,
  });

  return NextResponse.json(toApiTrabajo(trabajo), { status: 201 });
}
