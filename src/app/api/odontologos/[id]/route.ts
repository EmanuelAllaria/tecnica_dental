import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calcularSaldo, calcularTotalPagado } from "@/lib/trabajos";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const odontologo = await db.getOdontologoById(id);

  if (!odontologo) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const trabajosRaw = (odontologo.trabajos ?? []) as Array<{
    id: string;
    codigo: string;
    paciente: string;
    precio: number;
    estado: string;
    fecha_ingreso: string;
    pagos: { monto: number }[];
    tipo_trabajo: { nombre: string };
  }>;

  const trabajos = trabajosRaw.map((t) => {
    const precio = parseFloat(String(t.precio));
    const pagos = t.pagos ?? [];
    return {
      ...t,
      precio,
      totalPagado: calcularTotalPagado(pagos),
      saldo: calcularSaldo(precio, pagos),
      fechaIngreso: t.fecha_ingreso,
      tipoTrabajo: t.tipo_trabajo,
    };
  });

  const deuda = trabajos.reduce((sum, t) => sum + (t.saldo > 0 ? t.saldo : 0), 0);

  return NextResponse.json({
    id: odontologo.id,
    nombre: odontologo.nombre,
    telefono: odontologo.telefono,
    email: odontologo.email,
    trabajos,
    deuda,
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const odontologo = await db.updateOdontologo(id, {
    nombre: body.nombre,
    telefono: body.telefono,
    email: body.email,
  });
  return NextResponse.json(odontologo);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await db.deleteOdontologo(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "No se puede eliminar: tiene trabajos asociados" },
      { status: 400 }
    );
  }
}
