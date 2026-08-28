-- SaveUp schema
-- Run this in the Supabase SQL editor (Project > SQL Editor > New query).
--
-- No auth/user scoping yet: this is a single-user personal budget tool, so
-- every table is a flat list (or a singleton row) readable/writable by the
-- anon key. If you ever add Supabase Auth + multiple users, add a user_id
-- column referencing auth.users and rewrite the policies below to scope by
-- auth.uid() instead of "allow all".

create extension if not exists "pgcrypto";

-- Singleton row: monthly income.
create table if not exists budget_settings (
  id smallint primary key default 1,
  monthly_income numeric(12, 2) not null default 0,
  updated_at timestamptz not null default now(),
  constraint budget_settings_singleton check (id = 1)
);

insert into budget_settings (id, monthly_income)
values (1, 0)
on conflict (id) do nothing;

-- Recurring fixed expenses (rent, subscriptions, etc.)
create table if not exists fixed_expenses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  amount numeric(12, 2) not null check (amount >= 0),
  created_at timestamptz not null default now()
);

-- Quick one-off expenses logged day to day.
create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  description text not null,
  amount numeric(12, 2) not null check (amount >= 0),
  spent_at timestamptz not null default now()
);

-- Singleton row: savings goal + progress.
create table if not exists savings_goal (
  id smallint primary key default 1,
  name text not null default 'Mon objectif',
  target_amount numeric(12, 2) not null default 0,
  current_amount numeric(12, 2) not null default 0,
  updated_at timestamptz not null default now(),
  constraint savings_goal_singleton check (id = 1)
);

insert into savings_goal (id, name, target_amount, current_amount)
values (1, 'Mon objectif', 0, 0)
on conflict (id) do nothing;

-- Row Level Security: enabled but permissive (anon key = the single user).
alter table budget_settings enable row level security;
alter table fixed_expenses enable row level security;
alter table expenses enable row level security;
alter table savings_goal enable row level security;

drop policy if exists "budget_settings_all" on budget_settings;
create policy "budget_settings_all" on budget_settings
  for all using (true) with check (true);

drop policy if exists "fixed_expenses_all" on fixed_expenses;
create policy "fixed_expenses_all" on fixed_expenses
  for all using (true) with check (true);

drop policy if exists "expenses_all" on expenses;
create policy "expenses_all" on expenses
  for all using (true) with check (true);

drop policy if exists "savings_goal_all" on savings_goal;
create policy "savings_goal_all" on savings_goal
  for all using (true) with check (true);

-- RLS policies only gate access once a role already has base privileges on
-- the table. Supabase's anon/authenticated roles don't get those by
-- default for tables created outside the dashboard's table editor, so
-- grant them explicitly.
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on budget_settings, fixed_expenses, expenses, savings_goal
  to anon, authenticated;

-- Dashboard / health score / rewards features -------------------------------

-- Optional target date for the savings goal, used to flag a goal that's
-- falling behind its own pace.
alter table savings_goal add column if not exists target_date date;

-- Ledger of individual contributions to the savings goal (separate from the
-- running savings_goal.current_amount total) so we can measure how
-- regularly the user actually saves, not just the cumulative amount.
create table if not exists savings_contributions (
  id uuid primary key default gen_random_uuid(),
  amount numeric(12, 2) not null check (amount > 0),
  created_at timestamptz not null default now()
);

-- One row per day: the financial health score computed that day, so the
-- dashboard can show a trend arrow and a simple history chart over time.
create table if not exists financial_health_snapshots (
  score_date date primary key,
  score smallint not null check (score between 0 and 100),
  created_at timestamptz not null default now()
);

alter table savings_contributions enable row level security;
alter table financial_health_snapshots enable row level security;

drop policy if exists "savings_contributions_all" on savings_contributions;
create policy "savings_contributions_all" on savings_contributions
  for all using (true) with check (true);

drop policy if exists "financial_health_snapshots_all" on financial_health_snapshots;
create policy "financial_health_snapshots_all" on financial_health_snapshots
  for all using (true) with check (true);

grant select, insert, update, delete on savings_contributions, financial_health_snapshots
  to anon, authenticated;

-- Expense categories (budget page breakdown/insights) -----------------------

alter table fixed_expenses add column if not exists category text not null default 'Autre';
alter table expenses add column if not exists category text not null default 'Autre';

-- Multiple savings goals ------------------------------------------------------
-- Replaces the old singleton `savings_goal` (id=1) table, which stays in
-- place unused rather than being dropped, in case you want to double-check
-- the migrated data below before removing it yourself.

