import { createClient } from "@/lib/supabase/server";
import type { EstadoTrabajo, Pago, ResumenIA, Trabajo } from "@/lib/types";

const TRABAJO_SELECT = `
  *,
  odontologo:odontologos(*),
  tipo_trabajo:tipo_trabajos(*),
  pagos(*)
`;

function mapTrabajo(row: Record<string, unknown>): Trabajo {
  const t = row as unknown as Trabajo;
  if (t.precio) t.precio = parseFloat(String(t.precio));
  if (t.tipo_trabajo) {
    t.tipo_trabajo = {
      ...t.tipo_trabajo,
      precio_odontologo: parseFloat(String(t.tipo_trabajo.precio_odontologo)),
      precio_cliente: parseFloat(String(t.tipo_trabajo.precio_cliente)),
    };
  }
  if (t.pagos) {
    t.pagos = (t.pagos as Pago[]).map((p) => ({
      ...p,
      monto: parseFloat(String(p.monto)),
    }));
  }
  return t;
}

async function getClient() {
  return createClient();
}

export const db = {
  async getUltimoCodigo(): Promise<string | null> {
    const supabase = await getClient();
    const { data } = await supabase
      .from("trabajos")
      .select("codigo")
      .order("codigo", { ascending: false })
      .limit(1)
      .maybeSingle();
    return data?.codigo ?? null;
  },

  async getTrabajos(filters?: {
    estado?: string;
    odontologoId?: string;
    tipoCliente?: string;
    busqueda?: string;
    desde?: string;
    hasta?: string;
    fechaIngresoGte?: Date;
    fechaIngresoLte?: Date;
  }): Promise<Trabajo[]> {
    const supabase = await getClient();
    let query = supabase.from("trabajos").select(TRABAJO_SELECT);

    if (filters?.estado) query = query.eq("estado", filters.estado);
    if (filters?.odontologoId)
      query = query.eq("odontologo_id", filters.odontologoId);
    if (filters?.tipoCliente)
      query = query.eq("tipo_cliente", filters.tipoCliente);
    if (filters?.busqueda) {
      query = query.or(
        `codigo.ilike.%${filters.busqueda}%,paciente.ilike.%${filters.busqueda}%`
      );
    }
    if (filters?.desde) query = query.gte("fecha_ingreso", filters.desde);
    if (filters?.hasta) query = query.lte("fecha_ingreso", filters.hasta);
    if (filters?.fechaIngresoGte)
      query = query.gte("fecha_ingreso", filters.fechaIngresoGte.toISOString());
    if (filters?.fechaIngresoLte)
      query = query.lte("fecha_ingreso", filters.fechaIngresoLte.toISOString());

    const { data, error } = await query.order("fecha_ingreso", {
      ascending: false,
    });
    if (error) throw error;
    return (data ?? []).map(mapTrabajo);
  },

  async getTrabajoById(id: string): Promise<Trabajo | null> {
    const supabase = await getClient();
    const { data, error } = await supabase
      .from("trabajos")
      .select(TRABAJO_SELECT)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? mapTrabajo(data) : null;
  },

  async createTrabajo(data: {
    codigo: string;
    tipoCliente: "ODONTOLOGO" | "CLIENTE_DIRECTO";
    odontologoId?: string | null;
    paciente: string;
    tipoTrabajoId: string;
    precio: number;
    estado?: EstadoTrabajo;
    fechaEntrega?: string | null;
    notas?: string | null;
  }): Promise<Trabajo> {
    const supabase = await getClient();
    const { data: row, error } = await supabase
      .from("trabajos")
      .insert({
        codigo: data.codigo,
        tipo_cliente: data.tipoCliente,
        odontologo_id:
          data.tipoCliente === "ODONTOLOGO" ? data.odontologoId : null,
        paciente: data.paciente,
        tipo_trabajo_id: data.tipoTrabajoId,
        precio: data.precio,
        estado: data.estado ?? "PENDIENTE",
        fecha_entrega: data.fechaEntrega,
        notas: data.notas,
      })
      .select(TRABAJO_SELECT)
      .single();
    if (error) throw error;
    return mapTrabajo(row);
  },

  async updateTrabajo(
    id: string,
    data: Partial<{
      tipoCliente: "ODONTOLOGO" | "CLIENTE_DIRECTO";
      odontologoId: string | null;
      paciente: string;
      tipoTrabajoId: string;
      precio: number;
      estado: EstadoTrabajo;
      fechaEntrega: string | null;
      notas: string | null;
      fotoUrl: string | null;
    }>
  ): Promise<Trabajo> {
    const supabase = await getClient();
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.tipoCliente !== undefined) update.tipo_cliente = data.tipoCliente;
    if (data.odontologoId !== undefined) update.odontologo_id = data.odontologoId;
    if (data.paciente !== undefined) update.paciente = data.paciente;
    if (data.tipoTrabajoId !== undefined)
      update.tipo_trabajo_id = data.tipoTrabajoId;
    if (data.precio !== undefined) update.precio = data.precio;
    if (data.estado !== undefined) update.estado = data.estado;
    if (data.fechaEntrega !== undefined) update.fecha_entrega = data.fechaEntrega;
    if (data.notas !== undefined) update.notas = data.notas;
    if (data.fotoUrl !== undefined) update.foto_url = data.fotoUrl;

    const { data: row, error } = await supabase
      .from("trabajos")
      .update(update)
      .eq("id", id)
      .select(TRABAJO_SELECT)
      .single();
    if (error) throw error;
    return mapTrabajo(row);
  },

  async deleteTrabajo(id: string) {
    const supabase = await getClient();
    const { error } = await supabase.from("trabajos").delete().eq("id", id);
    if (error) throw error;
  },

  async createPago(data: {
    trabajoId: string;
    monto: number;
    metodo?: string | null;
    notas?: string | null;
    fecha?: string;
  }): Promise<Pago> {
    const supabase = await getClient();
    const { data: row, error } = await supabase
      .from("pagos")
      .insert({
        trabajo_id: data.trabajoId,
        monto: data.monto,
        metodo: data.metodo,
        notas: data.notas,
        fecha: data.fecha ?? new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return { ...row, monto: parseFloat(String(row.monto)) };
  },

  async getOdontologos() {
    const supabase = await getClient();
    const { data, error } = await supabase
      .from("odontologos")
      .select("*, trabajos(id, precio, pagos(monto))")
      .order("nombre");
    if (error) throw error;
    return data ?? [];
  },

  async getOdontologoById(id: string) {
    const supabase = await getClient();
    const { data, error } = await supabase
      .from("odontologos")
      .select(`*, trabajos(*, pagos(*), tipo_trabajo:tipo_trabajos(*))`)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async createOdontologo(data: {
    nombre: string;
    telefono?: string | null;
    email?: string | null;
  }) {
    const supabase = await getClient();
    const { data: row, error } = await supabase
      .from("odontologos")
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return row;
  },

  async updateOdontologo(
    id: string,
    data: { nombre: string; telefono?: string | null; email?: string | null }
  ) {
    const supabase = await getClient();
    const { data: row, error } = await supabase
      .from("odontologos")
      .update(data)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return row;
  },

  async deleteOdontologo(id: string) {
    const supabase = await getClient();
    const { count } = await supabase
      .from("trabajos")
      .select("id", { count: "exact", head: true })
      .eq("odontologo_id", id);
    if (count && count > 0) throw new Error("HAS_TRABAJOS");
    const { error } = await supabase.from("odontologos").delete().eq("id", id);
    if (error) throw error;
  },

  async countTrabajosByOdontologo(odontologoId: string) {
    const supabase = await getClient();
    const { count } = await supabase
      .from("trabajos")
      .select("id", { count: "exact", head: true })
      .eq("odontologo_id", odontologoId);
    return count ?? 0;
  },

  async getTiposTrabajo() {
    const supabase = await getClient();
    const { data, error } = await supabase
      .from("tipo_trabajos")
      .select("*, trabajos(count)")
      .order("nombre");
    if (error) throw error;
    return data ?? [];
  },

  async createTipoTrabajo(data: {
    nombre: string;
    precioOdontologo: number;
    precioCliente: number;
    activo?: boolean;
  }) {
    const supabase = await getClient();
    const { data: row, error } = await supabase
      .from("tipo_trabajos")
      .insert({
        nombre: data.nombre,
        precio_odontologo: data.precioOdontologo,
        precio_cliente: data.precioCliente,
        activo: data.activo ?? true,
      })
      .select()
      .single();
    if (error) throw error;
    return row;
  },

  async updateTipoTrabajo(
    id: string,
    data: {
      nombre: string;
      precioOdontologo: number;
      precioCliente: number;
      activo: boolean;
    }
  ) {
    const supabase = await getClient();
    const { data: row, error } = await supabase
      .from("tipo_trabajos")
      .update({
        nombre: data.nombre,
        precio_odontologo: data.precioOdontologo,
        precio_cliente: data.precioCliente,
        activo: data.activo,
      })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return row;
  },

  async countTrabajosByTipo(tipoId: string) {
    const supabase = await getClient();
    const { count } = await supabase
      .from("trabajos")
      .select("id", { count: "exact", head: true })
      .eq("tipo_trabajo_id", tipoId);
    return count ?? 0;
  },

  async deleteTipoTrabajo(id: string) {
    const supabase = await getClient();
    const { error } = await supabase.from("tipo_trabajos").delete().eq("id", id);
    if (error) throw error;
  },

  async createResumenIA(data: {
    tipo: string;
    periodo: string;
    contenido: string;
  }): Promise<ResumenIA> {
    const supabase = await getClient();
    const { data: row, error } = await supabase
      .from("resumen_ia")
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return row;
  },

  async getUltimoResumen(tipo: string, periodo: string) {
    const supabase = await getClient();
    const { data } = await supabase
      .from("resumen_ia")
      .select()
      .eq("tipo", tipo)
      .eq("periodo", periodo)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return data;
  },

  async getHistorialResumenes(limit = 10) {
    const supabase = await getClient();
    const { data } = await supabase
      .from("resumen_ia")
      .select()
      .order("created_at", { ascending: false })
      .limit(limit);
    return data ?? [];
  },

  async clearAllData() {
    const supabase = await getClient();
    await supabase.from("pagos").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("trabajos").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("tipo_trabajos").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("odontologos").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("resumen_ia").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  },
};
