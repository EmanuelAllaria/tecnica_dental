-- Migración para bases existentes (ejecutar en Supabase → SQL Editor)

CREATE TYPE tipo_cliente AS ENUM ('ODONTOLOGO', 'CLIENTE_DIRECTO');

ALTER TABLE tipo_trabajos
  ADD COLUMN IF NOT EXISTS precio_odontologo DECIMAL(12,2),
  ADD COLUMN IF NOT EXISTS precio_cliente DECIMAL(12,2);

UPDATE tipo_trabajos
SET
  precio_odontologo = COALESCE(precio_odontologo, precio),
  precio_cliente = COALESCE(precio_cliente, precio)
WHERE precio IS NOT NULL;

ALTER TABLE tipo_trabajos
  ALTER COLUMN precio_odontologo SET NOT NULL,
  ALTER COLUMN precio_cliente SET NOT NULL;

ALTER TABLE tipo_trabajos DROP COLUMN IF EXISTS precio;

ALTER TABLE trabajos
  ADD COLUMN IF NOT EXISTS tipo_cliente tipo_cliente DEFAULT 'ODONTOLOGO';

ALTER TABLE trabajos ALTER COLUMN odontologo_id DROP NOT NULL;
