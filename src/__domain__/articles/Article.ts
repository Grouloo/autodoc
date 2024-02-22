import type { Percentage } from '../__abstract__'
import { union, type InferUnion } from 'shulk'
import type { ArticleSlug } from './__types__/ArticleSlug'

type BaseSection = { title: string; content: string }

export type Source = { title: string; url?: string }

export const Section = union<{
	NotSourced: BaseSection
	Sourced: BaseSection & { sources: Source[] }
}>()
export type Section = InferUnion<typeof Section>['any']

export type Quality = {
	sourcedSections: number
	totalSections: number
	score: Percentage
}

export const articleIsGenerated = (
	art: Article,
): art is ArticleTag['Generated'] => art._state === 'Generated'

export class NotGenerated extends Error {
	static new() {
		return new NotGenerated()
	}
}

export const articleIsPending = (
	article: Article,
): article is ArticleTag['Pending'] => article._state === 'Pending'

export class AlreadyGenerated extends Error {
	static new() {
		return new AlreadyGenerated()
	}
}

export const Article = union<{
	Pending: {
		slug: ArticleSlug
		title: string
	}
	Generated: {
		slug: string
		title: string
		description: Section
		sections: Section[]
		relatedTo: { slug: ArticleSlug; title: string }[]
		quality: Quality
	}
}>()
export type Article = InferUnion<typeof Article>['any']
export type ArticleTag = InferUnion<typeof Article>
