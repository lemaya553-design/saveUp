-- A migration created during an earlier "make light mode the default"
-- experiment (since reverted, see git history — the .sql file itself was
-- deleted from the repo) flipped user_preferences.theme's column default
-- to 'light' and updated every existing row to 'light'. Deleting that
-- migration file from version control never undid what it already ran
-- against the live database — the app's code is back to treating 'dark'
-- as the default (no data-theme attribute), but the stored data wasn't.
-- This corrects both: the column default, and any row still sitting on
-- 'light' as a leftover from that migration rather than an actual choice
-- made through the "Apparence" toggle.

alter table user_preferences alter column theme set default 'dark';

update user_preferences set theme = 'dark' where theme = 'light';
