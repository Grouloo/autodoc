import type { DB } from '../../__data-access__'
import type { ArticleSlug } from '../__types__/ArticleSlug'
import { ArticleQueries } from '../ArticleQueries'
import { AlreadyGenerated, articleIsPending, type Article } from '../Article'
import type { LLM } from '../../__abstract__/LLM'
import { ArticleGPT } from '../ArticleGPT'
import { ArticleRepository } from '../ArticleRepository'
import type { AsyncResult } from 'shulk'
import type { NotFound, UnexpectedError } from '../../__abstract__'

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

	const generateArticleResult = await readArticleResult
		.filterType(articleIsPending, AlreadyGenerated.new)
		.flatMapAsync(ArticleGPT(llm).generate)

	const updateArticleResult = await generateArticleResult.flatMapAsync(
		ArticleRepository(db).update,
	)

	return updateArticleResult.flatMap(() => generateArticleResult)
}
