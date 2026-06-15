import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calcularSaldo } from "@/lib/trabajos";

export async function GET() {
  const odontologos = await db.getOdontologos();

  const result = odontologos.map((o) => {
    const trabajos = (o.trabajos ?? []) as Array<{
      id: string;
      precio: number;
      pagos: { monto: number }[];
    }>;
    const deuda = trabajos.reduce((sum, t) => {
      const pagado = (t.pagos ?? []).reduce(
        (s, p) => s + parseFloat(String(p.monto)),
        0
      );
      const saldo = parseFloat(String(t.precio)) - pagado;
      return saldo > 0 ? sum + saldo : sum;
    }, 0);

    return {
      id: o.id,
      nombre: o.nombre,
      telefono: o.telefono,
      email: o.email,
      trabajosCount: trabajos.length,
      deuda,
    };
  });

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const odontologo = await db.createOdontologo({
    nombre: body.nombre,
    telefono: body.telefono || null,
    email: body.email || null,
  });
  return NextResponse.json(odontologo, { status: 201 });
}
