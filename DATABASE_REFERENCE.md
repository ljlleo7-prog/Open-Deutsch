# Open-Deutsch Database Reference

## Scope
Open-Deutsch shares the same Supabase instance with GPS-Homepage. This document describes the GPS-Homepage public schema, how Open-Deutsch currently uses the database, and the constraints for future development so Open-Deutsch never interferes with other products.

## GPS-Homepage Database Structure (Public Schema)
Source of truth: [20260209_clean_rebuild.sql](file:///Users/leolong/Documents/trae_projects/GPS-Homepage/supabase/migrations/20260209_clean_rebuild.sql#L1-L399) and supplemental migrations like [20240209_site_content.sql](file:///Users/leolong/Documents/trae_projects/GPS-Homepage/supabase/migrations/20240209_site_content.sql#L1-L38).

- **Profiles & Economy**
  - `profiles`: user profile linked to `auth.users`
  - `wallets`, `ledger_entries`: economy balances and ledger history
- **Content & Social**
  - `news_articles`, `news_comments`
  - `forum_posts`
  - `contact_messages`, `team_members`
  - `site_content`
- **Missions & Market**
  - `missions`, `mission_submissions`
  - `ticket_types`, `user_ticket_balances`, `ticket_listings`, `ticket_transactions`
  - `support_instruments`, `support_positions`
- **Games & Leaderboards**
  - `minigame_scores`, `minigame_prize_pools`
  - `one_lap_drivers`, `one_lap_rooms`, `one_lap_room_players`, `one_lap_races`, `one_lap_leaderboard`
  - `test_player_requests`

Security model highlights:
- RLS is enabled broadly in the public schema; most tables enforce user-ownership checks and public-read patterns for community content. See policies in [20260209_clean_rebuild.sql](file:///Users/leolong/Documents/trae_projects/GPS-Homepage/supabase/migrations/20260209_clean_rebuild.sql#L360-L399).
- An `auth.users` trigger creates `profiles` (and wallets) on sign-up. See [20260209_clean_rebuild.sql](file:///Users/leolong/Documents/trae_projects/GPS-Homepage/supabase/migrations/20260209_clean_rebuild.sql#L429-L467) and the supplemental auth trigger fixes in [20240206_robust_auth_fix.sql](file:///Users/leolong/Documents/trae_projects/GPS-Homepage/supabase/migrations/20240206_robust_auth_fix.sql#L1-L43).

## Open-Deutsch Database Usage Today
Open-Deutsch only touches `opendeutsch_*` tables and Supabase Auth session state.

### Tables
Defined in [20260305000000_init_opendeutsch.sql](file:///Users/leolong/Documents/trae_projects/Open-Deutsch/supabase/migrations/20260305000000_init_opendeutsch.sql#L1-L140) and [20260305000001_rewards_and_sso.sql](file:///Users/leolong/Documents/trae_projects/Open-Deutsch/supabase/migrations/20260305000001_rewards_and_sso.sql#L1-L54):
- `opendeutsch_users`
- `opendeutsch_lessons`
- `opendeutsch_word_pools`
- `opendeutsch_exercise_templates`
- `opendeutsch_reading_texts`
- `opendeutsch_reading_questions`
- `opendeutsch_user_progress`
- `opendeutsch_user_read_history`
- `opendeutsch_skill_metrics`
- `opendeutsch_user_interests`
- `opendeutsch_level_rules`
- `opendeutsch_xp_events`
- `opendeutsch_xp_periods`

### Current Reads/Writes
- **Exercise progress writes** to `opendeutsch_user_progress` via [saveExerciseProgress](file:///Users/leolong/Documents/trae_projects/Open-Deutsch/src/lib/db.ts#L1-L39).
- **Stats and metrics reads** from `opendeutsch_user_progress`, `opendeutsch_users`, `opendeutsch_skill_metrics`, and `opendeutsch_xp_events` in [db.ts](file:///Users/leolong/Documents/trae_projects/Open-Deutsch/src/lib/db.ts#L41-L160).
- **Onboarding interests upserts** to `opendeutsch_user_interests` in [Onboarding](file:///Users/leolong/Documents/trae_projects/Open-Deutsch/src/pages/Onboarding.tsx#L22-L63).
- **Auth session sharing** uses cookie-based storage aligned with GPS-Homepage in [supabase.ts](file:///Users/leolong/Documents/trae_projects/Open-Deutsch/src/lib/supabase.ts#L1-L59).
- **SSO profile sync** writes to `opendeutsch_users` using the shared `auth.users` session (provider metadata captured at sign-in).
- **XP rewards** write to `opendeutsch_xp_events`, update `opendeutsch_users.total_xp`, and roll up into `opendeutsch_xp_periods`.

### SSO + Rewards Columns
- `opendeutsch_users.total_xp`: running XP total for the learner.
- `opendeutsch_users.sso_provider`: auth provider identifier from Supabase.
- `opendeutsch_users.sso_subject`: SSO subject/identifier captured at sign-in.
- `opendeutsch_users.last_sign_in_at`: last sign-in timestamp for session auditing.

## Constraints for Future Development
These rules keep Open-Deutsch isolated and safe in the shared Supabase instance.

### Hard Boundaries
- Only read/write `opendeutsch_*` tables. No writes to GPS-Homepage tables.
- Do not query or modify `public.*` tables from GPS-Homepage except the shared `auth.users` session via Supabase Auth.
- Never use service-role keys on the client. All writes must pass RLS via `anon` or `authenticated` roles.
- Every new table for Open-Deutsch must use the `opendeutsch_` prefix and live in a migration under `/supabase/migrations`.

### Recommended Patterns
- Use `opendeutsch_users` as the Open-Deutsch profile extension instead of touching `public.profiles`.
- Keep static lesson content in JSON or read-only tables; store only minimal per-user progress in the database.
- Ensure all new tables have RLS enabled with ownership-based policies.
- Prefer additive migrations; avoid altering GPS-Homepage schemas, functions, or policies.

### Safety Checklist for DB Changes
- Confirm the migration only creates or alters `opendeutsch_*` tables.
- Verify RLS policies exist for all new tables.
- Avoid cross-table foreign keys that point to non-Open-Deutsch tables (except `auth.users`).
- Document every new table in this file and link to its migration.
