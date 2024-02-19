import { connectPocketBase } from '@adapters/connectPocketBase'
import { mockLLM } from '@adapters/mockLLM'

export async function onRequest({ locals }: any, next: () => any) {
	const db = await connectPocketBase()
	const llm = mockLLM()

	locals.dependencies = { db, llm }

	return next()
}
