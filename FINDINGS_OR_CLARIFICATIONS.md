# Findings and clarifications

## Monnify payout fees

**Status:** Open — confirm with Monnify before launching withdrawals.

Tippy currently calculates the expected payout fee from a locally stored fee
schedule. That schedule did not match a sandbox transfer: Tippy expected
N10.75, while Monnify returned an actual fee of N35. The withdrawal UI no
longer presents the local calculation as an authoritative fee.

Ask the Monnify team to clarify:

1. The exact payout fee schedule applied to Tippy in sandbox and production.
2. Whether an API endpoint can return the fee before a transfer is initiated.
3. Whether Monnify can deduct its fee directly from the requested withdrawal
   amount instead of charging it separately to Tippy's wallet.
4. Whether `fee` and `totalFee` include VAT and every other payout charge.
5. How Tippy will be notified before the payout fee schedule changes.

Once confirmed, update the server-side payout calculation and its checks to
match Tippy's Monnify contract. Continue reconciling the calculated fee against
the fee Monnify returns for every completed payout.
