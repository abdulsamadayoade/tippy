ALTER TABLE "creator" DROP CONSTRAINT "creator_category_id_category_id_fk";
--> statement-breakpoint
ALTER TABLE "creator" ADD CONSTRAINT "creator_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category" ADD CONSTRAINT "category_name_unique" UNIQUE("name");