import { $repository, type Schema } from '@domain/__data-access__'
import type { Article, Quality, Section, Source } from './Article'

const SourceSchema: Schema<Source> = {
	table: 'sources',
	primaryKey: 'id',
	relations: {
		title: false,
		url: false,
	},
}

const SectionSchema: Schema<Section> = {
	table: 'sections',
	primaryKey: 'id',
	relations: {
		_state: false,
		title: false,
		content: false,
		sources: SourceSchema,
	},
}

const QualitySchema: Schema<Quality> = {
	table: 'qualities',
	primaryKey: 'id',
	relations: {
		sourcedSections: false,
		totalSections: false,
		score: false,
	},
}

export const ArticleRepository = $repository<Article>({
	table: 'articles',
	primaryKey: 'slug',
	relations: {
		_state: false,
		slug: false,
		title: false,
		description: SectionSchema,
		sections: SectionSchema,
		relatedTo: {
			table: 'articles',
			primaryKey: 'slug',
			relations: {
				slug: false,
				title: false,
			},
		},
		quality: QualitySchema,
	},
})
