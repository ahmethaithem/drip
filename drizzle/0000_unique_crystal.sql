CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`order_number` text NOT NULL,
	`idempotency_key` text NOT NULL,
	`customer_name` text NOT NULL,
	`primary_phone` text NOT NULL,
	`secondary_phone` text,
	`governorate` text NOT NULL,
	`city` text NOT NULL,
	`address` text NOT NULL,
	`building_number` text,
	`floor_apartment` text,
	`landmark` text,
	`notes` text,
	`items_json` text NOT NULL,
	`subtotal_egp` integer NOT NULL,
	`shipping_fee_egp` integer NOT NULL,
	`cod_amount_egp` integer NOT NULL,
	`status` text DEFAULT 'طلب جديد' NOT NULL,
	`exported` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_order_number_unique` ON `orders` (`order_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `orders_idempotency_key_unique` ON `orders` (`idempotency_key`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`color` text NOT NULL,
	`gender` text NOT NULL,
	`price_egp` integer NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_slug_unique` ON `products` (`slug`);