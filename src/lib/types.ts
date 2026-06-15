export type EstadoTrabajo =
  | "PENDIENTE"
  | "EN_PROCESO"
  | "ENTREGADO"
  | "PAGADO"
  | "VENCIDO";

export type TipoCliente = "ODONTOLOGO" | "CLIENTE_DIRECTO";

export interface Odontologo {
  id: string;
  nombre: string;
  telefono: string | null;
  email: string | null;
  created_at: string;
}

export interface TipoTrabajo {
  id: string;
  nombre: string;
  precio_odontologo: number;
  precio_cliente: number;
  activo: boolean;
  created_at: string;
}

export interface Pago {
  id: string;
  trabajo_id: string;
  monto: number;
  fecha: string;
  metodo: string | null;
  notas: string | null;
  created_at: string;
}

export interface Trabajo {
  id: string;
  codigo: string;
  tipo_cliente: TipoCliente;
  odontologo_id: string | null;
  paciente: string;
  tipo_trabajo_id: string;
  precio: number;
  estado: EstadoTrabajo;
  fecha_ingreso: string;
  fecha_entrega: string | null;
  notas: string | null;
  foto_url: string | null;
  created_at: string;
  updated_at: string;
  odontologo?: Odontologo | null;
  tipo_trabajo?: TipoTrabajo;
  pagos?: Pago[];
}

export interface ResumenIA {
  id: string;
  tipo: string;
  periodo: string;
  contenido: string;
  created_at: string;
}
