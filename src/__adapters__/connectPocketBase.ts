import {
	NotFound,
	UnexpectedError,
	createReference,
	type DB,
	type Select,
} from '@domain'
import PocketBase, { ClientResponseError } from 'pocketbase'
import { Err, Ok, match, type AsyncResult } from 'shulk'

function expandRelation(data: any) {
	if (data.expand) {
		Object.entries(data.expand).map(([field, val]) => {
			if (Array.isArray(val)) {
				data[field] = val.map((v) => expandRelation(v))
			} else if (typeof val === 'object' && val !== null) {
				data[field] = expandRelation(val)
			} else {
				data[field] = val
			}
		})
	}

	return data
}

export async function connectPocketBase() {
	const pb = new PocketBase(import.meta.env.SECRET_DB_URL)

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

				const finalData = expandRelation(data)

				return Ok(finalData as T)
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

			const parsedSortings = query.Sortings.map(({ field, order }) => ({
				field,
				order: order === 'ASC' ? '+' : '-',
			}))
				.map(({ field, order }) => `${order}${field}`)
				.join(',')

			try {
				const data = await pb.collection(collection).getFullList({
					filters: parsedFilters,
					sort: parsedSortings,
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
