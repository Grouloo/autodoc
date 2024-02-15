import type { Percentage } from '@domain/__abstract__/__types__'
import { union, type InferUnion } from 'shulk'
import type { ArticleSlug } from './__types__/ArticleSlug'

type BaseSection = { title: string; content: string }

export type Source = { title: string; url: string }

const Section = union<{
	NotSourced: BaseSection
	Sourced: BaseSection & { sources: Source[] }
}>()
export type Section = InferUnion<typeof Section>['any']

export type Quality = {
	sourcedSections: number
	totalSections: number
	score: Percentage
}

export const Article = union<{
	Pending: {
		slug: ArticleSlug
		title: string
	}
	Created: {
		slug: string
		title: string
		description: Section
		sections: Section[]
		relatedTo: { slug: ArticleSlug; title: string }[]
		quality: Quality
	}
}>()
export type Article = InferUnion<typeof Article>['any']
