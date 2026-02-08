-- =====================================================
-- Add Session Version System
-- Permite invalidar sesiones cuando sea necesario
-- =====================================================

-- Añadir campo session_version a profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS session_version INTEGER DEFAULT 1;

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_profiles_session_version 
ON profiles(session_version);

-- Función para incrementar versión de sesión (invalidar sesiones)
CREATE OR REPLACE FUNCTION invalidate_all_sessions()
RETURNS void AS $$
BEGIN
    UPDATE profiles SET session_version = session_version + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para invalidar sesiones por rol
CREATE OR REPLACE FUNCTION invalidate_sessions_by_role(target_role TEXT)
RETURNS void AS $$
BEGIN
    UPDATE profiles 
    SET session_version = session_version + 1
    WHERE role = target_role::role_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para invalidar sesión de un usuario específico
CREATE OR REPLACE FUNCTION invalidate_user_session(user_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE profiles 
    SET session_version = session_version + 1
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentarios
COMMENT ON COLUMN profiles.session_version IS 'Versión de sesión para invalidar tokens JWT';
COMMENT ON FUNCTION invalidate_all_sessions() IS 'Incrementa session_version de todos los usuarios (fuerza re-login)';
COMMENT ON FUNCTION invalidate_sessions_by_role(TEXT) IS 'Incrementa session_version de usuarios con rol específico';
COMMENT ON FUNCTION invalidate_user_session(UUID) IS 'Incrementa session_version de un usuario específico';
