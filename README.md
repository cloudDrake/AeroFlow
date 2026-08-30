# Flight Planner

[![ESLint](https://github.com/cloudDrake/AeroFlow/actions/workflows/eslint.yml/badge.svg)](https://github.com/cloudDrake/AeroFlow/actions/workflows/eslint.yml)
[![CodeQL](https://github.com/cloudDrake/AeroFlow/actions/workflows/codeql.yml/badge.svg)](https://github.com/cloudDrake/AeroFlow/actions/workflows/codeql.yml)
[![Gitleaks](https://github.com/cloudDrake/AeroFlow/actions/workflows/gitleaks.yml/badge.svg)](https://github.com/cloudDrake/AeroFlow/actions/workflows/gitleaks.yml)
[![Semgrep](https://github.com/cloudDrake/AeroFlow/actions/workflows/semgrep.yml/badge.svg)](https://github.com/cloudDrake/AeroFlow/actions/workflows/semgrep.yml)

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

### Monorepo tooling

From the repo root:

```bash
npm run lint
npm run format
npm run format:check
npm run build
```

These commands run the backend and frontend checks together so the entire monorepo is covered.

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
