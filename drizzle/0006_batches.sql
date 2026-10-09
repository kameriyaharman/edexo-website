CREATE TABLE "batches" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_id" integer,
	"title" text DEFAULT '',
	"level" text DEFAULT '',
	"start_date" timestamp with time zone NOT NULL,
	"days" text DEFAULT '',
	"time_from" text DEFAULT '',
	"time_to" text DEFAULT '',
	"duration" text DEFAULT '',
	"mode" text DEFAULT 'Online' NOT NULL,
	"branch_id" integer,
	"location" text DEFAULT '',
	"seats" integer,
	"total_seats" integer,
	"badge" text DEFAULT '',
	"note" text DEFAULT '',
	"sort" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "batches" ADD CONSTRAINT "batches_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "batches" ADD CONSTRAINT "batches_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "batches_start_idx" ON "batches" USING btree ("start_date");