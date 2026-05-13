# PSK Elektro Dashboard

Moderná dark mode aplikácia pre správu stavieb, úloh, termínov, poznámok a fotiek.

## Spustenie

1. `npm install`
2. Skopírujte `.env.example` do `.env` a doplňte Supabase údaje
3. `npm run dev`

## Supabase

- SQL schéma: `supabase/schema.sql`
- Storage bucket pre fotky: `project-photos`
- Tabuľky: `users`, `projects`, `tasks`, `task_updates`, `project_notes`, `project_photos`, `calendar_events`

Ak nie je Supabase nakonfigurované, aplikácia automaticky používa mock dáta.
