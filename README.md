# Ewind

A free tool to plan events from start to finish: contracts, payments, deadlines, guests, seating chart and quote comparison, all in one place.

**Production:** [ewind.com.br](https://ewind.com.br) (the interface is in Brazilian Portuguese; the product is aimed at the Brazilian market)

---

## Product vision

Ewind is split into two phases:

- **Phase 1 (current):** a free event management SaaS for organizers (B2C). It is today's focus and what is already live.
- **Phase 2 (in progress):** a marketplace for venues and suppliers (B2B), where advertisers will be able to promote their services and manage their own contracts on the same platform.

The strategy enters through demand (organizers using the free tool) and then activates supply (the marketplace), avoiding the cold-start problem of an empty marketplace.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite 5 |
| Styling | Plain CSS (no UI framework) |
| Routing | `useState` + History API (no react-router, to keep the bundle small) |
| Backend | Supabase (PostgreSQL + Auth + Storage) |
| Serverless functions | Vercel Functions (`/api`) |
| AI | Anthropic API (contract extraction, on standby) |
| Hosting | Vercel (automatic deploy on push to the `main` branch) |
| UI language | Brazilian Portuguese |

---

## Features (Phase 1, in production)

The core is the **event manager**, with a six-tab dashboard per event:

- **Overview**: financial summary, contracts per supplier with risky clauses highlighted, payment installments tracked as paid/pending/overdue.
- **Timeline**: horizontal chronological view of the milestones (payments, service dates, the event day).
- **Guests**: categories (adult/child/baby), pricing rule (full/half/free), Excel import with a template, counters and cost estimate.
- **Checklist**: tasks with countdown deadlines calculated from the event date; a suggested wedding template.
- **Quotes**: side-by-side comparison of quotes (venues, suppliers) with the lowest price highlighted.
- **Seating chart**: tables with variable capacity and confirmed guests assigned by drag-and-drop (desktop) or tap (mobile).

Cross-cutting features: contracts with PDF attachments (private bucket, signed URLs), AI extraction of contract data (on standby as a cost decision), and centralized error feedback with modal confirmation.

---

## Project structure

```
src/
  pages/         Pages (routes), including the event manager and the public pages
  components/    Reusable components and the event dashboard tabs
  lib/           Utilities (e.g. PDF text extraction)
  App.tsx        Routing and navigation
api/
  extract-contract.ts   Serverless function for AI contract extraction
sql/
  01-events.sql ... 10-space-addresses.sql   Database schema, numbered in the order it is applied
```

Main Supabase tables: `events`, `event_contracts`, `contract_payments`, `event_guests`, `event_tasks`, `event_comparisons`, `comparison_options`, `event_tables`, `agenda_reminders`. All of them use Row Level Security by `owner_id` (each user can only access their own data). A space's exact address lives in `space_addresses`, readable only by its host and by users who requested a quote.

---

## Running locally

Requirements: Node.js 18+ and a Supabase account.

```bash
npm install

# required environment variables
# VITE_SUPABASE_URL
# VITE_SUPABASE_ANON_KEY

npm run dev      # development server
npm run build    # production build
npm run preview  # preview the build
```

The AI extraction function requires `ANTHROPIC_API_KEY` set in the Vercel environment.

---

## Deploy

Deploys are automatic: every push to the `main` branch triggers a build on Vercel. Database changes are applied manually in the Supabase SQL Editor, running the files in `sql/` in numeric order. Every script is idempotent (safe to run more than once). They reference a `public.profiles` table that comes from the original marketplace schema, which is not in this folder.

---

## Status

The platform is live and under continuous improvement. Phase 1 (event management) is working; Phase 2 (marketplace) is in progress.
