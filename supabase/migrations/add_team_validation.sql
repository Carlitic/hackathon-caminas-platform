-- =====================================================
-- MIGRATION: Team Composition Validation
-- =====================================================

-- =====================================================
-- 1. FUNCTION TO VALIDATE TEAM COMPOSITION (2+2+2)
-- =====================================================

CREATE OR REPLACE FUNCTION validate_team_composition(p_team_id UUID)
RETURNS JSON AS $$
DECLARE
    v_year_level year_level_type;
    v_daw_count INTEGER;
    v_dam_count INTEGER;
    v_asir_count INTEGER;
    v_total_count INTEGER;
    v_errors TEXT[] := ARRAY[]::TEXT[];
    v_is_valid BOOLEAN := true;
BEGIN
    -- Get team year level
    SELECT year_level INTO v_year_level
    FROM teams
    WHERE id = p_team_id;
    
    -- Count members by cycle (matching team's year level)
    SELECT 
        COUNT(*) FILTER (WHERE cycle LIKE '%DAW') as daw,
        COUNT(*) FILTER (WHERE cycle LIKE '%DAM') as dam,
        COUNT(*) FILTER (WHERE cycle LIKE '%ASIR') as asir,
        COUNT(*) as total
    INTO v_daw_count, v_dam_count, v_asir_count, v_total_count
    FROM profiles
    WHERE team_id = p_team_id
    AND approval_status = 'approved'::approval_status_type
    AND year_level = v_year_level;
    
    -- Validate DAW count
    IF v_daw_count != 2 THEN
        v_errors := array_append(v_errors, format('DAW: %s/2 (necesita exactamente 2)', v_daw_count));
        v_is_valid := false;
    END IF;
    
    -- Validate DAM count
    IF v_dam_count != 2 THEN
        v_errors := array_append(v_errors, format('DAM: %s/2 (necesita exactamente 2)', v_dam_count));
        v_is_valid := false;
    END IF;
    
    -- Validate ASIR count
    IF v_asir_count != 2 THEN
        v_errors := array_append(v_errors, format('ASIR: %s/2 (necesita exactamente 2)', v_asir_count));
        v_is_valid := false;
    END IF;
    
    -- Validate total
    IF v_total_count != 6 THEN
        v_errors := array_append(v_errors, format('Total: %s/6 miembros', v_total_count));
        v_is_valid := false;
    END IF;
    
    -- Return validation result
    RETURN json_build_object(
        'valid', v_is_valid,
        'composition', json_build_object(
            'daw', v_daw_count,
            'dam', v_dam_count,
            'asir', v_asir_count,
            'total', v_total_count
        ),
        'errors', v_errors,
        'year_level', v_year_level
    );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 2. FUNCTION TO GET TEAM COMPOSITION SUMMARY
-- =====================================================

CREATE OR REPLACE FUNCTION get_team_composition_summary(p_team_id UUID)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    SELECT json_build_object(
        'daw', COUNT(*) FILTER (WHERE cycle LIKE '%DAW'),
        'dam', COUNT(*) FILTER (WHERE cycle LIKE '%DAM'),
        'asir', COUNT(*) FILTER (WHERE cycle LIKE '%ASIR'),
        'total', COUNT(*),
        'year_level', (SELECT year_level FROM teams WHERE id = p_team_id)
    )
    INTO v_result
    FROM profiles
    WHERE team_id = p_team_id
    AND approval_status = 'approved'::approval_status_type;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 3. TRIGGER TO PREVENT INVALID TEAM STATUS CHANGES
-- =====================================================

CREATE OR REPLACE FUNCTION check_team_ready_status()
RETURNS TRIGGER AS $$
DECLARE
    v_validation JSON;
BEGIN
    -- Only check when status is being changed to READY
    IF NEW.status = 'READY'::team_status_type AND OLD.status != 'READY'::team_status_type THEN
        -- Validate composition
        v_validation := validate_team_composition(NEW.id);
        
        -- If not valid, prevent status change
        IF NOT (v_validation->>'valid')::BOOLEAN THEN
            RAISE EXCEPTION 'Cannot mark team as READY: Invalid composition - %', 
                v_validation->>'errors';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS enforce_team_composition ON teams;
CREATE TRIGGER enforce_team_composition
    BEFORE UPDATE ON teams
    FOR EACH ROW
    EXECUTE FUNCTION check_team_ready_status();
