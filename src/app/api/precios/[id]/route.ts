import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { toApiTipoTrabajo } from "@/lib/mappers";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const tipo = await db.updateTipoTrabajo(id, {
    nombre: body.nombre,
    precioOdontologo: body.precioOdontologo,
    precioCliente: body.precioCliente,
    activo: body.activo,
  });
  return NextResponse.json(
    toApiTipoTrabajo({
      ...tipo,
      precio_odontologo: tipo.precio_odontologo,
      precio_cliente: tipo.precio_cliente,
    })
  );
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const count = await db.countTrabajosByTipo(id);
  if (count > 0) {
    const tipos = await db.getTiposTrabajo();
    const tipo = tipos.find((t) => t.id === id)!;
    await db.updateTipoTrabajo(id, {
      nombre: tipo.nombre,
      precioOdontologo: parseFloat(String(tipo.precio_odontologo)),
      precioCliente: parseFloat(String(tipo.precio_cliente)),
      activo: false,
    });
    return NextResponse.json({ deactivated: true });
  }
  await db.deleteTipoTrabajo(id);
  return NextResponse.json({ ok: true });
}
