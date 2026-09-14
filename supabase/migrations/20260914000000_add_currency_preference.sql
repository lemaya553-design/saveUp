-- Display currency preference (Paramètres) — cosmetic formatting only, never
-- a conversion rate. Stored amounts never change; this only picks which
-- Intl.NumberFormat currency code renders them. Same "one row per user"
-- table as accent_color/theme, same default-on-no-row convention.

alter table user_preferences add column if not exists currency text not null default 'CAD'
  check (currency in ('CAD', 'USD', 'EUR', 'GBP', 'CHF'));
