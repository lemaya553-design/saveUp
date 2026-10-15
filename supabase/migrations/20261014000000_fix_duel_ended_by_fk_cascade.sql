-- Found during a security/data-integrity audit (triggered by building
-- self-service account deletion, src/components/DeleteAccountModal.tsx):
-- every user-owned table's user_id FK has "on delete cascade" EXCEPT
-- savings_duels.ended_by, which has no delete action at all (defaults to
-- NO ACTION). abandon_duel() sets ended_by = auth.uid() for whichever
-- participant abandons — not necessarily the duel's creator (created_by,
-- which already cascades). Deleting an account that ever abandoned a duel
-- it didn't create would fail outright with a foreign-key violation,
-- breaking account deletion for anyone who's played Duels.
--
-- "set null" (not cascade) here on purpose: the duel itself, and the
-- *other* participant's view of it, shouldn't disappear just because the
-- person who ended it later deleted their account — only the "who ended
-- it" pointer needs to go.
alter table savings_duels drop constraint if exists savings_duels_ended_by_fkey;
alter table savings_duels
  add constraint savings_duels_ended_by_fkey
  foreign key (ended_by) references auth.users(id) on delete set null;
