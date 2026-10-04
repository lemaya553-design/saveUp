-- SaveUp Minimaliste redesign flipped the app's default appearance from
-- dark/blue to light/orange (see src/index.css), but the user_preferences
-- table's own column default was still 'dark' — meaning every existing row
-- (including rows that were never touched by the user, just created by the
-- old default) is still pinned to dark mode regardless of the new client
-- default. This updates the column default for future rows AND resets
-- every row currently AT the old default to light.
--
-- Caveat: this can't distinguish "never touched the toggle, stuck on the
-- old default" from "explicitly chose dark mode in Paramètres" — both look
-- identical in the data. Given this is a pre-launch app with a small user
-- base, the UPDATE below resets everyone to the new light default; if that
-- stops being true, drop the UPDATE and let the new default only apply to
-- new rows going forward.

alter table user_preferences alter column theme set default 'light';

update user_preferences set theme = 'light' where theme = 'dark';
