# Celebrio AI — PromptWars Event Planner

Hackathon MVP built with React, Vite, Tailwind CSS, a Vercel serverless API, Gemini, and Supabase PostgreSQL.

## Features
- AI-generated plans for weddings, birthdays, community events, and other celebrations
- Budget breakdown, editable estimates, event timeline, tasks, theme tips, and vendor ideas
- Checklist completion tracking and JSON export
- Supabase save/load/update/delete
- Demo plan for exploring the UI without credentials

## Local setup
Requires Node.js 20+.

```powershell
npm install
Copy-Item .env.example .env.local
npx vercel dev
```

Set the following in `.env.local`:
```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
GEMINI_MODEL=gemini-2.5-flash
```

For UI-only preview, run `npm run dev` and click **Try demo plan**. The Vite server alone does not execute `api/generate.js`; use `npx vercel dev` to test the serverless API locally.

## Supabase
1. Create a Supabase project.
2. Run `supabase/schema.sql` in its SQL Editor.
3. Add the project URL and anon/publishable key to `.env.local`.

## Gemini
Create a key in [Google AI Studio](https://aistudio.google.com/). Keep `GEMINI_API_KEY` server-only; never prefix it with `VITE_`.

## Deploy
Import this repository into Vercel and set all four environment variables in Project Settings. Redeploy after adding variables.

## Security warning
The SQL file intentionally has permissive anonymous policies for a controlled hackathon demo. Do not expose it publicly with real data. Before public launch, add Supabase Auth, a `user_id` column, and owner-scoped row-level security policies. Never expose the Supabase service-role key in frontend code.

## Limitations
Vendor ideas and costs are suggestions, not verified quotes or bookings. No authentication or PDF export is included in this MVP.
