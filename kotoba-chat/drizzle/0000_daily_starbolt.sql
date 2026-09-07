CREATE TABLE `blocks` (
	`user_id` text NOT NULL,
	`target_id` text NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `target_id`),
	FOREIGN KEY (`user_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`target_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_blocks_target` ON `blocks` (`target_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `members` (
	`room_id` text NOT NULL,
	`user_id` text NOT NULL,
	`state` text NOT NULL,
	`inviter_id` text NOT NULL,
	`invited_at` integer NOT NULL,
	`last_read` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`room_id`, `user_id`),
	FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`inviter_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_members_user_state` ON `members` (`user_id`,`state`);--> statement-breakpoint
CREATE TABLE `messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`client_id` text NOT NULL,
	`room_id` text NOT NULL,
	`user_id` text NOT NULL,
	`japanese` text NOT NULL,
	`payload` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_messages_room_id` ON `messages` (`room_id`,`id`);--> statement-breakpoint
CREATE INDEX `idx_messages_user_time` ON `messages` (`user_id`,`created_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_messages_client` ON `messages` (`user_id`,`client_id`);--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`auth_key` text NOT NULL,
	`nickname` text NOT NULL,
	`language` text NOT NULL,
	`level` text NOT NULL,
	`avatar` text NOT NULL,
	`available` integer DEFAULT 1 NOT NULL,
	`last_seen` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `profiles_auth_key_unique` ON `profiles` (`auth_key`);--> statement-breakpoint
CREATE INDEX `idx_profiles_presence` ON `profiles` (`available`,`last_seen`);--> statement-breakpoint
CREATE TABLE `rooms` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`owner_id` text NOT NULL,
	`dm_key` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `rooms_dm_key_unique` ON `rooms` (`dm_key`);