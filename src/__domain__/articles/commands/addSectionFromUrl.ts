import type { LLM, NotFound, UnexpectedError } from '@__domain__/__abstract__'
import type { DB } from '@__domain__/__data-access__'
import type { ArticleSlug } from '../__types__/ArticleSlug'
import { ArticleQueries } from '../ArticleQueries'
import { NotGenerated, articleIsGenerated, type Article } from '../Article'
import { ArticleGPT } from '../ArticleGPT'
import type { URL } from '@__domain__/__types__'
import { ArticleRepository } from '../ArticleRepository'
import type { AsyncResult } from 'shulk'

export type AddSectionForm = {
	title: string
	source: URL
}

type Dependencies = {
	db: DB
	llm: LLM
}

export async function addSectionFromUrl(
	slug: ArticleSlug,
	input: AddSectionForm,
	dependencies: Dependencies,
): AsyncResult<UnexpectedError | NotFound | NotGenerated, Article> {
	const { db, llm } = dependencies

	const readArticleResult = await ArticleQueries(db).fromSlug(slug)

	const patchedArticle = await readArticleResult
		.filterType(articleIsGenerated, NotGenerated.new)
		.flatMapAsync((article) =>
			ArticleGPT(llm).generateSection(article, input.title, input.source),
		)

	const updateArticleResult = await patchedArticle.flatMapAsync(
		ArticleRepository(db).update,
	)

	return updateArticleResult.flatMap(() => patchedArticle)
}
