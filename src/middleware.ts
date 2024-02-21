import { connectPocketBase } from '@adapters/connectPocketBase'
import { useMistral } from '@adapters/useMistral'

export async function onRequest({ locals }: any, next: () => any) {
	const db = await connectPocketBase()
	const llm = await useMistral()

	locals.dependencies = { db, llm }

	return next()
}
