-- ============================================================
-- SCHEMA UPDATES / MIGRATIONS LOG
-- Run these in order in your Supabase SQL Editor
-- ============================================================


-- ------------------------------------------------------------
-- [2026-06-30] Migration 001 - Add missing columns to meetings
-- Reason: custom_agenda_week, custom_agendas, cancelled_reason
--         were used by the app but missing from the DB schema,
--         causing Supabase to silently drop those field updates.
-- ------------------------------------------------------------

ALTER TABLE meetings
  ADD COLUMN IF NOT EXISTS custom_agenda_week INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS custom_agendas      JSONB   DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS cancelled_reason    TEXT    DEFAULT NULL;

-- custom_agenda_week : Halqa meeting type override (1=Thazkiya, 2=Prasthana,
--                      3=Pothu, 4=Thahreeki, 5=Sargga). NULL means use the
--                      date-calculated default.
-- custom_agendas     : User-added agenda items stored as JSONB array.
-- cancelled_reason   : Free-text reason when meeting status = 'cancelled'.
