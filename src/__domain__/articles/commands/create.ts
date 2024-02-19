import type { DB } from '../../__data-access__'
import { Article } from '../Article'
import { ArticleRepository } from '../ArticleRepository'
import { createArticleSlug } from '../__types__/ArticleSlug'

export type ArticleCreationForm = {
	title: string
}

export async function create(input: ArticleCreationForm, db: DB) {
	const article = Article.Pending({
		slug: createArticleSlug(input.title),
		title: input.title,
	})

	const createArticleResult = await ArticleRepository(db).insert(article)

	return createArticleResult
}
