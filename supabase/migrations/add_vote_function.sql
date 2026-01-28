-- Function to increment team votes atomically
CREATE OR REPLACE FUNCTION increment_team_votes(team_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE teams 
  SET votes = votes + 1 
  WHERE id = team_id_param;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION increment_team_votes(UUID) TO authenticated;
