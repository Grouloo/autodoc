import {
	NotFound,
	UnexpectedError,
	createReference,
	type DB,
	type Select,
} from '@domain'
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

		async update<T>(collection: string, id: string, data: T) {
			try {
				const v = await pb.collection(collection).update<T>(id, data as any)

				return Ok(v)
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

				if (data.expand) {
					Object.entries(data.expand).map(([field, val]) => {
						data[field] = val
					})
				}
				return Ok(data as T)
			} catch (e) {
				return match((e as ClientResponseError).status).case({
					404: () =>
						Err(
							new NotFound(
								`Entity '${collection}/${id}' does not exist.`,
							),
						),
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

				for (let item of data) {
					if (item.expand) {
						Object.entries(item.expand).map(([field, val]) => {
							item[field] = val
						})
					}
				}

				return Ok(data as T[])
			} catch (e) {
				return Err(new UnexpectedError((e as any).message))
			}
		},
	}

	return db
}
