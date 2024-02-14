import type { AsyncResult } from 'shulk'
import type { DB } from './DB'
import type { Select } from './Select'
import type { NotFound, UnexpectedError } from '@domain/__abstract__'

type Schema<T> = {
	table: string
	primaryKey: keyof T
	creationDate?: keyof T
	modificationDate?: keyof T
	relations: {
		[x in keyof T]: T[x] extends object ? string : false
	}
}

export function $repository<T>(schema: Schema<T>) {
	const collection = schema.table

	const joins = Object.values(schema.relations).filter(
		(pred) => pred !== false,
	) as string[]

	return (db: DB) => ({
		insert: (data: T) =>
			db.create(collection, data, data[schema.primaryKey] as string),

		read: (id: string): AsyncResult<UnexpectedError | NotFound, T> =>
			db.read<T>(collection, schema.primaryKey as string, id, joins),

		select: (q: Select<T>) => db.query(collection, q, joins),
	})
}
