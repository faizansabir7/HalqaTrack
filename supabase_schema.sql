-- Create tables for Halqa Activity Tracking

-- Areas Table
CREATE TABLE areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT NOT NULL
);

-- Halqas Table
CREATE TABLE halqas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area_id UUID REFERENCES areas(id),
  name TEXT NOT NULL,
  meeting_day TEXT NOT NULL,
  members JSONB DEFAULT '[]'::jsonb -- Storing members as JSONB for simplicity in this POC
);

-- Meetings Table
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  halqa_id UUID REFERENCES halqas(id),
  week_start_date DATE NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, completed, missed
  attendance JSONB DEFAULT '{}'::jsonb,
  agenda_status JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(halqa_id, week_start_date)
);

-- Enable Row Level Security (RLS)
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE halqas ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- Create policies (modify as needed for production, currently open for anon)
CREATE POLICY "Allow public read access on areas" ON areas FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on areas" ON areas FOR ALL USING (true);

CREATE POLICY "Allow public read access on halqas" ON halqas FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on halqas" ON halqas FOR ALL USING (true);

CREATE POLICY "Allow public read access on meetings" ON meetings FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on meetings" ON meetings FOR ALL USING (true);

-- Insert Initial Seed Data (Optional, based on mockData)
-- You can run this after creating tables if you want to populate some initial data.
