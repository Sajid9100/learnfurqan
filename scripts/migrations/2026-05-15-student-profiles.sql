CREATE TABLE IF NOT EXISTS student_profiles (
  email TEXT PRIMARY KEY,
  phone TEXT DEFAULT '',
  country TEXT DEFAULT '',
  age_group TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
