-- WhatsApp opt-in step (between signup and onboarding — src/pages/WhatsappOptIn.tsx).
-- Same table/convention as pay_frequency/next_payday/savings_why: one row
-- per user, null/false column = never set. whatsapp_number is stored in
-- E.164 format (e.g. "+15145550199"); whatsapp_consent/whatsapp_consent_at
-- record the explicit Loi 25 / LCAP consent captured alongside it — consent
-- is only ever written true (there's no opt-out UI; see usePreferences.tsx's
-- setWhatsappOptIn), so a true value with no corresponding timestamp should
-- never occur. RLS already covers these via the existing row-level
-- "user_preferences_all" policy (auth.uid() = user_id) — no policy change
-- needed, a new column on an already-RLS'd table inherits the same
-- row-level restriction automatically.

alter table user_preferences add column if not exists whatsapp_number text;
alter table user_preferences add column if not exists whatsapp_consent boolean not null default false;
alter table user_preferences add column if not exists whatsapp_consent_at timestamptz;
