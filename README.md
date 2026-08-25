# Flight Planner

A lightweight flight planning application scaffolded with React, TanStack Router, TanStack Query, Supabase, and Express.

## Stack

- Frontend: React + TypeScript + Vite
- Routing: TanStack Router
- Server state: TanStack Query
- Database/client state: TanStack DB (ready for local reactive data models)
- Backend: Express + Supabase client
- Auth: Supabase Auth
- Realtime: Supabase Realtime
- Storage: Supabase Storage
- Deployment: Vercel / Cloudflare + Supabase

## Scripts

```bash
npm install
npm run dev
```

## Environment

Create the backend env file and fill in your own Supabase values:

```bash
cp backend/.env.example backend/.env
```

If you are using the current backend setup, make sure your environment includes:

```bash
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=<anon-public-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
PORT=4000
```
