import { connectPocketBase } from '@adapters/connectPocketBase'

export async function onRequest({ locals }: any, next: () => any) {
	const db = await connectPocketBase()

	locals.db = db

	return next()
}
