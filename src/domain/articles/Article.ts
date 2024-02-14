import type { Percentage } from '@domain/__abstract__/__types__'
import { union, type InferUnion } from 'shulk'

type BaseSection = { title: string; content: string }

type Source = { title: string; url: string }

const Section = union<{
	NotSourced: BaseSection
	Sourced: BaseSection & { sources: Source[] }
}>()
type Section = InferUnion<typeof Section>['any']

export const Article = union<{
	Pending: {
		slug: string
		title: string
	}
	Created: {
		slug: string
		title: string
		description: Section
		sections: Section[]
		relatedTo: { slug: string; title: string }[]
		quality: {
			sourcedSections: number
			totalSections: number
			score: Percentage
		}
	}
}>()
export type Article = InferUnion<typeof Article>['any']
