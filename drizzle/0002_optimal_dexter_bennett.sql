CREATE TABLE `gamification_scores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`userId` int NOT NULL,
	`points` int DEFAULT 0,
	`level` int DEFAULT 1,
	`badges` json,
	`weeklyPoints` int DEFAULT 0,
	`monthlyPoints` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gamification_scores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `goals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`userId` int,
	`label` varchar(255) NOT NULL,
	`target` decimal(14,2) NOT NULL,
	`current` decimal(14,2) DEFAULT '0',
	`unit` varchar(20) DEFAULT 'R$',
	`period` varchar(50) DEFAULT 'monthly',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `goals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `kpis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`label` varchar(255) NOT NULL,
	`value` decimal(14,2) DEFAULT '0',
	`change` decimal(8,2) DEFAULT '0',
	`trend` enum('up','down','stable') DEFAULT 'stable',
	`category` varchar(100) DEFAULT 'Vendas',
	`unit` varchar(20) DEFAULT '',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `kpis_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `playbooks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`framework` varchar(100),
	`steps` int DEFAULT 0,
	`usageRate` int DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`content` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `playbooks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100),
	`price` decimal(12,2),
	`status` enum('active','inactive','draft') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`client` varchar(255),
	`status` enum('planning','execution','review','completed') NOT NULL DEFAULT 'planning',
	`progress` int DEFAULT 0,
	`budget` decimal(12,2),
	`spent` decimal(12,2) DEFAULT '0',
	`deadline` timestamp,
	`category` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `proposals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`dealId` int,
	`leadId` int,
	`title` varchar(255) NOT NULL,
	`value` decimal(12,2),
	`status` enum('draft','sent','viewed','negotiation','signed','rejected') NOT NULL DEFAULT 'draft',
	`sentAt` timestamp,
	`signedAt` timestamp,
	`content` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `proposals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `leads` ADD `icpScore` int;--> statement-breakpoint
ALTER TABLE `leads` ADD `icpFit` enum('A','B','C','D');--> statement-breakpoint
ALTER TABLE `users` ADD `layer` enum('direcao','gerente','operacional') DEFAULT 'operacional' NOT NULL;