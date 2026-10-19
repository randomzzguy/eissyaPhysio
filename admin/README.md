# Eissya Physio practice portal

A private React dashboard for managing clients, physiotherapy packages, sessions, home visits, contact details, treatment reminders and payment dates.

## One-time Supabase setup (free tier)

1. Create or open the Supabase project already referenced by `.env`.
2. Open **SQL Editor**, paste `supabase/schema.sql`, and run it.
3. Open **Authentication → Users → Add user** and create Eissya's email/password account. Do not enable public sign-up.
4. Confirm **Authentication → URL Configuration** includes the deployed admin URL.
5. Keep these environment variables in local `.env` and in Vercel:

```env
VITE_APP_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_APP_SUPABASE_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
```

The SQL enables row-level security, so a signed-in user can only access records attached to their own user ID. Never place a Supabase service-role key in this app.

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
