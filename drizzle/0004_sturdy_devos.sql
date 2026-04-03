CREATE TABLE `call_analyses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`transcriptionId` int NOT NULL,
	`companyId` int NOT NULL,
	`sentiment` varchar(50),
	`sentimentScore` decimal(3,2),
	`keyPoints` json,
	`strengths` json,
	`weaknesses` json,
	`frameworkEvaluation` json,
	`recommendations` json,
	`score` int,
	`analysisText` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `call_analyses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `call_transcriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`userId` int NOT NULL,
	`leadId` int,
	`dealId` int,
	`title` varchar(255) NOT NULL,
	`audioUrl` text,
	`transcription` text,
	`duration` int,
	`recordedAt` timestamp,
	`status` enum('pending','transcribed','analyzed','archived') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `call_transcriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `framework_evaluations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`analysisId` int NOT NULL,
	`framework` varchar(100) NOT NULL,
	`compliance` int DEFAULT 0,
	`details` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `framework_evaluations_id` PRIMARY KEY(`id`)
);
