import { UnexpectedError } from '@domain'
import type { LLM } from '@domain'
import MistralClient from '@mistralai/mistralai'
import {
	VectorStoreIndex,
	Document,
	serviceContextFromDefaults,
	MistralAIEmbedding,
	MistralAIEmbeddingModelType,
	MistralAI,
} from 'llamaindex'
import { Err, Ok } from 'shulk'

export async function useMistral(): Promise<LLM> {
	const apiKey = import.meta.env.SECRET_MISTRAL_API_KEY

	const client = new MistralClient(apiKey)

	const embedModel = new MistralAIEmbedding({
		model: MistralAIEmbeddingModelType.MISTRAL_EMBED,
		apiKey: apiKey,
	})

	const service = serviceContextFromDefaults({
		chunkSize: 1024,
		// @ts-expect-error
		llm: new MistralAI({ apiKey: apiKey, model: 'mistral-small' }),
		embedModel: embedModel,
	})

	const vectorStoreIndex = await VectorStoreIndex.fromDocuments([], {
		serviceContext: service,
	})

	return {
		prompt: async (msg: string) => {
			try {
				const response = await client.chat({
					model: 'mistral-tiny',
					messages: [{ role: 'user', content: msg }],
				})

				const content = response.choices[0]?.message.content

				if (!content) {
					return Err(Error('Content is undefined'))
				} else {
					return Ok(content)
				}
			} catch (e) {
				return Err(e as UnexpectedError)
			}
		},

		addDocument: async (doc: string) => {
			const document = new Document({ text: doc })

			await vectorStoreIndex.insert(document)
			return {}
		},

		query: async (msg: string) => {
			try {
				const queryEngine = vectorStoreIndex.asQueryEngine()

				const response = await queryEngine.query({
					query: msg,
				})

				return Ok(response.response)
			} catch (e) {
				return Err(new UnexpectedError((e as Error).message))
			}
		},
	}
}
