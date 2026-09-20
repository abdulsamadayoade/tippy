# Tippy

Tipping for Nigerian creators. Claim `tippy.cash/yourname`, share it, get tipped in naira through [Monnify](https://monnify.com), withdraw to your bank account.

Built for the Monnify hackathon.

## Features

- Public tip page per creator: presets by category, custom amounts, notes, anonymous tipping, Monnify inline checkout
- Dashboard with totals by day/week/month/year, an infinite tip feed with filters, and payout management
- Bank accounts use Monnify name enquiry; creators must also pass BVN-to-bank matching before payouts
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

| Variable                                                           | Purpose                                                                                                                                    |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `DATABASE_URL`                                                     | Postgres connection string                                                                                                                 |
| `BETTER_AUTH_SECRET` / `BETTER_AUTH_URL`                           | Auth session signing and base URL                                                                                                          |
| `RESEND_API_KEY` / `EMAIL_FROM`                                    | Sign-in link, tip receipt, and creator notification emails                                                                                 |
| `SUPPORT_EMAIL`                                                    | Destination for support-form messages and abuse reports (defaults to hello@tippy.cash)                                                     |
| `BLOB_STORE_ID` / `BLOB_READ_WRITE_TOKEN`                          | Avatar uploads (Vercel Blob). Two stores: production token scoped to Production, staging token to Preview + Development (and local `.env`) |
| `MONNIFY_API_KEY` / `MONNIFY_SECRET_KEY` / `MONNIFY_CONTRACT_CODE` | Monnify credentials                                                                                                                        |
| `MONNIFY_BASE_URL`                                                 | `https://sandbox.monnify.com` (default) or the live URL                                                                                    |
| `MONNIFY_SOURCE_ACCOUNT_NUMBER`                                    | Wallet account number that funds disbursements                                                                                             |
| `CRON_SECRET`                                                      | Bearer token for `/api/cron/payouts`. Vercel sends it on cron runs                                                                         |

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

Every settled tip is credited to the creator in full. Tippy does not deduct a fee from tips; the supporter bears Monnify's separate payment-processing charge under the Monnify contract.

Tips are inserted as `pending` and only marked successful by the signed transaction webhook, or by Monnify's query API — used when the webhook can't be verified, and by the post-payment status poll so checkout confirms even if the webhook is delayed or undeliverable (e.g. local dev without a tunnel). The available balance is settled tips, minus non-failed bank transfers and their fixed creator transfer fees, plus signed adjustments — one formula in `src/lib/ledger.ts`, computed in SQL.

A withdrawal inserts a `pending` payout inside a transaction that locks the creator row, so the balance check can't be raced. The creator's selected balance amount is split into the bank transfer and the quoted creator fee. Live fees are ₦10 below ₦10,000, ₦20 from ₦10,000 to ₦49,999.99, and ₦40 from ₦50,000; the tier is based on the requested debit before subtracting the fee. Sandbox uses a flat ₦35. For example, a live ₦10,000 withdrawal sends ₦9,980 and charges the creator ₦20. No extra VAT is added under the response-based policy (Monnify's public page labels its rates VAT-exclusive; provider discrepancies are monitored).

The quote binds the amount, fee policy, environment and bank revision. Confirmation rechecks these under the creator lock. A unique `TIPPY-PO-` reference identifies the transfer. `creatorFeeAmount` and the bank amount remain fixed; `actualProviderFeeAmount` is recorded separately from submission, webhooks or reconciliation. Tippy bears any excess provider fee; a lower fee is recorded as a difference without an automatic creator refund. Failed payouts release the full reservation. Late fees can update paid records without another payment email.

### Creator verification

After linking a bank account, creators consent to a BVN-to-bank match on the Payouts page. Only an explicit full match authorizes payouts for that bank revision and environment. Changing bank code or account number invalidates verification. Manual, Friday and admin payouts enforce the same eligibility rules; existing creators start unverified and can continue receiving tips.

Monnify identity APIs are live-only. Sandbox uses these explicit simulations, not real identities:

| Test BVN      | Result                  |
| ------------- | ----------------------- |
| `00000000001` | Full match              |
| `00000000002` | Mismatch                |
| `00000000003` | Retryable service error |

Other sandbox inputs do not verify. Sandbox results cannot authorize live payouts.

### Checks

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```

## Layout

```
src/
  app/           # routes: (auth), (creator) dashboard, (legal), [username], api/
  modules/       # feature slices: profile, overview, tips, payouts, auth, legal
  lib/           # db, monnify client, payout orchestration, session, queries
  components/    # shared UI, icons, layout
  data/          # constants: presets, banks, limits
```
