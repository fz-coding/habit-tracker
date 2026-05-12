CREATE TABLE IF NOT EXISTS user_profiles (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    name VARCHAR(100),
    avatar VARCHAR(500),
    timezone VARCHAR(50) DEFAULT 'Asia/Shanghai',
    goal_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS habits (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(20) NOT NULL DEFAULT '🎯',
    color VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
    category VARCHAR(50) NOT NULL DEFAULT '其他',
    frequency_type VARCHAR(20) NOT NULL DEFAULT 'daily',
    frequency_value INT,
    reminder_time TIME,
    description TEXT,
    archived BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS habit_logs (
    id VARCHAR(36) PRIMARY KEY,
    habit_id VARCHAR(36) NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    user_id VARCHAR(36) NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    metadata JSONB
);

CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habits_user_archived ON habits(user_id, archived);
CREATE INDEX idx_habit_logs_habit_id ON habit_logs(habit_id);
CREATE INDEX idx_habit_logs_user_id ON habit_logs(user_id);
CREATE INDEX idx_habit_logs_completed_at ON habit_logs(completed_at);

ALTER TABLE habit_logs ADD CONSTRAINT unique_habit_day UNIQUE (habit_id, DATE(completed_at));