import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { ListaPreciosPDF } from "@/components/pdf/lista-precios";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const lista = body.lista as "odontologo" | "cliente";

  if (!lista || !["odontologo", "cliente"].includes(lista)) {
    return NextResponse.json({ error: "Lista inválida" }, { status: 400 });
  }

  const tipos = await db.getTiposTrabajo();
  const activos = tipos
    .filter((t) => t.activo)
    .map((t) => ({
      nombre: t.nombre,
      precio:
        lista === "odontologo"
          ? parseFloat(String(t.precio_odontologo))
          : parseFloat(String(t.precio_cliente)),
    }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  const buffer = await renderToBuffer(
    <ListaPreciosPDF
      items={activos}
      fechaGeneracion={formatDate(new Date())}
    />
  );

  const suffix = lista === "odontologo" ? "odontologos" : "clientes";

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="tecnica-dental-precios-${suffix}.pdf"`,
    },
  });
}
