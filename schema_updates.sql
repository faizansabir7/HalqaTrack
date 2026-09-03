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


-- ------------------------------------------------------------
-- [2026-09-03] Migration 002 - Optional meeting report answers
-- Reason: The optional "Generate Meeting Report" feature stores the
--         extra descriptive answers (chairperson, class details,
--         discussion points, etc.) so a report can be regenerated
--         later. Everything else the report needs (halqa name, date,
--         category, attendance, programmes conducted) is read from
--         the existing tracker columns and is NOT duplicated here.
--
-- This migration is OPTIONAL: without it the report feature still
-- works for the current session, the answers just aren't persisted.
-- ------------------------------------------------------------

ALTER TABLE meetings
  ADD COLUMN IF NOT EXISTS report_answers JSONB DEFAULT '{}'::jsonb;

-- report_answers : { questionId: "answer text" } for the optional
--                  Malayalam meeting report generator.
