# Zombie Finance

> A half-built copy of **QuickBooks Online**. It tracks invoices, expenses, budgets and profit. It runs, it kind of works, and it is not ready for real users.
> Your job tonight: bring it back to life.

**Replaces:** QuickBooks Online (about $38 per month) <!-- Source: https://quickbooks.intuit.com/pricing/, Simple Start plan, monthly list price $38/mo, checked 2026-10-29. The "50% off for 3 months" promo price ($19/mo) is ignored. -->

**Live demo:** https://zombie-finance.vercel.app (a shared demo: data resets whenever the server restarts)

## Run it (2 minutes)

You need [Node.js 20 or newer](https://nodejs.org).

```bash
npm install
npm run dev
```

Open http://localhost:3107.

## What works

- A dashboard (`/`) with this month's income (paid invoices), expenses, profit, outstanding invoices and budget status.
- Two charts on the dashboard: income against expenses for the last 3 months (bars), and spending by category this month (horizontal bars).
- Invoices (`/invoices`) with a status: Draft, Sent, Paid or Overdue (Overdue is worked out from the due date).
- Add clients and see the client list. Click a client (`/clients/<id>`) to see their invoices, total billed, total paid and balance owed.
- Create an invoice with line items, a tax rate, a discount and a due date. Totals add up as you type.
- Open a clean, printable invoice page at `/i/<id>` (use the Print button).
- Mark an invoice as paid by hand.
- Expenses (`/expenses`): add one (date, vendor, category, amount, payment method, note), filter by month and category, see the total, delete one.
- Vendors (`/vendors`): a list of vendors built from your expenses, with the total spent on each. Click a vendor (`/vendors/<name>`) to see only its expenses.
- Recurring expenses: tick "Repeats every month" on an expense (or turn it on in the table). A Recurring section on `/expenses` lists them with the next due date.
- Budgets (`/budgets`): a monthly budget for each category, with a bar for spent against budget. Over budget shows in red.
- Profit and loss (`/reports`): pick a month or a year and see income, expenses by category and net profit.
- A pricing page with two plans (no prices yet, you pick them).
- Fake data: 6 clients, 12 invoices, 29 expenses (August to November 2026) and 8 categories. All vendors and emails are made up.

## What's broken

See [ZOMBIE.md](ZOMBIE.md). That's the to-do list for the night. Short version: the Pay now button does not pay, the tax math is wrong, invoice numbers can repeat, the profit and loss report mixes up cash and accrual, expenses accept bad amounts and dates, delete has no undo or record, anyone can read anything, and bank sync, CSV import, receipt upload, budget alerts, email, PDF and repeat invoices are not built. Also: recurring expenses are listed but never created each month, and vendor totals split "Sunrise Office Supply" and "sunrise office supply" into two vendors.

## How we build tonight

- **Mel** ([openmel.dev](https://openmel.dev)) does the building. Open this folder in Mel and give it tasks from ZOMBIE.md.
- **Prompt Anything** ([promptanything.io](https://www.promptanything.io)) writes the prompts. Use it inside Mel for features, agents, customer success flows, code fixes and reading this repo.
- **MEL.md** in this folder tells Mel's agents what this project is and how to work on it.

## Submit

Fork this repo, push your work, and send your link through the submission form before the deadline.
Many people can pick the same app. The one that actually works wins.

## License

MIT. Use it, ship it, share it.
