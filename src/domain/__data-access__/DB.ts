import type { AsyncResult } from 'shulk'
import type { NotFound, UnexpectedError } from '../__abstract__/Errors'
import type { Reference } from '../__abstract__/__types__/Reference'
import type { Select } from './Select'

export type DB = {
	create: (
		collection: string,
		data: any,
		id?: string,
	) => AsyncResult<UnexpectedError, Reference>
	read: <T>(
		collection: string,
		idField: string,
		id: string,
		expand: string[],
	) => AsyncResult<UnexpectedError | NotFound, T>
	query: <T>(
		collection: string,
		query: Select<T>,
		joins: string[],
	) => AsyncResult<UnexpectedError, T[]>
}
