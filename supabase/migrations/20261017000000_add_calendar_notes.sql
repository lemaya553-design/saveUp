-- Calendrier page (src/pages/Calendrier.tsx): one row per day a user rates,
-- 0-10 + an optional short description. Same shape/RLS convention as
-- login_activity/feedback — scoped to the submitting user, date-keyed,
-- upserted on (user_id, note_date) exactly like login_activity's
-- (user_id, activity_date). A day with no row simply has no note — there's
-- no "0 means unrated" ambiguity since 0 is itself a valid, explicit rating.

create table if not exists calendar_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  note_date date not null,
  rating smallint not null check (rating between 0 and 10),
  description text not null default '' check (char_length(description) <= 280),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists calendar_notes_user_id_date_key on calendar_notes(user_id, note_date);

alter table calendar_notes enable row level security;

drop policy if exists "calendar_notes_all" on calendar_notes;
create policy "calendar_notes_all" on calendar_notes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select, insert, update, delete on calendar_notes to authenticated;
