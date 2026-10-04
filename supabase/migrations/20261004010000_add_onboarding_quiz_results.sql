-- New onboarding flow (quiz -> archetype result -> plan selection) replaces
-- the old income/expenses/goal wizard. This table stores the computed quiz
-- result per user and doubles as the new "has completed onboarding" signal:
-- no row = not done yet, same convention as budget_settings/subscriptions.

create table if not exists onboarding_quiz_results (
  user_id uuid primary key references auth.users(id) on delete cascade,
  score integer not null check (score >= 0 and score <= 100),
  archetype text not null check (archetype in ('stressed', 'impulsive', 'cautious', 'master')),
  answers jsonb not null,
  created_at timestamptz not null default now()
);

alter table onboarding_quiz_results enable row level security;

drop policy if exists "onboarding_quiz_results_all" on onboarding_quiz_results;
create policy "onboarding_quiz_results_all" on onboarding_quiz_results
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select, insert, update, delete on onboarding_quiz_results to authenticated;
