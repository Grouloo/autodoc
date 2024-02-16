import { NotFound, UnexpectedError } from '@domain/__abstract__/Errors'
import { createReference } from '@domain/__abstract__/__types__/Reference'
import type { DB, Select } from '@domain/__data-access__'
import PocketBase, { ClientResponseError } from 'pocketbase'
import { Err, Ok, match, type AsyncResult } from 'shulk'

export async function connectPocketBase() {
	const pb = new PocketBase('http://127.0.0.1:8090')

	await pb
		.collection('applications')
		.authWithPassword(
			import.meta.env.SECRET_API_CLIENT,
			import.meta.env.SECRET_API_SECRET,
		)

	const db: DB = {
		create: async (collection: string, data: {}, _id?: string) => {
			try {
				const v = await pb.collection(collection).create({ ...data })

				return Ok(createReference(collection, v.id))
			} catch (e) {
				return Err(new UnexpectedError((e as any).message))
			}
		},

		read: async <T>(
			collection: string,
			idField: string,
			id: string,
			joins: string[],
		): AsyncResult<NotFound | UnexpectedError, T> => {
			try {
				const data = await pb
					.collection(collection)
					.getFirstListItem(`${idField}="${id}"`, {
						expand: joins.join(','),
					})
				return Ok(data as T)
			} catch (e) {
				return match((e as ClientResponseError).status).case({
					404: () => Err(new NotFound('Entity does not exist.')),
					_otherwise: () => Err(new UnexpectedError((e as any).message)),
				})
			}
		},

		query: async <T>(
			collection: string,
			query: Select<T>,
			joins: string[],
		): AsyncResult<NotFound | UnexpectedError, T[]> => {
			const parsedFilters = query.Filters.map(
				({ field, operator, value }) => ({
					field,
					operator,
					parsedValue: typeof value == 'string' ? `"${value}"` : value,
				}),
			)
				.map(
					(filter) =>
						`${filter.field} ${filter.operator} ${filter.parsedValue}`,
				)
				.join(' && ')

			try {
				const data = await pb.collection(collection).getFullList({
					filters: parsedFilters,
					expand: joins.join(','),
				})

				return Ok(data as T[])
			} catch (e) {
				return Err(new UnexpectedError((e as any).message))
			}
		},
	}

	return db
}
