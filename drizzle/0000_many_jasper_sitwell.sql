CREATE TABLE `feedback` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`kind` text NOT NULL,
	`message` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `players` (
	`id` text PRIMARY KEY NOT NULL,
	`save` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`verified` integer DEFAULT 1 NOT NULL,
	`public_rank` integer DEFAULT 0 NOT NULL,
	`alias` text NOT NULL,
	`xp` integer DEFAULT 0 NOT NULL,
	`wins` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `players_rank` ON `players` (`public_rank`,`verified`,`xp`);