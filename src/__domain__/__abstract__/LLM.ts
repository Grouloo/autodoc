import type { AsyncResult } from 'shulk'
import type { UnexpectedError } from './Errors'

export type LLM = {
	prompt: (msg: string) => AsyncResult<UnexpectedError, string>
	addDocument: (doc: string) => Promise<{}>
	query: (msg: string) => AsyncResult<UnexpectedError, string>
}
