-- Migración: Añadir sistema de aprobación de tutores
-- Esto añade el campo tutor_approved y la restricción única

-- Paso 1: Añadir columna tutor_approved
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS tutor_approved BOOLEAN DEFAULT false;

-- Paso 2: Añadir la restricción única para tutores aprobados
-- Nota: la restricción EXCLUDE requiere la extensión btree_gist
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Paso 3: Añadir la restricción
ALTER TABLE profiles
ADD CONSTRAINT unique_approved_tutor_per_group 
  EXCLUDE USING gist (tutor_group WITH =) 
  WHERE (is_tutor = true AND tutor_approved = true);

-- Paso 4: Actualizar tutores existentes (opcional - aprobar todos los tutores existentes)
-- Descomentar la línea de abajo si se quiere auto-aprobar los tutores existentes
-- UPDATE profiles SET tutor_approved = true WHERE is_tutor = true;

-- Consulta de verificación
SELECT 
  full_name, 
  tutor_group, 
  is_tutor, 
  tutor_approved 
FROM profiles 
WHERE is_tutor = true
ORDER BY tutor_group;
