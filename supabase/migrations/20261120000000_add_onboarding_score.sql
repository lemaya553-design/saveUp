-- Score screen at the end of the 10-question onboarding (src/pages/
-- Onboarding.tsx, see src/lib/onboardingScore.ts for the scoring rules —
-- plain deterministic math, no AI/model involved). Saved once, alongside
-- everything else written by completeOnboarding, for the record — nothing
-- reads it back today, but it's on the profile rather than lost after the
-- one-time reveal. Same table/convention as every other onboarding column:
-- one row per user in user_preferences, null = never computed (accounts
-- onboarded before this existed). No existing column, row, or table is
-- touched by this migration.

alter table user_preferences add column if not exists onboarding_score integer
  check (onboarding_score is null or (onboarding_score >= 0 and onboarding_score <= 100));
