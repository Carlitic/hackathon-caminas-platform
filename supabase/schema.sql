-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLA DE EQUIPOS (debe crearse primero debido a la FK en perfiles)
-- =====================================================
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL, -- "Equipo 1", "Equipo 2", etc.
  team_number INTEGER UNIQUE NOT NULL,
  year_level TEXT NOT NULL CHECK (year_level IN ('1', '2')), -- Todos los miembros deben ser del mismo curso
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'READY')),
  github_url TEXT,
  project_title TEXT, -- Título del proyecto
  project_description TEXT, -- Descripción del proyecto
  project_image_url TEXT, -- URL de la captura o logo
  votes INTEGER DEFAULT 0,
  position INTEGER, -- Posición final en el ranking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA DE PERFILES
-- =====================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
  
  -- Campos de estudiante
  cycle TEXT CHECK (cycle IN ('1º DAW', '2º DAW', '1º DAM', '2º DAM', '1º ASIR', '2º ASIR')),
  year_level TEXT CHECK (year_level IN ('1', '2')), -- Extraído del ciclo para facilitar el filtrado
  approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'denied')),
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  tutor_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Referencia al tutor
  
  -- Campos de profesor
  is_tutor BOOLEAN DEFAULT false,
  tutor_group TEXT, -- ej., "1º DAW"
  tutor_approved BOOLEAN DEFAULT false, -- El admin debe aprobar a los tutores
  subjects TEXT[], -- Array de asignaturas que imparten
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Restricción: Solo un tutor aprobado por grupo
  CONSTRAINT unique_approved_tutor_per_group 
    EXCLUDE (tutor_group WITH =) 
    WHERE (is_tutor = true AND tutor_approved = true)
);

-- =====================================================
-- TABLA DE VOTOS
-- =====================================================
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID REFERENCES profiles(id) NOT NULL,
  team_id UUID REFERENCES teams(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(teacher_id) -- Cada profesor solo puede votar una vez
);

-- =====================================================
-- TABLA DE REQUISITOS
-- =====================================================
CREATE TABLE requirements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID REFERENCES profiles(id) NOT NULL,
  title TEXT NOT NULL,
  tag TEXT NOT NULL CHECK (tag IN ('GLOBAL', 'DAW', 'DAM', 'ASIR')),
  subject TEXT NOT NULL, -- Debe coincidir con una de las asignaturas del profesor
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA DE SOLICITUDES DE AYUDA
-- =====================================================
CREATE TABLE help_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) NOT NULL,
  student_id UUID REFERENCES profiles(id) NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA DE CONFIGURACIÓN DE EVENTO
-- =====================================================
CREATE TABLE event_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phase TEXT NOT NULL CHECK (phase IN ('inicio', 'desarrollo', 'votacion', 'finalizado')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar configuración por defecto del evento
INSERT INTO event_config (phase) VALUES ('inicio');

-- =====================================================
-- POLÍTICAS DE SEGURIDAD A NIVEL DE FILA (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_config ENABLE ROW LEVEL SECURITY;

-- Políticas de perfiles
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Teachers can read student profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles AS teacher
      WHERE teacher.id = auth.uid()
      AND teacher.role = 'teacher'
    )
  );

-- Políticas de equipos
CREATE POLICY "Anyone can read teams" ON teams
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Teachers can create teams" ON teams
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'teacher'
    )
  );

CREATE POLICY "Teachers can update teams" ON teams
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('teacher', 'admin')
    )
  );

-- Políticas de votos
CREATE POLICY "Teachers can insert own vote" ON votes
  FOR INSERT WITH CHECK (
    auth.uid() = teacher_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'teacher'
    )
  );

CREATE POLICY "Teachers can read own vote" ON votes
  FOR SELECT USING (auth.uid() = teacher_id);

CREATE POLICY "Anyone can read vote counts" ON votes
  FOR SELECT TO authenticated USING (true);

-- Políticas de requisitos
CREATE POLICY "Anyone can read requirements" ON requirements
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Teachers can create requirements" ON requirements
  FOR INSERT WITH CHECK (
    auth.uid() = teacher_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'teacher'
    )
  );

-- Políticas de configuración de evento
CREATE POLICY "Anyone can read event config" ON event_config
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can update event config" ON event_config
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar el timestamp updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_config_updated_at BEFORE UPDATE ON event_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para establecer automáticamente year_level a partir de cycle
CREATE OR REPLACE FUNCTION set_year_level_from_cycle()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.cycle IS NOT NULL THEN
    NEW.year_level = SUBSTRING(NEW.cycle FROM 1 FOR 1);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_year_level BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_year_level_from_cycle();

-- =====================================================
-- ÍNDICES PARA RENDIMIENTO
-- =====================================================
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_cycle ON profiles(cycle);
CREATE INDEX idx_profiles_year_level ON profiles(year_level);
CREATE INDEX idx_profiles_team_id ON profiles(team_id);
CREATE INDEX idx_profiles_tutor_id ON profiles(tutor_id);
CREATE INDEX idx_teams_year_level ON teams(year_level);
CREATE INDEX idx_votes_team_id ON votes(team_id);
CREATE INDEX idx_requirements_teacher_id ON requirements(teacher_id);

-- =====================================================
-- POLÍTICAS DE ACCESO PÚBLICO
-- =====================================================

-- Permitir a cualquiera (incluyendo usuarios no autenticados) leer los perfiles de los tutores
-- Esto es necesario para que la página de registro rellene el menú desplegable de tutores
CREATE POLICY "Public can read tutors" ON profiles
  FOR SELECT USING (is_tutor = true);
