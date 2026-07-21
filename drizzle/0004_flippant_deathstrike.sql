ALTER TABLE "tip" DROP CONSTRAINT "tip_payout_id_payout_id_fk";
--> statement-breakpoint
DROP INDEX "tip_payout_id_idx";--> statement-breakpoint
ALTER TABLE "tip" DROP COLUMN "payout_id";