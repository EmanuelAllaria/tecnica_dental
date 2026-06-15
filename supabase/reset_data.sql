-- Vaciar todas las tablas de datos (dejar en 0).
-- NO toca auth.users — el usuario de login se mantiene.
-- Ejecutar en Supabase → SQL Editor

TRUNCATE TABLE
  pagos,
  trabajos,
  resumen_ia,
  tipo_trabajos,
  odontologos
RESTART IDENTITY
CASCADE;
