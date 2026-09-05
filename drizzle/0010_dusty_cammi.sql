CREATE TYPE "public"."adjustment_type" AS ENUM('refund', 'reversal', 'manual_credit', 'manual_debit');--> statement-breakpoint
CREATE TABLE "adjustment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid NOT NULL,
	"type" "adjustment_type" NOT NULL,
	"amount" bigint NOT NULL,
	"reason" text NOT NULL,
	"related_tip_id" uuid,
	"related_payout_id" uuid,
	"created_by_user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "creator" ADD COLUMN "payouts_frozen" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "creator" ADD COLUMN "frozen_reason" text;--> statement-breakpoint
ALTER TABLE "creator" ADD COLUMN "frozen_at" timestamp;--> statement-breakpoint
ALTER TABLE "creator" ADD COLUMN "frozen_by_user_id" text;--> statement-breakpoint
ALTER TABLE "adjustment" ADD CONSTRAINT "adjustment_creator_id_creator_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creator"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adjustment" ADD CONSTRAINT "adjustment_related_tip_id_tip_id_fk" FOREIGN KEY ("related_tip_id") REFERENCES "public"."tip"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adjustment" ADD CONSTRAINT "adjustment_related_payout_id_payout_id_fk" FOREIGN KEY ("related_payout_id") REFERENCES "public"."payout"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adjustment" ADD CONSTRAINT "adjustment_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "adjustment_creator_id_idx" ON "adjustment" USING btree ("creator_id");--> statement-breakpoint
ALTER TABLE "creator" ADD CONSTRAINT "creator_frozen_by_user_id_user_id_fk" FOREIGN KEY ("frozen_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adjustment" ADD CONSTRAINT "adjustment_amount_sign_check" CHECK (
  ("amount" <> 0) AND (
    ("type" = 'manual_credit' AND "amount" > 0) OR
    ("type" IN ('refund', 'reversal', 'manual_debit') AND "amount" < 0)
  )
);--> statement-breakpoint
CREATE TRIGGER adjustment_immutable
  BEFORE UPDATE OR DELETE ON "adjustment"
  FOR EACH ROW EXECUTE FUNCTION audit_log_block_mutation();
