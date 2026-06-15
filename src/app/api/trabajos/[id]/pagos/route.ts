import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sincronizarEstadoPago } from "@/lib/trabajos";
import { toApiPago } from "@/lib/mappers";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const pago = await db.createPago({
    trabajoId: id,
    monto: body.monto,
    metodo: body.metodo || null,
    notas: body.notas || null,
    fecha: body.fecha,
  });

  await sincronizarEstadoPago(id);

  return NextResponse.json(toApiPago(pago), { status: 201 });
}
