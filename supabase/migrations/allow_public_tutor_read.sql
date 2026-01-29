-- Allow anyone (including unauthenticated users) to read profiles of tutors
-- This is necessary for the registration page to populate the tutor dropdown
CREATE POLICY "Public can read tutors" ON profiles
  FOR SELECT USING (is_tutor = true);
