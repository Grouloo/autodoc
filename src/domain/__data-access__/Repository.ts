import { Err, Ok, type AsyncResult } from 'shulk'
import type { DB } from './DB'
import { Select } from './Select'
import type { NotFound, UnexpectedError } from '@domain/__abstract__'
import type { Reference } from '@domain/__abstract__/__types__/Reference'
import { log } from 'node_modules/astro/dist/core/logger/core'

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
		insert: async (data: T): AsyncResult<UnexpectedError, Reference> => {
			const id =
				schema.primaryKey in data
					? (data[schema.primaryKey as keyof T] as string)
					: undefined

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

					if (typeof value === 'object' && value && 'id' in value) {
						const propIdResult = await propRepo.update(value as any)

						if (propIdResult._state === 'Err') {
							return Err(propIdResult.val)
						}

						// @ts-expect-error
						normalForm[prop] = propIdResult.val.id
					} else if (value) {
						const propIdResult = await propRepo.insert(value)

						if (propIdResult._state === 'Err') {
							return Err(propIdResult.val)
						}

						normalForm[prop] = propIdResult.val.id
					}
				} else {
					normalForm[prop] = data[prop as keyof T]
				}
			}

			return db.update<T>(collection, (data as any).id, normalForm)
		},

		read: async (id: string): AsyncResult<UnexpectedError | NotFound, T> => {
			const readResult = await db.read<T>(
				collection,
				schema.primaryKey as string,
				id,
				joins,
			)

			if (readResult._state === 'Err') {
				return readResult
			}

			const normalForm = readResult.val

			console.log(normalForm)

			// @ts-expect-error
			const denormalized: T = {}

			for (let [prop, propScheme] of Object.entries(schema.relations)) {
				if (
					propScheme !== false &&
					normalForm[prop as keyof T] &&
					!Array.isArray(normalForm[prop as keyof T])
				) {
					// @ts-expect-error
					const propRepo = $repository(propScheme as Schema<T[keyof T]>)(
						db,
					)

					const propIdResult = await propRepo.read(
						normalForm[prop as keyof T] as any,
					)

					if (propIdResult._state === 'Err') {
						return Err(propIdResult.val)
					}

					// @ts-expect-error
					denormalized[prop as keyof T] = propIdResult.val
				} else {
					denormalized[prop as keyof T] = normalForm[prop as keyof T]
				}
			}

			return Ok(denormalized)
		},

		selectAll: () => Select.in<T>(db, collection, joins),
	})
}
