ALTER TABLE "bank_account" ADD COLUMN "revision" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "bank_account" ADD COLUMN "verification_status" text DEFAULT 'unverified' NOT NULL;--> statement-breakpoint
ALTER TABLE "bank_account" ADD COLUMN "verification_environment" text;--> statement-breakpoint
ALTER TABLE "bank_account" ADD COLUMN "verification_revision" integer;--> statement-breakpoint
ALTER TABLE "bank_account" ADD COLUMN "verified_at" timestamp;--> statement-breakpoint
ALTER TABLE "bank_account" ADD COLUMN "verification_reference" text;--> statement-breakpoint
ALTER TABLE "bank_account" ADD COLUMN "verification_attempt_id" uuid;--> statement-breakpoint
ALTER TABLE "bank_account" ADD COLUMN "verification_consent_at" timestamp;--> statement-breakpoint
ALTER TABLE "bank_account" ADD COLUMN "verification_consent_version" text;--> statement-breakpoint
ALTER TABLE "payout" ADD COLUMN "actual_provider_fee_amount" numeric(14, 2);--> statement-breakpoint
ALTER TABLE "payout" ADD COLUMN "environment" text;--> statement-breakpoint
ALTER TABLE "payout" ADD COLUMN "fee_policy_version" text DEFAULT 'legacy' NOT NULL;--> statement-breakpoint
ALTER TABLE "payout" ADD COLUMN "destination_revision" integer;--> statement-breakpoint
ALTER TABLE "payout" ADD COLUMN "destination_bank_name" text;--> statement-breakpoint
ALTER TABLE "payout" ADD COLUMN "destination_last4" text;