import type { LLM } from '../__abstract__/LLM'
import { Article, Section, type ArticleTag } from './Article'
import { createArticleSlug } from './__types__/ArticleSlug'
import type { AsyncResult } from 'shulk'
import { UnexpectedError } from '../__abstract__'
import type { URL } from '@__domain__/__types__'
import { pdfToText } from 'pdf-ts'

const GENERATE_DESCR_PROMPT = (title: string) =>
	`Give me information about the topic "${title}". Your response will be formatted according to this JSON-like structure: {"description": string, "relatedTo": string[]}`

const GENERATE_SECT_PROMPT = (articleTitle: string, sectionTitle: string) =>
	`Write a section "${sectionTitle}" for an encyclopedia article about ${articleTitle}. Reply with only the content of the subsection without its title, and nothing else. Make it as complete, formal, objective, and unbiased as possible.`

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

		generateSection: async (
			article: ArticleTag['Generated'],
			sectionTitle: string,
			sourceUrl: URL,
		) => {
			const fetchSource = await fetch(sourceUrl)

			const docTitle = fetchSource.headers.get('title')
			const doc = await fetchSource.text()

			await llm.addDocument(doc)

			const queryResult = await llm.query(
				GENERATE_SECT_PROMPT(article.title, sectionTitle),
			)

			return queryResult.map((res) =>
				Article.Generated({
					...article,
					sections: [
						...article.sections,
						Section.Sourced({
							title: sectionTitle,
							content: res,
							sources: [
								{ title: docTitle || sourceUrl, url: sourceUrl },
							],
						}),
					],
					// quality: {
					// 	sourcedSections: article.quality.sourcedSections + 1,
					// 	totalSections: article.quality.totalSections + 1,
					// 	score:
					// 		(article.quality.sourcedSections + 1) /
					// 		(article.quality.totalSections + 1),
					// },
				}),
			)
		},

		generateSectionFromPDF: async (
			article: ArticleTag['Generated'],
			sectionTitle: string,
			sourcePDF: File,
			sourceTitle: string,
		) => {
			const buffer = await sourcePDF.arrayBuffer()
			const text = (await pdfToText(Buffer.from(buffer))).replaceAll(
				'\n',
				'',
			)

			await llm.addDocument(text)

			const queryResult = await llm.query(
				GENERATE_SECT_PROMPT(article.title, sectionTitle),
			)

			return queryResult.map((res) =>
				Article.Generated({
					...article,
					sections: [
						...article.sections,
						Section.Sourced({
							title: sectionTitle,
							content: res,
							sources: [{ title: sourceTitle }],
						}),
					],
					// quality: {
					// 	sourcedSections: article.quality.sourcedSections + 1,
					// 	totalSections: article.quality.totalSections + 1,
					// 	score:
					// 		(article.quality.sourcedSections + 1) /
					// 		(article.quality.totalSections + 1),
					// },
				}),
			)
		},
	}
}
