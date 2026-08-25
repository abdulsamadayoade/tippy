ALTER TABLE "creator" ADD COLUMN "tip_presets" jsonb;--> statement-breakpoint
ALTER TABLE "creator" ADD COLUMN "allow_custom_amount" boolean DEFAULT true NOT NULL;