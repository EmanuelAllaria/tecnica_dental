import type { Pago, Trabajo } from "@/lib/types";

export function toApiTrabajo(t: Trabajo) {
  return {
    id: t.id,
    codigo: t.codigo,
    tipoCliente: t.tipo_cliente,
    odontologoId: t.odontologo_id,
    paciente: t.paciente,
    tipoTrabajoId: t.tipo_trabajo_id,
    precio: t.precio,
    estado: t.estado,
    fechaIngreso: t.fecha_ingreso,
    fechaEntrega: t.fecha_entrega,
    notas: t.notas,
    fotoUrl: t.foto_url,
    odontologo: t.odontologo ?? null,
    tipoTrabajo: t.tipo_trabajo
      ? {
          ...t.tipo_trabajo,
          precioOdontologo: t.tipo_trabajo.precio_odontologo,
          precioCliente: t.tipo_trabajo.precio_cliente,
        }
      : undefined,
    pagos: (t.pagos ?? []).map(toApiPago),
    clienteLabel:
      t.tipo_cliente === "CLIENTE_DIRECTO"
        ? t.paciente
        : t.odontologo?.nombre ?? "—",
  };
}

export function toApiPago(p: Pago) {
  return {
    id: p.id,
    trabajoId: p.trabajo_id,
    monto: p.monto,
    fecha: p.fecha,
    metodo: p.metodo,
    notas: p.notas,
  };
}

export function toApiTipoTrabajo(t: {
  id: string;
  nombre: string;
  precio_odontologo: number | string;
  precio_cliente: number | string;
  activo: boolean;
  trabajos?: { count: number }[];
}) {
  return {
    id: t.id,
    nombre: t.nombre,
    precioOdontologo: parseFloat(String(t.precio_odontologo)),
    precioCliente: parseFloat(String(t.precio_cliente)),
    activo: t.activo,
    trabajosCount: t.trabajos?.[0]?.count ?? 0,
  };
}
