-- ====================================================================
-- MIGRACIÓN: Habilitar Supabase Realtime para la tabla `help_requests`
-- ====================================================================

BEGIN;

  -- Comprobar si la publicación "supabase_realtime" ya existe
  -- Normalmente Supabase ya la ha creado
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
    ) THEN
      CREATE PUBLICATION supabase_realtime;
    END IF;
  END
  $$;

  -- Intentar añadir la tabla a la publicación, ignorar si ya está
  DO $$
  BEGIN
    -- Si la tabla NO está en la publicación, la añadimos.
    IF NOT EXISTS (
      SELECT 1 
      FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND tablename = 'help_requests'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE help_requests;
    END IF;
  END
  $$;

COMMIT;
