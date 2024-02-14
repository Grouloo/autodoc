/// <reference types="astro/client" />

declare namespace App {
	interface Locals {
		db: import('@domain/__abstract__').DB
	}
}
