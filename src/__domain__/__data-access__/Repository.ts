import { Err, type AsyncResult } from 'shulk'
import type { DB } from './DB'
import { Select } from './Select'
import {
	AlreadyPersisted,
	NotFound,
	type UnexpectedError,
} from '../__abstract__/Errors'
import type { Reference } from '@domain'

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

	const joins = Object.entries(schema.relations)
		.filter((entry): entry is [string, Schema<any>] => entry[1] !== false)
		.map(([field]) => field)

	return (db: DB) => ({
		insert: async (
			data: T,
		): AsyncResult<UnexpectedError | AlreadyPersisted, Reference> => {
			const repo = $repository(schema)(db)

			const id = data[schema.primaryKey as keyof T] as string

			const okIfEntityIsPersisted = await repo.read(id)

			if (okIfEntityIsPersisted._state === 'Ok') {
				return Err(new AlreadyPersisted())
			}

			const normalForm: Record<string, any> = {}

			for (let [prop, propScheme] of Object.entries(schema.relations)) {
				if (propScheme !== false && data[prop as keyof T]) {
					// @ts-expect-error
					const propRepo = $repository(propScheme as Schema<T[keyof T]>)(
						db,
					)

					const propIdResult = await propRepo.insert(
						data[prop as keyof T] as any,
					)

					if (propIdResult._state === 'Err') {
						return Err(propIdResult.val)
					}

					normalForm[prop] = propIdResult.val.id
				} else {
					normalForm[prop] = data[prop as keyof T]
				}
			}

			return db.create(collection, normalForm, id)
		},

		update: async (data: T): AsyncResult<UnexpectedError, T> => {
			const normalForm: Record<string, any> = {}

			for (let [prop, propScheme] of Object.entries(schema.relations)) {
				if (propScheme !== false) {
					// @ts-expect-error
					const propRepo = $repository(propScheme as Schema<T[keyof T]>)(
						db,
					)

					const value = data[prop as keyof T]

					if (
						typeof value === 'object' &&
						value &&
						!Array.isArray(value)
					) {
						const propIdResult = await propRepo.upsert(value)

						if (propIdResult._state === 'Err') {
							return Err(propIdResult.val)
						}

						// @ts-expect-error
						normalForm[prop] = propIdResult.val.id
					} else if (Array.isArray(value)) {
						let IDs: string[] = []

						for (let entry of value) {
							const propIdResult = await propRepo.upsert(entry)

							if (propIdResult._state === 'Err') {
								return Err(propIdResult.val)
							}

							// @ts-expect-error
							IDs.push(propIdResult.val.id)
						}

						normalForm[prop] = IDs
					}
				} else {
					normalForm[prop] = data[prop as keyof T]
				}
			}

			return db.update<T>(collection, (data as any).id, normalForm)
		},

		upsert: async (data: T) => {
			const repo = $repository(schema)(db)

			const tryInsertingResult = await repo.insert(data)

			const entityAlreadyExists =
				tryInsertingResult._state === 'Err' &&
				tryInsertingResult.val instanceof AlreadyPersisted

			if (entityAlreadyExists) {
				return repo.update(data)
			} else {
				return tryInsertingResult
			}
		},

		read: async (id: string): AsyncResult<UnexpectedError | NotFound, T> =>
			db.read<T>(collection, schema.primaryKey as string, id, joins),

		selectAll: () => Select.in<T>(db, collection, joins),
	})
}
