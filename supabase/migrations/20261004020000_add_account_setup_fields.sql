-- Extra fields for Onboarding.tsx's "Configure ton compte" step: pay
-- frequency + next payday (for future pay-day-aware budgeting), and a free-
-- text "why" read back later by motivational reminders. Same table/
-- convention as the rest of user_preferences — null column = never set.

alter table user_preferences add column if not exists pay_frequency text
  check (pay_frequency in ('hebdomadaire', 'aux_deux_semaines', 'mensuelle'));
alter table user_preferences add column if not exists next_payday date;
alter table user_preferences add column if not exists savings_why text;
