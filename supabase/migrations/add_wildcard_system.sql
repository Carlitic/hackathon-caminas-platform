-- =====================================================
-- MIGRATION: Wildcard/Support Ticket System
-- =====================================================

-- =====================================================
-- 1. CREATE SUPPORT_TICKETS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES profiles(id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_support_tickets_team ON support_tickets(team_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_resolved ON support_tickets(resolved);

-- =====================================================
-- 2. ADD WILDCARD TRACKING TO TEAMS
-- =====================================================

ALTER TABLE teams 
ADD COLUMN IF NOT EXISTS wildcards_used_today INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_wildcard_reset DATE DEFAULT CURRENT_DATE;

-- =====================================================
-- 3. RLS POLICIES FOR SUPPORT_TICKETS
-- =====================================================

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Students can see their team's tickets, teachers/admins see all
CREATE POLICY "support_tickets_select_policy" ON support_tickets
FOR SELECT USING (
    -- Student can see their team's tickets
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND team_id = support_tickets.team_id
    )
    OR
    -- Teachers and admins see all
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('teacher'::user_role, 'admin'::user_role)
    )
);

-- Students can create tickets for their team
CREATE POLICY "support_tickets_insert_policy" ON support_tickets
FOR INSERT WITH CHECK (
    created_by = auth.uid()
    AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'student'::user_role
        AND team_id = support_tickets.team_id
    )
);

-- Teachers and admins can update (resolve) tickets
CREATE POLICY "support_tickets_update_policy" ON support_tickets
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('teacher'::user_role, 'admin'::user_role)
    )
);

-- =====================================================
-- 4. FUNCTION TO CHECK AND RESET DAILY WILDCARDS
-- =====================================================

CREATE OR REPLACE FUNCTION check_and_reset_wildcards(p_team_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_last_reset DATE;
    v_used_today INTEGER;
BEGIN
    -- Get current wildcard status
    SELECT last_wildcard_reset, wildcards_used_today
    INTO v_last_reset, v_used_today
    FROM teams
    WHERE id = p_team_id;
    
    -- If last reset was not today, reset the counter
    IF v_last_reset < CURRENT_DATE THEN
        UPDATE teams
        SET wildcards_used_today = 0,
            last_wildcard_reset = CURRENT_DATE
        WHERE id = p_team_id;
        
        RETURN 0; -- 0 used after reset
    ELSE
        RETURN v_used_today;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. FUNCTION TO CREATE SUPPORT TICKET WITH VALIDATION
-- =====================================================

CREATE OR REPLACE FUNCTION create_support_ticket(
    p_team_id UUID,
    p_created_by UUID,
    p_message TEXT
)
RETURNS JSON AS $$
DECLARE
    v_used_today INTEGER;
    v_ticket_id UUID;
    v_max_daily_wildcards INTEGER := 5;
BEGIN
    -- Check and reset wildcards if needed
    v_used_today := check_and_reset_wildcards(p_team_id);
    
    -- Check if limit reached
    IF v_used_today >= v_max_daily_wildcards THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Daily wildcard limit reached (5/5 used)',
            'used', v_used_today,
            'remaining', 0
        );
    END IF;
    
    -- Create the ticket
    INSERT INTO support_tickets (team_id, created_by, message)
    VALUES (p_team_id, p_created_by, p_message)
    RETURNING id INTO v_ticket_id;
    
    -- Increment wildcard counter
    UPDATE teams
    SET wildcards_used_today = wildcards_used_today + 1
    WHERE id = p_team_id;
    
    -- Return success
    RETURN json_build_object(
        'success', true,
        'ticket_id', v_ticket_id,
        'used', v_used_today + 1,
        'remaining', v_max_daily_wildcards - v_used_today - 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