create table if not exists savings_goals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  target_amount numeric(12, 2) not null default 0,
  current_amount numeric(12, 2) not null default 0,
  target_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table savings_contributions add column if not exists goal_id uuid references savings_goals(id) on delete cascade;

-- One-time migration: bring the old singleton goal into the new table, if a
-- real goal was ever set (target_amount > 0). Safe to run more than once —
-- it only inserts when savings_goals is still empty.
insert into savings_goals (name, target_amount, current_amount, target_date, updated_at)
select name, target_amount, current_amount, target_date, updated_at
from savings_goal
where target_amount > 0
  and not exists (select 1 from savings_goals);

-- Attach any pre-existing contributions (which had no goal_id yet) to that
-- migrated goal — before this migration there was only ever one goal.
update savings_contributions
set goal_id = (select id from savings_goals order by created_at asc limit 1)
where goal_id is null
  and exists (select 1 from savings_goals);

alter table savings_goals enable row level security;

drop policy if exists "savings_goals_all" on savings_goals;
create policy "savings_goals_all" on savings_goals
  for all using (true) with check (true);

grant select, insert, update, delete on savings_goals to anon, authenticated;

-- User-managed expense categories --------------------------------------------
-- Replaces the previously hardcoded category list. fixed_expenses.category
-- and expenses.category stay plain text (not a foreign key) — renaming a
-- category is handled app-side as "update this row + bulk-update every
-- expense row using the old name," same as before this table existed.

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

insert into categories (name)
values ('Logement'), ('Alimentation'), ('Transport'), ('Loisirs'), ('Santé'), ('Autre')
on conflict (name) do nothing;

alter table categories enable row level security;

drop policy if exists "categories_all" on categories;
create policy "categories_all" on categories
  for all using (true) with check (true);

grant select, insert, update, delete on categories to anon, authenticated;

-- Actually-invested balance ---------------------------------------------------
-- Separate from the Investissement page's projection calculator (which is
-- purely hypothetical, unpersisted local state) — this is the real, tracked
-- amount currently invested, used by the Dashboard's net worth card.

create table if not exists investment_balance (
  id smallint primary key default 1,
  current_amount numeric(12, 2) not null default 0,
  updated_at timestamptz not null default now(),
  constraint investment_balance_singleton check (id = 1)
);

insert into investment_balance (id, current_amount)
values (1, 0)
on conflict (id) do nothing;

alter table investment_balance enable row level security;

drop policy if exists "investment_balance_all" on investment_balance;
create policy "investment_balance_all" on investment_balance
  for all using (true) with check (true);

grant select, insert, update, delete on investment_balance to anon, authenticated;

-- Multi-user auth: user_id columns (Phase 3) ---------------------------------
-- Added NULLABLE for now: existing rows predate Supabase Auth and have no
-- owner yet. Phase 6's migration backfills user_id on this data and only
-- THEN enforces NOT NULL (and, for the two singleton tables, switches their
-- primary key to user_id) — a NOT NULL column can't be added directly to a
-- table that already has rows with nothing to put in it.
-- RLS policies still read "using (true)" until Phase 4 runs, so nothing
-- breaks for the app in between — these two phases are additive only.

alter table expenses add column if not exists user_id uuid references auth.users(id) on delete cascade;
create index if not exists expenses_user_id_idx on expenses(user_id);

alter table fixed_expenses add column if not exists user_id uuid references auth.users(id) on delete cascade;
create index if not exists fixed_expenses_user_id_idx on fixed_expenses(user_id);

alter table savings_goals add column if not exists user_id uuid references auth.users(id) on delete cascade;
create index if not exists savings_goals_user_id_idx on savings_goals(user_id);

alter table savings_contributions add column if not exists user_id uuid references auth.users(id) on delete cascade;
create index if not exists savings_contributions_user_id_idx on savings_contributions(user_id);

-- categories.name was globally unique; once categories are per-user, the
-- same name must be allowed to exist for different users.
alter table categories add column if not exists user_id uuid references auth.users(id) on delete cascade;
create index if not exists categories_user_id_idx on categories(user_id);
alter table categories drop constraint if exists categories_name_key;
create unique index if not exists categories_user_id_name_key on categories(user_id, name);

alter table financial_health_snapshots add column if not exists user_id uuid references auth.users(id) on delete cascade;
create index if not exists financial_health_snapshots_user_id_idx on financial_health_snapshots(user_id);

