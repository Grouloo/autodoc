import { ArticleQueries } from '@domain'
import type { APIRoute } from 'astro'

export const GET: APIRoute = async (Astro) => {
	const { db } = Astro.locals.dependencies

	const fetchArticlesResult = await ArticleQueries(db).listAll()

	return fetchArticlesResult
		.map((articles) =>
			articles.map((art) => ({
				title: art.title,
				description:
					art._state === 'Generated' ? art.description.content : undefined,
				uri: '/articles/' + art.slug + '.json',
			})),
		)
		.map((res) => new Response(JSON.stringify(res)))
		.mapErr((err) => new Response(JSON.stringify({ message: err.message })))
		.val
}
