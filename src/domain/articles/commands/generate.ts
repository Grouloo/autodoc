import type { DB } from '@domain/__data-access__'
import type { ArticleSlug } from '../__types__/ArticleSlug'
import { ArticleQueries } from '../ArticleQueries'
import type { Article, ArticleTag } from '../Article'
import type { LLM } from '@domain/__abstract__/LLM'
import { ArticleGPT } from '../ArticleGPT'
import { ArticleRepository } from '../ArticleRepository'
import type { AsyncResult } from 'shulk'
import type { NotFound, UnexpectedError } from '@domain/__abstract__'

type Dependencies = {
	db: DB
	llm: LLM
}

export async function generate(
	slug: ArticleSlug,
	dependencies: Dependencies,
): AsyncResult<UnexpectedError | NotFound | AlreadyGenerated, Article> {
	const { db, llm } = dependencies

	const readArticleResult = await ArticleQueries(db).fromSlug(slug)

	const generatedArticleResult = await readArticleResult
		.filterType(articleIsPending, AlreadyGenerated.new)
		.flatMapAsync(ArticleGPT(llm).generate)

	const updateArticleResult = generatedArticleResult.flatMapAsync(
		ArticleRepository(db).update,
	)

	return updateArticleResult
}

const articleIsPending = (article: Article): article is ArticleTag['Pending'] =>
	article._state === 'Pending'

class AlreadyGenerated extends Error {
	static new() {
		return new AlreadyGenerated()
	}
}