-- Singleton tables (one row for the whole app) become one row per user.
-- The `id = 1` check no longer makes sense once every user gets their own
-- row — dropped now; the primary key itself moves to user_id in Phase 6.
alter table budget_settings add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table budget_settings drop constraint if exists budget_settings_singleton;

alter table investment_balance add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table investment_balance drop constraint if exists investment_balance_singleton;

-- Multi-user auth: RLS policies scoped by owner (Phase 4) -------------------
-- Replaces every "using (true)" policy — anyone holding the anon key could
-- read/write everyone's data — with one that only lets a signed-in user see
-- and modify their own rows. Run this only after Phase 3's user_id columns
-- exist. Existing rows have user_id = null until Phase 6 backfills them, so
-- they're invisible to everyone (even their eventual owner) until then —
-- expected, not a bug.

drop policy if exists "budget_settings_all" on budget_settings;
create policy "budget_settings_all" on budget_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "fixed_expenses_all" on fixed_expenses;
create policy "fixed_expenses_all" on fixed_expenses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "expenses_all" on expenses;
create policy "expenses_all" on expenses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "savings_goals_all" on savings_goals;
create policy "savings_goals_all" on savings_goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "savings_contributions_all" on savings_contributions;
create policy "savings_contributions_all" on savings_contributions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "categories_all" on categories;
create policy "categories_all" on categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "financial_health_snapshots_all" on financial_health_snapshots;
create policy "financial_health_snapshots_all" on financial_health_snapshots
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "investment_balance_all" on investment_balance;
create policy "investment_balance_all" on investment_balance
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Tighten grants: unauthenticated (anon) requests no longer need any base
-- privileges on these tables — every real request now carries a signed-in
-- user's JWT and hits Postgres as `authenticated`. Revoking anon access is
-- defense in depth on top of RLS, not a replacement for it.
revoke select, insert, update, delete on
  budget_settings, fixed_expenses, expenses, savings_goals,
  savings_contributions, categories, financial_health_snapshots, investment_balance
  from anon;

-- Migrate existing (pre-auth) data to your first account (Phase 6) ---------
-- Run this ONLY after: (1) you've signed up at /connexion, and (2) the
-- Phase 3 + 4 SQL above has already run. This backfills every row that
-- predates auth (user_id still null) onto your new account, then locks the
-- schema down to its final shape: user_id NOT NULL everywhere, and the two
-- former singleton tables (budget_settings, investment_balance) keyed by
-- user_id instead of a shared id=1 row. The app's code (useIncome,
-- useInvestmentBalance, useFinancialHealth) upserts using onConflict on
-- user_id — that requires user_id to actually BE a unique key, which only
-- happens once this block runs. Safe to re-run.

do $$
declare
  target_user_id uuid;
begin
  -- Replace the email if you sign up with something other than this.
  select id into target_user_id from auth.users where email = 'alex.lemay09@icloud.com' limit 1;
  if target_user_id is null then
    raise exception 'No auth.users row for that email — sign up at /connexion first.';
  end if;

  update expenses set user_id = target_user_id where user_id is null;
  update fixed_expenses set user_id = target_user_id where user_id is null;
  update savings_goals set user_id = target_user_id where user_id is null;
  update savings_contributions set user_id = target_user_id where user_id is null;
  update categories set user_id = target_user_id where user_id is null;
  update financial_health_snapshots set user_id = target_user_id where user_id is null;
  update budget_settings set user_id = target_user_id where user_id is null;
  update investment_balance set user_id = target_user_id where user_id is null;
end $$;

alter table expenses alter column user_id set not null;
alter table fixed_expenses alter column user_id set not null;
alter table savings_goals alter column user_id set not null;
alter table savings_contributions alter column user_id set not null;
alter table categories alter column user_id set not null;
alter table financial_health_snapshots alter column user_id set not null;
alter table budget_settings alter column user_id set not null;
alter table investment_balance alter column user_id set not null;

-- financial_health_snapshots: one row per (user, day) instead of one global
-- row per day.
alter table financial_health_snapshots drop constraint if exists financial_health_snapshots_pkey;
alter table financial_health_snapshots add primary key (user_id, score_date);

-- budget_settings: singleton (id=1) → one row per user.
alter table budget_settings drop constraint if exists budget_settings_pkey;
alter table budget_settings add primary key (user_id);
alter table budget_settings drop column if exists id;

-- investment_balance: singleton (id=1) → one row per user.
alter table investment_balance drop constraint if exists investment_balance_pkey;
alter table investment_balance add primary key (user_id);
alter table investment_balance drop column if exists id;

