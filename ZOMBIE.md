# 🧟 ZOMBIE.md: what's broken

This app is a zombie on purpose. Pick items off this list. Every box you tick gets it closer to a product we can all use and stop paying for QuickBooks.

Search the code for `ZOMBIE:` to find every planted problem.

## 1. Make it work

- [ ] The "Pay now" button on the public invoice (`/i/<id>`) gets a 501 from `app/api/invoices/[id]/pay/route.ts`. Make it open a Stripe Checkout page for that invoice.
- [ ] Tax is worked out before the discount is taken off (`lib/money.ts`). Take the discount off first, then tax the rest.
- [ ] Math uses floating point numbers, so cents can drift (`lib/money.ts`, and expense amounts). Store money as whole cents and round in one place.
- [ ] Invoice numbers can repeat (`app/api/invoices/route.ts`). Make them unique and in order, and reject a number that is already used.
- [ ] "Send by email" and "Download PDF" only show a message. Build them.
- [ ] "Repeat" (recurring invoices) is saved but nothing uses it. Build the job that makes the next invoice.
- [ ] The profit and loss report counts Sent invoices that are not paid as income (`app/api/reports/route.ts`), but the dashboard counts only paid ones. Pick cash or accrual and use it in both places.
- [ ] Expenses accept negative amounts and dates in the future (`app/api/expenses/route.ts`). Check them on the server.
- [ ] "Connect your bank" shows "Not built yet" (`app/api/bank/connect/route.ts`). Build bank sync (Plaid or similar).
- [ ] CSV import of bank transactions shows "Not built yet" (`app/api/bank/import/route.ts`). Build it.
- [ ] The receipt upload field on the expense form is turned off (`app/expenses/page.tsx`). Build it.
- [ ] "Email me when over budget" shows "Not built yet" (`app/api/budgets/alerts/route.ts`). Build the alert.
- [ ] Everything is in one currency and there is no currency field (`lib/finance.ts`). Add one.
- [ ] Recurring expenses are only listed (`recurringList` in `lib/finance.ts`). Nothing creates the next expense when it comes due, so the books miss it. Build the job that copies it each month, and a way to stop or edit the repeat.
- [ ] Vendor totals compare names exactly (`vendorTotals` in `lib/finance.ts`), so "Sunrise Office Supply" and "sunrise office supply" count as two vendors on `/vendors`. Compare trimmed, lowercase names and let the user merge vendors.
- [ ] There is no way to edit or delete a client, edit a vendor name, or edit an expense after it is saved (only delete). Build the edit screens.

## 2. Make it secure

- [ ] There is no login. Anyone who finds the URL sees all the invoices, expenses and reports. Add accounts (Supabase Auth, Clerk, Auth.js...).
- [ ] Every API route trusts whatever it's sent. Validate input on the server (numbers, dates, lengths).
- [ ] Invoice ids are guessable (`lib/db.ts`). Anyone can open `/i/1001`, `/i/1002` and read other people's invoices. Use long random ids or signed links, and check the invoice belongs to the signed-in user.
- [ ] Data lives in `data/db.json` on disk. Move it to a real database.
- [ ] Money is stored as floats, not cents (see section 1).
- [ ] There is no audit log. A sent or paid invoice can be edited with no record of who changed what. Add an audit log and lock sent invoices (issue a credit note instead).
- [ ] Deleting an expense has no "are you sure?" and leaves no record (`app/api/expenses/[id]/route.ts`). Ask first, mark it deleted instead of removing it, and log who did it.
- [ ] Receipt uploads, once built, must check file type and size, and must not be public.

## 3. Make it compliant

- [ ] Record keeping: in the US the IRS says to keep business records for at least 3 years, and up to 7 years in some cases (IRS Publication 583, and the IRS "How long should I keep records" guide). Do not let users hard delete invoices or expenses. Keep them for the right time.
- [ ] Cash or accrual: cash means you count money when it moves. Accrual means you count it when you earn it or owe it. US accounting rules (GAAP) expect you to pick one and stay with it. Make the report say which one it uses.
- [ ] Sales tax: it differs by state, and sometimes by city. After the 2018 Supreme Court ruling in South Dakota v. Wayfair, sellers can owe tax in states where they have no office. Do not make users type a rate by hand. Use a tax service (Stripe Tax, TaxJar...).
- [ ] 1099 contractor reporting: if the business pays a contractor $600 or more in a year (the IRS threshold can change, so check it), it may have to send a 1099 form. Expenses need a vendor tax ID and a "contractor" flag to make that possible.
- [ ] Invoice numbers must be unique and in order in many places. Many tax rules (for example EU VAT rules) require it. Fix the numbering.
- [ ] Card payments: use Stripe Checkout so card numbers never touch your server. That keeps you at the lightest PCI DSS level (SAQ A). Do not store card data.
- [ ] Financial data: in the US, the GLBA (Gramm-Leach-Bliley Act) sets rules for protecting customers' financial information. Encrypt it, limit who can see it, and write down your security plan.
- [ ] Business customers will ask for SOC 2 (an outside check that you protect data). Plan for logs, access control, backups and a written security policy.
- [ ] Bank connections (Plaid or similar) need their own security review. You will hold bank login tokens. Store them encrypted on the server, ask for read-only access, and let users disconnect.
- [ ] Emailing invoices and budget alerts: follow the CAN-SPAM Act (a real sender, a way to opt out for marketing mail).
- [ ] No privacy policy or terms page. Client names, emails and spending are personal data (CCPA, GDPR if you serve people in the EU).
- [ ] No way for a user to export or delete their data.

## 4. Connect Stripe

- [ ] `app/api/checkout/route.ts` returns a 501. Create a Stripe Checkout Session (test mode is fine).
- [ ] Add a webhook route that marks the account as paid.
- [ ] Lock the paid features behind the plan.

## 5. Ship it

- [ ] Deploy it (Vercel, Netlify, Railway...). The JSON file database will not survive this, so do section 2 first.
- [ ] Put the live link in your README.

## What "done" looks like

Someone who has never seen it can sign up, pay, use the main feature end to end, and come back tomorrow to find their data still there.
