CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"enquiry_id" integer,
	"course_id" integer,
	"course_title" text NOT NULL,
	"mode" text DEFAULT '',
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'INR' NOT NULL,
	"order_id" text NOT NULL,
	"payment_id" text,
	"status" text DEFAULT 'created' NOT NULL,
	"name" text DEFAULT '',
	"email" text DEFAULT '',
	"phone" text DEFAULT '',
	"method" text DEFAULT '',
	"error" text DEFAULT '',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payments_order_id_unique" UNIQUE("order_id")
);
--> statement-breakpoint
CREATE INDEX "payments_enquiry_idx" ON "payments" USING btree ("enquiry_id");