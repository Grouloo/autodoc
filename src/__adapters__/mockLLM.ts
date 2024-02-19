import type { UnexpectedError } from '@domain/__abstract__'
import type { LLM } from '@domain/__abstract__/LLM'
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
	}
}
