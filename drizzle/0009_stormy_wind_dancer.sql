CREATE TABLE "webhook_event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" text DEFAULT 'monnify' NOT NULL,
	"event_type" text,
	"signature_valid" boolean NOT NULL,
	"reference" text,
	"payload" jsonb NOT NULL,
	"body_hash" text NOT NULL,
	"received_count" integer DEFAULT 1 NOT NULL,
	"processing_outcome" text,
	"processing_error" text,
	"received_at" timestamp DEFAULT now() NOT NULL,
	"processed_at" timestamp,
	CONSTRAINT "webhook_event_body_hash_unique" UNIQUE("body_hash")
);
--> statement-breakpoint
CREATE INDEX "webhook_event_reference_idx" ON "webhook_event" USING btree ("reference");--> statement-breakpoint
CREATE INDEX "webhook_event_received_at_idx" ON "webhook_event" USING btree ("received_at");