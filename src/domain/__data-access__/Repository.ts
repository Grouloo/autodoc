import type { AsyncResult } from 'shulk'
import type { DB } from './DB'
import { Select } from './Select'
import type { NotFound, UnexpectedError } from '@domain/__abstract__'

type Unpacked<T> = T extends (infer U)[] ? U : T

export type Schema<T> = {
	table: string
	primaryKey: keyof T | 'id'
	creationDate?: keyof T
	modificationDate?: keyof T
	relations: {
		[x in keyof T]: T[x] extends object ? Schema<Unpacked<T[x]>> : false
	}
}

export function $repository<T extends object>(schema: Schema<T>) {
	const collection = schema.table

	const joins = Object.values(schema.relations).filter(
		(pred) => pred !== false,
	) as string[]

	return (db: DB) => ({
		insert: (data: T) => {
			const id =
				schema.primaryKey in data
					? (data[schema.primaryKey as keyof T] as string)
					: undefined
			return db.create(collection, data, id)
		},

		read: (id: string): AsyncResult<UnexpectedError | NotFound, T> =>
			db.read<T>(collection, schema.primaryKey as string, id, joins),

		selectAll: () => Select.in<T>(db, collection, joins),
	})
}
