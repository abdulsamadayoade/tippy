# Tippy

Tipping for Nigerian creators. Claim `tippy.cash/yourname`, share it, get tipped in naira through [Monnify](https://monnify.com), withdraw to your bank account.

Built for the Monnify hackathon.

## Features

- Public tip page per creator: presets by category, custom amounts, notes, anonymous tipping, Monnify inline checkout
- Dashboard with totals by day/week/month/year, an infinite tip feed with filters, and payout management
- Bank accounts are verified with Monnify name enquiry before they can receive payouts
- Withdraw any amount, or enable automatic full-balance payouts every Friday (Vercel cron)
- Magic-link sign in (better-auth + Resend), terms and privacy pages

## Stack

Next.js 16 (App Router, server actions), React 19, TypeScript, Tailwind v4, Drizzle ORM, Postgres, Vercel.

## Running it

```bash
npm install
cp .env.example .env   # then fill in the values below
npm run db:migrate
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

### Environment

| Variable                                                           | Purpose                                                            |
| ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| `DATABASE_URL`                                                     | Postgres connection string                                         |
| `BETTER_AUTH_SECRET` / `BETTER_AUTH_URL`                           | Auth session signing and base URL                                  |
| `RESEND_API_KEY` / `EMAIL_FROM`                                    | Sign-in link, tip receipt, and creator notification emails         |
| `SUPPORT_EMAIL`                                                    | Destination for support-form messages and abuse reports (defaults to hello@tippy.cash) |
| `BLOB_STORE_ID` / `BLOB_READ_WRITE_TOKEN`                          | Avatar uploads (Vercel Blob). Two stores: production token scoped to Production, staging token to Preview + Development (and local `.env`) |
| `MONNIFY_API_KEY` / `MONNIFY_SECRET_KEY` / `MONNIFY_CONTRACT_CODE` | Monnify credentials                                                |
| `MONNIFY_BASE_URL`                                                 | `https://sandbox.monnify.com` (default) or the live URL            |
| `MONNIFY_SOURCE_ACCOUNT_NUMBER`                                    | Wallet account number that funds disbursements                     |
| `CRON_SECRET`                                                      | Bearer token for `/api/cron/payouts`. Vercel sends it on cron runs |

### Monnify setup

1. Create a sandbox account and grab the API key, secret and contract code from the dashboard.
2. Set up the wallet under Transfers on the dashboard and put its account number in `MONNIFY_SOURCE_ACCOUNT_NUMBER`.
3. Email Monnify support to disable transfer OTP for the account. Automated disbursements can't answer an emailed OTP.
4. Point the Transaction Completion and Disbursement webhook URLs at `<your-url>/api/webhooks/monnify`. Locally you'll need a tunnel like ngrok. Without webhooks things still settle through reconciliation, just slower.

To complete a test tip payment in sandbox, use Monnify's simulated banking app: [https://websim.sdk.monnify.com/?#/bankingapp](https://websim.sdk.monnify.com/?#/bankingapp). Sandbox charges no real card or bank account — pay through the simulator to mark a transaction as successful.

### Database

```bash
npm run db:generate   # new migration after schema changes
npm run db:migrate    # apply migrations
npm run db:studio     # browse data
```

## How the money moves

Tippy currently keeps a 0% platform fee. The creator is credited the full tip amount, while the supporter bears Monnify's separate payment-processing charge under the Monnify contract. The platform fee and resulting net are still computed once at tip creation and stamped on the row, so a later code change to the rate never rewrites historical tips. Balance math only ever sums `tip.net_amount`, never the gross.

Tips are inserted as `pending` and only marked successful by the signed transaction webhook, or by Monnify's query API — used when the webhook can't be verified, and by the post-payment status poll so checkout confirms even if the webhook is delayed or undeliverable (e.g. local dev without a tunnel). The available balance is settled tips net of the platform fee, minus non-failed payouts, plus signed adjustments — one formula in `src/lib/ledger.ts`, computed in SQL.

A withdrawal inserts a `pending` payout inside a transaction that locks the creator row, so the balance check can't be raced. Then the Monnify single transfer API is called with a unique `TIPPY-PO-` reference, which doubles as an idempotency key. Disbursement webhooks move the payout to `paid` or `failed`, and a reconciliation pass on the payouts page re-checks anything stale. A transfer that never reached Monnify gets failed after a grace period, which releases the reserved amount back to the balance.

## Layout

```
src/
  app/           # routes: (auth), (creator) dashboard, (legal), [username], api/
  modules/       # feature slices: profile, overview, tips, payouts, auth, legal
  lib/           # db, monnify client, payout orchestration, session, queries
  components/    # shared UI, icons, layout
  data/          # constants: presets, banks, limits
```
