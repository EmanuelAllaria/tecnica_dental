import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { toApiTipoTrabajo } from "@/lib/mappers";

export async function GET() {
  const tipos = await db.getTiposTrabajo();

  const result = tipos.map((t) =>
    toApiTipoTrabajo({
      id: t.id,
      nombre: t.nombre,
      precio_odontologo: t.precio_odontologo,
      precio_cliente: t.precio_cliente,
      activo: t.activo,
      trabajos: t.trabajos as { count: number }[],
    })
  );

  const activos = result.filter((t) => t.activo);
  const promedioOdontologo =
    activos.length > 0
      ? activos.reduce((s, t) => s + t.precioOdontologo, 0) / activos.length
      : 0;
  const promedioCliente =
    activos.length > 0
      ? activos.reduce((s, t) => s + t.precioCliente, 0) / activos.length
      : 0;

  return NextResponse.json({
    tipos: result,
    promedioOdontologo,
    promedioCliente,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const tipo = await db.createTipoTrabajo({
    nombre: body.nombre,
    precioOdontologo: body.precioOdontologo,
    precioCliente: body.precioCliente,
    activo: body.activo ?? true,
  });
  return NextResponse.json(
    toApiTipoTrabajo({
      ...tipo,
      precio_odontologo: tipo.precio_odontologo,
      precio_cliente: tipo.precio_cliente,
    }),
    { status: 201 }
  );
}
