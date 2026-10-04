CREATE TABLE "faqs" (
	"id" serial PRIMARY KEY NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"group_name" text DEFAULT 'General' NOT NULL,
	"show_on_home" boolean DEFAULT false NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "files" (
	"id" serial PRIMARY KEY NOT NULL,
	"filename" text NOT NULL,
	"mime" text NOT NULL,
	"size" integer NOT NULL,
	"data" "bytea" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"department" text DEFAULT '',
	"location" text DEFAULT '',
	"employment_type" text DEFAULT 'Full-time',
	"description" text DEFAULT '',
	"requirements" text DEFAULT '',
	"sort" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trainers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"role" text DEFAULT '',
	"languages" text DEFAULT '',
	"bio" text DEFAULT '',
	"photo_id" integer,
	"sort" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "branches" ADD COLUMN "hours" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "price_offline" integer;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "who_should_join" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "outcomes" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "format" text DEFAULT 'Group / One-to-One';--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "study_material" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "exam_prep" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "timings" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "eligibility" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "faqs" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "enquiries" ADD COLUMN "type" text DEFAULT 'enquiry' NOT NULL;--> statement-breakpoint
ALTER TABLE "enquiries" ADD COLUMN "country" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "enquiries" ADD COLUMN "language" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "enquiries" ADD COLUMN "level" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "enquiries" ADD COLUMN "course_type" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "enquiries" ADD COLUMN "mode" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "enquiries" ADD COLUMN "format" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "enquiries" ADD COLUMN "exam" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "enquiries" ADD COLUMN "timing" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "enquiries" ADD COLUMN "timezone" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "enquiries" ADD COLUMN "page_url" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "enquiries" ADD COLUMN "extra" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "enquiries" ADD COLUMN "file_id" integer;--> statement-breakpoint
ALTER TABLE "languages" ADD COLUMN "category" text DEFAULT 'language' NOT NULL;--> statement-breakpoint
ALTER TABLE "languages" ADD COLUMN "title" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "languages" ADD COLUMN "tagline" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "languages" ADD COLUMN "description" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "languages" ADD COLUMN "highlights" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "languages" ADD COLUMN "exam_prep" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "languages" ADD COLUMN "fee_note" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "languages" ADD COLUMN "level_label" text DEFAULT 'Level';--> statement-breakpoint
ALTER TABLE "languages" ADD COLUMN "faqs" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "languages" ADD COLUMN "image_id" integer;--> statement-breakpoint
ALTER TABLE "languages" ADD COLUMN "icon" text DEFAULT 'languages';--> statement-breakpoint
ALTER TABLE "languages" ADD COLUMN "show_on_home" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "languages" ADD COLUMN "home_title" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "languages" ADD COLUMN "home_blurb" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "languages" ADD COLUMN "seo_title" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "languages" ADD COLUMN "seo_description" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "menu_items" ADD COLUMN "parent_id" integer;--> statement-breakpoint
ALTER TABLE "menu_items" ADD COLUMN "description" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "pages" ADD COLUMN "kind" text DEFAULT 'page' NOT NULL;--> statement-breakpoint
ALTER TABLE "pages" ADD COLUMN "group_name" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "pages" ADD COLUMN "highlights_title" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "pages" ADD COLUMN "highlights" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "pages" ADD COLUMN "faqs" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "pages" ADD COLUMN "cta_title" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "pages" ADD COLUMN "cta_text" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "pages" ADD COLUMN "disclaimer" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "pages" ADD COLUMN "show_enquiry" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "pages" ADD COLUMN "sort" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "category" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "key_points" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "faqs" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "related_language_id" integer;--> statement-breakpoint
ALTER TABLE "trainers" ADD CONSTRAINT "trainers_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "languages" ADD CONSTRAINT "languages_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_related_language_id_languages_id_fk" FOREIGN KEY ("related_language_id") REFERENCES "public"."languages"("id") ON DELETE set null ON UPDATE no action;