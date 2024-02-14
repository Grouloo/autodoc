import { $repository } from '@domain/__data-access__'
import type { Article } from './Article'

export const ArticleRepository = $repository<Article>({
	table: 'articles',
	primaryKey: 'slug',
	relations: {
		_state: false,
		slug: false,
		title: false,
		description: 'sections',
		sections: 'sections',
		relatedTo: 'articles',
		quality: 'qualities',
	},
})
