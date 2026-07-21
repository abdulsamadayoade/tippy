# Tippy

Every creator gets a page at `tippy.cash/username`. Supporters tip in naira, creators withdraw to their bank account.

## The problem

Nigerian creators don't have a good way to collect support from their audience. Buy Me a Coffee, Ko-fi and Patreon don't do naira: no local cards, no bank transfer, no payout to a Nigerian bank. So what actually happens is people paste their account number into their bio and hope. Nothing connects a transfer to a person or a message, there's no way to give anonymously, and the creator has no picture of how support is growing.

## What We built

A claimable tip page. Supporters open the link, pick an amount (the presets adapt to the creator's category), optionally write a note and leave their name, or tip anonymously, and pay through Monnify's checkout without leaving the page.

Creators get a dashboard: totals and averages by day, week, month and year, a scrollable feed of every tip with filters for notes and anonymous tips, and a payouts screen. They link a bank account, which is verified against the bank's own records before it can receive money, then withdraw any amount whenever they want. Or they flip a switch and get their whole balance automatically every Friday.

Sign-in is a magic link by email, no passwords. There are proper terms and privacy pages. The goal was a complete product, not a checkout demo.

## How We built it

Next.js 16 (App Router, server components, server actions), React 19, TypeScript, Tailwind v4, Drizzle ORM on Postgres, better-auth for the magic links, Resend for email. Deployed on Vercel, with a cron job for the Friday payout run.

Most of the care went into the money handling:

- The balance is always computed in SQL as settled tips minus non-failed payouts. There's no cached balance to drift.
- Creating a withdrawal locks the creator row in a transaction, so two concurrent requests can't both pass the balance check.
- Webhooks are verified with HMAC-SHA512. Sandbox events arrive unsigned, so those are checked against Monnify's query API instead of being trusted.
- Every transfer carries my own reference as an idempotency key, and a reconciliation pass re-checks any payout whose webhook went missing. If a transfer never reached Monnify, the reserved amount goes back to the balance.

## Where Monnify comes in

Both directions of the money go through Monnify.

Collections: the inline SDK runs the checkout on the tip page itself, so card details never touch my server. The transaction completion webhook settles tips, and the transaction query API is the fallback source of truth when a webhook can't be verified or never shows up.

Disbursements: when a creator links a bank account, the account validation endpoint resolves the account name from the bank, so the "Verified" badge means something. Withdrawals and the Friday sweep both go through the single transfer API, funded from the Monnify wallet, and the transfer status API plus the disbursement webhooks settle each payout as paid or failed.

Since collections settle into the same wallet that disbursements draw from, a supporter's tip turns into the creator's bank credit without any manual money movement in between.