-- Security fix (pre-launch audit): `savings_goal` (singular) is the
-- pre-multi-goal legacy table — dead code already stopped querying it, and
-- it was NOT part of the Phase 3/4 auth rewrite above (it never got a
-- user_id column), so it still has an open "using (true)" RLS policy and an
-- `anon` grant: anyone holding just the public anon key could read or write
-- it. Its data was already copied into savings_goals by the one-time
-- migration earlier in this file, so it's safe to drop outright rather than
-- leave it around unused with an open policy.
drop table if exists savings_goal;

-- Hotfix: unique constraints for upsert() onConflict targets ----------------
-- The app calls .upsert(data, { onConflict: '...' }) on three tables. That
-- onConflict value maps straight onto an `ON CONFLICT (...)` clause, and
-- Postgres requires an actual UNIQUE or exclusion constraint covering
-- exactly that column set — otherwise every upsert fails with "there is no
-- unique or exclusion constraint matching the ON CONFLICT specification".
-- Phase 6 above already gives budget_settings/investment_balance a user_id
-- primary key (which counts), but if Phase 6 hasn't been run yet — or ran
-- before this hotfix existed — the constraint may still be missing. This
-- block is safe to run in any state: idempotent, and harmless even if the
-- primary key already covers the same column (Postgres allows a redundant
-- unique constraint alongside it).

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'budget_settings_user_id_key') then
    alter table budget_settings add constraint budget_settings_user_id_key unique (user_id);
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'investment_balance_user_id_key') then
    alter table investment_balance add constraint investment_balance_user_id_key unique (user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'financial_health_snapshots_user_id_score_date_key'
  ) then
    alter table financial_health_snapshots
      add constraint financial_health_snapshots_user_id_score_date_key unique (user_id, score_date);
  end if;
end $$;

-- Hotfix: drop the leftover singleton-model primary keys ---------------------
-- budget_settings/investment_balance still have their original `id smallint
-- primary key default 1`, and financial_health_snapshots still has its
-- original `score_date date primary key` (one row per DAY, globally, across
-- every user). Those old keys are checked BEFORE the new user_id-scoped
-- unique constraint above ever comes into play, so a second account writing
-- today's snapshot — or any row that defaults id to 1 — collides with the
-- first account's row and fails with "duplicate key value violates unique
-- constraint ..._pkey", even though the new constraint would have been fine
-- with it. (Phase 6 further up this file was meant to drop these, but its
-- backfill DO block raises an exception if it can't find a matching
-- auth.users row for the target email — if that happened, everything after
-- it in the same script, including this drop, never ran.) Just dropping the
-- old constraint is enough: the user_id-scoped unique constraint added just
-- above already fully enforces "one row per user" (or "one row per user per
-- day"), independent of whether it's formally the primary key.

alter table budget_settings drop constraint if exists budget_settings_pkey;
alter table investment_balance drop constraint if exists investment_balance_pkey;
alter table financial_health_snapshots drop constraint if exists financial_health_snapshots_pkey;

-- Accounts (transaction import source labels) --------------------------------
-- User-named labels like "Carte de crédit 1" or "Débit", picked/created in
-- the import wizard so a batch of imported transactions can be traced back
-- to the account it came from. Created fresh (post-auth), so unlike the
-- older tables this one goes straight to a NOT NULL user_id and an
-- `authenticated`-only grant — no legacy singleton/anon-key baggage to work
-- around.

create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists accounts_user_id_name_key on accounts(user_id, name);

alter table accounts enable row level security;

drop policy if exists "accounts_all" on accounts;
create policy "accounts_all" on accounts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select, insert, update, delete on accounts to authenticated;

-- Which account an expense came from — set by the CSV/Excel import wizard;
-- null for expenses added manually (quick-add, the regular form), which
-- have no source account to attribute. Plain text, not a foreign key to
-- accounts(id), matching how expenses.category already works: renaming is
-- an app-side "update this row" operation, not something the DB enforces.
alter table expenses add column if not exists account text;

-- Per-category monthly budget (Statistiques page: budget vs. actual) -------
-- Optional — null means "no budget set for this category," not "$0 budget",
-- so an unset category is simply excluded from the budget-vs-actual view
-- instead of showing as permanently over budget.
alter table categories add column if not exists monthly_budget numeric(12, 2);

-- User-confirmed merchant-keyword -> category mappings ----------------------
-- Populated ONLY when the user explicitly confirms a suggestion from the
-- "Autre" clustering detector (Paramètres > Catégories suggérées) — never
-- written automatically. Consulted by pickCategory (src/lib/importParsing.ts)
-- alongside the built-in keyword dictionary, ahead of it in priority, so a
-- confirmed match keeps applying to future imports and recategorization
-- runs, not just the transactions it was suggested from. Created fresh
-- (post-auth), so like `accounts` it goes straight to a NOT NULL user_id and
-- an `authenticated`-only grant — no legacy singleton/anon-key baggage.

create table if not exists custom_category_keywords (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  keyword text not null,
  category text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists custom_category_keywords_user_id_keyword_key
  on custom_category_keywords(user_id, keyword);

alter table custom_category_keywords enable row level security;

drop policy if exists "custom_category_keywords_all" on custom_category_keywords;
create policy "custom_category_keywords_all" on custom_category_keywords
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select, insert, update, delete on custom_category_keywords to authenticated;

-- Claimed badges (Récompenses page) ------------------------------------------
-- A badge's underlying achievement (savings amount reached, a goal
-- completed) is always computed live from real data — never stored. This
-- table only records the separate, explicit "I clicked reveal on this
-- already-earned badge" action, so a claimed badge stays revealed on later
-- visits instead of re-flashing the grey-to-color animation every time.

create table if not exists claimed_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tier_id text not null,
  claimed_at timestamptz not null default now()
);

