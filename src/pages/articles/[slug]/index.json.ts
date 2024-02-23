import { ArticleQueries } from '@domain'
import type { APIRoute } from 'astro'
import { match } from 'shulk'

export const GET: APIRoute = async (Astro) => {
	const { db } = Astro.locals.dependencies

	const { slug } = Astro.params

	const fetchArticleResult = await ArticleQueries(db).fromSlug(slug as string)

	return fetchArticleResult
		.map((article) =>
			match(article).case({
				Pending: (article) => ({
					title: article.title,
					actions: [
						{
							title: 'Generate a description',
							method: 'PATCH',
							uri: '/articles/' + article.slug + '/generate',
						},
						{
							title: 'Write a description',
							method: 'POST',
							uri: '/articles/' + article.slug + '/write-description',
						},
					],
				}),
				Generated: (article) => ({
					title: article.title,
					actions: [
						{
							title: 'Add a section (URL)',
							method: 'POST',
							uri: '/articles/' + article.slug + '/add-section-url',
						},
						{
							title: 'Add a section (PDF)',
							method: 'POST',
							uri: '/articles/' + article.slug + '/add-section-pdf',
						},
					],
					description: article.description.content,
					sections: article.sections.map((sec) => ({
						title: sec.title,
						content: sec.content,
						sources:
							sec._state === 'Sourced'
								? sec.sources.map((source) => ({
										title: source.title,
										url: source.url,
									}))
								: undefined,
					})),
					relatedTo: article.relatedTo.map((a) => ({
						title: a.title,
						slug: a.slug,
						uri: '/articles/' + a.slug + '.json',
					})),
				}),
			}),
		)
		.map((res) => new Response(JSON.stringify(res)))
		.mapErr((err) => new Response(JSON.stringify({ message: err.message })))
		.val
}
