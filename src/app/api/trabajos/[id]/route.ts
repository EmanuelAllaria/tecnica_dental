import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calcularSaldo, calcularTotalPagado } from "@/lib/trabajos";
import { toApiTrabajo } from "@/lib/mappers";
import type { EstadoTrabajo } from "@/lib/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const trabajo = await db.getTrabajoById(id);

  if (!trabajo) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    ...toApiTrabajo(trabajo),
    totalPagado: calcularTotalPagado(trabajo.pagos ?? []),
    saldo: calcularSaldo(trabajo.precio, trabajo.pagos ?? []),
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const trabajo = await db.updateTrabajo(id, {
    tipoCliente: body.tipoCliente,
    odontologoId:
      body.tipoCliente === "CLIENTE_DIRECTO" ? null : body.odontologoId,
    paciente: body.paciente,
    tipoTrabajoId: body.tipoTrabajoId,
    precio: body.precio,
    estado: body.estado as EstadoTrabajo,
    fechaEntrega: body.fechaEntrega ? body.fechaEntrega : null,
    notas: body.notas,
    fotoUrl: body.fotoUrl,
  });

  return NextResponse.json(toApiTrabajo(trabajo));
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.deleteTrabajo(id);
  return NextResponse.json({ ok: true });
}
