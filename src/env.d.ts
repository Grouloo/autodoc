/// <reference types="astro/client" />

declare namespace App {
	interface Locals {
		dependencies: {
			db: import('@domain').DB
			llm: import('@domain').LLM
		}
	}
}
