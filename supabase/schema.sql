-- Ejecutar en Supabase → SQL Editor (instalación nueva)

CREATE TYPE estado_trabajo AS ENUM (
  'PENDIENTE', 'EN_PROCESO', 'ENTREGADO', 'PAGADO', 'VENCIDO'
);

CREATE TYPE tipo_cliente AS ENUM ('ODONTOLOGO', 'CLIENTE_DIRECTO');

CREATE TABLE odontologos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  telefono TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tipo_trabajos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT UNIQUE NOT NULL,
  precio_odontologo DECIMAL(12,2) NOT NULL,
  precio_cliente DECIMAL(12,2) NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE trabajos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT UNIQUE NOT NULL,
  tipo_cliente tipo_cliente DEFAULT 'ODONTOLOGO' NOT NULL,
  odontologo_id UUID REFERENCES odontologos(id),
  paciente TEXT NOT NULL,
  tipo_trabajo_id UUID NOT NULL REFERENCES tipo_trabajos(id),
  precio DECIMAL(12,2) NOT NULL,
  estado estado_trabajo DEFAULT 'PENDIENTE',
  fecha_ingreso TIMESTAMPTZ DEFAULT NOW(),
  fecha_entrega TIMESTAMPTZ,
  notas TEXT,
  foto_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pagos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trabajo_id UUID NOT NULL REFERENCES trabajos(id) ON DELETE CASCADE,
  monto DECIMAL(12,2) NOT NULL,
  fecha TIMESTAMPTZ DEFAULT NOW(),
  metodo TEXT,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE resumen_ia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL,
  periodo TEXT NOT NULL,
  contenido TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE odontologos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipo_trabajos ENABLE ROW LEVEL SECURITY;
ALTER TABLE trabajos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumen_ia ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_all" ON odontologos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON tipo_trabajos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON trabajos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON pagos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON resumen_ia FOR ALL TO authenticated USING (true) WITH CHECK (true);
