CREATE TABLE `account_rate_limits` (
	`bucket` text PRIMARY KEY NOT NULL,
	`hits` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_account_rates_expiry` ON `account_rate_limits` (`expires_at`);--> statement-breakpoint
CREATE TABLE `account_sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`auth_key` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`session_epoch` integer NOT NULL,
	FOREIGN KEY (`auth_key`) REFERENCES `email_accounts`(`auth_key`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_account_sessions_auth` ON `account_sessions` (`auth_key`);--> statement-breakpoint
CREATE INDEX `idx_account_sessions_expiry` ON `account_sessions` (`expires_at`);--> statement-breakpoint
CREATE TABLE `email_accounts` (
	`auth_key` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`recovery_hash` text NOT NULL,
	`session_epoch` integer DEFAULT 1 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `email_accounts_email_unique` ON `email_accounts` (`email`);