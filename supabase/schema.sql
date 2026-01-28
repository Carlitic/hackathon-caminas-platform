-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TEAMS TABLE (must be created first due to FK in profiles)
-- =====================================================
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL, -- "Equipo 1", "Equipo 2", etc.
  team_number INTEGER UNIQUE NOT NULL,
  year_level TEXT NOT NULL CHECK (year_level IN ('1', '2')), -- All members must be same year
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'READY')),
  github_url TEXT,
  votes INTEGER DEFAULT 0,
  position INTEGER, -- Final ranking position
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PROFILES TABLE
-- =====================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
  
  -- Student fields
  cycle TEXT CHECK (cycle IN ('1º DAW', '2º DAW', '1º DAM', '2º DAM', '1º ASIR', '2º ASIR')),
  year_level TEXT CHECK (year_level IN ('1', '2')), -- Extracted from cycle for easier filtering
  approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'denied')),
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  tutor_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Reference to tutor
  
  -- Teacher fields
  is_tutor BOOLEAN DEFAULT false,
  tutor_group TEXT, -- e.g., "1º DAW"
  tutor_approved BOOLEAN DEFAULT false, -- Admin must approve tutors
  subjects TEXT[], -- Array of subjects they teach
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: Only one approved tutor per group
  CONSTRAINT unique_approved_tutor_per_group 
    EXCLUDE (tutor_group WITH =) 
    WHERE (is_tutor = true AND tutor_approved = true)
);

-- =====================================================
-- VOTES TABLE
-- =====================================================
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID REFERENCES profiles(id) NOT NULL,
  team_id UUID REFERENCES teams(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(teacher_id) -- Each teacher can only vote once
);

-- =====================================================
-- REQUIREMENTS TABLE
-- =====================================================
CREATE TABLE requirements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID REFERENCES profiles(id) NOT NULL,
  title TEXT NOT NULL,
  tag TEXT NOT NULL CHECK (tag IN ('GLOBAL', 'DAW', 'DAM', 'ASIR')),
  subject TEXT NOT NULL, -- Must match one of teacher's subjects
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- HELP REQUESTS TABLE
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
-- EVENT CONFIG TABLE
-- =====================================================
CREATE TABLE event_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phase TEXT NOT NULL CHECK (phase IN ('inicio', 'desarrollo', 'votacion', 'finalizado')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default event config
INSERT INTO event_config (phase) VALUES ('inicio');

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_config ENABLE ROW LEVEL SECURITY;

-- Profiles policies
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

-- Teams policies
CREATE POLICY "Anyone can read teams" ON teams
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Teachers can update teams" ON teams
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('teacher', 'admin')
    )
  );

-- Votes policies
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

-- Requirements policies
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

-- Event config policies
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
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_config_updated_at BEFORE UPDATE ON event_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically set year_level from cycle
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
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_cycle ON profiles(cycle);
CREATE INDEX idx_profiles_year_level ON profiles(year_level);
CREATE INDEX idx_profiles_team_id ON profiles(team_id);
CREATE INDEX idx_profiles_tutor_id ON profiles(tutor_id);
CREATE INDEX idx_teams_year_level ON teams(year_level);
CREATE INDEX idx_votes_team_id ON votes(team_id);
CREATE INDEX idx_requirements_teacher_id ON requirements(teacher_id);
