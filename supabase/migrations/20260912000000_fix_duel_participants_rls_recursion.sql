-- Fixes: "infinite recursion detected in policy for relation
-- savings_duel_participants" — live production error on the Duels tab.
--
-- Root cause: the savings_duel_participants_select policy queried
-- savings_duel_participants from inside its own USING clause. Postgres
-- re-applies the same policy to that inner query, which re-applies it
-- again, infinitely.
--
-- Fix: route the membership check through a SECURITY DEFINER function.
-- The function runs as its (table-owning) role, which bypasses RLS for
-- its own internal select, so the check itself never re-triggers the
-- policy — breaking the loop without weakening who can see what.
--
-- Scope: only the SELECT policy on savings_duel_participants (the
-- jointly-visible side: display_name, progress_pct, optional goal_name —
-- never a dollar amount). savings_duel_entries — the strictly own-row
-- table where starting_amount actually lives — is untouched by this
-- migration; an opponent still can never see it.
--
-- Idempotent: safe to run again even if this was partially applied
-- before (CREATE OR REPLACE / DROP POLICY IF EXISTS throughout).

create or replace function public.is_duel_participant(p_duel_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from savings_duel_participants where duel_id = p_duel_id and user_id = auth.uid()
  );
$$;

grant execute on function public.is_duel_participant(uuid) to authenticated;

drop policy if exists "savings_duel_participants_select" on savings_duel_participants;
create policy "savings_duel_participants_select" on savings_duel_participants
  for select using (public.is_duel_participant(duel_id));
