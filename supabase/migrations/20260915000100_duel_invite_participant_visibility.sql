-- Fixes a gap in 20260915000000_duel_email_invites.sql: savings_duels became
-- visible to an invited-but-not-yet-joined user, but savings_duel_participants
-- did not — so the inviter's display name was invisible to them before they
-- accepted. Widens is_duel_participant() to also cover this case. Safe: a
-- pending duel only ever has the creator as a participant until someone
-- accepts, so this reveals exactly that one row, nothing more.

create or replace function public.is_duel_participant(p_duel_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from savings_duel_participants where duel_id = p_duel_id and user_id = auth.uid()
  )
  or exists (
    select 1 from savings_duels where id = p_duel_id and invited_user_id = auth.uid()
  );
$$;
