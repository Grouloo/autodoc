import type { UnexpectedError } from '@domain'
import type { LLM } from '@domain'
import MistralClient from '@mistralai/mistralai'
import { Err, Ok } from 'shulk'

export function useMistral(): LLM {
	const apiKey = import.meta.env.SECRET_MISTRAL_API_KEY

	const client = new MistralClient(apiKey)

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
	}
}
