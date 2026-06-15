import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File;
  const trabajoId = formData.get("trabajoId") as string;

  if (!file || !trabajoId) {
    return NextResponse.json({ error: "Archivo y trabajoId requeridos" }, { status: 400 });
  }

  const ext = file.name.split(".").pop();
  const fileName = `${trabajoId}-${Date.now()}.${ext}`;

  try {
    const supabase = await createClient();
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("trabajos-fotos")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: urlData } = supabase.storage
      .from("trabajos-fotos")
      .getPublicUrl(fileName);

    await db.updateTrabajo(trabajoId, { fotoUrl: urlData.publicUrl });

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Error al subir la foto. Verificá el bucket 'trabajos-fotos' en Supabase Storage." },
      { status: 500 }
    );
  }
}
