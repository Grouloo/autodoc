export type ArticleSlug = string

export function createArticleSlug(title: string): ArticleSlug {
	return title
		.trim()
		.toLowerCase()
		.replaceAll(' ', '-')
		.replaceAll(',', '')
		.replaceAll('(', '')
		.replaceAll(')', '')
}
