import type { UnexpectedError } from '@domain'
import type { LLM } from '@domain'
import { Err, Ok } from 'shulk'

export function mockLLM(): LLM {
	return {
		prompt: async (_msg: string) => {
			try {
				return Ok(
					'{"description": "Foo bar foo bar foo bar", "relatedTo": ["foo", "bar"]}',
				)
			} catch (e) {
				return Err(e as UnexpectedError)
			}
		},

		addDocument: () => {
			throw Error()
		},

		query: (_msg) => {
			throw Error()
		},
	}
}