create unique index if not exists claimed_badges_user_id_tier_id_key on claimed_badges(user_id, tier_id);

alter table claimed_badges enable row level security;

drop policy if exists "claimed_badges_all" on claimed_badges;
create policy "claimed_badges_all" on claimed_badges
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select, insert, update, delete on claimed_badges to authenticated;

-- Login streak (Récompenses page) ---------------------------------------------
-- One row per (user, calendar day) they had the app open — recorded from
-- Layout.tsx on every authenticated page load, not just Récompenses, so the
-- streak reflects real app usage rather than only visits to this one page.

create table if not exists login_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_date date not null,
  created_at timestamptz not null default now()
);

create unique index if not exists login_activity_user_id_date_key on login_activity(user_id, activity_date);

alter table login_activity enable row level security;

drop policy if exists "login_activity_all" on login_activity;
create policy "login_activity_all" on login_activity
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select, insert, update, delete on login_activity to authenticated;

-- Subscriptions (Stripe plans: free / standard / premium) -------------------
-- No row = free plan, same convention as budget_settings/useIncome
-- (hasIncomeRecord) — no signup trigger needed. Deliberately NO
-- insert/update/delete grant to `authenticated`: only the Stripe webhook
-- (running with the service role key, which bypasses RLS entirely) is ever
-- allowed to write here, so a user can never grant themselves a paid plan by
-- writing to this table directly from the client.

create table if not exists subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'standard', 'premium')),
  stripe_customer_id text,
  stripe_subscription_id text,
  status text,
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

alter table subscriptions enable row level security;

drop policy if exists "subscriptions_select" on subscriptions;
create policy "subscriptions_select" on subscriptions
  for select using (auth.uid() = user_id);

grant select on subscriptions to authenticated;

-- Wishlist (liste de souhaits) ------------------------------------------------
-- Items the user wants to buy, each optionally linked to an existing savings
-- goal — `on delete set null` (not cascade) so deleting the goal just
-- unlinks the item instead of deleting it too; it still represents
-- something the user wants regardless of what happens to the goal.

create table if not exists wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  price numeric(12, 2) not null default 0 check (price >= 0),
  goal_id uuid references savings_goals(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists wishlist_items_user_id_idx on wishlist_items(user_id);

alter table wishlist_items enable row level security;

drop policy if exists "wishlist_items_all" on wishlist_items;
create policy "wishlist_items_all" on wishlist_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select, insert, update, delete on wishlist_items to authenticated;

-- User preferences (Paramètres > Personnalisation) ---------------------------
-- No row = defaults (bleu / dark / no avatar), same convention as
-- budget_settings/subscriptions — no signup trigger needed.

create table if not exists user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  accent_color text not null default 'bleu' check (accent_color in ('bleu', 'vert', 'violet', 'orange')),
  theme text not null default 'dark' check (theme in ('dark', 'light')),
  avatar_emoji text,
  updated_at timestamptz not null default now()
);

alter table user_preferences enable row level security;

drop policy if exists "user_preferences_all" on user_preferences;
create policy "user_preferences_all" on user_preferences
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select, insert, update, delete on user_preferences to authenticated;
