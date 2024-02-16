import { ArticleRepository } from './ArticleRepository'
import { type DB } from '@domain/__data-access__'

export function ArticleQueries(db: DB) {
	const repository = ArticleRepository(db)

	return {
		fromSlug: (slug: string) => repository.read(slug),

		listAll: () => repository.selectAll().done(),
	}
}
