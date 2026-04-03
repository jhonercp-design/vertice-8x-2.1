ALTER TABLE `companies` ADD `stripeCustomerId` varchar(255);--> statement-breakpoint
ALTER TABLE `companies` ADD `stripeSubscriptionId` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `stripeCustomerId` varchar(255);