-- "Donner mon avis" button (Sidebar.tsx → FeedbackModal.tsx): a simple,
-- no-personal-info free-text suggestion box. Same shape/RLS convention as
-- login_activity — one row per submission, scoped to the submitting user.
-- No read-back UI exists in the app; Alex reads these in Supabase's table
-- editor (service role bypasses RLS).

create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);

alter table feedback enable row level security;

drop policy if exists "feedback_all" on feedback;
create policy "feedback_all" on feedback
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select, insert, update, delete on feedback to authenticated;
