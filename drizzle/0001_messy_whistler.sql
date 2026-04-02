CREATE TABLE `activities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`leadId` int,
	`dealId` int,
	`userId` int,
	`type` enum('note','call','email','meeting','whatsapp','proposal','diagnostic','agc_alert','task','status_change') NOT NULL,
	`title` varchar(255),
	`description` text,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agc_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`severity` enum('info','warning','critical') NOT NULL DEFAULT 'info',
	`category` varchar(100) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`recommendation` text,
	`data` json,
	`acknowledged` boolean DEFAULT false,
	`acknowledgedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `agc_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`userId` int NOT NULL,
	`type` enum('copilot','agc') NOT NULL DEFAULT 'copilot',
	`title` varchar(255),
	`messages` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `automations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`trigger` enum('lead_status_change','deal_stage_change','agc_alert','scheduled','manual') NOT NULL,
	`triggerConfig` json,
	`action` enum('send_whatsapp','create_task','send_email','notify_team','update_lead') NOT NULL,
	`actionConfig` json,
	`isActive` boolean NOT NULL DEFAULT true,
	`executionCount` int DEFAULT 0,
	`lastExecutedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `automations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `companies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`cnpj` varchar(20),
	`segment` varchar(100),
	`website` varchar(500),
	`logoUrl` text,
	`ownerId` int,
	`plan` enum('trial','starter','professional','enterprise') NOT NULL DEFAULT 'trial',
	`maxSeats` int NOT NULL DEFAULT 3,
	`status` enum('active','suspended','cancelled') NOT NULL DEFAULT 'active',
	`trialEndsAt` timestamp,
	`maturityScore` int,
	`revenueGap` decimal(12,2),
	`projectedRoi` decimal(12,2),
	`onboardingData` json,
	`onboardingCompleted` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `companies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `deals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`leadId` int,
	`assignedTo` int,
	`title` varchar(255) NOT NULL,
	`value` decimal(12,2),
	`stage` enum('prospecting','qualification','proposal','negotiation','closing','won','lost') NOT NULL DEFAULT 'prospecting',
	`probability` int DEFAULT 0,
	`expectedCloseDate` timestamp,
	`closedAt` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `deals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `diagnostics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`userId` int NOT NULL,
	`type` varchar(100) NOT NULL,
	`answers` json,
	`maturityScore` int,
	`revenueGap` decimal(12,2),
	`projectedRoi` decimal(12,2),
	`analysis` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `diagnostics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`assignedTo` int,
	`name` varchar(255) NOT NULL,
	`email` varchar(320),
	`phone` varchar(30),
	`company` varchar(255),
	`position` varchar(150),
	`source` varchar(100),
	`status` enum('new','contacted','qualified','proposal','negotiation','won','lost') NOT NULL DEFAULT 'new',
	`value` decimal(12,2),
	`notes` text,
	`tags` json,
	`lastContactAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `licenses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`plan` enum('trial','starter','professional','enterprise') NOT NULL,
	`monthlyPrice` decimal(10,2),
	`startDate` timestamp NOT NULL DEFAULT (now()),
	`endDate` timestamp,
	`status` enum('active','expired','cancelled') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `licenses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trail_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`userId` int NOT NULL,
	`pillar` enum('anatomia','arquitetura','ativacao','aceleracao','autoridade') NOT NULL,
	`stepIndex` int NOT NULL DEFAULT 0,
	`totalSteps` int NOT NULL DEFAULT 5,
	`status` enum('locked','in_progress','completed') NOT NULL DEFAULT 'locked',
	`completedAt` timestamp,
	`data` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trail_progress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `whatsapp_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`sessionId` int NOT NULL,
	`leadId` int,
	`remoteJid` varchar(100) NOT NULL,
	`fromMe` boolean NOT NULL DEFAULT false,
	`messageType` varchar(50) DEFAULT 'text',
	`content` text,
	`mediaUrl` text,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`status` enum('sent','delivered','read','failed') NOT NULL DEFAULT 'sent',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `whatsapp_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `whatsapp_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`sessionName` varchar(100) NOT NULL,
	`phoneNumber` varchar(30),
	`status` enum('disconnected','connecting','connected') NOT NULL DEFAULT 'disconnected',
	`qrCode` text,
	`lastConnectedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `whatsapp_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `companyId` int;--> statement-breakpoint
ALTER TABLE `users` ADD `avatarUrl` text;