CREATE TABLE `frontend_codes` (
	`code_hash` text PRIMARY KEY NOT NULL,
	`auth_key` text NOT NULL,
	`challenge` text NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_frontend_codes_user_expiry` ON `frontend_codes` (`auth_key`,`expires_at`);--> statement-breakpoint
CREATE TABLE `frontend_sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`auth_key` text NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_frontend_sessions_expiry` ON `frontend_sessions` (`expires_at`);--> statement-breakpoint
CREATE TABLE `study_progress` (
	`auth_key` text NOT NULL,
	`story_id` text NOT NULL,
	`step` integer NOT NULL,
	`due_at` integer NOT NULL,
	`reviewed_at` integer NOT NULL,
	`attempts` integer NOT NULL,
	PRIMARY KEY(`auth_key`, `story_id`)
);
