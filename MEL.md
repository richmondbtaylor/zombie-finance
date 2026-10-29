# MEL.md

This is a hackathon project: a half-built copy of QuickBooks Online (invoices, expenses, budgets and profit and loss) that we are turning into a real SaaS product the whole group can use.

## The stack

- Next.js (App Router) + TypeScript + React. Plain CSS in `app/globals.css`, no Tailwind.
- Data: `lib/db.ts` reads and writes `data/db.json`. `data/seed.json` is the starting data (clients, invoices, categories, expenses). This is temporary.
- Money math and invoice status live in `lib/money.ts`. Income, expense and budget totals, the 3 month chart numbers, vendor totals, recurring expenses and the client summary live in `lib/finance.ts`.
- API routes: `app/api/clients`, `app/api/invoices` (and `[id]`, `[id]/pay`), `app/api/expenses` (and `[id]`), `app/api/categories` (and `[id]`), `app/api/summary` (dashboard and charts), `app/api/reports` (profit and loss), `app/api/vendors`, `app/api/recurring`, `app/api/clients/[id]`.
- Stubs that return 501: `app/api/checkout`, `app/api/invoices/[id]/pay`, `app/api/bank/connect`, `app/api/bank/import`, `app/api/budgets/alerts`.
- Pages: `/` (dashboard), `/invoices`, `/invoices/new`, `/expenses`, `/budgets`, `/reports`, `/clients`, `/clients/[id]` (one client), `/vendors`, `/vendors/[name]` (one vendor), `/i/[id]` (public printable invoice), `/pricing`. Small shared pieces (page header, stat card, empty state) are in `app/components/ui.tsx`.
- Payments: Stripe is not connected.
- Runs on port 3107.

## The job

Work through `ZOMBIE.md` in order: make it work, make it secure, make it compliant, connect Stripe, ship it.
Every planted problem in the code is marked with a `ZOMBIE:` comment.

## Rules for agents

- Keep it running. Run `npm run build` after each change and fix what breaks.
- Never commit secrets. Keys go in `.env.local` (it is git-ignored).
- Use Stripe test mode keys only.
- Money rules: whole cents only, discount before tax, unique invoice numbers, expense amounts above zero.
- Pick one accounting method (cash or accrual) and use it on the dashboard and the report.
- Never hard delete financial records. Keep an audit log.
- Vendor names should be compared trimmed and lowercase. Recurring expenses should create the next expense on their due date.
- When you fix a `ZOMBIE:` item, delete its comment and tick its box in `ZOMBIE.md`.
- Small commits with plain messages.
