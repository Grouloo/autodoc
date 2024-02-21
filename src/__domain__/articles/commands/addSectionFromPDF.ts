import type { DB } from '@__domain__/__data-access__'
import type { ArticleSlug } from '../__types__/ArticleSlug'
import type { LLM } from '@__domain__/__abstract__'
import { ArticleQueries } from '../ArticleQueries'
import { ArticleRepository } from '../ArticleRepository'
import { ArticleGPT } from '../ArticleGPT'
import { NotGenerated, articleIsGenerated } from '../Article'

export type AddSectionPDFForm = {
	title: string
	source: File
}

type Dependencies = {
	db: DB
	llm: LLM
}

export async function addSectionFromPDF(
	slug: ArticleSlug,
	input: AddSectionPDFForm,
	dependencies: Dependencies,
) {
	const { db, llm } = dependencies

	const readArticleResult = await ArticleQueries(db).fromSlug(slug)

	const patchedArticle = await readArticleResult
		.filterType(articleIsGenerated, NotGenerated.new)
		.flatMapAsync((article) =>
			ArticleGPT(llm).generateSectionFromPDF(
				article,
				input.title,
				input.source,
			),
		)

	const updateArticleResult = await patchedArticle.flatMapAsync(
		ArticleRepository(db).update,
	)

	return updateArticleResult.flatMap(() => patchedArticle)
}
