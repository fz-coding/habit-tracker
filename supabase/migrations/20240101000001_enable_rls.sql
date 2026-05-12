ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
    ON user_profiles FOR SELECT
    USING (id = auth.uid()::TEXT);

CREATE POLICY "Users can update their own profile"
    ON user_profiles FOR UPDATE
    USING (id = auth.uid()::TEXT);

CREATE POLICY "Users can insert their own profile"
    ON user_profiles FOR INSERT
    WITH CHECK (id = auth.uid()::TEXT);

CREATE POLICY "Users can delete their own profile"
    ON user_profiles FOR DELETE
    USING (id = auth.uid()::TEXT);

CREATE POLICY "Users can view their own habits"
    ON habits FOR SELECT
    USING (user_id = auth.uid()::TEXT);

CREATE POLICY "Users can insert their own habits"
    ON habits FOR INSERT
    WITH CHECK (user_id = auth.uid()::TEXT);

CREATE POLICY "Users can update their own habits"
    ON habits FOR UPDATE
    USING (user_id = auth.uid()::TEXT);

CREATE POLICY "Users can delete their own habits"
    ON habits FOR DELETE
    USING (user_id = auth.uid()::TEXT);

CREATE POLICY "Users can view their own logs"
    ON habit_logs FOR SELECT
    USING (user_id = auth.uid()::TEXT);

CREATE POLICY "Users can insert their own logs"
    ON habit_logs FOR INSERT
    WITH CHECK (user_id = auth.uid()::TEXT);

CREATE POLICY "Users can update their own logs"
    ON habit_logs FOR UPDATE
    USING (user_id = auth.uid()::TEXT);

CREATE POLICY "Users can delete their own logs"
    ON habit_logs FOR DELETE
    USING (user_id = auth.uid()::TEXT);