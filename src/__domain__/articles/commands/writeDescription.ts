import type { DB } from '@__domain__/__data-access__'
import type { ArticleSlug } from '../__types__/ArticleSlug'
import { ArticleQueries } from '../ArticleQueries'
import { Article, NotGenerated, Section, articleIsPending } from '../Article'
import { ArticleRepository } from '../ArticleRepository'
import type { NotFound, UnexpectedError } from '@__domain__/__abstract__'
import type { AsyncResult } from 'shulk'

export type WriteDescriptionForm = {
	description: string
}

export async function writeDescription(
	slug: ArticleSlug,
	input: WriteDescriptionForm,
	dependencies: { db: DB },
): AsyncResult<UnexpectedError | NotFound | NotGenerated, Article> {
	const { db } = dependencies

	const readArticleResult = await ArticleQueries(db).fromSlug(slug)

	const updateArticleRsult = readArticleResult
		.filterType(articleIsPending, NotGenerated.new)
		.map((article) =>
			Article.Generated({
				...article,
				description: Section.NotSourced({
					title: 'Description',
					content: input.description,
				}),
				sections: [],
				relatedTo: [],
				quality: {
					sourcedSections: 0,
					totalSections: 1,
					score: 0,
				},
			}),
		)
		.flatMapAsync(ArticleRepository(db).update)

	return updateArticleRsult
}
