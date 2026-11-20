-- New 10-question onboarding (replaces the old 15-question quiz + "Configure
-- ton compte" setup phase — see src/pages/Onboarding.tsx). Same table/
-- convention as every other onboarding column: one row per user in
-- user_preferences, null column = never set. RLS already covers these via
-- the existing row-level "user_preferences_all" policy (auth.uid() = user_id)
-- — a new column on an already-RLS'd table inherits the same row-level
-- restriction automatically, no policy change needed. No existing column,
-- row, or table is dropped by this migration.

alter table user_preferences add column if not exists first_name text;

alter table user_preferences add column if not exists work_status text
  check (work_status in ('etudiant', 'travail', 'les_deux'));

alter table user_preferences add column if not exists income_range text
  check (income_range in ('moins_500', '500_1500', '1500_3000', '3000_plus'));

alter table user_preferences add column if not exists fixed_expenses_range text
  check (fixed_expenses_range in ('chez_parents', 'moins_500', '500_1500', 'plus_1500'));

-- Multi-select (Q6, "où ton argent disparaît") — array of the ids in
-- lib/onboardingQuiz.ts's MONEY_LEAKS. No check constraint on array
-- elements (Postgres can't express that inline cheaply); the app is the
-- only writer.
alter table user_preferences add column if not exists money_leaks text[] not null default '{}';

alter table user_preferences add column if not exists savings_goal_type text
  check (savings_goal_type in ('voyage', 'auto', 'appart', 'urgence', 'autre'));

-- Custom name when savings_goal_type = 'autre'. The actual goal row itself
-- (name/target_amount/target_date) is created in savings_goals via the
-- existing addGoal flow — this column just records what was typed during
-- onboarding, it isn't read back by anything else.
alter table user_preferences add column if not exists savings_goal_name text;

alter table user_preferences add column if not exists financial_mood text
  check (financial_mood in ('en_controle', 'correct', 'stresse'));

-- Authoritative "did we ask about WhatsApp" signal — unlike whatsapp_number
-- staying null (also true of an account never asked), whatsapp_status =
-- 'declined' means never ask again, anywhere in the app.
alter table user_preferences add column if not exists whatsapp_status text
  check (whatsapp_status in ('given', 'declined'));

-- Single source of truth for Dashboard.tsx's needsOnboarding gate — set
-- once, at the end of the 10-question flow (before the kept plan-selection
-- step, so abandoning that step doesn't replay the questions on next visit).
alter table user_preferences add column if not exists onboarding_completed_at timestamptz;

-- Q4 ("Ta paye rentre…") now has a 4th option, "Ça change" (variable
-- income) — widen the existing pay_frequency check to allow it. The
-- original check constraint (from 20261004020000_add_account_setup_fields.sql)
-- was declared inline with no explicit name, so Postgres gave it its
-- default auto-generated name, <table>_<column>_check.
alter table user_preferences drop constraint if exists user_preferences_pay_frequency_check;
alter table user_preferences add constraint user_preferences_pay_frequency_check
  check (pay_frequency in ('hebdomadaire', 'aux_deux_semaines', 'mensuelle', 'ca_change'));

-- Backfill: accounts that already finished the OLD onboarding (15-question
-- quiz + "Configure ton compte") should never see the NEW 10-question flow
-- either. onboarding_quiz_results has exactly one row per account that
-- completed that old flow, so its created_at is a reasonable stand-in for
-- "already onboarded, as of whenever that was". Accounts with no row there
-- (never did the old onboarding, or pre-date it) are intentionally left
-- null here, so they see the new flow once at their next login — exactly
-- the "existing user who never onboarded sees it once" behavior asked for.
update user_preferences up
set onboarding_completed_at = oqr.created_at
from onboarding_quiz_results oqr
where up.user_id = oqr.user_id
  and up.onboarding_completed_at is null;
