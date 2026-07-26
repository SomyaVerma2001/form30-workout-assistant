CREATE TABLE `workout_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`entry_date` text NOT NULL,
	`weight_kg` real NOT NULL,
	`plan_day` integer NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`duration_minutes` integer DEFAULT 0 NOT NULL,
	`completed_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `workout_logs_entry_date_unique` ON `workout_logs` (`entry_date`);