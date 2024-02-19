/// <reference types="astro/client" />

declare namespace App {
	interface Locals {
		dependencies: {
			db: import('@domain/__data-access__').DB
			llm: import('@domain/__abstract__').LLM
		}
	}
}
