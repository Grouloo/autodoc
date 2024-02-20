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
							title: 'Generate',
							method: 'PATCH',
							uri: '/articles/' + article.slug + '/generate',
						},
					],
				}),
				Generated: (article) => ({
					title: article.title,
					description: article.description.content,
					relatedTo: article.relatedTo.map((a) => ({
						title: a.title,
						slug: a.slug,
						uri: '/articles/' + a.slug + '.json',
					})),
					actions: [
						{
							title: 'Add a section',
							method: 'POST',
							uri: '/articles/' + article.slug + '/add-section',
						},
					],
				}),
			}),
		)
		.map((res) => new Response(JSON.stringify(res)))
		.mapErr((err) => new Response(JSON.stringify({ message: err.message })))
		.val
}
