-- Email-addressed duel invites — a duel now targets a specific account
-- (invited_user_id) instead of being a bearer link anyone can accept.
-- The old invite_token/link flow (create_duel, get_duel_invite_preview,
-- accept_duel_invite) is left untouched for backward compatibility with
-- any already-pending duel created before this migration; nothing in the
-- UI generates new links going forward.

alter table savings_duels add column if not exists invited_user_id uuid references auth.users(id);

-- Extends visibility (not narrows): a pending duel is now also visible to
-- the person it's addressed to, before they've joined as a participant.
drop policy if exists "savings_duels_select" on savings_duels;
create policy "savings_duels_select" on savings_duels
  for select using (
    exists (select 1 from savings_duel_participants p where p.duel_id = savings_duels.id and p.user_id = auth.uid())
    or invited_user_id = auth.uid()
  );

-- Creates a duel addressed to whichever account owns p_invitee_email.
-- Raises short, stable codes (not full sentences) — the client maps these
-- to HOOK_ERRORS[lang], same pattern as useAuth.tsx's mapAuthError.
create or replace function public.create_duel_invite(
  p_goal_id uuid, p_duration_days integer, p_display_name text, p_invitee_email text
)
returns table (duel_id uuid)
language plpgsql security definer set search_path = public as $$
declare
  v_duel_id uuid;
  v_invitee_id uuid;
  v_email text := lower(trim(coalesce(p_invitee_email, '')));
begin
  if p_duration_days not in (30, 60, 90) then raise exception 'invalid_duration'; end if;
  if trim(coalesce(p_display_name, '')) = '' then raise exception 'missing_display_name'; end if;
  if v_email = '' or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'invalid_email'; end if;
  if not exists (select 1 from savings_goals where id = p_goal_id and user_id = auth.uid()) then
    raise exception 'goal_not_found';
  end if;

  select id into v_invitee_id from auth.users where lower(email) = v_email limit 1;
  if v_invitee_id is null then raise exception 'invitee_not_found'; end if;
  if v_invitee_id = auth.uid() then raise exception 'cannot_invite_self'; end if;

  insert into savings_duels (status, duration_days, invite_expires_at, created_by, invited_user_id)
  values ('pending', p_duration_days, now() + interval '7 days', auth.uid(), v_invitee_id)
  returning id into v_duel_id;

  insert into savings_duel_participants (duel_id, user_id, display_name)
  values (v_duel_id, auth.uid(), trim(p_display_name));

  -- Reuses the existing enforce_one_active_duel_per_goal trigger on this
  -- insert — a goal already can't join two duels at once, which is also
  -- what makes "same person, same goal" duplicates structurally impossible.
  insert into savings_duel_entries (duel_id, user_id, goal_id, starting_amount)
  select v_duel_id, auth.uid(), id, current_amount from savings_goals where id = p_goal_id;

  return query select v_duel_id;
end;
$$;

-- Accept, addressed by duel_id (the invitee can already see the row via
-- the updated RLS policy above) instead of by bearer token.
create or replace function public.accept_duel_invite_by_id(
  p_duel_id uuid, p_goal_id uuid, p_display_name text, p_share_goal_name boolean default false
)
returns table (duel_id uuid)
language plpgsql security definer set search_path = public as $$
declare v_duel record;
begin
  if trim(coalesce(p_display_name, '')) = '' then raise exception 'missing_display_name'; end if;

  select * into v_duel from savings_duels where id = p_duel_id and status = 'pending' for update;
  if v_duel.id is null then raise exception 'invite_not_found'; end if;
  if v_duel.invited_user_id is distinct from auth.uid() then raise exception 'invite_not_found'; end if;
  if not exists (select 1 from savings_goals where id = p_goal_id and user_id = auth.uid()) then
    raise exception 'goal_not_found';
  end if;

  insert into savings_duel_participants (duel_id, user_id, display_name, share_goal_name, goal_name)
  values (
    v_duel.id, auth.uid(), trim(p_display_name), coalesce(p_share_goal_name, false),
    case when p_share_goal_name then (select name from savings_goals where id = p_goal_id) end
  );

  insert into savings_duel_entries (duel_id, user_id, goal_id, starting_amount)
  select v_duel.id, auth.uid(), id, current_amount from savings_goals where id = p_goal_id;

  update savings_duel_entries e set starting_amount = g.current_amount
  from savings_goals g
  where e.duel_id = v_duel.id and e.user_id = v_duel.created_by and g.id = e.goal_id;

  update savings_duels
  set status = 'active', started_at = now(), ends_at = now() + make_interval(days => v_duel.duration_days)
  where id = v_duel.id;

  return query select v_duel.id;
end;
$$;

-- Declining before ever joining as a participant — abandon_duel can't be
-- reused as-is (it authorizes via savings_duel_participants membership,
-- which a not-yet-joined invitee doesn't have).
create or replace function public.decline_duel_invite(p_duel_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  update savings_duels
  set status = 'abandoned', ended_reason = 'abandoned', ended_by = auth.uid(), updated_at = now()
  where id = p_duel_id and status = 'pending' and invited_user_id = auth.uid();

  if not found then raise exception 'invite_not_found'; end if;
end;
$$;

grant execute on function
  public.create_duel_invite(uuid, integer, text, text),
  public.accept_duel_invite_by_id(uuid, uuid, text, boolean),
  public.decline_duel_invite(uuid)
to authenticated;
