ALTER TABLE "payout" ALTER COLUMN "amount" SET DATA TYPE numeric(14, 2);--> statement-breakpoint
ALTER TABLE "payout" ADD COLUMN "provider_fee_amount" numeric(14, 2) DEFAULT 0 NOT NULL;