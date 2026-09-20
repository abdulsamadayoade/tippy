ALTER TABLE "payout" RENAME COLUMN "provider_fee_amount" TO "creator_fee_amount";--> statement-breakpoint
ALTER TABLE "payout" DROP CONSTRAINT "payout_creator_id_creator_id_fk";
--> statement-breakpoint
ALTER TABLE "tip" DROP CONSTRAINT "tip_creator_id_creator_id_fk";
--> statement-breakpoint
ALTER TABLE "payout" ADD CONSTRAINT "payout_creator_id_creator_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creator"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tip" ADD CONSTRAINT "tip_creator_id_creator_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creator"("id") ON DELETE restrict ON UPDATE no action;