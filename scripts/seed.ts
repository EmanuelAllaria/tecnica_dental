import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { createAdminClient } from "../src/lib/supabase/admin";

async function main() {
  console.log("🌱 Iniciando seed de Técnica Dental...\n");

  const adminEmail = process.env.ADMIN_EMAIL || "juli@tecnicadental.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "TecnicaDental2026!";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("❌ Configurá NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env");
    process.exit(1);
  }

  if (serviceKey) {
    const authAdmin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: existingUsers } = await authAdmin.auth.admin.listUsers();
    const userExists = existingUsers?.users?.some((u) => u.email === adminEmail);

    if (!userExists) {
      const { error } = await authAdmin.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
      });
      if (error) console.warn("⚠️  Usuario:", error.message);
      else console.log(`✅ Usuario creado: ${adminEmail}`);
    } else {
      console.log(`ℹ️  Usuario ya existe: ${adminEmail}`);
    }
  } else {
    console.log("⚠️  SUPABASE_SERVICE_ROLE_KEY no configurada — saltando creación de usuario");
  }

  const supabase = createAdminClient();

  await supabase.from("pagos").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("trabajos").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("tipo_trabajos").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("odontologos").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("resumen_ia").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  const tiposData = [
    { nombre: "Corona metal-porcelana", precio_odontologo: 45000, precio_cliente: 52000 },
    { nombre: "Corona de zirconio", precio_odontologo: 65000, precio_cliente: 75000 },
    { nombre: "Prótesis parcial removible", precio_odontologo: 85000, precio_cliente: 98000 },
    { nombre: "Prótesis completa", precio_odontologo: 120000, precio_cliente: 138000 },
    { nombre: "Carilla de porcelana", precio_odontologo: 55000, precio_cliente: 63000 },
    { nombre: "Inlay/Onlay", precio_odontologo: 40000, precio_cliente: 46000 },
    { nombre: "Puente fijo 3 piezas", precio_odontologo: 135000, precio_cliente: 155000 },
    { nombre: "Corona provisoria", precio_odontologo: 15000, precio_cliente: 18000 },
    { nombre: "Reparación de prótesis", precio_odontologo: 12000, precio_cliente: 14000 },
    { nombre: "Férula de descarga", precio_odontologo: 35000, precio_cliente: 40000 },
  ];

  const { data: tipos, error: tiposError } = await supabase
    .from("tipo_trabajos")
    .insert(tiposData)
    .select();
  if (tiposError) throw tiposError;

  const { data: odontologos, error: odontError } = await supabase
    .from("odontologos")
    .insert([
      { nombre: "Dr. Martín García", telefono: "221 555-1234", email: "garcia@email.com" },
      { nombre: "Dra. Laura Fernández", telefono: "221 555-5678", email: "fernandez@email.com" },
      { nombre: "Dr. Carlos López", telefono: "221 555-9012" },
    ])
    .select();
  if (odontError) throw odontError;

  const trabajosSeed = [
    { codigo: "TC-0001", tipo: "ODONTOLOGO", odontologo: 0, tipoTrabajo: 1, paciente: "María González", estado: "PAGADO", precio: 65000, pagos: [65000] },
    { codigo: "TC-0002", tipo: "ODONTOLOGO", odontologo: 0, tipoTrabajo: 0, paciente: "Juan Pérez", estado: "ENTREGADO", precio: 45000, pagos: [20000] },
    { codigo: "TC-0003", tipo: "ODONTOLOGO", odontologo: 1, tipoTrabajo: 2, paciente: "Ana Rodríguez", estado: "EN_PROCESO", precio: 85000, pagos: [] },
    { codigo: "TC-0004", tipo: "CLIENTE_DIRECTO", odontologo: null, tipoTrabajo: 4, paciente: "Pedro Sánchez", estado: "PAGADO", precio: 63000, pagos: [63000] },
    { codigo: "TC-0005", tipo: "ODONTOLOGO", odontologo: 2, tipoTrabajo: 6, paciente: "Lucía Martínez", estado: "VENCIDO", precio: 135000, pagos: [50000] },
    { codigo: "TC-0006", tipo: "CLIENTE_DIRECTO", odontologo: null, tipoTrabajo: 7, paciente: "Roberto Díaz", estado: "PENDIENTE", precio: 18000, pagos: [] },
    { codigo: "TC-0007", tipo: "ODONTOLOGO", odontologo: 2, tipoTrabajo: 1, paciente: "Carmen Ruiz", estado: "ENTREGADO", precio: 65000, pagos: [30000] },
    { codigo: "TC-0008", tipo: "CLIENTE_DIRECTO", odontologo: null, tipoTrabajo: 5, paciente: "Diego Torres", estado: "PAGADO", precio: 46000, pagos: [46000] },
  ];

  const now = new Date();
  for (let i = 0; i < trabajosSeed.length; i++) {
    const t = trabajosSeed[i];
    const daysAgo = 25 - i * 3;
    const fechaIngreso = new Date(now);
    fechaIngreso.setDate(fechaIngreso.getDate() - daysAgo);
    const fechaEntrega = new Date(fechaIngreso.getTime() + 7 * 24 * 60 * 60 * 1000);

    const { data: trabajo, error } = await supabase
      .from("trabajos")
      .insert({
        codigo: t.codigo,
        tipo_cliente: t.tipo,
        odontologo_id:
          t.tipo === "ODONTOLOGO" && t.odontologo != null
            ? odontologos![t.odontologo].id
            : null,
        tipo_trabajo_id: tipos![t.tipoTrabajo].id,
        paciente: t.paciente,
        precio: t.precio,
        estado: t.estado,
        fecha_ingreso: fechaIngreso.toISOString(),
        fecha_entrega: fechaEntrega.toISOString(),
        notas: i % 2 === 0 ? "Caso estándar" : null,
      })
      .select()
      .single();
    if (error) throw error;

    for (const monto of t.pagos) {
      await supabase.from("pagos").insert({
        trabajo_id: trabajo.id,
        monto,
        metodo: monto > 30000 ? "transferencia" : "efectivo",
      });
    }
  }

  console.log(`✅ ${tipos!.length} tipos de trabajo creados`);
  console.log(`✅ ${odontologos!.length} odontólogos creados`);
  console.log(`✅ ${trabajosSeed.length} trabajos de ejemplo creados`);
  console.log("\n🦷 Seed completado — Técnica Dental listo!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
