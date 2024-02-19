import type { LLM } from '../__abstract__/LLM'
import { Article, Section, type ArticleTag } from './Article'
import { createArticleSlug } from './__types__/ArticleSlug'
import type { AsyncResult } from 'shulk'
import { UnexpectedError } from '../__abstract__'

const GENERATE_DESCR_PROMPT = (title: string) =>
	`Give me information about the topic "${title}". Your response will be formatted according to this JSON-like structure: {"description": string, "relatedTo": string[]}`

type GenerateResponse = { description: string; relatedTo: string[] }

function jsonIsGenerateResponse(json: object): json is GenerateResponse {
	if (!('description' in json) || typeof json.description !== 'string') {
		return false
	} else if (!('relatedTo' in json) || !Array.isArray(json.relatedTo)) {
		return false
	} else {
		return true
	}
}

export function ArticleGPT(llm: LLM) {
	return {
		generate: async (
			article: ArticleTag['Pending'],
		): AsyncResult<UnexpectedError, Article> => {
			const genDesrResult = await llm.prompt(
				GENERATE_DESCR_PROMPT(article.title),
			)

			return genDesrResult
				.map((res) => JSON.parse(res))
				.filterType(jsonIsGenerateResponse, () => new UnexpectedError())
				.map((response) =>
					Article.Generated({
						...article,
						description: Section.NotSourced({
							title: 'Description',
							content: response.description,
						}),
						sections: [],
						relatedTo: response.relatedTo.map((title) => ({
							slug: createArticleSlug(title),
							title,
						})),
						quality: {
							sourcedSections: 0,
							totalSections: 1,
							score: 0,
						},
					}),
				)
		},
	}
}
