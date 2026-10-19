# Eissya Physio practice portal

A private React dashboard for managing clients, physiotherapy packages, sessions, home visits, contact details, treatment reminders and payment dates.

## One-time Supabase setup (free tier)

1. Create or open the Supabase project already referenced by `.env`.
2. For a new project, open **SQL Editor**, paste `supabase/schema.sql`, and run it. If the original schema was already installed, run `supabase/migration_v2_packages_and_schedule.sql` instead.
3. Open **Authentication → Users → Add user** and create Eissya's email/password account. Do not enable public sign-up.
4. Confirm **Authentication → URL Configuration** includes the deployed admin URL.
5. Keep these environment variables in local `.env` and in Vercel:

```env
VITE_APP_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_APP_SUPABASE_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
```

The SQL enables row-level security, so a signed-in user can only access records attached to their own user ID. Never place a Supabase service-role key in this app.

## Package and scheduling rules

- Single Session: 1 session, RM120
- Trial Pack: 3 sessions, RM330
- Progress Pack: 8 sessions, RM800
- Multi-session packages use two fixed weekly days with one shared start time.
- Each appointment can be 60, 90, or 120 minutes.
- A cancelled visit advances to the next fixed slot and does not use a package session.
- Payment stays “not due” until every package session is completed, then changes to “due” until marked paid.

## Local development

```bash
npm install
npm run dev
```

For a UI-only local preview without Supabase, set `VITE_DEMO_MODE=true`. Demo records are saved only in that browser's local storage. Never enable demo mode on a public deployment.

## Deployment

The simplest arrangement is:

- Keep `eissya.site` on its current static host.
- Deploy this `admin` directory as a separate Vercel project.
- Set the Vercel project root to `admin`, build command to `npm run build`, and output directory to `dist`.
- Add the two Supabase environment variables in Vercel.
- Add `admin.eissya.site` in Vercel Domains and create the DNS record Vercel shows.

`vercel.json` preserves client-side routes such as `/dashboard` when the page is refreshed.

## Checks

```bash
npm run build
npm run lint
```
